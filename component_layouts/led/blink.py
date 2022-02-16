import RPi.GPIO as GPIO

import threading

from .led import Led
from components import PihomeComponent


class Blink(Led):
    def __init__(self, db, name, input_pin, duration):
        super().__init__(db, name, input_pin, brightness=0)

        self.FLASH = 2

        self.duration = duration

    def flash(self):
        if self.state == self.IDLE or self.state == self.ON:
            self.state = self.FLASH
            self.__pwm.ChangeDutyCycle(100)
            timer = threading.Timer(self.duration, lambda: self.set_brightness(0))
            timer.start()

    def run(self):
        self.flash()
        return f"Blink LED on input PIN {self.input_pin}"
