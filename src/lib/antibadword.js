const fs = require('fs');
const path = require('path');

let badWordGroups = new Set();
let badWords = new Set();
const badWordFile = path.join(__dirname, '../data/badwords.json');

// Load bad words from file
function loadBadWords() {
    try {
        if (fs.existsSync(badWordFile)) {
            const data = JSON.parse(fs.readFileSync(badWordFile));
            badWordGroups = new Set(data.groups || []);
            badWords = new Set(data.words || []);
        } else {
            const defaultData = {
                groups: [],
                words: []
            };
            fs.writeFileSync(badWordFile, JSON.stringify(defaultData));
        }
    } catch (error) {
        console.error('Error loading bad words:', error);
    }
}

// Save bad words to file
function saveBadWords() {
    try {
        const data = {
            groups: [...badWordGroups],
            words: [...badWords]
        };
        fs.writeFileSync(badWordFile, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving bad words:', error);
    }
}

/**
 * Enable antibadword for a group
 * @param {String} groupId - Group ID
 */
function enableAntiBadWord(groupId) {
    badWordGroups.add(groupId);
    saveBadWords();
}

/**
 * Disable antibadword for a group
 * @param {String} groupId - Group ID
 */
function disableAntiBadWord(groupId) {
    badWordGroups.delete(groupId);
    saveBadWords();
}

/**
 * Check if antibadword is enabled for a group
 * @param {String} groupId - Group ID
 * @returns {Boolean} true if enabled
 */
function isAntiBadWordEnabled(groupId) {
    return badWordGroups.has(groupId);
}

/**
 * Add a bad word
 * @param {String} word - Word to add
 */
function addBadWord(word) {
    badWords.add(word.toLowerCase());
    saveBadWords();
}

/**
 * Remove a bad word
 * @param {String} word - Word to remove
 */
function removeBadWord(word) {
    badWords.delete(word.toLowerCase());
    saveBadWords();
}

/**
 * Check if text contains bad words
 * @param {String} text - Text to check
 * @returns {Boolean} true if contains bad words
 */
function containsBadWords(text) {
    const words = text.toLowerCase().split(/\s+/);
    return words.some(word => badWords.has(word));
}

/**
 * Get list of bad words
 * @returns {String[]} List of bad words
 */
function getBadWords() {
    return [...badWords];
}

// Load data on module import
loadBadWords();

module.exports = {
    enableAntiBadWord,
    disableAntiBadWord,
    isAntiBadWordEnabled,
    addBadWord,
    removeBadWord,
    containsBadWords,
    getBadWords
};