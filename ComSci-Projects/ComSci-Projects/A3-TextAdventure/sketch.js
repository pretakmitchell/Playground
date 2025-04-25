// ====================================================================
// sketch.js - Assignment 3 UI (Simplified Logic + Shortcuts Restored)
// Re-adds shortcut hints to buttons and the global keyPressed listener.
// Uses CSS provided by user. Simplified button state logic.
// ====================================================================

let inputTextArea;
let outputTextArea;
let encryptButton;
let copyButton;
let saveButton;
let resetButton;
let currentSeed;
let infoDisplay;
let container;



// References to group divs (kept for structure)
let inputGroupDiv;
let actionGroupDiv;
let outputGroupDiv;
let outputActionsDiv;
let outputActionsLeftGroup;



// --- Constants ---
let SEED_LENGTH;
const SEED_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOCAL_STORAGE_KEY = 'A3_SavedCiphertext_vFinal';



// --- Helper Functions ---
function generateRandomSeed(length) {
    let seed = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * SEED_CHARS.length);
        seed += SEED_CHARS[randomIndex];
    }
    return seed;
}



// --- Basic Feedback (Optional) ---
function giveSimpleFeedback(button, message = "Done!", duration = 1000) {
     if (!button || !button.elt) return;
     if (!button.attribute('data-original-text')) {
         button.attribute('data-original-text', button.html());
     }
     const originalText = button.attribute('data-original-text');
     button.html(message);
     setTimeout(() => {
         if (button.elt) {
            button.html(originalText); 
         }
     }, duration);
}

// --- p5.js Sketch Functions ---
function setup() {
    noCanvas();

    SEED_LENGTH = window.SEED_LENGTH || 8;

    container = select('#main-container');
    if (!container) { console.error("Main container (#main-container) not found!"); container = body(); }

    inputGroupDiv = createDiv().id('input-group').parent(container);
    createP('PLAINTEXT INPUT').addClass('input-label').parent(inputGroupDiv);
    inputTextArea = createElement('textarea', '');
    inputTextArea.attribute('placeholder', 'Enter message...');
    inputTextArea.id('input-message');
    inputTextArea.parent(inputGroupDiv);

    inputTextArea.elt.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            console.log("Cmd/Ctrl+Enter -> Encrypt");
            handleEncrypt(); 
        }
    });

    infoDisplay = createP(`Encrypts: [A-Z a-z 0-9 .,!?@#$&+-=] | Preserves others | Seed embedded`);
    infoDisplay.id('info-display');
    infoDisplay.parent(container);








    // Encrypt Button ** WITH SHORTCUT HINT **
    actionGroupDiv = createDiv().id('action-group').parent(container);
    encryptButton = createButton('EXECUTE ENCRYPTION (⌘ + ↵)'); 
    encryptButton.id('encrypt-button');
    encryptButton.mousePressed(handleEncrypt);
    encryptButton.parent(actionGroupDiv);
    encryptButton.attribute('data-original-text', encryptButton.html());

    outputGroupDiv = createDiv().id('output-group').parent(container);
    createP('CIPHERTEXT OUTPUT').addClass('input-label').parent(outputGroupDiv);
    outputTextArea = createElement('textarea', '');
    outputTextArea.attribute('readonly', '');
    outputTextArea.id('output-cipher');
    outputTextArea.attribute('placeholder', 'Encrypted output appears here...');
    outputTextArea.parent(outputGroupDiv);
    outputActionsDiv = createDiv().id('output-actions').parent(outputGroupDiv);
    outputActionsLeftGroup = createDiv().id('output-actions-left').parent(outputActionsDiv);




    // Copy Button ** WITH SHORTCUT HINT **
    copyButton = createButton('COPY (C)'); 
    copyButton.mousePressed(copyOutput);
    copyButton.parent(outputActionsLeftGroup);
    copyButton.attribute('data-original-text', copyButton.html());

    saveButton = createButton('SAVE LOCAL (S)'); // <-- Hint added
    saveButton.mousePressed(saveOutput);
    saveButton.parent(outputActionsLeftGroup);
    saveButton.attribute('data-original-text', saveButton.html());




    // Reset Button ** WITH SHORTCUT HINT **
    resetButton = createButton('RESET (R)'); // <-- Hint added
    resetButton.id('reset-button');
    resetButton.mousePressed(handleReset);
    resetButton.parent(outputActionsDiv); // Parent directly for layout
    resetButton.attribute('data-original-text', resetButton.html());

    currentSeed = generateRandomSeed(SEED_LENGTH);
    console.log("Encryption UI Initialized. [Simplified + Shortcuts]");
    console.log("Internal Seed:", currentSeed);
}






function draw() {}



function handleEncrypt() {

    if (encryptButton.html() === "Encrypting...") return;     //prevent issues if called rapidly

    const message = inputTextArea.value();
    console.log("Encrypting with internal seed:", currentSeed);
    outputTextArea.value('');
    outputTextArea.style('color', '');


    setTimeout(() => {
        const encryptedMessage = window.simpleEncrypt(message, currentSeed);

        if (encryptedMessage === null) {
            outputTextArea.value(">> ENCRYPTION FAILED // CHECK CONSOLE <<");
            outputTextArea.style('color', '#ff7b72');
        } else {
            outputTextArea.value(encryptedMessage);
            console.log("Ciphertext generated.");
        }
        currentSeed = generateRandomSeed(SEED_LENGTH); // Generate next seed
        console.log("Generated new internal seed:", currentSeed);

    }, 10); 
}



function copyOutput() {
    const textToCopy = outputTextArea.value();
    if (!textToCopy || textToCopy.startsWith(">>")) {
        console.warn("Copy: Nothing valid to copy.");
        giveSimpleFeedback(copyButton, "Error!");
        return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy)
            .then(() => { giveSimpleFeedback(copyButton, "Copied!"); })
            .catch(err => { console.error('Copy failed: ', err); giveSimpleFeedback(copyButton, "Failed!"); });
    } else {
        try {
            outputTextArea.elt.select(); 
            document.execCommand('copy'); 
            giveSimpleFeedback(copyButton, "Copied!");
        } catch (err) {
            console.error('Fallback copy failed: ', err);
            giveSimpleFeedback(copyButton, "Selected!"); 
        }
    }
}

function saveOutput() {
    const textToSave = outputTextArea.value();
     if (!textToSave || textToSave.startsWith(">>")) {
         console.warn("Save: Nothing valid to save.");
         giveSimpleFeedback(saveButton, "Error!");
         return;
     }
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, textToSave);
        console.log(`Ciphertext saved to localStorage [${LOCAL_STORAGE_KEY}]`);
        giveSimpleFeedback(saveButton, "Saved!");
    } catch (error) {
        console.error('Save failed: ', error);
        giveSimpleFeedback(saveButton, "Failed!");
    }
}

function handleReset() {
    inputTextArea.value('');
    outputTextArea.value('');
    outputTextArea.style('color', '');
    console.log("Input/Output Cleared.");
    giveSimpleFeedback(resetButton, "Cleared!");
}







//Global Key Listener
function keyPressed() {
    if (document.activeElement === inputTextArea.elt) {
        return;
    }

    const keyUpper = key.toUpperCase();

    if (keyUpper === 'C') {
        console.log("Shortcut 'C' -> Copy");
        copyOutput(); 
        return false; 
    } else if (keyUpper === 'S') {
        console.log("Shortcut 'S' -> Save");
        saveOutput(); 
        return false; // MUST prevent default browser 'Save Page' action (Ctrl+S)
    } else if (keyUpper === 'R') {
        console.log("Shortcut 'R' -> Reset");
        handleReset(); 
        return false; // Prevent default browser action if any (e.g., page refresh)
    }
}