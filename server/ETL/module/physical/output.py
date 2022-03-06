import subprocess
import threading
from time import sleep
from unicodedata import name

from src.modules import PihomeActor
from src.logic import Logic


class Debug(PihomeActor):
    def __init__(self, pi, db, name, stage, every, state):
        super().__init__(pi, db, name, stage, every)
        self.state_logic = Logic.from_config(state)

    def perform(self, callback):
        state = self.state_logic.get_value(self.db)
        callback()
        return f"Debugging Output {self.name}: {state}"


class DebugAsync(PihomeActor):
    def __init__(self, pi, db, name, stage, every):
        super().__init__(pi, db, name, stage, every)
        self.value = -1
        self.daemon_thread = threading.Thread(
            target=self.daemon_function, args=(), daemon=True
        )
        self.daemon_thread.start()

    def daemon_function(self):
        import random

        while True:
            self.value = random.random()
            sleep(0.1)

    def perform(self, callback):
        sleep(5)
        callback()
        return f"Async-Debugging Output {self.name}: {self.value}"


class TimeoutOutput(PihomeActor):
    def __init__(self, pi, db, name, stage, every, timeout):
        super().__init__(pi, db, name, stage, every)
        self.timeout = timeout

    def timeout_action(self, action, revert_action, callback):
        action()
        if self.timeout:

            def revert():
                revert_action()
                callback()

            timer = threading.Timer(self.timeout, revert)
            timer.start()
        else:
            callback()


class Output(TimeoutOutput):
    def __init__(self, pi, db, name, stage, every, input_pin, timeout=0, state=0):
        super().__init__(pi, db, name, stage, every, timeout)

        self.input_pin = input_pin
        self.state_logic = Logic.from_config(state)

        self.___execute(f"pigs modes {self.input_pin} w")

    def ___execute(self, command):
        process = subprocess.Popen(command.split(), stdout=subprocess.PIPE)
        return process.communicate()

    def perform(self, callback):
        state = self.state_logic.get_value(self.db)

        def action():
            self.___execute(f"pigs w {self.input_pin} {1 if state else 0}")

        def revert_action():
            self.___execute(f"pigs w {self.input_pin} {0 if state else 1}")

        self.timeout_action(action, revert_action, callback)

        return f"Switch Pin-{self.input_pin} {'on' if state else 'off'}{f' for {self.timeout} seconds' if self.timeout else ''}"


class PWMOutput(TimeoutOutput):
    def __init__(
        self,
        pi,
        db,
        name,
        stage,
        every,
        input_pin,
        frequency,
        timeout=0,
        duty_cycle=0.5,
        hardware_PWM=False,
    ):
        super().__init__(pi, db, name, stage, every, timeout)
        self.input_pin = input_pin
        self.frequency_logic = Logic.from_config(frequency)
        self.duty_cycle_logic = Logic.from_config(duty_cycle)
        self.hardware_PWM = hardware_PWM

    def set_pwm(self, frequency, duty_cycle):
        if self.hardware_PWM:
            self.pi.hardware_PWM(self.input_pin, frequency, int(1_000_000 * duty_cycle))
        else:
            self.pi.set_PWM_frequency(self.input_pin, frequency)
            self.pi.set_PWM_dutycycle(self.input_pin, int(duty_cycle * 255))

    def perform(self, callback):
        frequency = self.frequency_logic.get_value(self.db)
        duty_cycle = self.duty_cycle_logic.get_value(self.db)

        def action():
            self.set_pwm(frequency, duty_cycle)

        def revert_action():
            self.set_pwm(0, 0)

        self.timeout_action(action, revert_action, callback)
        return f"Switch Pin-{self.input_pin} to {frequency:.2f}Hz @{int(duty_cycle*100)}% {f' for {self.timeout} seconds' if self.timeout else ''}"
