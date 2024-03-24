import pyaudio
import logging
import time
import aubio
import numpy as np
from scipy.signal import butter, lfilter


def butterworth_low_pass(cuttoff: int, fs: int, data: np.array) -> np.array:
    """
    Applies a low pass filter on the input data
    """
    nyquist = 0.5 * fs
    normal_cutoff = cuttoff / nyquist
    b, a = butter(5, normal_cutoff, btype='low')
    data = np.array(data, dtype=float)
    y = lfilter(b, a, data)
    return y.astype(str).tolist()


def moving_average(data, window_size):
    return np.convolve(np.array(data, dtype=float), np.ones(window_size) / window_size, mode='valid').astype(str).tolist()


def midi_pitch(freq):
    """Compute midi pitch for given frequency
    Args:
        freq : float frequency

    Returns:
        Midi pitch
    """
    if freq <= 0:
        return 0
    midi = 69 + 12 * np.log2(freq / 440.0)
    if midi == -np.inf:
        return 0
    return np.round(midi, 2)


def get_note(midi):
    """Returns the note string representation
       in format "X[#/b]N" where X is a letter from A to G and N is the octave number (e.g. A3 or C#5)
    """
    _names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    midi_diff = midi - 69
    octave = int((midi - 12) / 12)
    pitch = midi_diff % 12
    note_name = _names[int((pitch + 9) % len(_names))]
    frac_cents = np.round((midi - int(midi)) * 100, 2)
    note_string = f"{note_name}{octave} +{frac_cents}ct"
    return note_string


class LiveAudio:
    CHUNK = 1024 * 2
    FORMAT = pyaudio.paFloat32
    CHANNELS = 1
    RATE = 44100
    hop_size = 512
    fft_size = 1024
    rms = 1

    def __init__(self):
        self.RECORD = True
        self.audio_object = pyaudio.PyAudio()
        self.stream = None
        self.tolerance = 0.8
        self.win_s = 4096
        self.hop_s = 2048

    def initialize_stream(self):
        if self.stream:
            logging.info("Closing existing stream...")
            self.stream.stop_stream()
            self.stream.close()

        logging.info("Initializing new stream...")
        self.stream = self.audio_object.open(
            format=self.FORMAT,
            channels=self.CHANNELS,
            rate=self.RATE,
            input=True,
            output=True,
            frames_per_buffer=self.CHUNK
        )

    def __del__(self):
        logging.info("Closed stream object successfully")
        if self.stream is not None:
            self.stream.stop_stream()
            self.stream.close()
        self.audio_object.terminate()

    def start_recording(self):
        self.RECORD = True
        self.initialize_stream()
        logging.info('Recording in progress.....')
        while self.RECORD:
            pitch_o = aubio.pitch("default", self.win_s, self.hop_s, self.RATE)
            pitch_o.set_tolerance(self.tolerance)
            data = self.stream.read(self.CHUNK)
            signal = np.fromstring(data, dtype=np.float32)
            self.rms = np.sqrt((signal ** 2).sum() / len(data))
            db = (20 * np.log10(self.rms)) + 75
            data = signal.astype(str)
            pitch = np.round(pitch_o(signal)[0], 2)
            midi_value = midi_pitch(pitch)
            music_note = get_note(midi_value)

            yield {'data': data.tolist(), 'time': time.time(), 'pitch': f'{str(pitch)} Hertz', 'db': str(round(db, 2)),
                   'midi_pitch': str(midi_value), 'music_note': str(music_note)}

    def stop_recording(self, stop_condition=False):
        logging.info('Stopping recording.....')
        self.RECORD = stop_condition
