from setuptools import setup

import pathlib

here = pathlib.Path(__file__).parent.resolve()

requirements = [x
    for x in (here / "requirements.txt").read_text(encoding="utf-8").split("\n")
    if len(x) > 0
]
long_description = (here / "README.md").read_text(encoding="utf-8")

setup(
    name="pihome",
    description="A small server thats get data from the RaspberryPi and displays it",
    long_description=long_description,
    long_description_content_type="text/markdown",
    packages=["log"],
    version="0.1",
    url="https://github.com/StefanHuettenmoser/pihome",
    license="MIT",
    author="Stefan Hüttenmoser",
    author_email="stefan.huettenmoser@gmail.com",
    classifiers=["Development Status :: 3 - Alpha"],
    python_requires=">=3.8",
    install_requires = requirements
)
