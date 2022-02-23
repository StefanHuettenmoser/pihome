import logging

logger = logging.getLogger(__name__)

import time
import pigpio
import inspect
import os
import pkgutil

import database


class PihomeActor:
    def __init__(self, pi: pigpio.pi, db: database.Database, name: str, stage: int):
        self.pi = pi
        self.db = db
        self.name = name
        self.stage = stage

    def perform(self, callback):
        raise NotImplementedError(f"Actor has no performance")


class ActorFactory:
    def __init__(self, module_dir):
        super().__init__()
        self.module_dir = module_dir
        self.load_modules()

    def build_actor(self, pi, db, name, config) -> PihomeActor:
        logger.debug(f"Build Actor {name} [{config['module']}]")
        return self.modules[self.module_dir + "." + config["module"]](
            pi, db, name, config["stage"], **config["args"]
        )

    def load_modules(self):
        self.modules = {}
        self.seen_module_dirs = []
        self.find_modules(self.module_dir)

    def find_modules(self, module_dir):
        try:
            imported_modules = __import__(module_dir, fromlist=[""])
        except Exception as e:
            logger.error(f"Could not load Module {module_dir}")
            logger.debug(e)
            return

        # LOOK IN CURRENT DIR
        for _, module_name, is_dir in pkgutil.iter_modules(
            imported_modules.__path__, imported_modules.__name__ + "."
        ):
            if not is_dir:
                try:
                    module_package = __import__(module_name, fromlist=[""])
                except Exception as e:
                    logger.error(f"Could not load Module {module_name}")
                    logger.debug(e)
                    continue
                module_classes = inspect.getmembers(module_package, inspect.isclass)
                for (_, module_class) in module_classes:
                    if issubclass(module_class, PihomeActor) & (
                        module_class is not PihomeActor
                    ):
                        module_key = (
                            f"{module_class.__module__}.{module_class.__name__}"
                        )
                        logger.debug(f"Load Module: {module_key}")
                        self.modules[module_key] = module_class

        # RECURSIVELY LOAD FROM NESTED DIRECTORIES
        nested_module_dirs = []
        if isinstance(imported_modules.__path__, str):
            nested_module_dirs.append(imported_modules.__path__)
        else:
            nested_module_dirs.extend([x for x in imported_modules.__path__])

        for nested_module_dir in nested_module_dirs:
            if nested_module_dir in self.seen_module_dirs:
                continue
            self.seen_module_dirs.append(nested_module_dir)

            child_modules = [
                child_module
                for child_module in os.listdir(nested_module_dir)
                if os.path.isdir(os.path.join(nested_module_dir, child_module))
            ]
            for child_module in child_modules:
                self.find_modules(module_dir + "." + child_module)


class ActorStager:
    def __init__(self, config, pi, db):
        # INITIALIZE WAIT FOR MODULE
        self.wait_for_actors = 0

        # PLUGIN LOADER
        actor_factory = ActorFactory("module")

        # LOAD ACTORS BY STAGE FROM CONFIG (USING PLUGINS)
        self.actors_by_stage = {}
        for actor_name in config["actors"]:
            actor = actor_factory.build_actor(
                pi,
                db,
                actor_name,
                config["actors"][actor_name],
            )
            if not actor.stage in self.actors_by_stage:
                self.actors_by_stage[actor.stage] = []

            self.actors_by_stage[actor.stage].append(actor)

    def perform(self, timeout=30, poll_interval=0.25):
        # LET ACTORS PERFORM
        stages = list(self.actors_by_stage)
        stages.sort()

        for stage in stages:
            logger.debug(f"Open Stage {stage}")
            actors = self.actors_by_stage[stage]
            self.wait_for_actors = len(actors)
            must_end = time.time() + timeout

            def actor_finished():
                self.wait_for_actors -= 1

            for actor in actors:
                response = actor.perform(actor_finished)
                logger.debug(f"[{stage}] {actor.name}: {response}")

            while time.time() < must_end and self.wait_for_actors:
                time.sleep(poll_interval)
            if self.wait_for_actors:
                raise TimeoutError(
                    f"Stage {stage} timed out after {timeout} seconds. {self.wait_for_actors} Tasks unfinished."
                )
            logger.debug(f"Close Stage {stage}")
