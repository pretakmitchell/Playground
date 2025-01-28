window.sketchInfo = {
  title: "Bouncy #3",
  description: "A ball bounces around and reacts to your cursor."
};

window.mySketch = function (p) {
  let canvas;
  let ball;
  let target = null;

  const primaryColor = "#309878";
  const secondaryColor = "#8cd4b3";

  // Flash, timer, and speed variables
  let flashOpacity = 0;
  const flashFadeRate = 5;

  let lastHitTime = 0; // Time since last hit
  let bestTime = 0; // Best time achieved
  let bestSpeed = 0; // Best speed achieved
  let speed = 4; // Initial speed
  const maxSpeed = 150; // Maximum speed

  const trackingStrength = 0.005; // Minimum tracking strength at low speeds
  const maxTrackingStrength = 0.03; // Maximum tracking strength at high speeds

  p.setup = function () {
    canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.parent("animation-wrapper");
    canvas.style("position", "absolute");

    // Initialize ball properties
    ball = {
      x: p.random(p.width),
      y: p.random(p.height),
      speedX: speed,
      speedY: speed,
      size: 25
    };

    // Load Roboto Mono font
    p.textFont("../../fonts/RobotoMono-Regular.ttf");
  };

  p.draw = function () {
    const currentTime = p.millis() / 1000; // Current time in seconds

    // Update speed based on time since last hit
    const timeSinceHit = currentTime - lastHitTime;
    speed = p.min(maxSpeed, 4 * Math.pow(1.05, timeSinceHit)); // Exponential growth

    // Update tracking strength based on speed
    const currentTrackingStrength = p.map(speed, 4, maxSpeed, trackingStrength, maxTrackingStrength);

    // Flash the screen red if hit
    if (flashOpacity > 0) {
      p.background(255, 0, 0, flashOpacity);
      flashOpacity = p.max(0, flashOpacity - flashFadeRate);
    } else {
      p.clear();
    }

    // Draw the cursor circle
    const strokeWeightMin = 2;
    const strokeWeightMax = 5;
    const thickness = strokeWeightMin + p.abs(p.sin(p.frameCount * 0.05)) * (strokeWeightMax - strokeWeightMin);

    p.stroke(primaryColor);
    p.strokeWeight(thickness);
    p.ellipse(p.mouseX, p.mouseY, 25, 25);

    // Draw the ball
    p.noStroke();
    p.fill(primaryColor);
    p.ellipse(ball.x, ball.y, ball.size, ball.size);

    // Move the ball
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Gradually adjust the ball's velocity toward the cursor
    const angleToCursor = p.atan2(p.mouseY - ball.y, p.mouseX - ball.x);
    ball.speedX += currentTrackingStrength * p.cos(angleToCursor) * speed;
    ball.speedY += currentTrackingStrength * p.sin(angleToCursor) * speed;

    // Normalize the velocity to maintain consistent speed
    const velocityMagnitude = p.dist(0, 0, ball.speedX, ball.speedY);
    ball.speedX = (ball.speedX / velocityMagnitude) * speed;
    ball.speedY = (ball.speedY / velocityMagnitude) * speed;

    // Check for collisions with walls
    if (ball.x <= 0 || ball.x >= p.width) {
      ball.speedX *= -1; // Reverse direction
      captureTarget();
    }
    if (ball.y <= 0 || ball.y >= p.height) {
      ball.speedY *= -1; // Reverse direction
      captureTarget();
    }

    // Check if ball hits the cursor
    const distanceToCursor = p.dist(ball.x, ball.y, p.mouseX, p.mouseY);
    if (distanceToCursor <= ball.size / 2 + 12.5) {
      triggerHit(currentTime);
    }

    // Draw the "Best Time" and "Best Speed"
    p.fill(secondaryColor);
    p.noStroke();
    p.textSize(16);
    p.textAlign(p.LEFT, p.BOTTOM);
    p.text(`Best Time: ${bestTime.toFixed(1)}s`, 20, p.height - 50);
    p.text(`Best Speed: ${bestSpeed.toFixed(2)}`, p.width - 150, p.height - 50);

    // Draw the current timer and speed at the bottom of the screen
    p.fill(50);
    p.textSize(20); // Increased font size for readability
    p.textAlign(p.LEFT, p.BOTTOM);
    p.text(`Time: ${timeSinceHit.toFixed(1)}s`, 20, p.height - 20);

    p.textSize(18); // Slightly larger font for speed
    p.textAlign(p.RIGHT, p.BOTTOM);
    p.text(`Speed: ${speed.toFixed(2)}`, p.width - 20, p.height - 20);
  };

  // Function to set the target position and adjust the ball's direction
  function captureTarget() {
    target = { x: p.mouseX, y: p.mouseY };
    const angle = p.atan2(target.y - ball.y, target.x - ball.x);
    const currentSpeed = p.dist(0, 0, ball.speedX, ball.speedY);
    ball.speedX = p.cos(angle) * currentSpeed;
    ball.speedY = p.sin(angle) * currentSpeed;
  }

  // Trigger the red flash effect and reset the timer and speed
  function triggerHit(currentTime) {
    flashOpacity = 64; // Set flash opacity (25%)

    // Update best time and speed if applicable
    const timeSinceHit = currentTime - lastHitTime;
    if (timeSinceHit > bestTime) {
      bestTime = timeSinceHit;
    }
    if (speed > bestSpeed) {
      bestSpeed = speed;
    }

    // Reset timer and speed
    lastHitTime = currentTime; // Reset timer
    speed = 4; // Reset speed

    // Reset ball speed
    const angle = p.atan2(ball.speedY, ball.speedX);
    ball.speedX = p.cos(angle) * speed;
    ball.speedY = p.sin(angle) * speed;
  }

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};
