import RPi.GPIO as GPIO

from components import PihomeComponent


class Led(PihomeComponent):
    def __init__(self, db, name, input_pin, brightness):
        super().__init__(db, name)

        self.input_pin = input_pin
        self.brightness = brightness

        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.input_pin, GPIO.OUT)

        self.IDLE = 0
        self.ON = 1

        self.state = self.IDLE

        self.pwm = GPIO.PWM(self.input_pin, 100)
        self.pwm.start(0)
        self.set_brightness(self.brightness)

    def set_brightness(self, brightness):
        self.brightness = brightness

        if self.brightness <= 0:
            self.state = self.IDLE
        else:
            self.state = self.ON

        self.pwm.ChangeDutyCycle(int(self.brightness * 100))

    def run(self):
        return f"LED on input PIN {self.input_pin} is on"
