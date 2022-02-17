import logging

logger = logging.getLogger(__name__)

import pigpio
import argparse
import os
import json

from log.logger import BaseLogger
from modules import ActorStager
from database import Database

parser = argparse.ArgumentParser(description="Get Data and Upload to Pi Home Database")
# parser.add_argument("test", type=str, metavar="T", help="I can not help you")
parser.add_argument("-v", "--verbose", action="store_true", help="Verbose logging")

args = parser.parse_args()


def main():
    # INITIALIZE LOGGER
    file_dir = os.path.split(os.path.realpath(__file__))[0]
    logger_conf_file = os.path.join(
        file_dir, "log/logging_v.conf" if args.verbose else "log/logging.conf"
    )
    BaseLogger(logger_conf_file)

    # LOAD CONFIGURATION
    with open("./config/pihome.config") as f:
        config = json.load(f)

    # CREATE DATABASE CONNECTION
    db = Database(
        config["db"]["host"],
        config["db"]["database"],
        config["db"]["user"],
        config["db"]["password"],
    )

    # CREATE PI GPIO INSTANCE
    pi = pigpio.pi()

    # CREATE ACTOR STAGER
    actor_stager = ActorStager(config, pi, db)
    actor_stager.perform()

    pi.stop()


if __name__ == "__main__":
    main()
