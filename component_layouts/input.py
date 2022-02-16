import pigpio

from components import PihomeComponent


class Input(PihomeComponent):
    def __init__(self, pi, db, name, stage, output_pin, value_type):
        super().__init__(pi, db, name, stage)

        self.output_pin = output_pin
        self.value_type = value_type
        self.db.init_table(self.name, self.value_type)

        self.pi.set_mode(self.output_pin, pigpio.INPUT)

    def run(self, callback):
        value = self.pi.read(self.output_pin)
        self.db.add_one(self.name, value)
        callback()
        return f"Read form Pin-{self.output_pin}: {value} and Save to Database '{self.name}'"
