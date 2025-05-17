const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const cors = require('cors');
const app = express();
app.use(cors()); // Allow frontend to connect
app.use(express.json());

// Simulated authorized serials (replace with your Zen's serial)
const authorizedSerials = ['PB470705744B611C'];

// Simulated GPC compiler (replace with actual compiler logic)
function compileGPC(gpcCode) {
    // Placeholder: Convert GPC to binary for Zen memory slot
    return Buffer.from(gpcCode);
}

// Load GPC script
const gpcScript = fs.readFileSync('elite_basic.gpc', 'utf8');

app.post('/install', (req, res) => {
    const { serial } = req.body;
    try {
        if (!authorizedSerials.includes(serial)) {
            throw new Error('Unauthorized serial number');
        }
        const compiledScript = compileGPC(gpcScript);
        const key = crypto.pbkdf2Sync(serial, 'salt', 100000, 32, 'sha256');
        const cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.alloc(16, 0));
        let encryptedScript = cipher.update(compiledScript);
        encryptedScript = Buffer.concat([encryptedScript, cipher.final()]);
        res.json({ encryptedScript: encryptedScript.toString('base64') });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));