// Load environment variables first, before any other imports
require('dotenv').config({ path: '.env.local' });

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// POST endpoint for signup
app.post('/api/signup', async (req, res) => {
  try {
    // Import the signup handler
    const signupModule = await import('./api/signup.ts');
    console.log('Imported module:', signupModule);
    console.log('Default export:', signupModule.default);
    console.log('Type of default:', typeof signupModule.default);
    
    // The module has a nested default structure
    const handler = signupModule.default.default;
    
    // Create mock Vercel request/response objects
    const mockReq = {
      method: 'POST',
      body: req.body,
      headers: req.headers,
      query: req.query
    };
    
    const mockRes = {
      status: (code) => ({
        json: (data) => res.status(code).json(data),
        send: (data) => res.status(code).send(data)
      }),
      json: (data) => res.json(data),
      send: (data) => res.send(data)
    };
    
    // Call the signup handler
    await handler(mockReq, mockRes);
  } catch (error) {
    console.error('Error in signup endpoint:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log(`  POST http://localhost:${PORT}/api/signup`);
});