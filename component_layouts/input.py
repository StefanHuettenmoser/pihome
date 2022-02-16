import pigpio

from components import PihomeComponent


class Input(PihomeComponent):
    def __init__(self, db, name, input_pin, value_type):
        super().__init__(db, name)

        self.input_pin = input_pin
        self.value_type = value_type
        self.db.init_table(self.name, self.value_type)

        self.pi = pigpio.pi()
        self.pi.set_mode(self.input_pin, pigpio.INPUT)

    def run(self):
        value = self.pi.read(self.input_pin)
        self.db.add_one(self.name, value)
        return f"Read form Pin-{self.input_pin}: {value} and Save to Database '{self.name}'"
