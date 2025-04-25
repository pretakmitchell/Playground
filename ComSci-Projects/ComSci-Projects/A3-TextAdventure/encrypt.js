// ====================================================================
// encrypt.js - Cipher Library (Assignment 3 - ENCRYPTION ONLY)
// Case-Preserving, Expanded Alphabet, Pass-Through Chars, Interleaved Seed
// Contains ONLY the encryption logic and necessary constants/helpers.
// ====================================================================
// Encryption logic written entirely but GPT-o3 then later improved by gemini 2.5pro preview 
// ====================================================================

(function(window) {
    'use strict';

    // --- Configuration Constants ---
    // These MUST be identical in the Assignment 5 decrypt.js file
    const SEED_LENGTH = 8;
    const EMBED_INTERVAL = 10;
    const CHARACTER_SET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?@#$&+-="; // 74 chars
    const CHAR_MAP = new Map(CHARACTER_SET.split('').map((char, i) => [char, i]));
    const ALPHABET_SIZE = CHARACTER_SET.length; // 74

    /**
     * Generates a numeric key sequence (0-25) from a seed string (A-Z).
     * Used internally by Vigenere processing.
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
     * Used internally by simpleEncrypt. Only needs encrypt mode here.
     */
    function processVigenereExpanded(inputText, keySeed, encryptMode) { // encryptMode = true
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
                // Only does encryption:
                let processedIndex = (charIndex + keyShiftValue) % ALPHABET_SIZE;
                result += CHARACTER_SET[processedIndex];
                keyIndex++;
            } else {
                // This should ideally not happen if input is pre-filtered by caller
                console.warn(`Appending unexpected character during Vigenere: ${char}`);
                result += char;
            }
        }
        return result;
    }

    /**
     * Encrypts message, preserving case, passing through unknowns, interleaving seed.
     */
    function simpleEncrypt(message, randomSeed) {
        // 1. Validate Seed
        if (typeof randomSeed !== 'string' || randomSeed.length !== SEED_LENGTH || !/^[A-Z]+$/.test(randomSeed)) {
            console.error(`Encryption Error: Invalid seed "${randomSeed}". Must be ${SEED_LENGTH} uppercase letters.`); return null;
        }
        // 2. Process message: Collect encryptable chars, track structure
        let encryptableChars = "";
        let structure = [];
        for (let i = 0; i < message.length; i++) {
            const char = message[i];
            if (CHAR_MAP.has(char)) {
                encryptableChars += char;
                structure.push({ char: null, process: true });
            } else {
                structure.push({ char: char, process: false });
            }
        }
        // 3. Encrypt the collected encryptable characters
        const encryptedProcessedChars = processVigenereExpanded(encryptableChars, randomSeed, true); // Always true
        if (encryptedProcessedChars === "[PROCESS_ERROR]") { return null; }

        // 4. Interleave Seed (A-Z) into the encrypted processed characters
        let interleavedEncryptedWithSeed = "";
        let encryptedIndex = 0;
        let seedIndex = 0;
        let charsSinceLastSeed = 0;
        while (encryptedIndex < encryptedProcessedChars.length || seedIndex < randomSeed.length) {
            if (encryptedIndex < encryptedProcessedChars.length) {
                 interleavedEncryptedWithSeed += encryptedProcessedChars[encryptedIndex];
                 encryptedIndex++;
                 charsSinceLastSeed++;
            }
            if (seedIndex < randomSeed.length && (charsSinceLastSeed === EMBED_INTERVAL || encryptedIndex >= encryptedProcessedChars.length)) {
                interleavedEncryptedWithSeed += randomSeed[seedIndex];
                seedIndex++;
                charsSinceLastSeed = 0;
            }
        }
        // 5. Reconstruct Final Ciphertext using the structure map
        let finalCipher = "";
        let processableIndex = 0;
        for (let i = 0; i < structure.length; i++) {
            if (structure[i].process) {
                if (processableIndex < interleavedEncryptedWithSeed.length) {
                    finalCipher += interleavedEncryptedWithSeed[processableIndex];
                    processableIndex++;
                } else {
                     console.error("Error during encryption reconstruction: Not enough processable chars."); finalCipher += '?';
                }
            } else {
                finalCipher += structure[i].char;
            }
        }
         if (processableIndex < interleavedEncryptedWithSeed.length) {
              console.warn("(Encrypt) Appending remaining final chars from interleaved string.");
              finalCipher += interleavedEncryptedWithSeed.substring(processableIndex);
         }
        return finalCipher;
    }

    // --- Decryption function REMOVED for Assignment 3 ---

    // Export only the encryption function and constants
    window.simpleEncrypt = simpleEncrypt;

    window.SEED_LENGTH = SEED_LENGTH;
    window.EMBED_INTERVAL = EMBED_INTERVAL;
    window.CHARACTER_SET = CHARACTER_SET;
    window.ALPHABET_SIZE = ALPHABET_SIZE;

})(window);