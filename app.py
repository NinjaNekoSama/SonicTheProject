from flask import Flask, render_template
from flask_socketio import SocketIO
from audio import LiveAudio
import logging

app = Flask(__name__)
app.config['SECRET_KEY'] = 'nani'
app.config['DEBUG'] = True
socketio = SocketIO(app)

mic_feed = LiveAudio()


@app.route('/')
def hello_world():
    return render_template('index.html')


@socketio.on('connect')
def handle_connect():
    logging.info('Client connected')
    socketio.emit('stream_data', {'data': 'Streaming started'})


@socketio.on('disconnect')
def handle_disconnect():
    logging.info('Client disconnected')


@socketio.on('start_streaming')
def start_streaming():
    logging.warning('Streaming started')
    socketio.emit('stream_data', {'data': 'Streaming started'})
    for data in mic_feed.start_recording():
        socketio.emit('stream_data', data)

@socketio.on('stop_streaming')
def stop_streaming():
    logging.warning('Streaming stopped')
    mic_feed.stop_recording()


if __name__ == '__main__':
    app.run()
