import mysql.connector
from datetime import datetime, timedelta
import math
from inspect import signature

TIME = "Time"
VALUE = "Value"


class Database:

    SQL_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

    def __init__(self, host, database, user, password, reset=False):
        if reset:
            Database.reset_database(host, database, user, password)
        # create database if it not allready exists
        Database.create_database(host, database, user, password)

        # connect to database
        self.conn = mysql.connector.connect(
            host=host, database=database, user=user, password=password
        )
        self.conn.autocommit = True

    def get_all(self, table):
        sql = f"SELECT * FROM {table}"
        return self.___execute(sql)

    def get_last(self, table, n=1):
        sql = f"SELECT * FROM {table} ORDER BY {TIME} DESC LIMIT {n}"
        values = self.___execute(sql)
        return self.__parse(values)

    def get_between(self, table, start_date: datetime, end_date: datetime):

        sql = f"""
        SELECT * FROM {table}
        WHERE {TIME} BETWEEN
            "{start_date.strftime(self.SQL_DATE_FORMAT)}"
            AND "{end_date.strftime(self.SQL_DATE_FORMAT)}"
        """
        values = self.___execute(sql)
        return self.__parse(values)

    def add_one(self, table, value):
        date = datetime.now()
        sql = f"""
        INSERT INTO {table} ({TIME}, {VALUE})
        VALUES 
        {self.__format_input(date, value)}
        """
        self.___execute(sql)

    def add_many(self, table, data, replace=False):
        SEP = ",\n"
        sql = f"""
        {"INSERT" if not replace else "REPLACE"} INTO {table} ({TIME}, {VALUE})
        VALUES
        {SEP.join(self.__format_input(x["date"], x["value"]) for x in data)}
        """
        self.___execute(sql)

    def init_table(self, table, value_type, primary_keys=[]):
        sql = f"""
        CREATE TABLE if not exists {table} (
            {TIME} DATETIME NOT NULL, 
            {VALUE} {value_type} NOT NULL, 
            PRIMARY KEY ({TIME}) 
        )
        """
        self.___execute(sql)

    def delete_table(self, table):
        sql = f"DROP TABLE {table}"
        self.___execute(sql)

    def ___execute(self, sql):
        with self.conn.cursor() as cursor:
            cursor.execute(sql)
            return cursor.fetchall()

    @staticmethod
    def __format_input(date, value):
        value = value if type(value) != str else f'"{value}"'
        return f'("{date.strftime(Database.SQL_DATE_FORMAT)}",{value})'

    @staticmethod
    def __parse(values):
        return [{TIME: value[0], VALUE: value[1]} for value in values]

    @staticmethod
    def create_database(host, database, user, password):
        conn = mysql.connector.connect(host=host, user=user, password=password)
        conn.autocommit = True
        with conn.cursor() as cursor:
            sql = f"CREATE DATABASE if not exists {database}"
            cursor.execute(sql)

    @staticmethod
    def reset_database(host, database, user, password):
        conn = mysql.connector.connect(host=host, user=user, password=password)
        conn.autocommit = True
        with conn.cursor() as cursor:
            sql = f"DROP DATABASE if exists {database}"
            cursor.execute(sql)


def load_key(json, key, default):
    try:
        return json[key]
    except (KeyError, TypeError):
        return default


class Operation:
    def __init__(self, operation):
        # Assert that there is only one operation
        if len(list(operation)) != 1:
            raise ValueError(
                f"Operation excepts exactly one Operation Type, { len(list(operation))} where given.\n({operation})"
            )
        # Save the name and get the function
        self.name = list(operation)[0]
        self.fn = list(filter(lambda x: x["name"] == self.name, self.OPERATION_TYPE))[
            0
        ]["fn"]

    def calculate(self, value):
        raise NotImplementedError(f"Don't know how to process {value}")


class ListOperation(Operation):
    # DEFAULT OPERATION:
    __AVG_NAME = "AVG"
    AVG = {__AVG_NAME: {}}
    # AVAILABLE OPERATION TYPES
    OPERATION_TYPE = [
        {"name": __AVG_NAME, "fn": lambda b: sum(b) / len(b)},
        {"name": "SUM", "fn": lambda b: sum(b)},
        {"name": "MIN", "fn": lambda b: min(b)},
        {"name": "MAX", "fn": lambda b: max(b)},
    ]

    def __init__(self, operation):
        if not type(operation) == dict:
            operation = {operation: {}}
        super().__init__(operation)

    def calculate(self, value):
        return self.fn(value)


class ArithmeticOperation(Operation):
    # DEFAULT OPERATION:
    __NO_OP_NAME = "NO_OP"
    NO_OP = {__NO_OP_NAME: {}}
    # AVAILABLE OPERATION TYPES
    OPERATION_TYPE = [
        # NOOP
        {"name": __NO_OP_NAME, "fn": lambda a: a},
        # TWO ARG OPERATIONS
        {"name": "ADD", "fn": lambda a, b: a + b},
        {"name": "SUBTRACT", "fn": lambda a, b: a - b},
        {"name": "MULTIPLY", "fn": lambda a, b: a * b},
        {"name": "DIVIDE", "fn": lambda a, b: a / b},
        {"name": "MODULO", "fn": lambda a, b: a % b},
        {"name": "POWER", "fn": lambda a, b: a**b},
        {"name": "GT", "fn": lambda a, b: a > b},
        {"name": "LT", "fn": lambda a, b: a < b},
        {"name": "EQ", "fn": lambda a, b: a == b},
        {"name": "IN", "fn": lambda a, b: a in b},
        # ONE ARG OPERATIONS
        {"name": "CEIL", "fn": lambda b: math.ceil(b)},
        {"name": "FLOOR", "fn": lambda b: math.floor(b)},
        {"name": "ABS", "fn": lambda b: abs(b)},
    ]

    def __init__(self, operation):
        super().__init__(operation)
        # there is no b_value on a no_op
        if not self.__is_no_op():
            self.b_value_logic = Logic(next(iter(operation.values())))

    def calculate(self, db, a_value):
        # return the value if this is a no_op
        if self.__is_no_op():
            return a_value

        # get the b_value from the db
        b_value = self.b_value_logic.get_value(db)

        # check if the function matches the given arguments
        expected_arguments = len(signature(self.fn).parameters)
        if expected_arguments == 1:
            if not a_value is None:
                raise ValueError(
                    f"{self.name}-Operation can not use the first value {a_value} (only the second value {b_value})"
                )
            return self.fn(b_value)

        else:
            return self.fn(a_value, b_value)

    def __is_no_op(self):
        return self.name == self.__NO_OP_NAME


class TimeFrame:
    NO_FRAME = {"n": 1}

    def __init__(self, time_frame):
        if len(list(time_frame)) == 0:
            raise ValueError(
                f"Time Frame excepts more than one Values, { len(list(time_frame))} where given.\n({time_frame})"
            )
        self.is_n_time_frame = "n" in list(time_frame)
        self.operation = ListOperation(
            load_key(time_frame, "operation", ListOperation.AVG)
        )
        self.time_frame = time_frame

    def get_value(self, db: Database, reference_table):
        # apply list operation on list-values and return
        return self.operation.calculate(self.__get_value(db, reference_table))

    def __get_value(self, db: Database, reference_table):
        if self.is_n_time_frame:
            return [
                x[VALUE] for x in db.get_last(reference_table, n=self.time_frame["n"])
            ]

        # get start_date OR hours_ago
        start_date = load_key(self.time_frame, "start_date", None)
        if start_date is None:
            start_date = datetime.now() - timedelta(
                hours=self.time_frame["start_X_hours_ago"]
            )

        # get end_date OR duration_h
        end_date = load_key(self.time_frame, "end_date", None)
        if end_date is None:
            end_date = start_date + timedelta(hours=self.time_frame["duration_h"])

        return [x[VALUE] for x in db.get_between(reference_table, start_date, end_date)]


class Logic:
    TIME_KEY = "$TIME"
    TIME_DELTA_KEY = "$DELTA_S"
    TIME_FORMAT_KEY = "$FORMAT"
    DEFAULT_TIME_FORMAT = "%d.%m.%Y %H:%M:%S"

    def __init__(self, logic):
        # get operation
        self.operation = ArithmeticOperation(
            load_key(logic, "operation", ArithmeticOperation.NO_OP)
        )

        # check if logic is a static value
        if not type(logic) == dict:
            self.static_value = logic
            return
        try:
            time_logic = logic[self.TIME_KEY]
            time_delta_s = load_key(time_logic, self.TIME_DELTA_KEY, 0)
            time_format = load_key(
                time_logic, self.TIME_FORMAT_KEY, self.DEFAULT_TIME_FORMAT
            )
            self.static_value = (
                datetime.now() + timedelta(seconds=time_delta_s)
            ).strftime(time_format)
            return
        except:
            pass

        try:
            # try to get the reference_table for the db
            self.reference_table = logic["reference_table"]
        except KeyError:
            # if there is no reference_table, get the static value
            self.static_value = load_key(logic, "static_value", None)
            return

        # try to get a time_frame for the db request
        self.time_frame = TimeFrame(load_key(logic, "time_frame", TimeFrame.NO_FRAME))

    def get_value(
        self,
        db: Database,
    ):
        return self.operation.calculate(db, self.__get_value(db))

    def __get_value(self, db: Database):
        # try to return the constant value if there is one
        try:
            return self.static_value
        except AttributeError:
            pass

        # get value(s) from the db table for the specified time_frame
        return self.time_frame.get_value(db, self.reference_table)
