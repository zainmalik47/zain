const util = require('util');

function logMessageDetails(msg, client) {
    const botNumber = client.info?.wid?._serialized || client.user?.id || 'unknown';
    
    // Deep clone message and remove circular references
    const msgClone = JSON.parse(JSON.stringify(msg));
    
    console.log('\n=== INCOMING MESSAGE DEBUG INFO ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Bot Number:', botNumber);
    console.log('Message Details:');
    console.log('- From:', msg.from);
    console.log('- FromMe:', msg.fromMe);
    console.log('- Is Group:', msg.isGroup);
    console.log('- Type:', msg.type);
    console.log('- Body:', msg.body);
    
    // Log raw message data for debugging
    console.log('\nRaw Message Data:');
    console.log(util.inspect(msgClone, { depth: 5, colors: true }));
    
    // Log message shape analysis
    console.log('\nMessage Shape Analysis:');
    if (msg._data?.message?.conversation) console.log('- Has conversation');
    if (msg._data?.message?.imageMessage?.caption) console.log('- Has image caption');
    if (msg._data?.message?.extendedTextMessage?.text) console.log('- Has extended text');
    if (msg._data?.message?.buttonsResponseMessage) console.log('- Has button response');
    if (msg._data?.message?.listResponseMessage) console.log('- Has list response');
    
    console.log('===============================\n');
    
    return {
        isSelfMessage: msg.from === botNumber || msg.to === botNumber
    };
}

// Message content extraction helper
function extractMessageContent(msg) {
    if (!msg) return null;
    
    // Handle different message types
    if (msg.body) return msg.body;
    if (msg._data?.message?.conversation) return msg._data.message.conversation;
    if (msg._data?.message?.imageMessage?.caption) return msg._data.message.imageMessage.caption;
    if (msg._data?.message?.extendedTextMessage?.text) return msg._data.message.extendedTextMessage.text;
    if (msg._data?.message?.buttonsResponseMessage?.selectedDisplayText) 
        return msg._data.message.buttonsResponseMessage.selectedDisplayText;
    if (msg._data?.message?.listResponseMessage?.title) 
        return msg._data.message.listResponseMessage.title;
    
    return null;
}

module.exports = {
    logMessageDetails,
    extractMessageContent
};