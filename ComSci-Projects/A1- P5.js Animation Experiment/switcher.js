// An ID for our dynamically-created script tag
const P5_SCRIPT_ID = "p5sketch";

// Removes the old p5 instance, script, and canvases
function removeOldSketch() {
  // 1) If a p5 instance is still running from before, remove it
  if (window.currentP5) {
    window.currentP5.remove(); // tells p5 to remove all canvases
    window.currentP5 = null;
  }

  // 2) Clear the old script
  const oldScript = document.getElementById(P5_SCRIPT_ID);
  if (oldScript) {
    oldScript.remove();
  }

  // 3) Clear any leftover <canvas> just in case
  const oldCanvases = document.querySelectorAll("canvas");
  oldCanvases.forEach((canvas) => canvas.remove());

  // 4) Reset the global references for the next script
  window.sketchInfo = null;
  window.mySketch = null;
}

// Dynamically load a given sketch file, forcing a fresh re-run
function loadSketch(sketchFile) {
  removeOldSketch();

  // Force the browser to fetch/re-run by adding a unique query string
  const timestamp = new Date().getTime();
  const scriptSrc = `${sketchFile}?ts=${timestamp}`;

  const newScript = document.createElement("script");
  newScript.id = P5_SCRIPT_ID;
  newScript.src = scriptSrc;

  // When the script finishes loading, let's start the new p5 instance
  newScript.addEventListener("load", () => {
    if (window.sketchInfo && window.mySketch) {
      // Update heading/subheading from the loaded sketch’s info
      updateAnimationInfo(window.sketchInfo.title, window.sketchInfo.description);

      // Start a new p5 instance (instance mode)
      window.currentP5 = new p5(window.mySketch);
    } else {
      // If the loaded script doesn't define them, fallback
      updateAnimationInfo("Unnamed Sketch", "No description available.");
    }
  });

  // Add the script to the document
  document.body.appendChild(newScript);
}

// Update the heading/subheading in the HTML
function updateAnimationInfo(titleText, descriptionText) {
  const titleEl = document.getElementById("current-animation-title");
  const descriptionEl = document.getElementById("current-animation-description");

  if (titleEl)      titleEl.textContent = titleText;
  if (descriptionEl) descriptionEl.textContent = descriptionText;
}

// Wait for DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".tab-button");
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const sketchFile = button.getAttribute("data-sketch");
      loadSketch(sketchFile);
    });
  });
});
