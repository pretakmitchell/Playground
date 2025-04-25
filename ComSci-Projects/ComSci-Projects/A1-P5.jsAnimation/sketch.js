var theta = 0;          // Angle for movement
var r = 10;             // Starting radius
var speed = 2;          // Speed of movement
var dr = 1;             // How fast the radius expands


var trail = [];         // Array to store past positions

function setup() {
  createCanvas(windowWidth, windowHeight);
  background('#f8f8f8');
}

function draw() {
  background('#f8f8f8');
  
  // Calculate ball position
  var x = width / 2 + r * cos(theta);
  var y = height / 2 + r * sin(theta);
  
  // Save position with fading effect
  trail.push({ x: x, y: y, alpha: 150 });

  for (var i = trail.length - 1; i >= 0; i--) {
    var point = trail[i];
    noStroke();
    fill(212, 212, 212, point.alpha);
    ellipse(point.x, point.y, 20, 20);
    point.alpha -= 5;
    if (point.alpha <= 0) trail.splice(i, 1);
  }

  // Draw current ball
  fill('#d4d4d4');
  stroke ('#309878');
  strokeWeight(3);
  ellipse(x, y, 20, 20);

  // Update position
  r += dr;
  theta += 0.1; // Directly update theta

  // Reset when reaching max radius
  if (r > windowWidth/3) {
    r = 10;
    theta = 0;
    trail = [];
    console.log("Spiral has reached window width. Now restarting.");
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
