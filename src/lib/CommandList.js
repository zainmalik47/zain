// List of all available commands
const commands = {
    // Owner commands
    "addowner": "Add a new owner to the bot",
    "removeowner": "Remove an owner from the bot",
    "broadcast": "Broadcast a message to all chats",
    "setpp": "Set bot's profile picture",
    
    // Group admin commands
    "kick": "Kick a member from the group",
    "add": "Add a member to the group",
    "promote": "Promote a member to admin",
    "demote": "Demote an admin to member",
    "ban": "Ban a user from using the bot",
    "unban": "Unban a user",
    "mute": "Mute a user in group",
    "unmute": "Unmute a user in group",
    
    // General commands
    "help": "Show this help message",
    "menu": "Show command menu",
    "ping": "Check bot's response time",
    "info": "Show bot information",
    "ownerinfo": "Show bot owner information",
    
    // Feature commands
    "autostatus": "Toggle auto status viewer",
    "autoreply": "Toggle auto reply",
    "autoreact": "Toggle auto reactions",
    "autoread": "Toggle auto read messages",
    "welcome": "Toggle welcome messages",
    "goodbye": "Toggle goodbye messages",
    
    // Fun commands
    "sticker": "Create sticker from image/video",
    "quote": "Get a random quote",
    "meme": "Get a random meme",
    "joke": "Get a random joke",
    "ship": "Ship two people together",
    "truth": "Get a truth question",
    "dare": "Get a dare",
    "compliment": "Get a compliment",
    "flirt": "Get a flirty line",
    "insult": "Get a funny insult",
    
    // Media commands
    "play": "Play YouTube audio",
    "video": "Download YouTube video",
    "song": "Search and download songs",
    "lyrics": "Find song lyrics",
    "tiktok": "Download TikTok video",
    "instagram": "Download Instagram content",
    "facebook": "Download Facebook video",
    
    // Utility commands
    "translate": "Translate text",
    "weather": "Get weather information",
    "news": "Get latest news",
    "ss": "Take website screenshot",
    "github": "Get GitHub user/repo info",
    "ai": "Chat with AI",
    
    // Group commands
    "groupinfo": "Show group information",
    "tagall": "Tag all group members",
    "tag": "Tag specific members",
    "warnings": "Show user warnings",
    "warn": "Warn a user",
    "topmembers": "Show most active members"
};

function getCommandHelp(command) {
    return commands[command] || "No help available for this command";
}

function listAllCommands() {
    return Object.entries(commands).map(([cmd, desc]) => `*.${cmd}* - ${desc}`).join('\n');
}

function formatCommandHelp() {
    const categories = {
        "👑 Owner Commands": ["addowner", "removeowner", "broadcast", "setpp"],
        "👮 Admin Commands": ["kick", "add", "promote", "demote", "ban", "unban", "mute", "unmute"],
        "🤖 Bot Commands": ["help", "menu", "ping", "info", "ownerinfo"],
        "⚙️ Features": ["autostatus", "autoreply", "autoreact", "autoread", "welcome", "goodbye"],
        "🎮 Fun Commands": ["sticker", "quote", "meme", "joke", "ship", "truth", "dare", "compliment", "flirt", "insult"],
        "📺 Media Commands": ["play", "video", "song", "lyrics", "tiktok", "instagram", "facebook"],
        "🛠️ Utilities": ["translate", "weather", "news", "ss", "github", "ai"],
        "👥 Group Commands": ["groupinfo", "tagall", "tag", "warnings", "warn", "topmembers"]
    };

    let helpText = "*𝒵𝒜𝐼𝒩 • 𝒳𝒟 ★ Commands*\n\n";
    
    for (const [category, cmds] of Object.entries(categories)) {
        helpText += `${category}\n`;
        cmds.forEach(cmd => {
            helpText += `  *.${cmd}* - ${getCommandHelp(cmd)}\n`;
        });
        helpText += '\n';
    }
    
    return helpText + "\nUse .help <command> for detailed information about a specific command.";
}

module.exports = {
    getCommandHelp,
    listAllCommands,
    formatCommandHelp,
    commands
};