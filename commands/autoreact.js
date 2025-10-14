const fs = require('fs');
const path = require('path');

// Initialize data file if it doesn't exist
const dataFile = path.join(__dirname, '../data/reactions.json');
if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify({
        autoreact: false,
        reactEmojis: ["🪀", "🥏", "🤩", "💔", "🕐️", "🤍", "🥵", "❤️", "👍", "🎉", "✨", "🌟"],
        customReacts: {}
    }, null, 2));
}

const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: 'instagram@social',
            newsletterName: '𝒵𝒜𝐼𝒩 • 𝒳𝒟 ★',
            serverMessageId: -1
        }
    }
};

// Command to manage auto-reactions
async function autoreactCommand(sock, chatId, message, args) {
    try {
        // Read current data
        const data = JSON.parse(fs.readFileSync(dataFile));

        // If no arguments, show current settings
        if (!args || args.length === 0) {
            const status = data.autoreact ? 'enabled' : 'disabled';
            let replyText = `🎯 *Auto-React System*\nStatus: ${status}\n\n*Current Emojis:*\n${data.reactEmojis.join(' ')}\n\n`;
            
            if (Object.keys(data.customReacts).length > 0) {
                replyText += '*Custom Reactions:*\n';
                Object.entries(data.customReacts).forEach(([trigger, emoji]) => {
                    replyText += `"${trigger}" → ${emoji}\n`;
                });
                replyText += '\n';
            }

            replyText += "*Commands:*\n" +
                        ".autoreact on - Enable system\n" +
                        ".autoreact off - Disable system\n" +
                        ".autoreact add <emoji> - Add emoji to random pool\n" +
                        ".autoreact del <emoji> - Remove emoji from pool\n" +
                        ".autoreact set <word>|<emoji> - Set custom reaction\n" +
                        ".autoreact unset <word> - Remove custom reaction\n" +
                        ".autoreact list - Show all settings";

            await sock.sendMessage(chatId, { 
                text: replyText,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const command = args[0].toLowerCase();

        switch(command) {
            case 'on':
                data.autoreact = true;
                fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
                await sock.sendMessage(chatId, { 
                    text: '✅ Auto-react system enabled!',
                    ...channelInfo
                }, { quoted: message });
                break;

            case 'off':
                data.autoreact = false;
                fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
                await sock.sendMessage(chatId, { 
                    text: '❌ Auto-react system disabled!',
                    ...channelInfo
                }, { quoted: message });
                break;

            case 'add':
                const newEmoji = args[1];
                if (!newEmoji || !isEmoji(newEmoji)) {
                    await sock.sendMessage(chatId, { 
                        text: '❌ Please provide a valid emoji!',
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }

                if (!data.reactEmojis.includes(newEmoji)) {
                    data.reactEmojis.push(newEmoji);
                    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
                    await sock.sendMessage(chatId, { 
                        text: `✅ Added ${newEmoji} to reaction pool!`,
                        ...channelInfo
                    }, { quoted: message });
                } else {
                    await sock.sendMessage(chatId, { 
                        text: `❌ ${newEmoji} is already in the reaction pool!`,
                        ...channelInfo
                    }, { quoted: message });
                }
                break;

            case 'del':
                const emojiToRemove = args[1];
                const index = data.reactEmojis.indexOf(emojiToRemove);
                
                if (index === -1) {
                    await sock.sendMessage(chatId, { 
                        text: `❌ ${emojiToRemove} is not in the reaction pool!`,
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }

                data.reactEmojis.splice(index, 1);
                fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
                
                await sock.sendMessage(chatId, { 
                    text: `✅ Removed ${emojiToRemove} from reaction pool!`,
                    ...channelInfo
                }, { quoted: message });
                break;

            case 'set':
                const input = args.slice(1).join(' ');
                const [trigger, emoji] = input.split('|').map(str => str.trim());
                
                if (!trigger || !emoji || !isEmoji(emoji)) {
                    await sock.sendMessage(chatId, { 
                        text: '❌ Invalid format! Use: .autoreact set word|emoji',
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }

                data.customReacts[trigger.toLowerCase()] = emoji;
                fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
                
                await sock.sendMessage(chatId, { 
                    text: `✅ Added custom reaction!\nWhen message contains: "${trigger}"\nBot will react with: ${emoji}`,
                    ...channelInfo
                }, { quoted: message });
                break;

            case 'unset':
                const triggerToRemove = args.slice(1).join(' ').toLowerCase();
                
                if (!data.customReacts[triggerToRemove]) {
                    await sock.sendMessage(chatId, { 
                        text: '❌ No custom reaction found for this word!',
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }

                delete data.customReacts[triggerToRemove];
                fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
                
                await sock.sendMessage(chatId, { 
                    text: `✅ Removed custom reaction for "${triggerToRemove}"`,
                    ...channelInfo
                }, { quoted: message });
                break;

            case 'list':
                let listText = '*🎯 Auto-React Settings*\n\n';
                listText += `Status: ${data.autoreact ? 'Enabled' : 'Disabled'}\n\n`;
                listText += '*Random Reaction Pool:*\n';
                listText += data.reactEmojis.join(' ') + '\n\n';
                
                if (Object.keys(data.customReacts).length > 0) {
                    listText += '*Custom Reactions:*\n';
                    Object.entries(data.customReacts).forEach(([trigger, emoji]) => {
                        listText += `"${trigger}" → ${emoji}\n`;
                    });
                }

                await sock.sendMessage(chatId, { 
                    text: listText,
                    ...channelInfo
                }, { quoted: message });
                break;

            default:
                await sock.sendMessage(chatId, { 
                    text: '❌ Unknown command! Use .autoreact for help.',
                    ...channelInfo
                }, { quoted: message });
        }
    } catch (error) {
        console.error('Error in autoreact command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error processing command.',
            ...channelInfo
        }, { quoted: message });
    }
}

// Function to check and handle auto-reactions
async function handleAutoReact(sock, message) {
    try {
        // Read current data
        const data = JSON.parse(fs.readFileSync(dataFile));
        
        // If system is disabled, return
        if (!data.autoreact) return;

        const text = message.message?.conversation?.toLowerCase() ||
                    message.message?.extendedTextMessage?.text?.toLowerCase() ||
                    message.message?.imageMessage?.caption?.toLowerCase() ||
                    '';

        // First check custom reactions
        for (const [trigger, emoji] of Object.entries(data.customReacts)) {
            if (text.includes(trigger)) {
                await sock.sendMessage(message.key.remoteJid, { 
                    react: { 
                        text: emoji, 
                        key: message.key 
                    }
                });
                return;
            }
        }

        // If no custom reaction matched, use random emoji
        if (data.reactEmojis.length > 0) {
            const randomEmoji = data.reactEmojis[Math.floor(Math.random() * data.reactEmojis.length)];
            await sock.sendMessage(message.key.remoteJid, { 
                react: { 
                    text: randomEmoji, 
                    key: message.key 
                }
            });
        }
    } catch (error) {
        console.error('Error in auto-react handler:', error);
    }
}

// Helper function to check if a string is a single emoji
function isEmoji(str) {
    const emojiRegex = /^(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])$/;
    return str.length === 1 && emojiRegex.test(str);
}

module.exports = {
    info: {
        name: 'autoreact',
        description: 'Manage auto-reaction system',
        usage: '.autoreact [on|off|add|del|set|unset|list]',
        aliases: ['areact']
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            // Read current data
            const data = JSON.parse(fs.readFileSync(dataFile));

            // If no arguments, show current settings
            if (!args || args.length === 0) {
                const status = data.autoreact ? 'enabled' : 'disabled';
                let replyText = `🎯 *Auto-React System*\nStatus: ${status}\n\n*Current Emojis:*\n${data.reactEmojis.join(' ')}\n\n`;
                
                if (Object.keys(data.customReacts).length > 0) {
                    replyText += '*Custom Reactions:*\n';
                    Object.entries(data.customReacts).forEach(([trigger, emoji]) => {
                        replyText += `"${trigger}" → ${emoji}\n`;
                    });
                    replyText += '\n';
                }

                replyText += "*Commands:*\n" +
                            ".autoreact on - Enable system\n" +
                            ".autoreact off - Disable system\n" +
                            ".autoreact add <emoji> - Add emoji to random pool\n" +
                            ".autoreact del <emoji> - Remove emoji from pool\n" +
                            ".autoreact set <word>|<emoji> - Set custom reaction\n" +
                            ".autoreact unset <word> - Remove custom reaction\n" +
                            ".autoreact list - Show all settings";

                await msg.reply(replyText);
                return { success: true };
            }

            const command = args[0].toLowerCase();

            switch(command) {
                case 'on':
                    data.autoreact = true;
                    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
                    await msg.reply('✅ Auto-react system enabled!\n\nBot will now react to incoming messages with random emojis.');
                    return { 
                        success: true,
                        autoReact: true
                    };

                case 'off':
                    data.autoreact = false;
                    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
                    await msg.reply('❌ Auto-react system disabled!\n\nBot will no longer auto-react to messages.');
                    return { 
                        success: true,
                        autoReact: false
                    };

                case 'add':
                    const newEmoji = args[1];
                    if (!newEmoji || !isEmoji(newEmoji)) {
                        await msg.reply('❌ Please provide a valid emoji!');
                        return { success: true };
                    }

                    if (!data.reactEmojis.includes(newEmoji)) {
                        data.reactEmojis.push(newEmoji);
                        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
                        await msg.reply(`✅ Added ${newEmoji} to reaction pool!`);
                    } else {
                        await msg.reply(`❌ ${newEmoji} is already in the reaction pool!`);
                    }
                    break;

                case 'del':
                    const emojiToRemove = args[1];
                    const index = data.reactEmojis.indexOf(emojiToRemove);
                    
                    if (index === -1) {
                        await msg.reply(`❌ ${emojiToRemove} is not in the reaction pool!`);
                        return { success: true };
                    }

                    data.reactEmojis.splice(index, 1);
                    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
                    
                    await msg.reply(`✅ Removed ${emojiToRemove} from reaction pool!`);
                    break;

                case 'set':
                    const input = args.slice(1).join(' ');
                    const [trigger, emoji] = input.split('|').map(str => str.trim());
                    
                    if (!trigger || !emoji || !isEmoji(emoji)) {
                        await msg.reply('❌ Invalid format! Use: .autoreact set word|emoji');
                        return { success: true };
                    }

                    data.customReacts[trigger.toLowerCase()] = emoji;
                    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
                    
                    await msg.reply(`✅ Added custom reaction!\nWhen message contains: "${trigger}"\nBot will react with: ${emoji}`);
                    break;

                case 'unset':
                    const triggerToRemove = args.slice(1).join(' ').toLowerCase();
                    
                    if (!data.customReacts[triggerToRemove]) {
                        await msg.reply('❌ No custom reaction found for this word!');
                        return { success: true };
                    }

                    delete data.customReacts[triggerToRemove];
                    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
                    
                    await msg.reply(`✅ Removed custom reaction for "${triggerToRemove}"`);
                    break;

                case 'list':
                    let listText = '*🎯 Auto-React Settings*\n\n';
                    listText += `Status: ${data.autoreact ? 'Enabled' : 'Disabled'}\n\n`;
                    listText += '*Random Reaction Pool:*\n';
                    listText += data.reactEmojis.join(' ') + '\n\n';
                    
                    if (Object.keys(data.customReacts).length > 0) {
                        listText += '*Custom Reactions:*\n';
                        Object.entries(data.customReacts).forEach(([trigger, emoji]) => {
                            listText += `"${trigger}" → ${emoji}\n`;
                        });
                    }

                    await msg.reply(listText);
                    break;

                default:
                    await msg.reply('❌ Unknown command! Use .autoreact for help.');
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error in autoreact command:', error);
            return { 
                success: false, 
                message: '❌ Error in autoreact command: ' + error.message 
            };
        }
    },

    // Export the auto-react handler for use in main bot
    handleAutoReact
};
