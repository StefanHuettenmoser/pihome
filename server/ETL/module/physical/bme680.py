from src.modules import PihomeActor

import threading
import subprocess
import re

DIMENSIONS = [
    {
        "name": "temperature",
        "get_value": lambda self: self.temperature,
        "value_type": "FLOAT",
    },
    {
        "name": "pressure",
        "get_value": lambda self: self.pressure,
        "value_type": "FLOAT",
    },
    {
        "name": "humidity",
        "get_value": lambda self: self.humidity,
        "value_type": "FLOAT",
    },
    {
        "name": "iaq",
        "get_value": lambda self: self.iaq,
        "wait": True,
        "value_type": "FLOAT",
    },
    {
        "name": "co2",
        "get_value": lambda self: self.co2,
        "wait": True,
        "value_type": "FLOAT",
    },
    {
        "name": "voc",
        "get_value": lambda self: self.voc,
        "wait": True,
        "value_type": "FLOAT",
    },
    {
        "name": "gas_resistance",
        "get_value": lambda self: self.gas_resistance,
        "value_type": "FLOAT",
    },
    {
        "name": "iaq_accuracy",
        "get_value": lambda self: self.iaq_accuracy,
        "value_type": "TINYINT",
    },
    {
        "name": "bsec_return_value",
        "get_value": lambda self: self.bsec_return_value,
        "value_type": "TINYINT",
    },
]

# link to this script
# https://github.com/alexh-name/bsec_bme680_linux
class BSEC_Sensor(PihomeActor):

    REGEX = r"^[\d-]+ [\d:]+,\[IAQ \(([0123])\)]: ([\d.]+),\[T degC]: ([\d.]+),\[H %rH]: ([\d.]+),\[P hPa]: ([\d.]+),\[G Ohms]: ([\d.]+),\[S]: ([\d.]+),\[eCO2 ppm]: ([\d.]+),\[bVOCe ppm]: ([\d.]+)$"

    def __init__(self, pi, db, name, stage, every, script_path):
        super().__init__(pi, db, name, stage, every)

        for dimension in self.get_dimensions():
            self.db.init_table(
                self.get_table_name(self.name, dimension["name"]),
                dimension["value_type"],
            )

        self.daemon_thread = threading.Thread(
            target=self.daemon_function, args=(script_path,), daemon=True
        )
        self.daemon_thread.start()
        self.iaq_accuracy = -1

    def daemon_function(self, script_path):
        process = subprocess.Popen(script_path, stdout=subprocess.PIPE)
        while True:
            output = process.stdout.readline().decode("utf-8")
            if output == "" and process.poll() is not None:
                break
            if output:
                data = re.findall(self.REGEX, output.strip())[0]
                if len(data) != 9:
                    continue
                data = [float(x) if "." in x else int(x) for x in data]
                (
                    self.iaq_accuracy,
                    self.iaq,
                    self.temperature,
                    self.humidity,
                    self.pressure,
                    self.gas_resistance,
                    self.bsec_return_value,
                    self.co2,
                    self.voc,
                ) = data

    def perform(self, callback):
        output = {
            -1: "No measurement was made yet.",
            0: "Sensor is still stabilizing. (lasts normally 5min)",
            1: "Uncertain background history. Measured data too stable.",
            2: "Sensor found new calibration data and is calibrating.",
            3: "Sensor is calibrated.",
        }
        if self.iaq_accuracy == -1:
            callback()
            return output[-1]

        for dimension in self.get_dimensions(waiting=self.iaq_accuracy < 3):
            table_name = self.get_table_name(self.name, dimension["name"])
            value = dimension["get_value"](self)
            self.db.add_one(table_name, value)
        callback()
        return f"Environment data was saved. {output[self.iaq_accuracy]}"

    @staticmethod
    def get_table_name(name, dimension):
        return f"{name}${dimension}"

    @staticmethod
    def get_dimensions(waiting=False):
        if not waiting:
            return DIMENSIONS

        def keep_non_waiting(dimension):
            try:
                return not dimension["wait"]
            except KeyError:
                return True

        return list(filter(keep_non_waiting, DIMENSIONS))
