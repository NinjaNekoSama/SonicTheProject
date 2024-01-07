import pytest
import time
import pyaudio
from audio import midi_pitch, get_note, LiveAudio
import numpy as np



# Assuming your module is in a file named your_module_name.py

@pytest.mark.parametrize("freq, expected_pitch", [
    (440.0, 69),  # A4
    (523.25, 72),  # C5
    (880.0, 81),  # A5
])
def test_midi_pitch(freq, expected_pitch):
    result = midi_pitch(freq)
    assert np.isclose(result, expected_pitch)


@pytest.mark.parametrize("midi, expected_note", [
    (69, 'A4 +0ct'),  # A3
    (72, 'C5 +0ct'),  # C4
    (81, 'A5 +0ct'),  # A4
])
def test_get_note(midi, expected_note):
    result = get_note(midi)
    assert result == expected_note


def test_live_audio_initialization():
    live_audio = LiveAudio()
    assert live_audio.CHUNK == 1024 * 2
    assert live_audio.FORMAT == pyaudio.paFloat32
    assert live_audio.CHANNELS == 1
    assert live_audio.RATE == 44100
    assert live_audio.hop_size == 512
    assert live_audio.fft_size == 1024
    assert live_audio.rms == 1
    assert live_audio.RECORD is True
    assert live_audio.audio_object is not None
    assert live_audio.stream is None
    assert live_audio.tolerance == 0.8
    assert live_audio.win_s == 4096
    assert live_audio.hop_s == 2048


def test_live_audio_start_and_stop_recording():
    live_audio = LiveAudio()

    # Mocking the audio stream
    class MockStream:
        def read(self, chunk):
            return b'\x00' * chunk

        def stop_stream(self):
            pass

        def close(self):
            pass

    live_audio.stream = MockStream()
    generator = live_audio.start_recording()
    time.sleep(0.1)
    live_audio.stop_recording(stop_condition=False)
    data_point = next(generator)
    assert 'data' in data_point
    assert 'time' in data_point
    assert 'pitch' in data_point
    assert 'db' in data_point
    assert 'midi_pitch' in data_point
    assert 'music_note' in data_point


