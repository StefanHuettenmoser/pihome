from src.modules import PihomeActor
import bme680

import time


class Sensor(PihomeActor):
    def __init__(
        self,
        pi,
        db,
        name,
        stage,
        every,
        measure_gas=True,
        gas_preheat_duration_s=15,
        initial_preheat_s=120,
        ADDR_77=False,
    ):
        super().__init__(pi, db, name, stage, every)
        self.measure_gas = measure_gas
        self.gas_preheat_duration_s = gas_preheat_duration_s
        self.initial_preheat_s = initial_preheat_s

        for dimension in self.get_dimensions(self.measure_gas):
            self.db.init_table(
                self.get_table_name(self.name, dimension["name"]), "FLOAT"
            )

        self.sensor = bme680.BME680(
            i2c_addr=bme680.constants.I2C_ADDR_PRIMARY
            if ADDR_77
            else bme680.constants.I2C_ADDR_SECONDARY
        )

        self.sensor.set_humidity_oversample(bme680.OS_2X)
        self.sensor.set_pressure_oversample(bme680.OS_4X)
        self.sensor.set_temperature_oversample(bme680.OS_8X)
        self.sensor.set_filter(bme680.FILTER_SIZE_3)

        if self.measure_gas:
            self.sensor.set_gas_status(bme680.ENABLE_GAS_MEAS)
            self.sensor.set_gas_heater_temperature(320)
            self.sensor.set_gas_heater_duration(150)
            self.sensor.select_gas_heater_profile(0)
            self.perform(callback=None, initialize=True)

    def perform(self, callback, initialize=False):
        must_end = time.time() + (
            (self.initial_preheat_s if initialize else self.gas_preheat_duration_s)
            if self.measure_gas
            else 0
        )
        while True:
            if self.sensor.get_sensor_data():
                if time.time() >= must_end:
                    if initialize:
                        return "BME680 Initialized"
                    for dimension in self.get_dimensions(self.measure_gas):
                        table_name = self.get_table_name(self.name, dimension["name"])
                        value = dimension["get_value"](self.sensor.data)
                        self.db.add_one(table_name, value)
                    callback()
                    return "BME680 Finished Measure of Environment Data"
                time.sleep(0.5)

    @staticmethod
    def get_table_name(name, dimension):
        return f"{name}${dimension}"

    @staticmethod
    def get_dimensions(measure_gas=True):
        base_values = [
            {"name": "temperature", "get_value": lambda data: data.temperature},
            {"name": "pressure", "get_value": lambda data: data.pressure},
            {"name": "humidity", "get_value": lambda data: data.humidity},
        ]
        gas_value = [
            {"name": "gas_resistance", "get_value": lambda data: data.gas_resistance}
        ]
        return base_values + (gas_value if measure_gas else [])
