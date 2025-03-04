let cols, rows;
let spacing = 50;
let selectedX = 0, selectedY = 0;
let moveDelay =3;
let loopcounter = 1;
let frameCounter = 0;
let gridOffsetX, gridOffsetY; 

function setup() {
    let canvas = createCanvas(windowWidth * 0.98, windowHeight * 0.98); 
    canvas.class('lab1-canvas');
    canvas.parent('lab1-container');
    calculateGrid();
    console.log("WELCOME! this animation runs focused ball through the screen and loops when it reaches the end.");
    console.log("Enter moveDelay=X in console to change speed. (X must be greater than 0). Current speed is " + moveDelay);
}

function draw() {
    background('#f8f8f8');

    // Draw grid/background dots (got help from chatgpt to get it to be centered properly)
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            fill(212, 212, 212, 85); 
            noStroke();
            ellipse(gridOffsetX + x * spacing, gridOffsetY + y * spacing, 12, 12);
        }
    }

    // Move the focus circle
    if (frameCounter % moveDelay === 0) {
        selectedX++;
        if (selectedX >= cols) {
            selectedX = 0;
            selectedY++;
            if (selectedY >= rows) {
                selectedY = 0;
                console.log("Focus ball reached the end. Starting Loop #" + loopcounter);
                loopcounter++;
            }
        }
    }

    // Draw focus circle
    fill('#d4d4d4');
    stroke('#309878');
    strokeWeight(3);
    ellipse(gridOffsetX + selectedX * spacing, gridOffsetY + selectedY * spacing, 20, 20);

    frameCounter++;
}


// Calculate grid size and center it inside the canvas (this was made by chat)
function calculateGrid() {
    cols = floor(width / spacing);
    rows = floor(height / spacing);

    // Adjust offsets to reduce unnecessary padding
    gridOffsetX = (width - (cols * spacing)) / 2 + spacing / 2;
    gridOffsetY = (height - (rows * spacing)) / 2 + spacing / 2;
}

// resizes canvas to fit window whenever it is changed
function windowResized() {
    resizeCanvas(windowWidth * 0.98, windowHeight * 0.98); // Use more of the window
    calculateGrid();
}
