const array = [];
let n = 30;
let timeToSwap = 10;
let isPlaying = false;
let showComparison = false;
let showSaveOptionBtn = { compare: true, speed: true, sortNumber: true };
let stopAndReset = false;

init(); // initialize arrays

let audioCtx = null;

function shouldDisable() {
  return showSaveOptionBtn.compare && showSaveOptionBtn.speed && showSaveOptionBtn.sortNumber;
}

compare.addEventListener("change", function () {
  if (this.checked == showComparison) {
    showSaveOptionBtn.compare = true;
  } else showSaveOptionBtn.compare = false;
  saveOptionBtn.disabled = shouldDisable();
});

speed.addEventListener("change", function () {
  if (this.value == timeToSwap) {
    showSaveOptionBtn.speed = true;
  } else showSaveOptionBtn.speed = false;
  saveOptionBtn.disabled = shouldDisable();
});

sortNumber.addEventListener("change", function () {
  if (this.value == n) {
    showSaveOptionBtn.sortNumber = true;
  } else showSaveOptionBtn.sortNumber = false;
  saveOptionBtn.disabled = shouldDisable();
});

function saveOptions() {
  showComparison = compare.checked;
  n = sortNumber.value || 30;
  timeToSwap = speed.value || 10;
  saveOptionBtn.disabled = true;
  stopAndReset = true;
  init();
}

function playNote(freq) {
  if (audioCtx == null) {
    audioCtx = new (AudioContext || webkitAudioContext || window.webkitAudioContext)();
  }
  const dur = 0.1;
  const osc = audioCtx.createOscillator();
  osc.frequency.value = freq;
  osc.start();
  osc.stop(audioCtx.currentTime + dur);
  const node = audioCtx.createGain();
  node.gain.value = 0.1; // ? volume
  node.gain.linearRampToValueAtTime(0, audioCtx.currentTime + dur); // ? removes clicking sound
  osc.connect(node);
  node.connect(audioCtx.destination);
}

function init() {
  for (let i = 0; i < n; i++) {
    array[i] = Math.random();
  }
  showBars();
}

function play() {
  if (stopAndReset) stopAndReset = false;
  if (isPlaying) return;
  isPlaying = true;
  const copy = [...array];
  const moves = bubbleSort(copy);
  animate(moves);
}

function animate(moves) {
  if (moves.length == 0 || stopAndReset) {
    stopAndReset = false;
    isPlaying = false;
    showBars(); // ? at end of sort, makes all bars black again
    return;
  }
  const move = moves.shift();
  const [i, j] = move.indices;

  if (move.type == "swap") {
    [array[i], array[j]] = [array[j], array[i]];
  }
  playNote(200 + array[i] * 500);
  playNote(200 + array[j] * 500);
  showBars(move);
  setTimeout(() => {
    animate(moves);
  }, timeToSwap);
}

function bubbleSort(array) {
  const moves = []; // ? record the moves for animation

  do {
    var swapped = false;
    for (let i = 1; i < array.length; i++) {
      if (showComparison) moves.push({ indices: [i - 1, i], type: "comparison" });
      if (array[i - 1] > array[i]) {
        swapped = true;
        moves.push({ indices: [i - 1, i], type: "swap" }); // ? two indices that will be swapped
        // ? swap elements until sorted
        [array[i - 1], array[i]] = [array[i], array[i - 1]];
      }
    }
  } while (swapped);
  return moves;
}

function showBars(move) {
  container.innerHTML = "";
  for (let i = 0; i < array.length; i++) {
    const bar = document.createElement("div");
    bar.style.height = array[i] * 100 + "%";
    bar.classList.add("bar");
    if (move && move.indices.includes(i)) bar.style.backgroundColor = move.type == "swap" ? "red" : "blue";
    container.appendChild(bar);
  }
}
