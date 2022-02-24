# https://github.com/waveshare/e-Paper/blob/master/RaspberryPi_JetsonNano/python/examples/epd_2in7_test.py
import logging

from src.logic import Logic

logging.basicConfig(level=logging.DEBUG)

import threading
import os
from PIL import ImageFont

rsc_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), "rsc")

from .lib import epd2in7
from .layouts import BasicList

from src.modules import PihomeActor


class List(PihomeActor):
    def __init__(
        self,
        pi,
        db,
        name,
        stage,
        every,
        title: str,
        lines: list,
        values: list,
        body_font_size=14,
        title_font_size=18,
    ):
        super().__init__(pi, db, name, stage, every)

        self.title = title
        self.lines = lines
        self.value_logics = [
            [Logic.from_config(value) for value in line_values]
            for line_values in values
        ]

        self.epd = epd2in7.EPD()
        self.epd.init()
        self.epd.Clear(0xFF)

        ubuntu_mono_regular = "Ubuntu_Mono/UbuntuMono-Regular.ttf"
        ubuntu_mono_bold = "Ubuntu_Mono/UbuntuMono-Bold.ttf"
        pixel_font_body = ImageFont.truetype(
            os.path.join(rsc_dir, ubuntu_mono_regular), body_font_size
        )
        pixel_font_title = ImageFont.truetype(
            os.path.join(rsc_dir, ubuntu_mono_bold), title_font_size
        )

        self.basic_list = BasicList(
            title=self.title,
            width=self.epd.width,
            height=self.epd.height,
            colors=self.__get_colors(),
            font_text=pixel_font_body,
            font_title=pixel_font_title,
        )

    def __get_colors(self):
        return (self.epd.GRAY1, self.epd.GRAY2, self.epd.GRAY3, self.epd.GRAY4)

    def draw_screen(self, callback):
        for line, line_value_logics in zip(self.lines, self.value_logics):
            self.basic_list.add_element(
                line.format(
                    *(
                        value_logic.get_value(self.db)
                        for value_logic in line_value_logics
                    )
                )
            )

        self.epd.Init_4Gray()
        self.epd.display_4Gray(self.epd.getbuffer_4Gray(self.basic_list.get_image()))
        self.epd.sleep()
        callback()

    def perform(self, callback):
        threading.Thread(target=self.draw_screen, args=(callback,)).start()
        return "Update EPD Screen"
