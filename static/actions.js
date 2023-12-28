document.addEventListener('DOMContentLoaded', function () {
    var socket = io.connect('http://127.0.0.1:5000/');
    let streamData = Array(2048).fill(0);


    document.getElementById('startButton').addEventListener('click', function () {
        socket.emit('start_streaming');
    });

    document.getElementById('stopButton').addEventListener('click', function () {
        socket.emit('stop_streaming');
    });

    socket.on('stream_data', function (data) {
          Plotly.newPlot('chart', [{
          y: streamData,
          type: 'line'
      }])
        if (typeof data.data !== 'string') {
        updateStream(data.data);
    }
    });

  function updateStream(data) {
      console.log(data.length);

     Plotly.react('chart', [{
          y: data,
          type: 'line'
      }])



  }});
