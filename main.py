import logging

logger = logging.getLogger(__name__)

import pigpio
import argparse
import os
import json

from log.logger import BaseLogger
from components import ComponentsHandler
from database import Database

parser = argparse.ArgumentParser(description="Get Data and Upload to Pi Home Database")
# parser.add_argument("test", type=str, metavar="T", help="I can not help you")
parser.add_argument("-v", "--verbose", action="store_true", help="Verbose logging")

args = parser.parse_args()


def main():
    # LOGGER
    file_dir = os.path.split(os.path.realpath(__file__))[0]
    conf_file = os.path.join(
        file_dir, "log/logging_v.conf" if args.verbose else "log/logging.conf"
    )
    BaseLogger(conf_file=conf_file)

    # LOAD CONFIGURATION
    with open("./config/pihome.config") as f:
        pihome_configuration = json.load(f)

    # CREATE DATABASE CONNECTION
    db = Database(
        pihome_configuration["db"]["host"],
        pihome_configuration["db"]["database"],
        pihome_configuration["db"]["user"],
        pihome_configuration["db"]["password"],
    )

    # CREATE PI GPIO INSTANCE
    pi = pigpio.pi()

    # CREATE COMPONENT HANDLER
    handler = ComponentsHandler(pihome_configuration, pi, db)
    handler.run()

    pi.stop()


if __name__ == "__main__":
    main()
