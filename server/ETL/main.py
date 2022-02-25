import logging

logger = logging.getLogger(__name__)

import pigpio
import argparse
import os
import json

from src.log.logger import BaseLogger
from src.modules import ActorStager, PerformanceSchedule
from src.database import Database

parser = argparse.ArgumentParser(
    prog="pihome",
    description="Get Data and Upload to Pi Home Database",
    allow_abbrev=False,
)
# parser.add_argument("test", type=str, metavar="T", help="I can not help you")
parser.add_argument("-v", "--verbose", action="store_true", help="verbose logging")
parser.add_argument("-r", "--reset", action="store_true", help="reset database")
parser.add_argument(
    "-s", "--stage", type=int, help="force a single stage to be executed"
)
parser.add_argument(
    "--debug-once",
    action="store_true",
    help="execute every module twice to check for errors",
)
parser.add_argument(
    "--once",
    action="store_true",
    help="run only once",
)

args = parser.parse_args()


def main():
    # INITIALIZE LOGGER
    file_dir = os.path.split(os.path.realpath(__file__))[0]
    logger_conf_file = os.path.join(
        file_dir,
        "log_config/logging_v.conf" if args.verbose else "log_config/logging.conf",
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
        actor_stager = ActorStager(config, pi, db, args.stage)
        # SCHEDULE EXECUTIONS IF DESIRED
        if args.once or args.debug_once:
            actor_stager.perform()
            if args.debug_once:
                actor_stager.perform()
        else:
            performance_schedule = PerformanceSchedule(actor_stager)
            performance_schedule.follow_through()
    finally:
        pi.stop()


if __name__ == "__main__":
    main()
