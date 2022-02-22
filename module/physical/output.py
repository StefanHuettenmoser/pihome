import subprocess
from time import sleep
import threading

from modules import PihomeActor
from database import Logic


class Output(PihomeActor):
    def __init__(self, pi, db, name, stage, input_pin, state=0, timeout=0):
        super().__init__(pi, db, name, stage)

        self.input_pin = input_pin
        self.state_logic = Logic(state)
        self.timeout = timeout

        self._execute(f"pigs modes {self.input_pin} w")

    def _execute(self, command):
        process = subprocess.Popen(command.split(), stdout=subprocess.PIPE)
        return process.communicate()

    def perform(self, callback):
        state = self.state_logic.get_value(self.db)
        self._execute(f"pigs w {self.input_pin} {1 if state else 0}")
        if self.timeout:

            def revert():
                self._execute(f"pigs w {self.input_pin} {0 if state else 1}")
                callback()

            timer = threading.Timer(self.timeout, revert)
            timer.start()
        else:
            callback()
        return f"Switch Pin-{self.input_pin} {'on' if state else 'off'}{f' for {self.timeout} seconds' if self.timeout else ''}"


class PWMOutput(PihomeActor):
    def __init__(
        self,
        pi,
        db,
        name,
        stage,
        input_pin,
        frequency,
        duty_cycle=0.5,
        hardware_PWM=False,
    ):
        super().__init__(pi, db, name, stage)
        self.input_pin = input_pin
        self.frequency_logic = Logic(frequency)
        self.duty_cycle_logic = Logic(duty_cycle)
        self.hardware_PWM = hardware_PWM

    def perform(self, callback):
        frequency = self.frequency_logic.get_value()
        duty_cycle = self.duty_cycle_logic.get_value()
        if self.hardware_PWM:
            self.pi.hardware_PWM(self.input_pin, frequency, int(1_000_000 * duty_cycle))
        else:
            self.pi.set_PWM_frequency(self.input_pin, frequency)
            self.pi.set_PWM_dutycycle(self.input_pin, int(duty_cycle * 255))

        callback()
