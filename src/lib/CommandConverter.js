// Command converter utility class
class CommandConverter {
    static async convertCommand(oldCommandPath, commandName) {
        try {
            // Remove command from require cache if it exists
            delete require.cache[require.resolve(oldCommandPath)];
            
            // Import the old command
            const oldCommand = require(oldCommandPath);

            // Create new command structure
            const newCommand = {
                async handleCommand(client, chat, msg, args) {
                    try {
                        console.log(`Executing command: ${commandName} with args:`, args);
                        
                        // Handle different command formats
                        if (typeof oldCommand === 'function') {
                            // For function-style commands
                            await oldCommand(client, chat.id._serialized, msg, args);
                            return { success: true };
                        } else if (oldCommand.handleCommand) {
                            // Already in new format
                            const result = await oldCommand.handleCommand(client, chat, msg, args);
                            console.log(`Command ${commandName} result:`, result);
                            return result || { success: true };
                        } else if (oldCommand[`${commandName}Command`]) {
                            // For commands that export nameCommand function
                            await oldCommand[`${commandName}Command`](client, chat.id._serialized, msg, args);
                            return { success: true };
                        } else if (oldCommand.execute) {
                            // For commands with execute method
                            await oldCommand.execute(client, chat.id._serialized, msg, args);
                            return { success: true };
                        } else {
                            throw new Error(`Unsupported command format for ${commandName}`);
                        }
                    } catch (error) {
                        console.error(`Error executing ${commandName}:`, error);
                        return {
                            success: false,
                            message: '❌ Error executing command: ' + error.message
                        };
                    }
                }
            };

            // Add any additional exported functions from old command
            for (const key in oldCommand) {
                if (key !== 'handleCommand' && typeof oldCommand[key] === 'function') {
                    newCommand[key] = oldCommand[key];
                }
            }

            return newCommand;
        } catch (error) {
            console.error(`Error converting command ${commandName}:`, error);
            return {
                handleCommand: async () => ({
                    success: false,
                    message: '❌ Command failed to load: ' + error.message
                })
            };
        }
    }
}

module.exports = CommandConverter;