const fs = require('fs');
const path = require('path');
const CommandConverter = require('../lib/CommandConverter');
const settings = require('../lib/settings');
const { messageConfig, channelInfo } = require('../lib/messageConfig');

class CommandHandler {
    constructor(client, config) {
        this.client = client;
        this.config = config;
        this.commands = new Map();
        this.CommandList = require('../lib/CommandList');
        this.loadCommands();
        this.cooldowns = new Map();
    }

    async loadCommands() {
        const commandsPath = path.join(__dirname, '../../commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => 
            file.endsWith('.js') && file !== 'BaseCommand.js'
        );

        console.log('Loading commands...');
        let successCount = 0;
        let errorCount = 0;

        for (const file of commandFiles) {
            try {
                const commandPath = path.join(commandsPath, file);
                const commandName = file.split('.')[0].toLowerCase();
                
                // Convert old command to new format
                const command = await CommandConverter.convertCommand(commandPath, commandName);
                
                // Add command metadata
                command.info = {
                    name: commandName,
                    fileName: file,
                    ownerOnly: settings.commands.ownerOnly.includes(commandName),
                    adminOnly: settings.commands.adminOnly.includes(commandName),
                    groupOnly: settings.commands.groupOnly.includes(commandName)
                };
                
                this.commands.set(commandName, command);
                console.log(`✅ Loaded command: ${commandName}`);
                successCount++;
            } catch (error) {
                console.error(`❌ Error loading command ${file}:`, error);
                errorCount++;
            }
        }
        
        console.log(`Command loading complete:
- Total commands: ${commandFiles.length}
- Successfully loaded: ${successCount}
- Failed to load: ${errorCount}`);
    }

    async handleCommand(msg, chat, contact) {
        try {
            const text = msg.body || '';
            if (!text.startsWith(settings.prefix)) return false;

            const args = text.trim().split(/\s+/);
            const commandName = args[0].slice(1).toLowerCase();
            const command = this.commands.get(commandName);

            // Log command attempt in terminal
            console.log(`Command attempt: ${commandName} from ${contact.pushname || contact.number} in ${chat.isGroup ? 'group' : 'private'} chat`);

            // Special handling for help command
            if (commandName === 'help') {
                const helpText = args[1] ? 
                    this.CommandList.getCommandHelp(args[1]) :
                    this.CommandList.formatCommandHelp();
                await msg.reply(helpText);
                return true;
            }

            // Check if command exists
            if (!command) {
                await msg.reply('❌ Unknown command. Use .help to see available commands.');
                return false;
            }

            // Check admin-only commands in groups
            if (chat.isGroup && command.info.adminOnly) {
                const isAdmin = chat.participants.find(p => p.id._serialized === contact.id._serialized)?.isAdmin;
                if (!isAdmin) {
                    await msg.reply('❌ This command can only be used by group admins.');
                    return false;
                }
            }

            // Log command execution
            console.log(`Executing command: ${commandName} from ${contact.pushname || contact.number} in ${chat.isGroup ? 'group' : 'private'} chat`);
            
            // Execute command

            try {
                // Execute command
                const result = await command.handleCommand(this.client, chat, msg, args.slice(1));
                
                // Handle command result
                if (result) {
                    if (result.message) {
                        await msg.reply({
                            text: result.message,
                            ...channelInfo
                        });
                    }
                    return result.success;
                }
                return true;
            } catch (error) {
                console.error(`Error executing command ${commandName}:`, error);
                await msg.reply({
                    text: '❌ Error executing command: ' + error.message,
                    ...channelInfo
                });
                return false;
            }

            return false;
        } catch (error) {
            console.error('Error in command handler:', error);
            return false;
        }
    }

    getLoadedCommands() {
        return Array.from(this.commands.keys());
    }
}

module.exports = CommandHandler;