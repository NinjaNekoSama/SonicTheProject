import pyaudio
import struct
import matplotlib.pyplot as plt
import matplotlib
import logging
import time

matplotlib.use('Qt5Agg', force=True)
plt.style.use('dark_background')


class LiveAudio:
    CHUNK = 1024 * 2
    FORMAT = pyaudio.paInt16
    CHANNELS = 1
    RATE = 44100

    def __init__(self):
        self.RECORD = True
        self.audio_object = pyaudio.PyAudio()
        self.stream = None

    def initialize_stream(self):
        if self.stream:
            logging.info("Stream already initialized")
            return
        self.stream = self.audio_object.open(
            format=pyaudio.paInt16,
            channels=1,
            rate=44100,
            input=True,
            output=True,
            frames_per_buffer=1024
        )

    def __del__(self):
        logging.info("Closed stream object successfully")
        self.audio_object.terminate()
        self.stream.stop_stream()
        self.stream.close()

    def start_recording(self):
        self.RECORD = True
        self.initialize_stream()
        logging.info('Recording in progress.....')
        while self.RECORD:
            data = self.stream.read(self.CHUNK)
            data = struct.unpack(str(self.CHUNK) + 'h', data)
            yield {'data': data, 'time': time.time()}

    def stop_recording(self, stop_condition=False):
        logging.info('Stopping recording.....')
        self.RECORD = stop_condition
