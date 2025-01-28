window.sketchInfo = {
  title: "Particle Painter #1",
  description: "Particles paint, following behind your cursor."
};

window.mySketch = function (p) {
  let canvas;
  let clearButton;
  let instructions;

  p.preload = function () {
    // Load Roboto Mono font from two directories up
    font = p.loadFont("../../fonts/RobotoMono-Regular.ttf");
  };

  p.setup = function() {
    // Create full-window canvas
    canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.parent("animation-wrapper");
    canvas.style("position", "absolute");
    canvas.style("top", "0");
    canvas.style("left", "0");
    canvas.style("z-index", "-1"); // Push the canvas behind other content

    // Set initial background
    p.clear(); // Fully transparent canvas

    // Create Instructions Text
    instructions = p.createDiv("Hold <b>D</b> to draw, and press <b>C</b> to clear the whole page.");
    instructions.style("position", "fixed");
    instructions.style("bottom", "60px");
    instructions.style("left", "50%");
    instructions.style("transform", "translateX(-50%)");
    instructions.style("font-family", "Roboto Mono, monospace");
    instructions.style("font-size", "16px");
    instructions.style("color", "#333");
    instructions.style("text-align", "center");
    instructions.style("z-index", "9999");
    instructions.parent(document.body);

    // Create Clear Button
    clearButton = p.createButton("Clear Canvas");
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
      p.clear(); 
    
    });
  };

  p.draw = function() {
    // Only draw if the 'D' key is held down
    if (p.keyIsDown(68)) { // 68 is the keyCode for 'D'
      // Map mouseX/mouseY to color
      let red = p.map(p.mouseX, 0, p.width, 0, 255);
      let green = p.map(p.mouseY, 0, p.height, 0, 255);

      p.fill(red, green, 200);
      p.noStroke();
      p.ellipse(p.mouseX, p.mouseY, 30, 30);
    }
  };

  // Handle keyPressed for hotkey functionality
  p.keyPressed = function() {
    if (p.key === 'c' || p.key === 'C') {
      p.clear(); // Clear the canvas when 'C' is pressed
    }
  };

  // Handle window resizing
  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.clear(); // Clear the canvas on resize
  };
};
