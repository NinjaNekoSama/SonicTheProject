import os
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO
import audio
from audio import LiveAudio
from dotenv import load_dotenv
import logging
import numpy as np

load_dotenv()
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.debug = True
socketio = SocketIO(app)
mic_feed = LiveAudio()


@app.route('/')
def hello_world():
    return render_template('home.html')


@socketio.on('connect')
def handle_connect():
    logging.info('Client connected')
    socketio.emit('stream_data', {'data': 'Streaming started'})


@socketio.on('disconnect')
def handle_disconnect():
    logging.info('Client disconnected')


@socketio.on('start_streaming')
def start_streaming(data):
    logging.warning('Streaming started')
    socketio.emit('stream_data', {'data': 'Streaming started'})

    for recording in mic_feed.start_recording():

        if 'user_input' in data:
            user_data = data['user_input']
            cutoff_frequency = user_data.get('cutoff_frequency')
            moving_window = user_data.get('window_size')

            if cutoff_frequency is not None:
                recording['data'] = audio.butterworth_low_pass(cutoff_frequency, audio.LiveAudio.RATE,
                                                               recording.get('data'))
            if moving_window is not None:
                recording['data'] = audio.moving_average(recording.get('data'), moving_window)
            socketio.emit('stream_data', recording)


@socketio.on('stop_streaming')
def stop_streaming():
    logging.warning('Streaming stopped')
    mic_feed.stop_recording()
    socketio.emit('stream_data', {'data': 'Streaming stopped'})


@app.route('/stft', methods=['GET', 'POST'])
def stft_endpoint():
    if request.method == 'GET':
        return render_template('spectrum.html')


@app.route('/amplitude', methods=['GET', 'POST'])
def amplitude_endpoint():
    if request.method == 'GET':
        return render_template('index.html')


@app.route('/novelty', methods=['GET', 'POST'])
def similarity_endpoint():
    if request.method == 'GET':
        return render_template('similarity.html')


if __name__ == '__main__':
    app.run()
