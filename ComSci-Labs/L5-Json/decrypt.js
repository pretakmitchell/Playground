// ====================================================================
// encrypt.js - Cipher Library (Assignment 5 - DECRYPTION ONLY)
// Case-Preserving, Expanded Alphabet, Pass-Through Chars, Interleaved Seed
// Contains ONLY the decryption logic and necessary constants/helpers.
// ====================================================================

(function(window) {
    'use strict';

    // --- Configuration Constants ---
    // These MUST be identical to the Assignment 3 encrypt.js file
    const SEED_LENGTH = 8;
    const EMBED_INTERVAL = 10;
    const CHARACTER_SET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?@#$&+-="; // 74 chars
    const CHAR_MAP = new Map(CHARACTER_SET.split('').map((char, i) => [char, i]));
    const ALPHABET_SIZE = CHARACTER_SET.length; // 74

    /**
     * Generates a numeric key sequence (0-25) from a seed string (A-Z).
     */
    function getKeySequenceFromSeed(seed) {
        const keySequence = [];
        for (let i = 0; i < seed.length; i++) {
            const charCode = seed.charCodeAt(i);
            if (charCode >= 65 && charCode <= 90) { // 'A'-'Z'
                keySequence.push(charCode - 65);
            }
        }
        return keySequence;
    }

    /**
     * Core Vigenere processing over the expanded CHARACTER_SET.
     * Used internally by simpleDecrypt. Only needs decrypt mode here.
     */
    function processVigenereExpanded(inputText, keySeed, encryptMode) { // encryptMode = false
        const keySequence = getKeySequenceFromSeed(keySeed);
        if (keySequence.length === 0) {
            console.error("Vigenere Error: Key sequence empty for seed:", keySeed);
            return "[PROCESS_ERROR]";
        }
        let result = "";
        let keyIndex = 0;
        for (let i = 0; i < inputText.length; i++) {
            const char = inputText[i];
            if (CHAR_MAP.has(char)) {
                const charIndex = CHAR_MAP.get(char);
                const keyShiftValue = keySequence[keyIndex % keySequence.length];
                 // Only does decryption:
                let processedIndex = (charIndex - keyShiftValue + ALPHABET_SIZE) % ALPHABET_SIZE;
                result += CHARACTER_SET[processedIndex];
                keyIndex++;
            } else {
                console.warn(`Appending unexpected character during Vigenere: ${char}`);
                result += char;
            }
        }
        return result;
    }

    // --- Encryption function REMOVED for Assignment 5 ---

    /**
     * Decrypts ciphertext, handling pass-through chars and extracting interleaved seed.
     */
    function simpleDecrypt(cipherText) {
        if (typeof cipherText !== 'string') { return null; }

        // 1. Deconstruct
        let processableCharsStream = "";
        let structure = [];
        for (let i = 0; i < cipherText.length; i++) {
            const char = cipherText[i];
            if (CHAR_MAP.has(char)) { // Check if processable (could be body or seed)
                processableCharsStream += char;
                structure.push({ char: '?', process: true }); // Mark slot
            } else {
                structure.push({ char: char, process: false }); // Pass-through
            }
        }

        // 2. De-interleave (Correct logic from previous step)
        if (processableCharsStream.length < SEED_LENGTH) {
             console.error("Decryption Error: Processable stream too short for seed."); return null;
        }
        const expectedBodyLength = processableCharsStream.length - SEED_LENGTH;
        let recoveredSeed = "";
        let encryptedBody = "";
        let charsSinceLastSeed = 0;
        let currentBodyLength = 0;
        let seedCharsFound = 0;
        for (let i = 0; i < processableCharsStream.length; i++) {
            const char = processableCharsStream[i];
            let isSeedChar = false;
            if (currentBodyLength >= expectedBodyLength) {
                 if (seedCharsFound < SEED_LENGTH) { isSeedChar = true; }
                 else { console.error(`Decryption Error: Extra chars after body/seed at index ${i}`); return null; }
            } else if (seedCharsFound < SEED_LENGTH && charsSinceLastSeed === EMBED_INTERVAL) {
                isSeedChar = true;
            }
            if (isSeedChar) {
                if (char >= 'A' && char <= 'Z') {
                    recoveredSeed += char; charsSinceLastSeed = 0; seedCharsFound++;
                } else { console.error(`Decryption Error: Expected A-Z seed char at index ${i}, found "${char}".`); return null; }
            } else {
                encryptedBody += char; charsSinceLastSeed++; currentBodyLength++;
            }
        }

        // 3. Validate Recovered Seed
        if (seedCharsFound !== SEED_LENGTH) { console.error(`Decryption Error: Recovered seed count ${seedCharsFound}.`); return null; }
        if (!/^[A-Z]+$/.test(recoveredSeed)) { console.error(`Decryption Error: Recovered seed "${recoveredSeed}" invalid.`); return null; }
        console.log("Recovered Seed:", recoveredSeed);
        if (processableCharsStream.length !== encryptedBody.length + recoveredSeed.length) { console.error(`Internal De-interleave Error: Length mismatch.`); return null; }

        // 4. Decrypt Body
        const decryptedChars = processVigenereExpanded(encryptedBody, recoveredSeed, false); // Always false
        if (decryptedChars === "[PROCESS_ERROR]") { return null; }

        // 5. Reconstruct Final Message (Correct logic from previous step)
        let finalMessage = "";
        let decryptedCharIndex = 0;

        for (let i = 0; i < structure.length; i++) {
            if (structure[i].process) {
                if (decryptedCharIndex < decryptedChars.length) {
                    finalMessage += decryptedChars[decryptedCharIndex];
                    decryptedCharIndex++;
                } else {
                    // Skip the seed slots silently
                }
            } else {
                finalMessage += structure[i].char;
            }
        }

        // Final check (Optional for decrypt-only version, but good sanity check)
        if (decryptedCharIndex < decryptedChars.length) {
             console.warn(`Warning: ${decryptedChars.length - decryptedCharIndex} decrypted characters unused. Check Step 1/5 logic.`);
        }

        return finalMessage;
    }


    // Export only the decryption function and constants
    window.simpleDecrypt = simpleDecrypt;

    window.SEED_LENGTH = SEED_LENGTH;
    window.EMBED_INTERVAL = EMBED_INTERVAL;
    window.CHARACTER_SET = CHARACTER_SET;
    window.ALPHABET_SIZE = ALPHABET_SIZE;

})(window);