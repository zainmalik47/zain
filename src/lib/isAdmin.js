/**
 * Check if user is admin in the group
 * @param {Object} client - WhatsApp client instance
 * @param {String} group - Group ID 
 * @param {String} user - User ID to check
 * @returns {Promise<Boolean>} true if user is admin
 */
async function isAdmin(client, group, user) {
    try {
        const chat = await client.groupMetadata(group);
        const admins = chat.participants.filter(p => p.admin).map(p => p.id);
        return admins.includes(user);
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

module.exports = isAdmin;