from components import PihomeComponent


class Test(PihomeComponent):
    def __init__(self, name, arg1, arg2):
        super().__init__(name)
        self.arg1 = arg1
        self.arg2 = arg2

    def run(self, db):
        print("run Test Component")
        return f"{self.name} <TEST>: {db} {self.arg1} {self.arg2}"
