let eyeWidth = 130;
let eyeHeight = 85;
let basePupilSize = 20;
let maxPupilSize = 40; 

//chat helped with a lot of the math here

let eye1 = {
  x: 125,
  y: 100,
  w: eyeWidth,
  h: eyeHeight,
  pupilSize: basePupilSize,
  draw: function() {
    fill(255);
    stroke(0);
    strokeWeight(3);
    ellipse(this.x, this.y, this.w, this.h);
  },
  drawPupil: function(targetX, targetY, sharedSize) {
    let dx = targetX - this.x;
    let dy = targetY - this.y;
    let angle = atan2(dy, dx);
    let maxPupilDist = this.w / 5;
    let pupilX = this.x + cos(angle) * maxPupilDist;
    let pupilY = this.y + sin(angle) * maxPupilDist;
    fill(0);
    noStroke();
    ellipse(pupilX, pupilY, sharedSize, sharedSize);
  }
};

let eye2 = {
  x: 275,
  y: 100,
  w: eyeWidth,
  h: eyeHeight,
  pupilSize: basePupilSize,
  draw: function() {
    fill(255);
    stroke(0);
    strokeWeight(3);
    ellipse(this.x, this.y, this.w, this.h);
  },
  drawPupil: function(targetX, targetY, sharedSize) {
    let dx = targetX - this.x;
    let dy = targetY - this.y;
    let angle = atan2(dy, dx);
    let maxPupilDist = this.w / 5;
    let pupilX = this.x + cos(angle) * maxPupilDist;
    let pupilY = this.y + sin(angle) * maxPupilDist;
    fill(0);
    noStroke();
    ellipse(pupilX, pupilY, sharedSize, sharedSize);
  }
};

function setup() {
  let canvas = createCanvas(400, 200);
  canvas.parent('canvas-container'); 
}

function draw() {
  background('#f8f8f8');
  let targetX = mouseX;
  let targetY = mouseY;
  let midX = (eye1.x + eye2.x) / 2;
  let distance = dist(midX, eye1.y, targetX, targetY);
  
  
  let sharedPupilSize = basePupilSize + (30 - distance / 10);
  if (sharedPupilSize > maxPupilSize) {
    sharedPupilSize = maxPupilSize;
  }
  if (sharedPupilSize < basePupilSize) {
    sharedPupilSize = basePupilSize;
  }
  
  eye1.draw();
  eye2.draw();
  eye1.drawPupil(targetX, targetY, sharedPupilSize);
  eye2.drawPupil(targetX, targetY, sharedPupilSize);
}

function windowResized() {
  resizeCanvas(400, 200);
}
