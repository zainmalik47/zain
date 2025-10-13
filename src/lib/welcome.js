const fs = require('fs');
const path = require('path');

// Default messages
const welcomeMessages = [
    "Welcome {user}! 👋 Glad to have you here!",
    "Hey {user}! 🎉 Welcome to our group!",
    "Welcome aboard {user}! 🚀",
    "A warm welcome to {user}! 🌟",
    "Hello {user}! 👋 Welcome to the family!"
];

const goodbyeMessages = [
    "Goodbye {user}! 👋",
    "Farewell {user}! Hope to see you again! 🌟",
    "Take care {user}! 👋",
    "See you around {user}! 🌅", 
    "Until next time {user}! 🤝"
];

// Welcome handler
module.exports = {
    /**
     * Get welcome message for a group
     * @param {String} groupId - Group ID
     * @returns {String|null} Welcome message if exists
     */
    getWelcomeMessage(groupId) {
        try {
            const welcomeFile = path.join(__dirname, '../data/welcome.json');
            if (!fs.existsSync(welcomeFile)) {
                fs.writeFileSync(welcomeFile, '{}');
                return null;
            }

            const welcomeData = JSON.parse(fs.readFileSync(welcomeFile));
            return welcomeData[groupId] || this.getRandomWelcome();
        } catch (error) {
            console.error('Error getting welcome message:', error);
            return this.getRandomWelcome();
        }
    },

    /**
     * Set welcome message for a group
     * @param {String} groupId - Group ID
     * @param {String} message - Welcome message
     */
    setWelcomeMessage(groupId, message) {
        try {
            const welcomeFile = path.join(__dirname, '../data/welcome.json');
            let welcomeData = {};
            
            if (fs.existsSync(welcomeFile)) {
                welcomeData = JSON.parse(fs.readFileSync(welcomeFile));
            }

            welcomeData[groupId] = message;
            fs.writeFileSync(welcomeFile, JSON.stringify(welcomeData, null, 2));
        } catch (error) {
            console.error('Error setting welcome message:', error);
        }
    },

    /**
     * Remove welcome message for a group
     * @param {String} groupId - Group ID
     */
    removeWelcomeMessage(groupId) {
        try {
            const welcomeFile = path.join(__dirname, '../data/welcome.json');
            if (!fs.existsSync(welcomeFile)) return;

            const welcomeData = JSON.parse(fs.readFileSync(welcomeFile));
            delete welcomeData[groupId];
            fs.writeFileSync(welcomeFile, JSON.stringify(welcomeData, null, 2));
        } catch (error) {
            console.error('Error removing welcome message:', error);
        }
    },

    /**
     * Get random welcome message
     * @param {String} username - Username to insert
     * @returns {String} Welcome message
     */
    getRandomWelcome(username) {
        const msg = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
        return username ? msg.replace('{user}', username) : msg;
    },

    /**
     * Get random goodbye message
     * @param {String} username - Username to insert
     * @returns {String} Goodbye message
     */
    getRandomGoodbye(username) {
        const msg = goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)];
        return username ? msg.replace('{user}', username) : msg;
    }
};