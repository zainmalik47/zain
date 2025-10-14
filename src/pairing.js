const readline = require('readline');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const P = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promise-based readline question
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

// Check if session exists
function hasExistingSession() {
    const authDir = path.join(__dirname, '..', 'auth_info');
    return fs.existsSync(authDir) && fs.readdirSync(authDir).length > 0;
}

// Generate real pair code using WhatsApp's official method
async function generateRealPairCode(phoneNumber) {
    try {
        console.log(`\n🔄 Generating pair code for ${phoneNumber}...`);
        console.log('📱 This will send an invite to the WhatsApp number...');
        
        // Clean phone number (remove + and non-digits)
        const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
        
        // Create a temporary socket to generate pair code
        const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '..', 'auth_info_temp'));
        const { version } = await fetchLatestBaileysVersion();
        
        let pairCodeGenerated = false;
        let pairCode = null;
        
        const tempSocket = makeWASocket({
            version,
            logger: P({ level: 'silent' }),
            auth: state,
            browser: ['ZainBot', 'Chrome', '1.0.0'],
            generateHighQualityLinkPreview: true,
        });

        // Handle connection updates
        tempSocket.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                console.log('\n📱 WhatsApp QR Code Generated');
                console.log('==============================');
                console.log('Scan this QR code with your WhatsApp app:');
                console.log('1. Open WhatsApp on your phone');
                console.log('2. Go to Settings > Linked Devices');
                console.log('3. Tap "Link a Device"');
                console.log('4. Scan the QR code below');
                console.log('QR Code:');
                qrcode.generate(qr, { small: true });
                console.log('==============================');
            }
            
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                if (shouldReconnect) {
                    console.log('\n🔄 Connection closed, attempting to reconnect...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    initializeMobileClient();
                } else {
                    console.log('\n❌ Connection closed due to logout');
                    process.exit(1);
                }
            } else if (connection === 'open') {
                console.log('\n✅ Connected successfully!');
                isConnected = true;
                
                // Get bot info
                botInfo = {
                    id: tempSocket.user?.id,
                    name: tempSocket.user?.name || 'ZainBot'
                };
                
                console.log('Bot Info:', botInfo);
                console.log(`Bot Number: ${botInfo.id}`);
                console.log(`Bot Name: ${botInfo.name}`);
            }
        });

        // Handle credentials update
        tempSocket.ev.on('creds.update', saveCreds);

        // Try to generate pair code using WhatsApp's official method
        try {
            // This is the official WhatsApp method to generate pair codes
            const pairCodeResponse = await tempSocket.generatePairingCode(cleanNumber);
            
            if (pairCodeResponse && pairCodeResponse.code) {
                pairCode = pairCodeResponse.code;
                pairCodeGenerated = true;
                
                console.log('\n✅ Real Pair Code Generated!');
                console.log('==============================');
                console.log(`📱 Phone Number: ${phoneNumber}`);
                console.log(`🔑 Pair Code: ${pairCode}`);
                console.log('==============================');
                console.log('\n📲 Instructions:');
                console.log('1. Check your WhatsApp for an invite message');
                console.log('2. Enter this pair code in the invite');
                console.log('3. The bot will connect automatically');
                console.log('==============================');
                
                return pairCode;
            }
        } catch (error) {
            console.log('\n⚠️ Could not generate official pair code, falling back to QR code...');
            console.log('Error:', error.message);
            
            // Fall back to QR code method
            return null;
        }
        
        return null;
    } catch (error) {
        console.error('❌ Error generating pair code:', error);
        return null;
    }
}

// Main pairing function
async function startPairingProcess() {
    console.log('\n🔐 WhatsApp Pairing System');
    console.log('============================');
    
    // Check for existing session
    if (hasExistingSession()) {
        console.log('✅ Existing session found!');
        console.log('🔄 Attempting to reconnect using existing session...');
        return { useExisting: true };
    }
    
    console.log('❌ No existing session found.');
    console.log('\n📋 Choose connection method:');
    console.log('1. QR Code (Scan with WhatsApp)');
    console.log('2. Pair Code (Enter phone number)');
    
    const choice = await askQuestion('\nEnter your choice (1 or 2): ');
    
    if (choice === '1') {
        console.log('\n📱 QR Code method selected');
        return { method: 'qr' };
    } else if (choice === '2') {
        console.log('\n🔑 Pair Code method selected');
        
        const phoneNumber = await askQuestion('Enter phone number (with country code, e.g., +92 343 7408518): ');
        
        if (!phoneNumber || phoneNumber.length < 10) {
            console.log('❌ Invalid phone number. Please try again.');
            return await startPairingProcess();
        }
        
        console.log(`\n📱 Phone number: ${phoneNumber}`);
        const confirm = await askQuestion('Is this correct? (y/n): ');
        
        if (confirm.toLowerCase() !== 'y') {
            return await startPairingProcess();
        }
        
        const pairCode = await generateRealPairCode(phoneNumber);
        
        if (pairCode) {
            return { method: 'pair', phoneNumber, pairCode };
        } else {
            console.log('\n❌ Failed to generate pair code. Falling back to QR code...');
            return { method: 'qr' };
        }
    } else {
        console.log('❌ Invalid choice. Please try again.');
        return await startPairingProcess();
    }
}

module.exports = {
    startPairingProcess,
    askQuestion,
    hasExistingSession,
    rl
};


