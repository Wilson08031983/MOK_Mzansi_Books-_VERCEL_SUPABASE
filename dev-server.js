const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Register tsconfig-paths to resolve path mappings
require('tsconfig-paths/register');

// Register ts-node to handle TypeScript files using CommonJS for require compatibility
const tsNode = require('ts-node');
tsNode.register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    target: 'ES2020'
  }
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Function to dynamically load API routes
function loadApiRoutes() {
  const apiDir = path.join(__dirname, 'api');
  
  // Get all files in the api directory
  function getApiFiles(dir, basePath = '') {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...getApiFiles(fullPath, path.join(basePath, item)));
      } else if (item.endsWith('.ts') || item.endsWith('.js')) {
        const routePath = path.join(basePath, item.replace(/\.(ts|js)$/, ''));
        files.push({
          path: routePath.replace(/\\/g, '/'), // Normalize path separators
          file: fullPath
        });
      }
    }
    
    return files;
  }
  
  const apiFiles = getApiFiles(apiDir);
  
  for (const { path: routePath, file } of apiFiles) {
    try {
      const apiPath = `/api/${routePath}`;
      console.log(`Loading API route: ${apiPath} -> ${file}`);

      app.all(apiPath, async (req, res) => {
        try {
          // Load the TypeScript/JavaScript module via CommonJS require (handled by ts-node)
          const mod = require(file);
          const handlerFunction = mod.default || mod;

          if (typeof handlerFunction !== 'function') {
            throw new Error(`Handler is not a function for ${apiPath}`);
          }

          // Create Vercel-compatible request/response objects
          const vercelReq = {
            ...req,
            headers: {
              ...req.headers,
              'x-forwarded-for': req.ip || req.connection?.remoteAddress || '127.0.0.1'
            },
            body: req.body,
            query: { ...req.query, ...req.params },
            method: req.method,
            url: req.url,
            connection: req.connection || { remoteAddress: req.ip || '127.0.0.1' }
          };

          const vercelRes = {
            status: (code) => {
              res.status(code);
              return vercelRes;
            },
            json: (data) => {
              res.json(data);
              return vercelRes;
            },
            send: (data) => {
              res.send(data);
              return vercelRes;
            },
            setHeader: (name, value) => {
              res.setHeader(name, value);
              return vercelRes;
            },
            end: (data) => {
              res.end(data);
              return vercelRes;
            }
          };

          await handlerFunction(vercelReq, vercelRes);
        } catch (error) {
          console.error(`Error in ${apiPath}:`, error);
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              error: 'Internal server error',
              details: error.message
            });
          }
        }
      });
    } catch (error) {
      console.error(`Failed to set up API route ${routePath}:`, error);
    }
  }
}

// Load API routes
loadApiRoutes();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  if (!res.headersSent) {
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`);
  console.log(`📋 Health check available at http://localhost:${PORT}/health`);
});

module.exports = app;