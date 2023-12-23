import pyaudio
import struct
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
import PyQt5
matplotlib.use('Qt5Agg',force=True)
plt.style.use('dark_background')

CHUNK = 1024 * 2
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 44100
p = pyaudio.PyAudio()
stream = p.open(
    format=FORMAT,
    channels=CHANNELS,
    rate=RATE,
    input=True,
    output=True,
    frames_per_buffer=CHUNK
)
fig,ax = plt.subplots()
x = np.arange(0,2*CHUNK,2)
line, = ax.plot(x, np.random.rand(CHUNK),'r')
ax.set_ylim(-32770,32770)
ax.set_xlim = (0,CHUNK)
ax.set_title('Waveform')
ax.set_xlabel('Time')
ax.set_ylabel('Amplitude')
fig.show()
while 1:
    data = stream.read(CHUNK)
    dataInt = struct.unpack(str(CHUNK) + 'h', data)
    line.set_ydata(dataInt)
    ax.draw_artist(ax.patch)
    ax.draw_artist(line)
    fig.canvas.update()
    fig.canvas.flush_events()