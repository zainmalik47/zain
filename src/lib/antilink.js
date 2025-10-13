const fs = require('fs');
const path = require('path');

let antiLinkGroups = new Set();
const antiLinkFile = path.join(__dirname, '../data/antilink.json');

// Load antilink groups from file
function loadAntiLinkGroups() {
    try {
        if (fs.existsSync(antiLinkFile)) {
            const data = JSON.parse(fs.readFileSync(antiLinkFile));
            antiLinkGroups = new Set(data);
        } else {
            fs.writeFileSync(antiLinkFile, '[]');
        }
    } catch (error) {
        console.error('Error loading antilink groups:', error);
    }
}

// Save antilink groups to file
function saveAntiLinkGroups() {
    try {
        fs.writeFileSync(antiLinkFile, JSON.stringify([...antiLinkGroups]));
    } catch (error) {
        console.error('Error saving antilink groups:', error);
    }
}

/**
 * Enable antilink for a group
 * @param {String} groupId - Group ID
 */
function enableAntiLink(groupId) {
    antiLinkGroups.add(groupId);
    saveAntiLinkGroups();
}

/**
 * Disable antilink for a group
 * @param {String} groupId - Group ID
 */
function disableAntiLink(groupId) {
    antiLinkGroups.delete(groupId);
    saveAntiLinkGroups();
}

/**
 * Check if antilink is enabled for a group
 * @param {String} groupId - Group ID
 * @returns {Boolean} true if enabled
 */
function isAntiLinkEnabled(groupId) {
    return antiLinkGroups.has(groupId);
}

/**
 * Check if a message contains links
 * @param {String} text - Message text
 * @returns {Boolean} true if contains links
 */
function containsLinks(text) {
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
    return urlRegex.test(text);
}

// Load groups on module import
loadAntiLinkGroups();

module.exports = {
    enableAntiLink,
    disableAntiLink,
    isAntiLinkEnabled,
    containsLinks
};