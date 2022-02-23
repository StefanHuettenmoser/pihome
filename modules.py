import logging

logger = logging.getLogger(__name__)

import time
import pigpio
import inspect
import os
import pkgutil

import database


class PihomeActor:
    def __init__(
        self, pi: pigpio.pi, db: database.Database, name: str, stage: int, every: int
    ):
        self.pi = pi
        self.db = db
        self.name = name
        self.stage = stage
        self.every = int(every)
        if (
            self.every != every
            or self.every < 1
            or self.every > PerformanceSchedule.MAX_EVERY
        ):
            raise ValueError(
                f"The 'every'-parameter must be a whole number between 1 and {PerformanceSchedule.MAX_EVERY}, got {every}"
            )

    def perform(self, callback):
        raise NotImplementedError(f"Actor has no performance")


class ActorFactory:
    def __init__(self, module_dir):
        super().__init__()
        self.module_dir = module_dir
        self.load_modules()

    def build_actor(self, pi, db, name, config) -> PihomeActor:
        logger.debug(f"Build Actor {name} [{config['module']}]")
        every = PerformanceSchedule.MIN_EVERY
        try:
            every = config["every"]
        except:
            pass
        return self.modules[self.module_dir + "." + config["module"]](
            pi, db, name, config["stage"], every, **config["args"]
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

    def perform(self, time_index=-1, timeout=30, poll_interval=0.25):
        # LET ACTORS PERFORM
        stages = list(self.actors_by_stage)
        stages.sort()

        for stage in stages:
            logger.debug(f"Open Stage {stage}")
            actors = self.actors_by_stage[stage]
            self.wait_for_actors = len(actors)
            stage_must_end = time.time() + timeout

            def actor_finished():
                self.wait_for_actors -= 1

            actor: PihomeActor
            for actor in actors:
                if time_index == -1 or time_index % actor.every == 0:
                    start_time = time.time()
                    response = actor.perform(actor_finished)
                    logger.debug(
                        f"[{stage}] {actor.name}: {response} ({time.time()-start_time:.2f}s)"
                    )
                else:
                    actor_finished()

            while time.time() < stage_must_end and self.wait_for_actors:
                time.sleep(poll_interval)
            if self.wait_for_actors:
                raise TimeoutError(
                    f"Stage {stage} timed out after {timeout} seconds. {self.wait_for_actors} Tasks unfinished."
                )
            logger.debug(f"Close Stage {stage}")


class PerformanceSchedule:
    MIN_EVERY = 1
    MAX_EVERY = 60 * 24 * 7 * 4

    def __init__(self, actor_stager):
        self.actor_stager = actor_stager

    def follow_through(self):
        MIN_EVERY_S = self.MIN_EVERY * 60

        time_index = 0
        while True:
            start_time = time.time()
            self.actor_stager.perform(time_index)
            delta = time.time() - start_time()
            if delta > MIN_EVERY_S:
                logger.warn(f"Execution @{time_index} took to long! ({delta:.3f}s)")
                delta = MIN_EVERY_S
            else:
                logger.debug(f"Execution @{time_index} took {delta:.3f}s")

            time.sleep(MIN_EVERY_S - delta)
            time_index += 1
            time_index %= self.MAX_EVERY
