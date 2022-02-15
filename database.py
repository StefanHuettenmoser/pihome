import mysql.connector
from datetime import datetime

TIME = "Time"
VALUE = "Value"


class Database:
    def __init__(self, host, database, user, password):
        # create database if it not allready exists
        mysql.connector.connect(
            host=host, user=user, password=password
        ).cursor().execute(f"CREATE DATABASE if not exists f{database}")

        # connect to database
        conn = mysql.connector.connect(
            host=host, database=database, user=user, password=password
        )
        self.cursor = conn.cursor()

    def get_all(self, table):
        self.cursor.execute(f"SELECT * FROM {table}")
        return self.cursor

    def add_one(self, table, time: datetime, value):
        self.cursor.execute(
            f"INSERT INTO f{table}(f{TIME}, f{VALUE}) VALUES(f{time.strftime('%Y-%m-%d %H:%M:%S')}, f{value})"
        )
        return self.cursor

    def init_table(self, table, value_type):
        self.cursor.execute(
            f"CREATE TABLE if not exists f{table} (f{TIME} DATETIME, f{VALUE} f{value_type})"
        )
