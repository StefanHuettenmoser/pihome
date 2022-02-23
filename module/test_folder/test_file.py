from modules import PihomeActor


class Test(PihomeActor):
    def __init__(self, pi, db, name, stage, every, value_type, arg1, arg2):
        super().__init__(pi, db, name, stage, every)

        self.value_type = value_type
        self.arg1 = arg1
        self.arg2 = arg2

        self.db.init_table(self.name, self.value_type)

    def perform(self, callback):
        self.db.add_one(self.name, self.arg1)
        callback()
        return f"{self.name} <TEST>: {self.db} {self.arg1} {self.arg2}"
