var w = 1000;
var h = 300;
var rt2 = Math.sqrt(2);
var countqubits = 0;
var keysize = 0;

var simulationRunning = false; // Flag to track if simulation is running
var simulationTimer;

var startButton; // Start button element
var stopButton; // Stop button element

function qubit(x, y, basis) {
  this.x = x;
  this.y = y;
  this.basis = basis;
  this.state = Math.floor(2 * Math.random());

  this.renderQubit = function () {
    stroke(255);
    strokeWeight(3);
    ellipse(this.x, this.y, 20, 20);
  };

  this.renderSpin = function (measureBasis) {
    stroke(255);
    strokeWeight(2);
    if (this.basis == 0) {
      if (this.state == 0) {
        stroke(255, 255, 0);
        line(this.x, this.y - 10, this.x, this.y + 10);
      } else if (this.state == 1) {
        stroke(255, 255, 0);
        line(this.x - 10, this.y, this.x + 10, this.y);
      }
    } else if (this.basis == 1) {
      if (this.state == 0) {
        stroke(255, 255, 0);
        line(
          this.x - 10 / rt2,
          this.y - 10 / rt2,
          this.x + 10 / rt2,
          this.y + 10 / rt2
        );
      } else if (this.state == 1) {
        stroke(255, 255, 0);
        line(
          this.x + 10 / rt2,
          this.y - 10 / rt2,
          this.x - 10 / rt2,
          this.y + 10 / rt2
        );
      }
    }
  };

  this.updatePos = function (dx, dy) {
    if (simulationRunning) {
      // Only update position if simulation is running
      this.x += dx;
      this.y += dy;
    }
  };

  this.setBasis = function (basis) {
    if (basis != this.basis) {
      this.basis = basis;
      this.state = Math.floor(2 * Math.random());
    }
  };
}

function detector_emitter(x, y) {
  this.x = x;
  this.y = y;
  this.basis = Math.floor(2 * Math.random());

  this.updateBasis = function () {
    this.basis = Math.floor(2 * Math.random());
  };

  this.renderBasis = function () {
    stroke(255);
    strokeWeight(4);
    if (this.basis == 0) {
      stroke(255, 0, 0);
      line(this.x, this.y - 15, this.x, this.y + 15);
      line(this.x - 15, this.y, this.x + 15, this.y);
    } else if (this.basis == 1) {
      stroke(255, 0, 0);
      line(
        this.x - 15 / rt2,
        this.y - 15 / rt2,
        this.x + 15 / rt2,
        this.y + 15 / rt2
      );
      line(
        this.x + 15 / rt2,
        this.y - 15 / rt2,
        this.x - 15 / rt2,
        this.y + 15 / rt2
      );
    }
  };
}

var q = [];
var a = new detector_emitter(w / 9, h / 2);
var b = new detector_emitter((8 * w) / 9, h / 2);
var key = " ";
var FinalKey = ""; // New variable to store the final key

function setup() {
  createCanvas(w, h);
  background(0);
  noFill();
  stroke(255, 0, 0);
  strokeWeight(5);

  frameRate(70);
  keyDisp = createDiv("");
  eff = createDiv("");
  q.push(new qubit(a.x, a.y, a.basis));

  time = createSlider(25, 750, 40);
  time.position(10, 10);
  time.style("width", "500px");

  // Create start button
  startButton = createButton("Start");
  startButton.position(550, 10);
  startButton.mousePressed(startSimulation);

  // Create stop button
  stopButton = createButton("Stop");
  stopButton.position(610, 10);
  stopButton.mousePressed(stopSimulation);

  // Create heading
  createElement("h1", "Quantum Computer").position(10, 50);

  // Create key display element
  keyDisp = createDiv("");
  keyDisp.style("font-size", "48px"); // Set the font size to 24px
  keyDisp.html("Key =  " + key);

  // Create efficiency display element
  eff = createDiv("");
  eff.style("font-size", "48px"); // Set the font size to 24px
  eff.html("Efficiency = 0%");
}

function startSimulation() {
  simulationRunning = true; // Set simulationRunning flag to true
  startButton.html("Running"); // Update start button text
  stopButton.html("Stop"); // Reset stop button text
  simulationTimer = setTimeout(stopSimulation, 40000);
}

function stopSimulation() {
  simulationRunning = false; // Set simulationRunning flag to false
  startButton.html("Start"); // Reset start button text
  stopButton.html("Stopped"); // Update stop button text

  clearTimeout(simulationTimer);
  FinalKey = key; // Store the final key in the variable
  keyDisp.html("Simulation Finished. Key Generated = " + FinalKey);
  // Send FinalKey to the parent window
  window.parent.postMessage(FinalKey, "*");
}

function draw() {
  if (simulationRunning) {
    // Only execute simulation logic if simulation is running

    if (frameCount % Math.floor(time.value()) == 0) {
      a.updateBasis();
      q.push(new qubit(a.x, a.y, a.basis));
    }

    background(0);
    a.renderBasis();
    b.renderBasis();

    for (i = 0; i < q.length; i++) {
      q[i].renderQubit();
      q[i].renderSpin(q[i].basis);
      q[i].updatePos(1, 0);
    }

    if (
      (q[0].x - b.x) * (q[0].x - b.x) + (q[0].y - b.y) * (q[0].y - b.y) <=
      2
    ) {
      countqubits++;
      if (q[0].basis == b.basis) {
        key = key + q[0].state;
        keyDisp.html("Key =  " + key);
        keysize++;
      }
      if (key.length >= 15) {
        stopSimulation();
      }
      eff.html(
        "Efficiency = " + Math.floor((100 * keysize) / countqubits) + "%"
      );
      b.updateBasis();
      q.shift();
    }
  }
}
