import RPi.GPIO as GPIO

import time
import threading

from components import PihomeComponent


class Blink(PihomeComponent):
    def __init__(self, db, name, input_pin, brightness=0):
        super().__init__(db, name)

        self.input_pin = input_pin
        self.brightness = brightness

        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.input_pin, GPIO.OUT)

        self.IDLE = 0
        self.ON = 1
        self.FLASH = 2

        self.state = self.IDLE

        self.__pwm = GPIO.PWM(self.input_pin, 100)
        self.__pwm.start(0)
        self.set_brightness(self.brightness)

    def set_brightness(self, brightness):
        self.brightness = brightness

        if self.brightness <= 0:
            self.state = self.IDLE
        else:
            self.state = self.ON

        self.__pwm.ChangeDutyCycle(int(self.brightness * 100))

    def flash(self, duration=0.2):
        if self.state == self.IDLE or self.state == self.ON:
            self.state = self.FLASH
            self.__pwm.ChangeDutyCycle(100)
            timer = threading.Timer(
                duration, lambda: self.set_brightness(self.brightness)
            )
            timer.start()

    def run(self):
        self.flash()
        return f"Blink LED on input PIN {self.input_pin}"
