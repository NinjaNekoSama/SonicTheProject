var socket = io.connect('http://127.0.0.1:5000/');
var intervalId;
document.addEventListener('DOMContentLoaded', function () {
    let streamData = Array(2048).fill(0);
    var layout = {
        title: {
        text: 'Amplitude Plot',
        font: {
            color: 'white',  // Set the title color to white
            family: 'Arial'   // Set the title font family to Arial
        }
    },
        xaxis: {
            title: 'Buffer size',
            tickfont: {
                color: 'white'  // Set the color of the tick labels to white
            },
            titlefont: {
                color: 'white'  // Set the color of the x-axis title to white
            },
            showgrid: false  // Hide the grid lines for the x-axis
        },
        yaxis: {
            title: 'Frequency',
            tickfont: {
                color: 'white'  // Set the color of the tick labels to white
            },
            titlefont: {
                color: 'white'  // Set the color of the y-axis title to white
            },
            showgrid: false ,
        },
        plot_bgcolor: 'black' ,
        paper_bgcolor:"black",// Set the background color of the plot to black

    };
    var trace = {x: [], y: [], z: [], type: 'heatmap', colorscale: 'Viridis'};

    document.getElementById('startButton').addEventListener('click', sendUserInput)

    document.getElementById('stopButton').addEventListener('click', function () {
        socket.emit('stop_streaming');
    });



    socket.on('stream_data', function (data) {
        document.getElementById('pitchValue').innerText = `Pitch: ${data.pitch}`;
        document.getElementById('db').innerText = `Loudness: ${data.db}`;
        document.getElementById('midi_pitch').innerText = `MIDI number: ${data.midi_pitch}`;
        document.getElementById('music_note').innerText = `Note string: ${data.music_note}`;

        // Set text color to white
        document.getElementById('pitchValue').style.color = 'white';
        document.getElementById('db').style.color = 'white';
        document.getElementById('midi_pitch').style.color = 'white';
        document.getElementById('music_note').style.color = 'white';

        Plotly.newPlot('chart', [{
            y: streamData,
            type: 'line'
        }], layout);

        if (typeof data.data !== 'string') {
            updateStream(data);
        }
    });

    function updateStream(data) {
        var startValue = parseFloat(document.getElementById('startAxis').value);
        var endValue =parseFloat(document.getElementById('endAxis').value);
        const numberArray = data.data.map(parseFloat);
        var minValue = Math.min(...numberArray);
        var maxValue = Math.max(...numberArray);
        var userRange = [minValue, maxValue];
        console.log(startValue)
        if (!isNaN(startValue) && !isNaN(endValue)) {
             userRange = [startValue, endValue];
            }
        Plotly.relayout('chart', {
            'yaxis.range': userRange
        });
        Plotly.react('chart', [{
            y: data.data,
            type: 'line',
            line: {
                color: 'white'  // Set the line color to white
            }
        }], layout);
    }
});

function sendUserInput() {
     var currentCutoffFrequency = parseFloat(document.getElementById('cutoffFrequency').value);
     var windowSize = parseFloat(document.getElementById('windowSize').value);
        socket.emit('start_streaming', {
            user_input: {
                cutoff_frequency: currentCutoffFrequency,
                window_size: windowSize
            },
        });
}