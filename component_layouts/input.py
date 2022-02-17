from unittest import skip
import pigpio

import time
import math

from components import PihomeComponent


class Input(PihomeComponent):
    def __init__(self, pi, db, name, stage, output_pin, value_type):
        super().__init__(pi, db, name, stage)

        self.output_pin = output_pin
        self.value_type = value_type
        self.db.init_table(self.name, self.value_type)

    def read(self):
        self.pi.set_mode(self.output_pin, pigpio.INPUT)
        return self.pi.read(self.output_pin)

    def run(self, callback):
        value = self.read()
        self.db.add_one(self.name, value)
        callback()
        return f"Read form Pin-{self.output_pin}: {value} and Save to Database '{self.name}'"


class AnalogInput(Input):
    def __init__(
        self,
        pi,
        db,
        name,
        stage,
        output_pin,
        discharge_pin,
        min_value,
        max_value,
        log_result=False,
        skip_measurements=5,
        measurements=10,
        wait_after_discharge=0.02,
        timeout=2,
        measurement_tick=0.0001,
    ):
        super().__init__(pi, db, name, stage, output_pin, value_type="DECIMAL")

        self.discharge_pin = discharge_pin

        self.min_value = min_value
        self.value_range = max_value - min_value

        self.log_result = log_result
        self.skip_measurements = skip_measurements
        self.measurements = measurements
        self.wait_after_discharge = wait_after_discharge
        self.timeout = timeout

    def discharge(self):
        self.pi.set_mode(self.output_pin, pigpio.INPUT)
        self.pi.set_mode(self.discharge_pin, pigpio.OUTPUT)
        self.pi.write(self.discharge_pin, 0)
        time.sleep(self.wait_after_discharge)

    def measure_charge_time(self):
        self.pi.set_mode(self.output_pin, pigpio.OUTPUT)
        self.pi.set_mode(self.discharge_pin, pigpio.INPUT)
        self.pi.write(self.output_pin, 1)

        start_time = time.time()
        must_end = start_time + self.timeout
        while not self.pi.read(self.discharge_pin) and time.time() < must_end:
            time.sleep(0.0001)
        delta_time = time.time() - start_time

        if self.log_result:
            delta_time = math.log(delta_time)
        return max(0, min(1, (delta_time - self.min_value) / (self.value_range)))

    def __read(self):
        self.discharge()
        return self.measure_charge_time()

    def read(self):
        for _ in range(self.skip_measurements):
            self.__read()
        # measure multiple times
        read_values = []
        for _ in range(self.measurements):
            read_values.append(self.__read())
        read_values.sort()
        # return median
        return read_values[int(len(read_values) / 2)]
