document.addEventListener('DOMContentLoaded', function () {
    var socket = io.connect('http://127.0.0.1:5000/');
    let streamData = Array(2048).fill(0);
    var layout = { title: 'Spectrogram', xaxis: { title: 'Time' }, yaxis: { title: 'Frequency' }};
    var trace = {x: [], y: [], z: [], type: 'heatmap', colorscale: 'Viridis'};


    document.getElementById('startButton').addEventListener('click', function () {
        socket.emit('start_streaming');
    });

    document.getElementById('stopButton').addEventListener('click', function () {
        socket.emit('stop_streaming');
    });

    socket.on('stream_data', function (data) {
        document.getElementById('pitchValue').innerText = `Pitch: ${data.pitch}`;
        document.getElementById('db').innerText = `Loudness: ${data.db}`;
        document.getElementById('midi_pitch').innerText = `MIDI number: ${data.midi_pitch}`;
        document.getElementById('music_note').innerText = `Note string: ${data.music_note}`;


          Plotly.newPlot('chart', [{
          y: streamData,
          type: 'line'
      }])
        if (typeof data.data !== 'string') {
        updateStream(data);
    }
    });

  function updateStream(data) {
      console.log(data.length);

     Plotly.react('chart', [{
          y: data.data,
          type: 'line'
      }])

  }});
