import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle different HTTP methods
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'GET request successful',
      timestamp: new Date().toISOString(),
      method: req.method
    });
  }

  if (req.method === 'POST') {
    return res.status(200).json({
      success: true,
      message: 'POST request successful',
      timestamp: new Date().toISOString(),
      method: req.method,
      body: req.body
    });
  }

  // Method not allowed
  return res.status(405).json({
    success: false,
    message: `Method ${req.method} not allowed`
  });
}