import pytest
from audio import LiveAudio
import time


def test_start_recording():
    audio = LiveAudio()
    start = time.time()
    duration = 0.1
    assert audio.RECORD == True
