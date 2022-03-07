import mysql.connector
from datetime import datetime

TIME = "Time"
VALUE = "Value"

SYSTEM_PREFIX = "$"


def check_table_name(tableName):
    if tableName[0] == SYSTEM_PREFIX:
        raise ValueError(f"WARNING: Table name can not start with a {SYSTEM_PREFIX}")


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

    def get_all(self, tableName):
        check_table_name(tableName)
        sql = f"SELECT * FROM {tableName}"
        return self.___execute(sql)

    def get_last(self, tableName, n=1):
        check_table_name(tableName)
        sql = f"SELECT * FROM {tableName} ORDER BY {TIME} DESC LIMIT {n}"
        values = self.___execute(sql)
        return self.__parse(values)

    def get_between(self, tableName, start_date: datetime, end_date: datetime):

        check_table_name(tableName)
        sql = f"""
        SELECT * FROM {tableName}
        WHERE {TIME} BETWEEN
            "{start_date.strftime(self.SQL_DATE_FORMAT)}"
            AND "{end_date.strftime(self.SQL_DATE_FORMAT)}"
        """
        values = self.___execute(sql)
        return self.__parse(values)

    def add_one(self, tableName, value):
        check_table_name(tableName)
        date = datetime.now()
        sql = f"""
        INSERT INTO {tableName} ({TIME}, {VALUE})
        VALUES 
        {self.__format_input(date, value)}
        """
        self.___execute(sql)

    def add_many(self, tableName, data, replace=False):
        check_table_name(tableName)
        SEP = ",\n"
        sql = f"""
        {"INSERT" if not replace else "REPLACE"} INTO {tableName} ({TIME}, {VALUE})
        VALUES
        {SEP.join(self.__format_input(x["date"], x["value"]) for x in data)}
        """
        self.___execute(sql)

    def init_table(self, tableName, value_type):
        check_table_name(tableName)
        sql = f"""
        CREATE TABLE if not exists {tableName} (
            {TIME} DATETIME NOT NULL, 
            {VALUE} {value_type} NOT NULL, 
            PRIMARY KEY ({TIME}) 
        )
        """
        self.___execute(sql)

    def delete_table(self, tableName):
        check_table_name(tableName)
        sql = f"DROP TABLE {tableName}"
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
