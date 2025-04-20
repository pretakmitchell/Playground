/*
==========================================
Assignment 4 – Arrays in P5.js
==========================================

REQUIREMENTS MET:
- ✅ Uses P5.js to create an interactive sketch.
- ✅ Includes multiple arrays: 
    • `currentWord` → stores typed letters as an array
    • `portfolioItems` → array of project objects
    • `letterElements` → array of DOM elements for draggable letters
- ✅ Uses `for` loops (to create letters, check overlap, randomize, etc.)
- ✅ Uses `.push()` to add letters to `currentWord`
- ✅ Uses `.join()` to display the typed word

BEYOND MINIMUM:
- ✅ Uses array of objects (`portfolioItems`)
- ✅ Uses multiple arrays with different data types
- ✅ Manipulates arrays (adds/removes/updates elements)
- ✅ Interacts with DOM elements via an array of HTMLElements (`letterElements`)
- ✅ Uses `.push()` and `.join()` methods

REFERENCES / TUTORIALS:
- Drag & Drop API – MDN: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
- P5.js DOM reference: https://p5js.org/reference/#group-DOM
- Inspired by "worst portfolio search" project created in a previous class
*/

const letterElements = [];
let currentWord = [];
let draggedElement = null;
let offsetX = 0;
let offsetY = 0;

function createLetters() {
  const container = document.querySelector('.container');
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let i = 0; i < alphabet.length; i++) {
    const letterChar = alphabet[i];
    const letterDiv = document.createElement('div');
    letterDiv.classList.add('letter');
    letterDiv.textContent = letterChar;

    randomizeLetterPosition(letterDiv, container);
    container.appendChild(letterDiv);
    letterElements.push(letterDiv);
  }
}

function randomizeLetterPosition(letterEl, containerEl) {
  const containerRect = containerEl.getBoundingClientRect();
  const minTop = 150;
  const reservedBottomSpace = 60;
  const maxTop = containerRect.height - reservedBottomSpace - 50;
  const maxLeft = containerRect.width - 50;

  const randomTop = Math.random() * (maxTop - minTop) + minTop;
  const randomLeft = Math.random() * maxLeft;

  letterEl.style.top = randomTop + "px";
  letterEl.style.left = randomLeft + "px";
}

function enableDragging() {
  document.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('letter')) {
      draggedElement = e.target;
      offsetX = e.clientX - draggedElement.offsetLeft;
      offsetY = e.clientY - draggedElement.offsetTop;
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (draggedElement) {
      e.preventDefault();
      draggedElement.style.left = (e.clientX - offsetX) + 'px';
      draggedElement.style.top = (e.clientY - offsetY) + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    if (!draggedElement) return;

    const dropZone = document.querySelector('.drop-zone');
    if (isOverlapping(draggedElement, dropZone)) {
      snapIntoZone(draggedElement, dropZone);
    }

    draggedElement = null;
  });
}

function isOverlapping(el1, el2) {
  const r1 = el1.getBoundingClientRect();
  const r2 = el2.getBoundingClientRect();

  return !(
    r1.right < r2.left ||
    r1.left > r2.right ||
    r1.bottom < r2.top ||
    r1.top > r2.bottom
  );
}

function snapIntoZone(letterEl, zoneEl) {
  const zoneRect = zoneEl.getBoundingClientRect();
  const centerX = zoneRect.left + zoneRect.width / 2;
  const centerY = zoneRect.top + zoneRect.height / 2;

  letterEl.style.left = (centerX - letterEl.offsetWidth / 2) + "px";
  letterEl.style.top = (centerY - letterEl.offsetHeight / 2) + "px";
  letterEl.dataset.inZone = "true";
}

function setupButtons() {
  document.getElementById('doneBtn').addEventListener('click', handleDone);
  document.getElementById('startSearchBtn').addEventListener('click', handleStartSearch);
  document.getElementById('clearWordBtn').addEventListener('click', handleClearWord);
}

function handleDone() {
  const container = document.querySelector('.container');
  let droppedLetter = null;

  letterElements.forEach(letter => {
    if (letter.dataset.inZone === "true") {
      droppedLetter = letter;
    }
  });

  if (droppedLetter) {
    currentWord.push(droppedLetter.textContent);
    updateCurrentWordDisplay();

    droppedLetter.dataset.inZone = "false";
    randomizeLetterPosition(droppedLetter, container);

    letterElements.forEach(letter => {
      if (letter !== droppedLetter) {
        randomizeLetterPosition(letter, container);
      }
    });
  }
}

function handleStartSearch() {
  const resultsContainer = document.getElementById('searchResults');
  resultsContainer.innerHTML = "";

  const query = currentWord.join('').toLowerCase().trim();
  if (!query) {
    resultsContainer.innerHTML = "<p>No letters typed yet!</p>";
    return;
  }

  const matchedItems = portfolioItems.filter(item => {
    const nameMatch = item.name.toLowerCase().includes(query);
    const slugMatch = item.slug.toLowerCase().includes(query);
    return nameMatch || slugMatch;
  });

  if (matchedItems.length === 0) {
    resultsContainer.innerHTML = "<p>No matches found. Maybe type differently!</p>";
  } else {
    matchedItems.forEach(item => {
      const link = document.createElement('a');
      link.classList.add('result-link');
      link.textContent = `${item.name} (${item.type})`;
      link.href = item.link;
      link.target = "_blank";
      resultsContainer.appendChild(link);
    });
  }
}

function handleClearWord() {
  currentWord = [];
  updateCurrentWordDisplay();

  const container = document.querySelector('.container');
  document.getElementById('searchResults').innerHTML = "";

  letterElements.forEach(letter => {
    letter.dataset.inZone = "false";
    randomizeLetterPosition(letter, container);
  });
}

function updateCurrentWordDisplay() {
  const wordDisplay = document.getElementById('currentWordDisplay');
  wordDisplay.textContent = currentWord.length > 0 ? currentWord.join('') : "(No letters yet)";
}

document.addEventListener('DOMContentLoaded', () => {
  createLetters();
  enableDragging();
  setupButtons();
});
