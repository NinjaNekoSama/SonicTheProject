import pytest
from audio import midi_pitch, get_note
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
