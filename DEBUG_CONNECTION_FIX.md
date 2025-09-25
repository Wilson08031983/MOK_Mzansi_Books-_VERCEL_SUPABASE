## 🔧 Manual Browser Debugging Setup

### **Step 1: Enable Source Maps in Browser**
1. Open Browser DevTools (F12)
2. Go to **Settings** (gear icon) → **Preferences**
3. Under **Sources** section:
   - ✅ **Enable JavaScript source maps**
   - ✅ **Enable CSS source maps**
   - ❌ **Disable source map caching** (uncheck this)
4. Close settings

### **Step 2: Hard Refresh**
1. Press **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (Mac)
2. This bypasses cache completely

### **Step 3: Check Console**
1. Go to **Console** tab in DevTools
2. Look for source file links (blue clickable text)
3. Click on them to open source files

---

## 🛠️ Alternative Solutions

### **Solution A: Use VS Code Live Server**
```bash
# Install Live Server extension in VS Code
# Right-click on index.html → "Open with Live Server"
```

### **Solution B: Use ngrok for External Access**
```bash
# Install ngrok
npm install -g ngrok

# Start ngrok tunnel
ngrok http 8080

# Use the ngrok URL in APP_HOST
export APP_HOST=https://abc123.ngrok.io
```

### **Solution C: Use BrowserStack**
1. Go to browserstack.com/live
2. Enter your localhost:8080 URL
3. Test with real devices/browsers

---

## 🔍 Common Issues & Fixes

### **Issue 1: Browser Extensions Blocking**
**Symptoms:** Console errors not showing, debugging not working
**Fix:**
1. Disable all browser extensions temporarily
2. Try incognito/private mode
3. Check if ad blockers are interfering

### **Issue 2: Cache Problems**
**Symptoms:** Old code still running, changes not reflected
**Fix:**
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache completely
3. Clear Vite cache: `rm -rf node_modules/.vite`

### **Issue 3: Source Maps Not Loading**
**Symptoms:** Console shows compiled code, not source
**Fix:**
1. Check Vite config has `sourcemap: true`
2. Ensure browser has source maps enabled
3. Check network tab for .map file requests

### **Issue 4: HMR Not Working**
**Symptoms:** Changes not auto-reloading
**Fix:**
1. Check HMR port configuration
2. Disable browser cache
3. Restart development server

---

## 🧪 Testing the Connection

### **Test Script:**
```javascript
// Add this to any component to test debugging
console.log('🔧 Debug test - file should link to source');
console.error('❌ Error test - should show stack trace');
throw new Error('🚨 Exception test - should break at source line');
```

### **Expected Results:**
- ✅ Console messages appear
- ✅ Source file names are clickable
- ✅ Clicking opens file in Windsurf
- ✅ Stack traces show correct line numbers

---

## 📊 Debug Information

### **Check These in Browser:**
1. **Network Tab**: Look for .map files loading
2. **Sources Tab**: Check if source files are mapped
3. **Console Tab**: Verify error locations are clickable
4. **Application Tab**: Check if source maps are cached

### **Check These in Windsurf:**
1. **File Explorer**: Ensure all source files are visible
2. **Settings**: Verify TypeScript/JavaScript debugging is enabled
3. **Extensions**: Check for debugging-related extensions

---

## 🚨 If Still Not Working

### **Nuclear Options:**

1. **Complete Reset:**
   ```bash
   # Stop all servers
   pkill -f "vite\|node"

   # Clear all caches
   rm -rf node_modules/.vite
   rm -rf .vite

   # Restart
   npm run dev
   ```

2. **Alternative Port:**
   ```bash
   # Try different port
   npm run dev -- --port 3000
   ```

3. **Different Browser:**
   - Try Firefox instead of Chrome
   - Try Safari instead of Chrome
   - Use incognito mode

---

## 📞 Need Help?

If the debugging connection still isn't working:

1. **Check the debug script:** `./debug-connection.sh`
2. **Run diagnostics:** `./debug-connection.sh`
3. **Share the output** for further assistance

The most common fix is enabling source maps in browser settings and doing a hard refresh!
