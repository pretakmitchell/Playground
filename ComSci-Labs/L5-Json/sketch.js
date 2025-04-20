// ====================================================================
// sketch.js - p5.js script for Assignment 5 UI (Final Decryption v3)
// Corrected Shortcut handling. Adjusted Modal Layout via CSS.
// ====================================================================

// --- Global Variables ---
let cipherInputArea;
let plaintextOutputArea;
let decryptButton;
let pasteDecryptButton;
let resetButton;
let copyOutputButton;
let savedItemsContainer;
let modalOverlay;
let modalCloseButton;
let modalCiphertextElement;
let modalPlaintextElement;
let modalCopyCipherTextButton;
let modalCopyPlaintextButton;
let noSavedDataMsg;

const LOCAL_STORAGE_KEY = 'A3_SavedCiphertext_vFinal';

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


function copyTextToClipboard(text, feedbackButton, successMsg = "Copied!", failMsg = "Failed!") {
     if (!text) {
         console.warn("Copy: Nothing to copy.");
         if(feedbackButton) giveSimpleFeedback(feedbackButton, "Empty!", 1200);
         return;
     }
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => { if(feedbackButton) giveSimpleFeedback(feedbackButton, successMsg, 1200); })
            .catch(err => {
                 console.error('Copy failed: ', err);
                 if(feedbackButton) giveSimpleFeedback(feedbackButton, failMsg, 1500);
            });
    } else { 
        try {
             let temp = createInput(''); temp.position(-9999, -9999);
             temp.value(text); temp.elt.select(); document.execCommand('copy'); temp.remove();
             if(feedbackButton) giveSimpleFeedback(feedbackButton, successMsg, 1200);
        } catch (err) {
             console.error('Fallback copy failed: ', err);
             if(feedbackButton) giveSimpleFeedback(feedbackButton, "Select Manually", 1500);
        }
    }
}


function setup() {
    noCanvas();

    cipherInputArea = select('#input-cipher');
    plaintextOutputArea = select('#output-plaintext');
    decryptButton = select('#decrypt-button');
    pasteDecryptButton = select('#paste-decrypt-button');
    resetButton = select('#reset-button');
    copyOutputButton = select('#copy-output-button');
    savedItemsContainer = select('#saved-items-container');
    modalOverlay = select('#modal-overlay');
    modalCloseButton = select('#modal-close-button');
    modalCiphertextElement = select('#modal-ciphertext');
    modalPlaintextElement = select('#modal-plaintext');
    modalCopyCipherTextButton = select('#modal-copy-cipher');
    modalCopyPlaintextButton = select('#modal-copy-plain');
    noSavedDataMsg = select('#no-saved-data');

    if (!cipherInputArea || !plaintextOutputArea || !decryptButton || !pasteDecryptButton || !resetButton || !copyOutputButton || !savedItemsContainer || !modalOverlay || !modalCloseButton || !modalCiphertextElement || !modalPlaintextElement || !modalCopyCipherTextButton || !modalCopyPlaintextButton || !noSavedDataMsg) {
         console.error("FATAL: One or more required UI elements not found in HTML!");
         alert("Page Error: UI elements missing. Check HTML structure.");
         return; 
    }


    decryptButton.mousePressed(handleDecrypt);
    decryptButton.attribute('data-original-text', decryptButton.html());

    pasteDecryptButton.mousePressed(handlePasteAndDecrypt);
    pasteDecryptButton.attribute('data-original-text', pasteDecryptButton.html());

    resetButton.mousePressed(handleReset);
    resetButton.attribute('data-original-text', resetButton.html());

    copyOutputButton.mousePressed(copyDecryptedOutput);
    copyOutputButton.attribute('disabled', ''); 
    copyOutputButton.attribute('data-original-text', copyOutputButton.html());

    modalCloseButton.mousePressed(hideModal);

    modalOverlay.mousePressed((event) => { if (event.target === modalOverlay.elt) { hideModal(); } });

    
    
    
    // Modal Copy Button Listeners
    modalCopyCipherTextButton.mousePressed(copyModalCiphertext);
    modalCopyPlaintextButton.mousePressed(copyModalPlaintext);

    // Cmd/Ctrl+Enter Listener
    cipherInputArea.elt.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault(); handleDecrypt();
        }
    });

    // Load Saved Items
    displaySavedItems();
    console.log("Decryption UI Initialized. [Lab 5 Final v3]");
}

function draw() { /* No animation needed */ }



// --- Event Handlers ---
function handleDecrypt() {

    if (decryptButton.elt.innerText.includes("...")) return;

    const originalText = decryptButton.attribute('data-original-text');
    decryptButton.html("Decrypting..."); 

    const cipherText = cipherInputArea.value();
    plaintextOutputArea.value('');
    plaintextOutputArea.style('color', '');
    copyOutputButton.attribute('disabled', '');

    setTimeout(() => {
        if (!cipherText) {
            plaintextOutputArea.value("Error: No ciphertext provided.");
            plaintextOutputArea.style('color', 'var(--reset-button-color)');
            decryptButton.html(originalText); // Restore button text
            return;
        }
        console.log("Attempting direct decryption...");
        const decryptedMessage = window.simpleDecrypt(cipherText); // Assumes decrypt.js loaded

        if (decryptedMessage === null) {
            plaintextOutputArea.value("DECRYPTION FAILED.");
            plaintextOutputArea.style('color', 'var(--reset-button-color)');
        } else {
            plaintextOutputArea.value(decryptedMessage);
            console.log("Direct decryption successful.");
            if (decryptedMessage.length > 0) {
                copyOutputButton.removeAttribute('disabled');
            }
        }
        decryptButton.html(originalText); // Restore button text
    }, 10); 
}

function handlePasteAndDecrypt() {
    console.log("Paste & Decrypt triggered");
    giveSimpleFeedback(pasteDecryptButton, "Pasting...");
    navigator.clipboard.readText()
        .then(text => {
            if (text) {
                cipherInputArea.value(text);
                console.log("Pasted from clipboard.");
                handleDecrypt(); // Trigger decryption immediately
            } else {
                console.warn("Clipboard is empty.");
                plaintextOutputArea.value("Clipboard empty or permission denied.");
                plaintextOutputArea.style('color', 'var(--text-tertiary)');
                 // Restore button text manually as feedback might not trigger?
                if (pasteDecryptButton.elt) pasteDecryptButton.html(pasteDecryptButton.attribute('data-original-text'));
            }
        })
        .catch(err => {
            console.error('Failed to read clipboard: ', err);
            plaintextOutputArea.value("Error reading clipboard.");
            plaintextOutputArea.style('color', 'var(--reset-button-color)');
            // Give specific feedback on the button itself for paste failure
            if(pasteDecryptButton) giveSimpleFeedback(pasteDecryptButton, "Paste Failed!", 1500);
        });
}

function handleReset() {
    cipherInputArea.value('');
    plaintextOutputArea.value('');
    plaintextOutputArea.style('color', '');
    copyOutputButton.attribute('disabled', ''); // Disable copy on reset
    console.log("Input/Output Cleared.");
    giveSimpleFeedback(resetButton, "Cleared!", 1000);
}

function copyDecryptedOutput() {
    const textToCopy = plaintextOutputArea.value();
    copyTextToClipboard(textToCopy, copyOutputButton);
}












// --- Saved Item & Modal Functions ---
function displaySavedItems() { 
    if (!savedItemsContainer || !noSavedDataMsg) return;
    try {
        const savedCiphertext = localStorage.getItem(LOCAL_STORAGE_KEY);
        savedItemsContainer.html('');
        if (savedCiphertext) {
            noSavedDataMsg.style('display', 'none');
            const card = createDiv().addClass('saved-item-card').parent(savedItemsContainer);
            createElement('h4', 'Saved Ciphertext').parent(card);
            const snippet = savedCiphertext.substring(0, 100) + (savedCiphertext.length > 100 ? '...' : '');
            createP(snippet).parent(card);
            card.mousePressed(() => handleSavedItemClick(savedCiphertext));
        } else {
            console.log("No saved ciphertext found [", LOCAL_STORAGE_KEY, "]");
            noSavedDataMsg.style('display', 'block');
        }
    } catch (error) {
        console.error("Error accessing localStorage:", error);
        savedItemsContainer.html('<p style="color: var(--reset-button-color);">Error loading data.</p>');
        noSavedDataMsg.style('display', 'none');
    }
}
function handleSavedItemClick(ciphertext) { 
    console.log("Decrypting saved item for modal...");
    const decryptedMessage = window.simpleDecrypt(ciphertext);
    if (modalCiphertextElement) modalCiphertextElement.html(ciphertext);
    if (modalPlaintextElement) {
        if (decryptedMessage === null) {
             modalPlaintextElement.html(">> DECRYPTION FAILED <<");
             modalPlaintextElement.style('color', 'var(--reset-button-color)');
        } else {
             modalPlaintextElement.html(decryptedMessage);
             modalPlaintextElement.style('color', '');
        }
    }
    showModal();
}
function copyModalCiphertext(){ 
    if(modalCiphertextElement){ copyTextToClipboard(modalCiphertextElement.elt.innerText, modalCopyCipherTextButton); }
}
function copyModalPlaintext(){ 
     if(modalPlaintextElement){
         const text = modalPlaintextElement.elt.innerText;
         if (text && !text.includes(">> DECRYPTION FAILED <<")) { copyTextToClipboard(text, modalCopyPlaintextButton); }
         else { giveSimpleFeedback(modalCopyPlaintextButton, "Error!", 1200); }
    }
}
function showModal() { 
    if (modalOverlay) {
        modalOverlay.removeClass('modal-hidden'); modalOverlay.addClass('modal-visible');
        document.addEventListener('keydown', handleEscapeKey);
    }
}
function hideModal() { 
    if (modalOverlay) {
        modalOverlay.removeClass('modal-visible'); modalOverlay.addClass('modal-hidden');
        document.removeEventListener('keydown', handleEscapeKey);
    }
}
function handleEscapeKey(event) { 
     if (event.key === 'Escape') { hideModal(); }
}




// --- Global Key Listener (Shortcuts C, R, V) ---
function keyPressed() {
    // Ignore key presses if the input textarea has focus OR modal is visible
    if (document.activeElement === cipherInputArea.elt ||
        (modalOverlay && modalOverlay.hasClass('modal-visible'))) {
        return;
    }

    const keyUpper = key.toUpperCase();
    if (keyUpper === 'V' && pasteDecryptButton) {
        console.log("Shortcut 'V' -> Paste & Decrypt");
        handlePasteAndDecrypt(); return false; 
    } else if (keyUpper === 'C' && copyOutputButton && !copyOutputButton.hasAttribute('disabled')) {
        console.log("Shortcut 'C' -> Copy Output");
        copyDecryptedOutput(); return false; 
    } else if (keyUpper === 'R' && resetButton) {
         console.log("Shortcut 'R' -> Reset");
        handleReset(); return false; 
    }
}