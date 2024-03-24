
console.clear();

let mic;
let fft;
const binCount = 1024;
let log_scale = false;
let log_amplitude = false;
let speed = 4;
let cnv;

function setup() {
  createButton('Fullscreen').position(19, 50).mousePressed(toggleFullscreen);
  cnv = createCanvas(windowWidth, windowHeight);
  noStroke();
  mic = new p5.AudioIn();
  mic.start();

  const smoothing = 0.6;
  fft = new p5.FFT(smoothing, binCount);
  fft.setInput(mic);
  createToggleLogfrequency();
}


let isPaused = false;

function togglePlayPause() {
    isPaused = !isPaused;
    const toggleButton = document.getElementById('toggleButton');
    toggleButton.textContent = isPaused ? 'Play' : 'Pause';
}

function draw() {
 if (!isPaused) {
    var backgroundColorSelect = document.getElementById('backgroundColorSelect');
    backgroundColorSelect.addEventListener('change', function() {
        var selectedOption = backgroundColorSelect.value;
        switch (selectedOption) {
            case 'rgb':
                  background(0);
                  document.body.style.backgroundColor = 'black';
                  break
            case 'black':
                document.body.style.backgroundColor = 'black';
                background(0);
                break
            case 'white':
                background(255);
                document.body.style.backgroundColor = 'white';
                break
        }
    });
  const DATA = fft.analyze();
  copy(cnv, 0, 0, width, height, -speed, 0, width, height);

  for (let i = 0; i < DATA.length; i++) {
    let value;
    if (log_scale) {
      value = DATA[logScale(i, DATA.length)];
    } else {
      value = DATA[i];
    }

    if (log_amplitude) {
      value = logCompression(value,100000000000);
    }
    switch (backgroundColorSelect.value) {
            case 'rgb':
           value =[value,0,value];
                break;
            case 'black':
                break;
            case 'white':
                value = 255 - value;
                break;
        }
    fill(value);
    const percent = i / DATA.length;
    const y = percent * height;
    const yOffset = height * 0.2;
    rect(width - speed, height - y - yOffset, speed, height / DATA.length);
  }
}
}

let isFullscreen = false;

function toggleFullscreen() {
  if (!isFullscreen) {
    fullscreen(true);
  } else {
    fullscreen(false);
  }
  isFullscreen = !isFullscreen;
}
function toggleFreq() {
  log_scale = !log_scale;
}

function toggleAmplitude() {
  log_amplitude = !log_amplitude;
}

function createToggleLogfrequency() {
  const toggleFButton = createButton('Logarithmic Frequency Toggle');
  toggleFButton.position(19, 19);
  toggleFButton.mousePressed(toggleFreq);
}

function createToggleLogAmplitude() {
  const toggleAButton = createButton('Logarithmic Amplitude Toggle');
  toggleAButton.position(250, 19);
  toggleAButton.mousePressed(toggleAmplitude);
}


// helper functions via
// https://github.com/borismus/spectrograph/blob/master/g-spectrograph.js
// MIT license

/**
 * Given an index and the total number of entries, return the
 * log-scaled value.
 */

function logScale(index, total, base = 2) {
  const logmax = logBase(total + 1, base);
  const exp = logmax * index / total;
  return Math.round(Math.pow(base, exp) - 1);
}

function logBase(val, base) {
  return Math.log(val) / Math.log(base);
}

function logCompression(v, gamma = 1.0) {
    if (typeof v === 'number') {
        return Math.log(1 + gamma * v);
    } else if (Array.isArray(v)) {
        return v.map(value => Math.log(1 + gamma * value));
    } else {
        throw new Error("Input must be a number or an array.");
    }
}
