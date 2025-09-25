#!/bin/bash

# Debug Connection Script
# Run this to check and fix debugging connection issues

echo "🔍 Debugging Connection Diagnostics"
echo "=================================="

# Check if Vite is running
echo "1. Checking Vite server..."
if pgrep -f "vite" > /dev/null; then
    echo "✅ Vite server is running"
else
    echo "❌ Vite server not found. Starting..."
    npm run dev &
    sleep 3
fi

# Check port
echo "2. Checking port 8080..."
if lsof -i :8080 > /dev/null; then
    echo "✅ Port 8080 is in use"
else
    echo "❌ Port 8080 is not in use"
fi

# Check browser processes
echo "3. Checking for browser processes..."
if pgrep -f "Chrome\|Safari\|Firefox" > /dev/null; then
    echo "✅ Browser processes found"
else
    echo "⚠️  No browser processes found"
fi

# Check source maps
echo "4. Checking source map configuration..."
if grep -q "sourcemap.*true" vite.config.ts; then
    echo "✅ Source maps are enabled"
else
    echo "❌ Source maps may not be enabled"
fi

# Check HMR configuration
echo "5. Checking HMR configuration..."
if grep -q "hmr.*port.*8080" vite.config.ts; then
    echo "✅ HMR port configured"
else
    echo "❌ HMR port not configured"
fi

echo ""
echo "🔧 Manual Fixes:"
echo "==============="
echo "1. Open browser DevTools (F12)"
echo "2. Go to Settings → Preferences → Sources"
echo "3. Enable: 'Enable JavaScript source maps'"
echo "4. Disable: 'Enable source map caching'"
echo "5. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)"
echo "6. Check Console tab for source file links"
echo ""
echo "📱 Alternative: Use BrowserStack or ngrok for external access"
echo "💡 If still not working, try disabling browser extensions"
