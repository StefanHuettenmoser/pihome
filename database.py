import mysql.connector
from datetime import datetime

TIME = "Time"
VALUE = "Value"


class Database:
    def __init__(self, host, database, user, password):
        # create database if it not allready exists
        Database.create_database(host, database, user, password)

        # connect to database
        self.conn = mysql.connector.connect(
            host=host, database=database, user=user, password=password
        )
        self.conn.autocommit = True

    def get_all(self, table):
        sql = f"SELECT * FROM {table}"
        return self._execute(sql)

    def get_last(self, table, n=1):
        sql = f"SELECT * FROM {table} ORDER BY id DESC LIMIT {n}"
        res = self._execute(sql)
        return {TIME: res[1], VALUE: res[2]}

    def add_one(self, table, value):
        time = datetime.now()
        value = value if type(value) != str else f'"{value}"'
        sql = f"""
        INSERT INTO {table} ({TIME}, {VALUE})
        VALUES 
        ("{time.strftime('%Y-%m-%d %H:%M:%S')}", {value})
        """
        self._execute(sql)

    def init_table(self, table, value_type):
        sql = f"""
        CREATE TABLE if not exists {table} (
            id int NOT NULL AUTO_INCREMENT, 
            {TIME} DATETIME NOT NULL, 
            {VALUE} {value_type} NOT NULL, 
            PRIMARY KEY (id) 
        )
        """
        self._execute(sql)

    def _execute(self, sql):
        with self.conn.cursor() as cursor:
            cursor.execute(sql)
            return cursor.fetchall()

    @staticmethod
    def create_database(host, database, user, password):
        conn = mysql.connector.connect(host=host, user=user, password=password)
        conn.autocommit = True
        with conn.cursor() as cursor:
            sql = f"CREATE DATABASE if not exists {database}"
            cursor.execute(sql)
