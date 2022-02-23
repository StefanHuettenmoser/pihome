import logging

logger = logging.getLogger(__name__)

import pigpio
import argparse
import os
import json

from log.logger import BaseLogger
from modules import ActorStager, PerformanceSchedule
from database import Database

parser = argparse.ArgumentParser(description="Get Data and Upload to Pi Home Database")
# parser.add_argument("test", type=str, metavar="T", help="I can not help you")
parser.add_argument("-v", "--verbose", action="store_true", help="verbose logging")
parser.add_argument("-r", "--reset", action="store_true", help="reset database")
parser.add_argument(
    "-s",
    "--schedule",
    action="store_true",
    help="schedule executions according to config-file",
)

args = parser.parse_args()


def main():
    # INITIALIZE LOGGER
    file_dir = os.path.split(os.path.realpath(__file__))[0]
    logger_conf_file = os.path.join(
        file_dir, "log/logging_v.conf" if args.verbose else "log/logging.conf"
    )
    BaseLogger(logger_conf_file)

    # LOAD CONFIGURATION
    with open("./config/pihome.json") as f:
        config = json.load(f)

    # CREATE DATABASE CONNECTION
    db = Database(
        config["db"]["host"],
        config["db"]["database"],
        config["db"]["user"],
        config["db"]["password"],
        reset=args.reset,
    )

    # CREATE PI GPIO INSTANCE
    pi = pigpio.pi()
    try:
        # CREATE ACTOR STAGER
        actor_stager = ActorStager(config, pi, db)
        # SCHEDULE EXECUTIONS IF DESIRED
        if not args.schedule:
            actor_stager.perform()
        else:
            performance_schedule = PerformanceSchedule(actor_stager)
            performance_schedule.follow_through()
    finally:
        pi.stop()


if __name__ == "__main__":
    main()
