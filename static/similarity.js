const plotHeight = 200;
console.clear();
let mic;
let fft;
const binCount = 1024;
let cnv;
const smoothing = 0.6;
let isPaused = false;
let Y_diff = [];
let dx;
let nov = []
let M_sec = 100;
let mean = 0;

function togglePlayPause() {
    isPaused = !isPaused;
    const toggleButton = document.getElementById('toggleButton');
    toggleButton.textContent = isPaused ? 'Play' : 'Pause';
}

function setup() {
  createButton('Toggle Spectral novelty function').position(19, 50).mousePressed(toggleRectification);
  cnv = createCanvas(windowWidth, windowHeight*0.840);
  w = windowWidth/binCount
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT(smoothing, binCount);
  fft.setInput(mic);
  Fs_nov = getFrameRate();
  dx = windowWidth / (binCount - 1);
  lastScrollTime = millis();

}

function draw() {
 if (!isPaused) {

background(0)
stroke(255)
let spectrum =  fft.analyze();
if (isRect) {
    nov = computeSpectralNovelty(spectrum,nov);
    console.log(mean)
    if (millis() - lastScrollTime > 2000) {
        const sum = nov.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        mean =  sum / nov.length;
        for (let i = 0; i < nov.length; i++) {
          nov[i] -= 5;
        }
        lastScrollTime = millis();
   }
  if (nov.length * dx > width) {
    nov.shift();
    nov = []
  }
  plotArray(nov);
}
else {
    for (let i = 0; i<spectrum.length;i++) {
        var amp  = spectrum[i]
        var y = map(amp,0,256,height,0);
        rect(i*w,y,w,height-y)
}
}
}
}

let isRect = false;

function toggleRectification() {
  isRect = !isRect;
}

function computeNovelty(Y_diff) {
    let val = 0
    for (let i = 0; i < Y_diff.length; i++) {
        val += Math.max(0, Y_diff[i]);
    }
    return val;
}

function computeSpectralNovelty(Y,nov) {
    let Y_diff = [];
    // Calculate the differences
    for (let i = 1; i < Y.length; i++) {
      Y_diff.push(Math.log(1 + 100 * Y[i]) - Math.log(1 + 100 * Y[i - 1]));
    }
    // Apply half-wave rectification
    for (let i = 0; i < Y_diff.length; i++) {
        if (Y_diff[i] < 0) {
            Y_diff[i] = 0;
        }
    }
    // Compute the novelty

    val = computeNovelty(Y_diff);
    nov.push(val)
    nov.push(0)
    return nov;
}

function plotArray(data) {
  stroke(255);
  for (let i = 0; i < data.length - 1; i++) {
    let x1 = i * dx;
    let y1 = height - map(data[i], 0, max(data), 0, height);
    let x2 = (i + 1) * dx;
    let y2 = height - map(data[i + 1], 0, max(data), 0, height);
    line(x1, y1, x2, y2);
  }
}

function subtractArrayByValue(array, value) {
  return array.map(element => element - value);
}