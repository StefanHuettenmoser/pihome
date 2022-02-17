# pihome

PRE-ALPHA

Modular Stage Based RaspberryPi Data Warehouse and Smart Home Server.

Different modules like sensors, scrappers and outputs (like LEDs or LCDs) can be added and managed in a plugin based style. Instances of this modules called actors are then executes. The actors are loaded from a configuration file and executed in a staged fashion, where the actors from the first stage are executed, then the actors from the next stage. This behavior allows actors in a latter stage to use the output from actors in a previous stage.

## Installation

1. Install the python dependencies
   `python setup.py install`

2. set up the configuration
   `cp config/pihome.json.example config/pihome.json`

3. execute python script to run according to the configuration in the pihome.json file
   `python main.py`

4. write custom modules and save them to the module folder to access them from the configuration

## further dependencies:

- python3
- pigpio (running)
- mysql (running)

## Upcoming

The Script will be executed automatically using a cron-job.
A Web-Interface will be created to:

1. configure, create and remove actors.
2. display the gathered data from the data warehouse.
