import subprocess
from time import sleep

from components import PihomeComponent


class Switch(PihomeComponent):
    def __init__(self, db, name, input_pin, state=0, timeout=0):
        super().__init__(db, name)

        self.input_pin = input_pin
        self.state = state
        self.timeout = timeout

        self._execute(f"pigs modes {self.input_pin} w")

    def _execute(self, command):
        process = subprocess.Popen(command.split(), stdout=subprocess.PIPE)
        return process.communicate()

    def run(self):
        self._execute(f"pigs w {self.input_pin} {1 if self.state else 0}")
        if self.timeout:
            sleep(self.timeout)
            self._execute(f"pigs w {self.input_pin} {0 if self.state else 1}")

        return f"Switch Pin-{self.input_pin} {'on' if self.state else 'off'}{f' for {self.timeout} seconds' if self.timeout else ''}"
