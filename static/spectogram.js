console.clear();

let ctx;
let mic;
var fft;
var bin_count = 1024;
var smoothing = 0.4;
let height;
let width;
let checkbox;
var log_scale = false;

 function setup(){
  let cnv = createCanvas(window.innerWidth, window.innerHeight);
  ctx = cnv.canvas.getContext('2d')
  mic = new p5.AudioIn();
  fft = new p5.FFT(smoothing, bin_count);
  fft.setInput(mic);
  toggleOnOff = createButton('Logarthmic Frequency Toggle')
  toggleOnOff.position(19,19)
  toggleOnOff.mousePressed(toggleScale)
  process();
}

function draw() {
     let imgData = ctx.getImageData(1, 0, window.innerWidth - 1, window.innerHeight);
     ctx.clearRect(0,0,window.innerWidth,window.innerHeight)
     ctx.putImageData(imgData,0,0)
     let DATA = fft.analyze();
     let logIndex;
    for (let i = 0; i < DATA.length; i++) {
        if (log_scale) {
            logIndex = logScale(i, DATA.length);
            value = DATA[logIndex];
        } else {
            value = DATA[i];
        }
        let powerSpectrum = value / 255;
        ctx.beginPath()
        ctx.strokeStyle = `rgba(0,0,0,${powerSpectrum}`
        ctx.moveTo(width, window.innerHeight - (height * i));
        ctx.lineTo(width, window.innerHeight - (i * height + height));
        ctx.stroke();
    }
 }

function process() {
     mic.start();
     fft.setInput(mic)
     height =  window.innerHeight / bin_count
     width    = window.innerWidth - 1

 }

function toggleScale() {
  log_scale = !log_scale;
}


 // helper functions via
// https://github.com/borismus/spectrograph/blob/master/g-spectrograph.js
// MIT license

/**
 * Given an index and the total number of entries, return the
 * log-scaled value.
 */
function logScale(index, total, opt_base) {
  var base = opt_base || 2;
  var logmax = logBase(total + 1, base);
  var exp = logmax * index / total;
  return Math.round(Math.pow(base, exp) - 1);
}

function logBase(val, base) {
  return Math.log(val) / Math.log(base);
}