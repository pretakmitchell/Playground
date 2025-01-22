/* 
  MAIN LOGIC:
  1. Create letters A–Z, position them randomly.
  2. Dragging logic (drag + drop).
  3. If a letter is dropped into .drop-zone, it stays there 
     until the user presses "Done".
  4. "Done" moves that letter into the "currentWord", 
     then reshuffles letters (for maximum annoyance).
  5. "Start Search" uses the 'currentWord' to filter portfolioItems 
     and shows results in #searchResults.
  6. "Clear Word" resets everything.
*/

// You can edit this base URL for your actual site
const portfolioBaseURL = "https://www.mitchellpretak.com/works/";

//////////////////////////////
// 1. CREATE LETTERS A–Z
//////////////////////////////
function createLetters() {
  const container = document.querySelector('.container');
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let i = 0; i < alphabet.length; i++) {
    const letterChar = alphabet[i];
    const letterDiv = document.createElement('div');
    letterDiv.classList.add('letter');
    letterDiv.textContent = letterChar;

    // Place randomly within container
    randomizeLetterPosition(letterDiv, container);

    container.appendChild(letterDiv);
  }
}

/* 
  Helper: position a letter at a random location in the container.
*/
function randomizeLetterPosition(letterEl, containerEl) {
  const containerRect = containerEl.getBoundingClientRect();

  // Define the top offset to ensure letters don't spawn over buttons
  const minTop = 150; // Adjust this based on your layout
  const reservedBottomSpace = 60; // Space to reserve at the bottom (e.g., for search results)
  const maxTop = containerRect.height - reservedBottomSpace - 50; // Adjust for letter size and reserved space
  const maxLeft = containerRect.width - 50; // Adjust for letter size

  // Generate random positions within bounds
  const randomTop = Math.random() * (maxTop - minTop) + minTop; // Between minTop and maxTop
  const randomLeft = Math.random() * maxLeft;

  // Convert to px and apply
  letterEl.style.top = randomTop + "px";
  letterEl.style.left = randomLeft + "px";
}



//////////////////////////////
// 2. DRAG + DROP SETUP
//////////////////////////////
let draggedElement = null;
let offsetX = 0;
let offsetY = 0;

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
      e.preventDefault(); // Prevent text selection
      draggedElement.style.left = (e.clientX - offsetX) + 'px';
      draggedElement.style.top = (e.clientY - offsetY) + 'px';
    }
  });

  document.addEventListener('mouseup', (e) => {
    if (!draggedElement) return;

    // Check if we dropped over the drop-zone
    const dropZone = document.querySelector('.drop-zone');
    if (isOverlapping(draggedElement, dropZone)) {
      // Snap the letter into the drop-zone 
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

/* 
  Snap the letter's position to the center of the drop zone. 
  We also put a special data attribute so we know 
  the letter is "in the zone."
*/
function snapIntoZone(letterEl, zoneEl) {
  const zoneRect = zoneEl.getBoundingClientRect();
  // Compute center coords
  const centerX = zoneRect.left + zoneRect.width / 2;
  const centerY = zoneRect.top + zoneRect.height / 2;

  // Adjust letter so it's centered in that zone
  letterEl.style.left = (centerX - letterEl.offsetWidth / 2) + "px";
  letterEl.style.top = (centerY - letterEl.offsetHeight / 2) + "px";

  // Mark it as "dropped" 
  letterEl.dataset.inZone = "true";
}

//////////////////////////////
// 3. BUILDING THE "CURRENT WORD"
//////////////////////////////
let currentWord = "";

function setupButtons() {
  const doneBtn = document.getElementById('doneBtn');
  const startSearchBtn = document.getElementById('startSearchBtn');
  const clearWordBtn = document.getElementById('clearWordBtn');

  doneBtn.addEventListener('click', handleDone);
  startSearchBtn.addEventListener('click', handleStartSearch);
  clearWordBtn.addEventListener('click', handleClearWord);
}

/* 
  DONE = take the letter in .drop-zone (if any) 
  and append it to 'currentWord'. Then randomize 
  the positions of all letters again for extra annoyance.
*/
function handleDone() {
  const letters = document.querySelectorAll('.letter');
  let droppedLetter = null;

  // Find which letter is in the zone
  letters.forEach(letter => {
    if (letter.dataset.inZone === "true") {
      droppedLetter = letter;
    }
  });

  if (droppedLetter) {
    // Add that letter to currentWord
    currentWord += droppedLetter.textContent;
    updateCurrentWordDisplay();

    // Mark it as not in the zone anymore
    droppedLetter.dataset.inZone = "false";

    // Re-randomize it in the container
    const container = document.querySelector('.container');
    randomizeLetterPosition(droppedLetter, container);

    // Also shuffle ALL letters for maximum chaos
    letters.forEach(letter => {
      // If a letter isn't the one we just used, randomize it again
      if (letter !== droppedLetter) {
        randomizeLetterPosition(letter, container);
      }
    });
  }
}

/* 
  START SEARCH = do a normal filter of 'portfolioItems' 
  using the 'currentWord' as the query. 
*/
function handleStartSearch() {
  const resultsContainer = document.getElementById('searchResults');
  resultsContainer.innerHTML = "";

  // Trim the word in case of spaces 
  const query = currentWord.toLowerCase().trim();
  if (!query) {
    // If it's empty, do nothing
    resultsContainer.innerHTML = "<p>No letters typed yet!</p>";
    return;
  }

  // Filter from data.js
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
      link.textContent = item.name;
      link.href = portfolioBaseURL + item.slug;
      link.target = "_blank";
      resultsContainer.appendChild(link);
    });
  }
}

/* 
  CLEAR WORD = reset currentWord to "", 
  clear the search results, and 
  keep the letters in the container. 
*/
function handleClearWord() {
  currentWord = "";
  updateCurrentWordDisplay();

  // Clear results
  const resultsContainer = document.getElementById('searchResults');
  resultsContainer.innerHTML = "";

  // Optionally, we could re-randomize all letters again
  const letters = document.querySelectorAll('.letter');
  const container = document.querySelector('.container');
  letters.forEach(letter => {
    letter.dataset.inZone = "false";
    randomizeLetterPosition(letter, container);
  });
}

/* Update the on-screen word display */
function updateCurrentWordDisplay() {
  const wordDisplay = document.getElementById('currentWordDisplay');
  if (currentWord.length > 0) {
    wordDisplay.textContent = currentWord;
  } else {
    wordDisplay.textContent = "(No letters yet)";
  }
}

//////////////////////////////
// 4. INIT
//////////////////////////////
document.addEventListener('DOMContentLoaded', () => {
  createLetters();
  enableDragging();
  setupButtons();
});
