const fs = require('fs');
const path = require('path');

module.exports = {
    info: {
        name: 'addowner',
        description: 'Add a new owner to the bot',
        usage: '.addowner <number>',
        aliases: []
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            if (!args || args.length === 0) {
                await msg.reply('❌ Please provide a phone number!\nUsage: .addowner <number>');
                return { success: true };
            }

            const phoneNumber = args[0].replace(/[^\d]/g, ''); // Remove non-digits
            const formattedNumber = phoneNumber + '@c.us';

            // Create data directory if it doesn't exist
            if (!fs.existsSync('./data')) {
                fs.mkdirSync('./data');
            }

            // Load existing owners
            let owners = [];
            const ownersFile = './data/owners.json';
            if (fs.existsSync(ownersFile)) {
                owners = JSON.parse(fs.readFileSync(ownersFile, 'utf8'));
            }

            // Check if owner already exists
            if (owners.includes(formattedNumber)) {
                await msg.reply(`❌ ${phoneNumber} is already an owner!`);
                return { success: true };
            }

            // Add new owner
            owners.push(formattedNumber);
            fs.writeFileSync(ownersFile, JSON.stringify(owners, null, 2));

            await msg.reply(`✅ Successfully added ${phoneNumber} as bot owner!`);
            return { success: true };
        } catch (error) {
            console.error('Error in addowner command:', error);
            return { 
                success: false, 
                message: '❌ Error in addowner command: ' + error.message 
            };
        }
    }
};
