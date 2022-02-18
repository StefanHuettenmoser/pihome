# https://github.com/waveshare/e-Paper/blob/master/RaspberryPi_JetsonNano/python/examples/epd_2in7_test.py
import logging

logging.basicConfig(level=logging.DEBUG)

import threading
import os
from PIL import ImageFont

rsc_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), "rsc")

from .lib import epd2in7
from .layouts import BasicList

from modules import PihomeActor

# class PaperScreen:
#     def __init__(self):
#         logging.info("set up")
#         GPIO.setmode(GPIO.BCM)

#         self.epd = epd2in7.EPD()

#         logging.info("init and clear")
#         self.epd.init()
#         self.epd.Clear(0xFF)
#         self.epd.Init_4Gray()

#         # self.h = self.epd.height
#         # self.w = self.epd.width

#     def draw_screen(self, image):
#         self.epd.display_4Gray(self.epd.getbuffer_4Gray(image))
#         self.epd.sleep()

#     def get_colors(self):
#         return (self.epd.GRAY1, self.epd.GRAY2, self.epd.GRAY3, self.epd.GRAY4)


class List(PihomeActor):
    def __init__(self, pi, db, name, stage):
        super().__init__(pi, db, name, stage)
        # GPIO.setmode(GPIO.BCM)
        self.epd = epd2in7.EPD()
        self.epd.init()
        self.epd.Clear(0xFF)
        self.epd.Init_4Gray()

        ubuntu_mono_regular = "Ubuntu_Mono/UbuntuMono-Regular.ttf"
        ubuntu_mono_bold = "Ubuntu_Mono/UbuntuMono-Bold.ttf"
        pixel_font_14 = ImageFont.truetype(
            os.path.join(rsc_dir, ubuntu_mono_regular), 14
        )
        pixel_font_18 = ImageFont.truetype(os.path.join(rsc_dir, ubuntu_mono_bold), 18)

        self.basic_list = BasicList(
            title="TestList",
            width=self.epd.width,
            height=self.epd.height,
            colors=self.__get_colors(),
            font_text=pixel_font_14,
            font_title=pixel_font_18,
        )
        self.basic_list.add_element("Your data could be displayed here!")

    def __get_colors(self):
        return (self.epd.GRAY1, self.epd.GRAY2, self.epd.GRAY3, self.epd.GRAY4)

    def draw_screen(self, callback):
        self.epd.display_4Gray(self.epd.getbuffer_4Gray(self.basic_list.get_image()))
        self.epd.sleep()
        callback()

    def perform(self, callback):
        threading.Thread(target=self.draw_screen, args=(callback,)).start()
        return "Update EPD Screen"
