# https://github.com/waveshare/e-Paper/blob/master/RaspberryPi_JetsonNano/python/examples/epd_2in7_test.py
import logging

from database import Logic

logging.basicConfig(level=logging.DEBUG)

import threading
import os
from PIL import ImageFont

rsc_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), "rsc")

from .lib import epd2in7
from .layouts import BasicList

from modules import PihomeActor


class List(PihomeActor):
    def __init__(self, pi, db, name, stage, every, title, line, values):
        super().__init__(pi, db, name, stage, every)

        self.title = title
        self.line = line
        self.value_logics = (Logic(value) for value in values)

        self.epd = epd2in7.EPD()
        self.epd.init()
        self.epd.Clear(0xFF)

        ubuntu_mono_regular = "Ubuntu_Mono/UbuntuMono-Regular.ttf"
        ubuntu_mono_bold = "Ubuntu_Mono/UbuntuMono-Bold.ttf"
        pixel_font_14 = ImageFont.truetype(
            os.path.join(rsc_dir, ubuntu_mono_regular), 14
        )
        pixel_font_18 = ImageFont.truetype(os.path.join(rsc_dir, ubuntu_mono_bold), 18)

        self.basic_list = BasicList(
            title=self.title,
            width=self.epd.width,
            height=self.epd.height,
            colors=self.__get_colors(),
            font_text=pixel_font_14,
            font_title=pixel_font_18,
        )

    def __get_colors(self):
        return (self.epd.GRAY1, self.epd.GRAY2, self.epd.GRAY3, self.epd.GRAY4)

    def draw_screen(self, callback):
        self.basic_list.add_element(
            self.line.format(
                *(value_logic.get_value(self.db) for value_logic in self.value_logics)
            )
        )

        self.epd.Init_4Gray()
        self.epd.display_4Gray(self.epd.getbuffer_4Gray(self.basic_list.get_image()))
        self.epd.sleep()
        callback()

    def perform(self, callback):
        threading.Thread(target=self.draw_screen, args=(callback,)).start()
        return "Update EPD Screen"
