import logging

logger = logging.getLogger(__name__)

from bs4 import BeautifulSoup
import requests
from datetime import datetime
from datetime import timedelta
import time
from operator import mul
from functools import reduce


class WeatherScraper:
    TEMP = "temperature"
    RAIN_P = "rain_probability"
    RAIN_ML = "rain_amount"
    WIND_DIR = "wind_direction"
    WIND_KMH = "wind_speed_avg"
    WIND_KMH_MAX = "wind_speed_max"
    VALUE_TYPES = {
        TEMP: {"value_type": "INT", "fn": int},
        RAIN_P: {"value_type": "INT", "fn": int},
        RAIN_ML: {"value_type": "FLOAT", "fn": float},
        WIND_DIR: {"value_type": "VARCHAR(16)", "fn": str},
        WIND_KMH: {"value_type": "INT", "fn": int},
        WIND_KMH_MAX: {"value_type": "INT", "fn": int},
    }

    def __init__(self, lat, long, weather_data={}):
        self.lat = lat
        self.long = long
        self.weather_data = weather_data

    def update(self, retry=0):
        response = requests.get(
            f"https://www.srf.ch/meteo/wetter/w/{self.lat},{self.long}"
        )
        if response.status_code != 200:
            logger.warn(
                f"WARNING: Could not reach srf.ch/meteo – status: {response.status_code}"
            )
            if retry <= 3:
                logger.debug("Try again in 5 seconds")
                time.sleep(5)
                return self.update(retry + 1)

        soup = BeautifulSoup(response.content, "html.parser")

        weather_elements = soup.findAll("ul", attrs={"class": "weather-hours"})

        self.__update_from_html(weather_elements)
        logger.debug("Meteo update successful!")

    def __update_from_html(self, weather_elements):

        temperature_elements = weather_elements[0].findAll(
            "li", attrs={"class": "weather-hours__item"}
        )
        wind_elements = weather_elements[1].findAll(
            "li", attrs={"class": "weather-hours__item"}
        )

        day_offset = 0
        last_hour = 0

        def add_key(key):
            if not key in self.weather_data:
                self.weather_data[key] = []

        add_key(self.TEMP)
        add_key(self.RAIN_P)
        add_key(self.RAIN_ML)
        add_key(self.WIND_DIR)
        add_key(self.WIND_KMH)
        add_key(self.WIND_KMH_MAX)

        for i in range(len(temperature_elements)):

            temperature_element = temperature_elements[i]
            wind_element = wind_elements[i]

            time1 = (
                temperature_element.find("div", attrs={"class": "weather-hours__time"})
                .get_text()
                .replace("Uhr", "")
            )
            time2 = (
                wind_element.find("div", attrs={"class": "weather-hours__time"})
                .get_text()
                .replace("Uhr", "")
            )

            if time1 != time2:
                logger.warn("ERROR, times do not match!")
                continue
            # else
            time = time1

            hour = int(time[0:2])
            if hour < last_hour:
                day_offset += 1
            last_hour = hour
            day = (datetime.now() + timedelta(days=day_offset)).strftime("%d.%m.%Y")

            temperature = (
                temperature_element.find(
                    "div", attrs={"class": "weather-hours__temperature"}
                )
                .get_text()
                .replace("\n", "")
                .replace(" ", "")
                .replace("°Celsius", "")
            )

            rain_amount = (
                temperature_element.find(
                    "div", attrs={"class": "weather-hours__amount"}
                )
                .get_text()
                .replace("Regenmenge", "")
            )
            rain_probability = (
                temperature_element.find(
                    "div", attrs={"class": "weather-hours__percent"}
                )
                .get_text()
                .replace("Regenwahrscheinlichkeit", "")
                .replace("\n", "")
                .replace(" ", "")
                .replace("<5", "0")
            )

            wind_direction = wind_element.find(
                "img", attrs={"class": "weather-hours__image"}
            )["alt"].replace("Wind", "")
            wind_speed_avg, wind_speed_max = (
                wind_element.find("div", attrs={"class": "weather-hours__wind"})
                .get_text()
                .replace("Wind / Böenspitzen", "")
                .replace("\n", "")
                .replace(" ", "")
                .split("/")
            )
            date = datetime.strptime(f"{day} {hour}", "%d.%m.%Y %H")

            def append_value(key, date, value):
                self.weather_data[key].append(
                    {"date": date, "value": self.VALUE_TYPES[key]["fn"](value)}
                )

            append_value(self.TEMP, date, temperature)
            append_value(self.RAIN_P, date, rain_probability)
            append_value(self.RAIN_ML, date, rain_amount)
            append_value(self.WIND_DIR, date, wind_direction)
            append_value(self.WIND_KMH, date, wind_speed_avg)
            append_value(self.WIND_KMH_MAX, date, wind_speed_max)


def __format_input(time, value):
    value = value if type(value) != str else f'"{value}"'
    return f'("{time.strftime("%Y-%m-%d %H:%M:%S")}",{value})'


if __name__ == "__main__":
    weather_scraper = WeatherScraper(lat="47.0609", long="8.3572")
    weather_scraper.update()
    for key in weather_scraper.weather_data:
        data = weather_scraper.weather_data[key]
        print(key)
        print(",\n".join(__format_input(x["date"], x["value"]) for x in data[0:1]))
