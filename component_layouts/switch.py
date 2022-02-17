import subprocess
from time import sleep
import threading

from components import PihomeComponent
from database import Database, VALUE


class Switch(PihomeComponent):
    def __init__(self, pi, db, name, stage, input_pin, state=0, timeout=0):
        super().__init__(pi, db, name, stage)

        self.input_pin = input_pin
        self.state = state
        self.timeout = timeout

        self._execute(f"pigs modes {self.input_pin} w")

    def _execute(self, command):
        process = subprocess.Popen(command.split(), stdout=subprocess.PIPE)
        return process.communicate()

    def run(self, callback):
        self._execute(f"pigs w {self.input_pin} {1 if self.state else 0}")
        if self.timeout:

            def revert():
                self._execute(f"pigs w {self.input_pin} {0 if self.state else 1}")
                callback()

            timer = threading.Timer(self.timeout, revert)
            timer.start()
        else:
            callback()
        return f"Switch Pin-{self.input_pin} {'on' if self.state else 'off'}{f' for {self.timeout} seconds' if self.timeout else ''}"


class Logic:
    def __init__(self, logic_json):

        self.n = Logic.load_key(logic_json, "n", 1)
        self.threshold = Logic.load_key(logic_json, "threshold", 0)
        self.invert = Logic.load_key(logic_json, "invert", False)

    def get_state(
        self,
        db: Database,
        reference_table: str,
    ):
        # load data
        reference_data = db.get_last(reference_table, n=self.n)
        # get avg of data
        avg_value = sum(x[VALUE] for x in reference_data) / len(reference_data)
        # compare to threshold
        state = avg_value > self.threshold
        # invert (if self.invert)
        return not state if self.invert else state

    @staticmethod
    def load_key(json, key, default):
        try:
            return json[key]
        except KeyError:
            return default


class LogicSwitch(Switch):
    def __init__(
        self, pi, db, name, stage, input_pin, reference_table, logic_json={}, timeout=0
    ):
        super().__init__(pi, db, name, stage, input_pin, state=0, timeout=timeout)
        self.logic_json = logic_json
        self.reference_table = reference_table

    def run(self, callback):
        self.state = Logic(self.logic_json).get_state(self.db, self.reference_table)
        return super().run(callback)
