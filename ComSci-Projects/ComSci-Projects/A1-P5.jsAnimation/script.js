console.log("JavaScript file loaded successfully!");

// Ensure P5.js is loaded before checking it
window.addEventListener("load", function() {
    console.log("Window fully loaded!");

    // Check if P5.js is available
    if (typeof p5 !== "undefined") {
        console.log("P5.js library loaded successfully!");
    } else {
        console.log("Error: P5.js library failed to load.");
    }

    // Confirm sketch.js is running
    console.log("Sketch.js has been initialized!");
});
