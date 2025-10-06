import fs from 'fs';
import path from 'path';

export default function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Read the logo file from the public directory
    const logoPath = path.join(process.cwd(), 'public', 'mokmzansi-logo.PNG');
    const logoBuffer = fs.readFileSync(logoPath);
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Send the image buffer
    res.status(200).send(logoBuffer);
  } catch (error) {
    console.error('Error serving logo:', error);
    res.status(404).json({ message: 'Logo not found' });
  }
}