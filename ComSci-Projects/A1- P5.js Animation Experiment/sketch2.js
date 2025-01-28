window.sketchInfo = {
  title: "Physics Ball Drop with Collisions",
  description: "Balls spawn with momentum, bounce off edges, and collide with each other."
};

window.mySketch = function (p) {
  let canvas;
  const balls = [];
  const gravity = 0.4; // Gravity constant

  p.setup = function () {
    canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.parent("animation-wrapper");
    canvas.style("position", "absolute");
    canvas.style("top", "0");
    canvas.style("left", "0");

    // Create Clear Button
    const clearButton = p.createButton("Clear Canvas");
    clearButton.style("position", "fixed");
    clearButton.style("bottom", "20px");
    clearButton.style("left", "50%");
    clearButton.style("transform", "translateX(-50%)");
    clearButton.style("padding", "10px 20px");
    clearButton.style("background-color", "#ff5c5c");
    clearButton.style("color", "#fff");
    clearButton.style("border", "none");
    clearButton.style("border-radius", "5px");
    clearButton.style("cursor", "pointer");
    clearButton.style("z-index", "9999");
    clearButton.parent(document.body);

    clearButton.mousePressed(() => {
      balls.length = 0; // Clear all balls
    });
  };

  p.draw = function () {
    p.clear();

    // Update and display all balls
    for (let i = 0; i < balls.length; i++) {
      const ball = balls[i];
      ball.update();
      ball.display();

      // Check for collisions with other balls
      for (let j = i + 1; j < balls.length; j++) {
        ball.checkCollision(balls[j]);
      }
    }
  };

  p.keyPressed = function () {
    if (p.key === 'd' || p.key === 'D') {
      // Calculate velocity based on mouse movement
      let vx = (p.mouseX - p.pmouseX) * 0.5;
      let vy = (p.mouseY - p.pmouseY) * 0.5;

      // Add a slight random offset if velocity is too small
      if (Math.abs(vx) < 1 && Math.abs(vy) < 1) {
        vx += p.random(-2, 2);
        vy += p.random(-2, 2);
      }

      balls.push(new Ball(p.mouseX, p.mouseY, vx, vy));
    }
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  // Ball class
  class Ball {
    constructor(x, y, vx, vy) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.radius = 20;
      this.restitution = 0.8; // Bounce factor
      this.friction = 0.98; // Rolling friction
    }

    update() {
      // Apply gravity
      this.vy += gravity;

      // Update position
      this.x += this.vx;
      this.y += this.vy;

      // Check for collisions with edges
      if (this.y + this.radius > p.height) {
        this.y = p.height - this.radius;
        this.vy *= -this.restitution; // Reverse and reduce velocity
        this.vx *= this.friction; // Apply rolling friction
      }

      if (this.y - this.radius < 0) {
        this.y = this.radius;
        this.vy *= -this.restitution;
      }

      if (this.x + this.radius > p.width) {
        this.x = p.width - this.radius;
        this.vx *= -this.restitution;
      }

      if (this.x - this.radius < 0) {
        this.x = this.radius;
        this.vx *= -this.restitution;
      }
    }

    display() {
      p.fill(100, 150, 255);
      p.noStroke();
      p.ellipse(this.x, this.y, this.radius * 2);
    }

    checkCollision(other) {
      const dx = other.x - this.x;
      const dy = other.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Check if balls are colliding
      if (distance < this.radius + other.radius) {
        // Resolve overlap
        const overlap = this.radius + other.radius - distance;
        const angle = Math.atan2(dy, dx);
        const moveX = (overlap / 2) * Math.cos(angle);
        const moveY = (overlap / 2) * Math.sin(angle);

        this.x -= moveX;
        this.y -= moveY;
        other.x += moveX;
        other.y += moveY;

        // Exchange velocities (elastic collision)
        const normal = { x: dx / distance, y: dy / distance };
        const relativeVelocity = {
          x: this.vx - other.vx,
          y: this.vy - other.vy,
        };

        const speed = relativeVelocity.x * normal.x + relativeVelocity.y * normal.y;
        if (speed > 0) return;

        this.vx -= speed * normal.x;
        this.vy -= speed * normal.y;

        other.vx += speed * normal.x;
        other.vy += speed * normal.y;
      }
    }
  }
};
