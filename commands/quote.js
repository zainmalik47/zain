module.exports = {
    info: {
        name: 'quote',
        description: 'Get random quotes',
        usage: '.quote',
        aliases: []
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            const quotes = [
                { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
                { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
                { text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon" },
                { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
                { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
                { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
                { text: "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.", author: "Roy T. Bennett" },
                { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
                { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
                { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
                { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
                { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
                { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
                { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
                { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" }
            ];
            
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            
            await msg.reply(`💭 *Inspirational Quote:*\n\n"${randomQuote.text}"\n\n— ${randomQuote.author}`);
            return { success: true };
        } catch (error) {
            console.error('Error in quote command:', error);
            return { 
                success: false, 
                message: '❌ Error in quote command: ' + error.message 
            };
        }
    }
};