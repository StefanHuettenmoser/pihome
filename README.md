# PIHOME

1. Install the python dependencies
   `python setup.py install`

2. set up the configuration
   `cp config/pihome.config.template config/pihome.config`

3. execute python script to run according to the configuration in the pihome.config file
   `python main.py`

4. write custom plugins to the component_layouts folder to access them from the configuration

## dependencies:

- python3
- pigpio (running)
- mysql (running)
