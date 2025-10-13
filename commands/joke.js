const axios = require('axios');

module.exports = {
    info: {
        name: 'joke',
        description: 'Get a random joke',
        usage: '.joke',
        aliases: []
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            const jokes = [
                "Why don't scientists trust atoms? Because they make up everything!",
                "Why did the scarecrow win an award? He was outstanding in his field!",
                "Why don't eggs tell jokes? They'd crack each other up!",
                "What do you call a fake noodle? An impasta!",
                "Why did the math book look so sad? Because it had too many problems!",
                "What do you call a bear with no teeth? A gummy bear!",
                "Why don't skeletons fight each other? They don't have the guts!",
                "What do you call a fish wearing a bowtie? So-fish-ticated!",
                "Why did the coffee file a police report? It got mugged!",
                "What do you call a dinosaur that crashes his car? Tyrannosaurus Wrecks!",
                "Why don't scientists trust stairs? Because they're always up to something!",
                "What do you call a cow with no legs? Ground beef!",
                "Why did the bicycle fall over? Because it was two tired!",
                "What do you call a can opener that doesn't work? A can't opener!",
                "Why don't oysters donate to charity? Because they are shellfish!"
            ];
            
            const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
            
            await msg.reply(`😂 *Random Joke:*\n\n${randomJoke}`);
            return { success: true };
        } catch (error) {
            console.error('Error in joke command:', error);
            return { 
                success: false, 
                message: '❌ Error in joke command: ' + error.message 
            };
        }
    }
};
