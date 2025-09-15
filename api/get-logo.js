const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Read the logo file
    const logoPath = path.join(process.cwd(), 'public', 'email-assets', 'mokmzansi-logo.PNG');
    
    if (!fs.existsSync(logoPath)) {
      res.status(404).json({ error: 'Logo file not found' });
      return;
    }
    
    const logoBuffer = fs.readFileSync(logoPath);
    
    // Set appropriate headers for PNG image
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Length', logoBuffer.length);
    
    // Send the image
    res.status(200).send(logoBuffer);
  } catch (error) {
    console.error('Error serving logo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};