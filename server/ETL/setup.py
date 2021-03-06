from setuptools import setup

import pathlib

here = pathlib.Path(__file__).parent.resolve()

requirements = [
    x
    for x in (here / "requirements.txt").read_text(encoding="utf-8").split("\n")
    if len(x) > 0
]
# long_description = (here / "README.md").read_text(encoding="utf-8")
long_description = "Not available yet..."

setup(
    name="pihome",
    description="A modular python script that collects data and stores it in a database",
    long_description=long_description,
    long_description_content_type="text/markdown",
    packages=["src/log"],
    version="0.1",
    url="https://github.com/StefanHuettenmoser/pihome",
    license="MIT",
    author="Stefan Huttenmoser",
    author_email="stefan.huettenmoser@gmail.com",
    classifiers=["Development Status :: 3 - Alpha"],
    python_requires=">=3.8",
    install_requires=requirements,
)
