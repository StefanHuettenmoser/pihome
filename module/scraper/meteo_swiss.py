from src.modules import PihomeActor

import threading

from .lib import meteo_swiss


class MeteoSwissScraper(PihomeActor):
    def __init__(self, pi, db, name, stage, every, location, lat, long):
        super().__init__(pi, db, name, stage, every)
        self.location = location
        self.weather_scraper = meteo_swiss.WeatherScraper(lat, long)

    def scrap_and_save(self, callback):
        self.weather_scraper.update()
        for key in self.weather_scraper.weather_data:
            db_table = f"{self.location}${key}"

            self.db.init_table(
                db_table, meteo_swiss.WeatherScraper.VALUE_TYPES[key]["value_type"]
            )
            # self.db.delete_table(db_table)
            # continue
            data = self.weather_scraper.weather_data[key]
            self.db.add_many(db_table, data, replace=True)
        callback()

    def perform(self, callback):
        threading.Thread(target=self.scrap_and_save, args=(callback,)).start()
        return f"Scrapping Data from Meteo Swiss for {self.location}"
