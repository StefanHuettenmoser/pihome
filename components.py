import logging

logger = logging.getLogger(__name__)

import multiprocessing
import time
import pigpio
import inspect
import os
import pkgutil

import database


class PihomeComponent:
    def __init__(self, pi: pigpio.pi, db: database.Database, name: str, stage: int):
        self.pi = pi
        self.db = db
        self.name = name
        self.stage = stage

    def run(self):
        raise NotImplementedError


class ComponentFactory:
    def __init__(self, component_layout_package):
        super().__init__()
        self.component_layout_package = component_layout_package
        self.load_component_layouts()

    def build_component(self, pi, db, name, config) -> PihomeComponent:
        return self.component_layouts[
            self.component_layout_package + "." + config["component_layout"]
        ](pi, db, name, config["stage"], **config["args"])

    def load_component_layouts(self):
        self.component_layouts = {}
        self.seen_paths = []
        self.find_component_layouts(self.component_layout_package)

    def find_component_layouts(self, package):
        imported_package = __import__(package, fromlist=[""])

        # LOOK IN CURRENT DIR
        for _, pluginname, is_pkg in pkgutil.iter_modules(
            imported_package.__path__, imported_package.__name__ + "."
        ):
            if not is_pkg:
                plugin_module = __import__(pluginname, fromlist=[""])
                clsmembers = inspect.getmembers(plugin_module, inspect.isclass)
                for (_, c) in clsmembers:
                    if issubclass(c, PihomeComponent) & (c is not PihomeComponent):
                        plugin_name = f"{c.__module__}.{c.__name__}"
                        logger.debug(f"Load Plugin: {plugin_name}")
                        self.component_layouts[plugin_name] = c

        # RECURSIVELY LOAD FROM NESTED DIRECTORIES
        all_current_paths = []
        if isinstance(imported_package.__path__, str):
            all_current_paths.append(imported_package.__path__)
        else:
            all_current_paths.extend([x for x in imported_package.__path__])

        for pkg_path in all_current_paths:
            if pkg_path not in self.seen_paths:
                self.seen_paths.append(pkg_path)

                child_pkgs = [
                    p
                    for p in os.listdir(pkg_path)
                    if os.path.isdir(os.path.join(pkg_path, p))
                ]

                for child_pkg in child_pkgs:
                    self.find_component_layouts(package + "." + child_pkg)


class ComponentsHandler:
    def __init__(self, config, pi, db):
        # PLUGIN LOADER
        component_factory = ComponentFactory("component_layouts")

        # LOAD COMPONENTS BY STAGE FROM CONFIG (USING PLUGINS)
        self.components_by_stage = {}
        for component_name in config["components"]:
            component = component_factory.build_component(
                pi,
                db,
                component_name,
                config["components"][component_name],
            )
            if not component.stage in self.components_by_stage:
                self.components_by_stage[component.stage] = []

            self.components_by_stage[component.stage].append(component)

    def run(self):
        # RUN COMPONENTS
        stages = list(self.components_by_stage)
        stages.sort()

        # FOR EVERY STAGE
        for stage in stages:
            logger.debug(f"Run Stage {stage}")
            components = self.components_by_stage[stage]
            start_time = time.time()

            def run_component(component):
                component.run()
                return component

            def get_runtime_ms():
                return 1000 * int(time.time() - start_time)

            p = multiprocessing.Pool()
            for component in p.imap_unordered(run_component, components):
                logger.debug(
                    f"\t[{stage}] {component.name} Finished ({get_runtime_ms()}ms)"
                )

            logger.debug(f"Stage {stage} Finished ({get_runtime_ms()}ms)")
