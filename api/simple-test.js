export default function handler(req, res) {
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
      message: 'Simple JS API working!',
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