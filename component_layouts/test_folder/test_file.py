from components import PihomeComponent


class Test(PihomeComponent):
    def __init__(self, db, name, value_type, arg1, arg2):
        super().__init__(db, name)

        self.value_type = value_type
        self.arg1 = arg1
        self.arg2 = arg2

        self.db.init_table(self.name, self.value_type)

    def run(self):
        self.db.add_one(self.name, self.arg1)
        print(self.db.get_last(self.name))
        return f"{self.name} <TEST>: {self.db} {self.arg1} {self.arg2}"
