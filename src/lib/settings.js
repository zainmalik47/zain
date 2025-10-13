const fs = require('fs');
const path = require('path');

const defaultSettings = {
    private: false,
    owners: [],
    ownerNames: ["Zoxer", "Mazari"],
    channels: [
        "https://whatsapp.com/channel/0029Vb6GUj8BPzjOWNfnhm1B",
        "https://whatsapp.com/channel/0029VbBRITODzgTGQhZSFT3P"
    ],
    welcomeMessage: "Welcome! This is MazariBot. Use .help to see commands.",
    autoStatusSeen: false,
    autoReply: true, 
    autoReact: true,
    prefix: ".",
    adminPrefix: "@",
    botName: "MazariBot",
    version: "2.0.5",
    apiKeys: {
        weather: process.env.WEATHER_API_KEY || "",
        news: process.env.NEWS_API_KEY || "",
        tenor: process.env.TENOR_API_KEY || "",
        openai: process.env.OPENAI_API_KEY || "",
        removebg: process.env.REMOVE_BG_API_KEY || ""
    },
    commands: {
        ownerOnly: [],
        adminOnly: [
            "kick", "add", "promote", "demote",
            "close", "open", "link", "revoke", 
            "tagall", "hidetag", "warn", "unwarn"
        ],
        groupOnly: [
            "antilink", "welcome", "goodbye",
            "groupinfo", "setdesc", "setname",
            "tagall", "hidetag", "warn"
        ]
    },
    stickerMetadata: {
        packname: "MazariBot",
        author: "Made with ❤️"
    },
    games: {
        tictactoe: {
            timeLimit: 60000,
            turnTime: 30000
        },
        trivia: {
            timeLimit: 30000,
            points: 10
        }
    },
    antiSpam: {
        enabled: true,
        maxMessages: 5,
        timeWindow: 3000
    }
};

let settings = { ...defaultSettings };
const settingsFile = path.join(__dirname, '../config.json');

/**
 * Load settings from config file
 */
function loadSettings() {
    try {
        if (fs.existsSync(settingsFile)) {
            const data = JSON.parse(fs.readFileSync(settingsFile));
            settings = { ...defaultSettings, ...data };
        } else {
            fs.writeFileSync(settingsFile, JSON.stringify(defaultSettings, null, 2));
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

/**
 * Save current settings to config file
 */
function saveSettings() {
    try {
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

/**
 * Get current settings
 * @returns {Object} Current settings
 */
function getSettings() {
    return { ...settings };
}

/**
 * Update settings
 * @param {Object} newSettings - New settings to merge
 */
function updateSettings(newSettings) {
    settings = { ...settings, ...newSettings };
    saveSettings();
}

// Load settings on module import
loadSettings();

module.exports = {
    getSettings,
    updateSettings,
    loadSettings,
    saveSettings
};