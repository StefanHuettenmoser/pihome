from src.modules import PihomeActor

import threading
import subprocess
import re

# link to this script
# https://github.com/alexh-name/bsec_bme680_linux
class BSEC_Sensor(PihomeActor):

    REGEX = r"^[\d-]+ [\d:]+,\[IAQ \(([0123])\)]: ([\d.]+),\[T degC]: ([\d.]+),\[H %rH]: ([\d.]+),\[P hPa]: ([\d.]+),\[G Ohms]: ([\d.]+),\[S]: ([\d.]+),\[eCO2 ppm]: ([\d.]+),\[bVOCe ppm]: ([\d.]+)$"

    def __init__(self, pi, db, name, stage, every, script_path):
        super().__init__(pi, db, name, stage, every)

        for dimension in self.get_dimensions():
            self.db.init_table(
                self.get_table_name(self.name, dimension["name"]), "FLOAT"
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
        if self.iaq_accuracy < 1:
            callback()
            return f"No data was saved. {output[self.iaq_accuracy]}"

        for dimension in self.get_dimensions():
            table_name = self.get_table_name(self.name, dimension["name"])
            value = dimension["get_value"](self)
            self.db.add_one(table_name, value)
        callback()
        return f"Environment data was saved. {output[self.iaq_accuracy]}"

    @staticmethod
    def get_table_name(name, dimension):
        return f"{name}${dimension}"

    @staticmethod
    def get_dimensions():
        return [
            {"name": "temperature", "get_value": lambda self: self.temperature},
            {"name": "pressure", "get_value": lambda self: self.pressure},
            {"name": "humidity", "get_value": lambda self: self.humidity},
            {"name": "iaq", "get_value": lambda self: self.iaq},
            {"name": "co2", "get_value": lambda self: self.co2},
            {"name": "voc", "get_value": lambda self: self.voc},
            {"name": "gas_resistance", "get_value": lambda self: self.gas_resistance},
        ]
