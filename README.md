# pihome

PRE-ALPHA

Modular Stage Based RaspberryPi Data Warehouse and Smart Home Web-Server.

Different ETL modules like sensors, scrappers and outputs (like LEDs or LCDs) can be added and managed in a plugin based style. Instances of this modules (called actors) are then executed. The actors are loaded from a configuration file and executed in a staged fashion, where the actors from the first stage are executed, then the actors from the next stage, etc... This behavior allows actors in a latter stage to use the output from actors in a previous stage.

The gathered data can than be displayed on a web server using various widgets.

## Usage

- Connect all devices to the Raspberry Pi GPIO
- Install Python Service and Node Servers
- Configure server/config/pihome.json to match your physical devices
- Access website on Port 5000

## Installation

### 1. Start Python Service (Gathers Data)

1. Navigate to the server
   `cd server`

2. Install the python dependencies
   `python ETL/setup.py install`

3. set up the default configuration
   `cp config/pihome.json.example config/pihome.json`

4. execute python script
   `python ELT/main.py`

5. write custom modules and save them to the module folder to access them from the configuration

#### 2. Start Backend Web-Server

1. Navigate to the server
   `cd server`

2. Install the node dependencies
   `npm i`

3. set up the configuration
   `cp .env.example .env`

4. Start the Backend Server
   `npm start`

#### 3. Start Frontend Web-Server

1. Navigate to the client
   `cd client`

2. Install the node dependencies
   `npm i`

3. set up the configuration
   `cp .env.example .env`

4. Start the Frontend Server
   `npm start`

## dependencies:

- python3
- node
- pigpio (running service)
- mysql (running service)

## Upcoming

- more widgets
- real layout and design
- ability to add, remove and edit ETL modules directly from web-server
- Add libcamera webstream support for raspi-camera (https://github.com/pimterry/raspivid-stream, https://github.com/131/h264-live-player)
