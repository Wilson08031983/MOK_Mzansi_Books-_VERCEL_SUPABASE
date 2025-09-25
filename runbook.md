# Verification Email Flow - Local Testing Runbook

## Prerequisites

### 1. Environment Setup

**Required Environment Variables:**
```env
# Postmark Configuration (Test Server)
POSTMARK_SERVER_TOKEN=1d8c2f0c-3a66-4693-8374-9c1052879d9d
POSTMARK_SENDER_EMAIL=noreply@mokmzansibooks.com
POSTMARK_SENDER_NAME="MOK Mzansi Books"

# Application Configuration
APP_HOST=http://localhost:8082
VERIFICATION_TOKEN_EXPIRY_HOURS=24
NODE_ENV=development
```

**Dependencies to Install:**
```bash
npm install bcryptjs @types/bcryptjs
```

### 2. Application Setup

1. **Start the Development Server:**
   ```bash
   cd /Users/wilsonmoabelo/Windsurf/MOKMzansiBook_Final_Dev.05/MOK_Mzansi_Books-_VERCEL_SUPABASE
   npm run dev
   ```

2. **Verify Server is Running:**
   - Open http://localhost:8082 in browser
   - Should see MOK Mzansi Books application

3. **Clear Existing Data (if needed):**
   ```javascript
   // Open browser console and run:
   localStorage.clear();
   ```

### 3. Postmark Test Server Setup

1. **Access Postmark Dashboard:**
   - Go to https://account.postmarkapp.com
   - Navigate to test server (if not using live server)

2. **Verify Test Server Configuration:**
   - Server token should match environment variable
   - Sender signature should be configured
   - Test emails should be enabled

## Testing the Complete Flow

### Phase 1: User Signup

1. **Navigate to Signup Page:**
   ```
   http://localhost:8082/signup
   ```

2. **Fill Out Signup Form:**
   ```javascript
   const testData = {
     firstName: 'Test',
     surname: 'User',
     companyName: 'Test Company Pty Ltd',
     email: `test${Date.now()}@example.com`, // Use unique email
     position: 'CEO',
     password: 'TestPassword123!',
     confirmPassword: 'TestPassword123!'
   };
   ```

3. **Submit Form:**
   - Click "Sign Up" button
   - Should see success message
   - Should redirect to login page

4. **Verify API Call:**
   - Check browser Network tab
   - Should see POST to `/api/signup`
   - Response should be HTTP 201

5. **Check Postmark Test Inbox:**
   - Go to Postmark dashboard
   - Look for test email with subject "Verify your MOK Mzansi Books account"
   - Verify email content and branding

### Phase 2: Email Verification

1. **Extract Verification Link:**
   - Copy verification link from email
   - Should look like: `http://localhost:8082/auth/verify-email?token=abc123&uid=def456`

2. **Click Verification Link:**
   - Should open verification page
   - Should see "Verifying your email, please wait..." message
   - Should redirect to login with success message

3. **Verify API Call:**
   - Check browser Network tab
   - Should see POST to `/api/verify-email`
   - Response should be HTTP 200

4. **Check Database State:**
   ```javascript
   // Open browser console and run:
   const users = JSON.parse(localStorage.getItem('users') || '[]');
   const user = users.find(u => u.email === 'test@example.com');
   console.log('User verified:', user?.verified); // Should be true
   ```

### Phase 3: User Login

1. **Navigate to Login Page:**
   ```
   http://localhost:8082/login
   ```

2. **Attempt Login:**
   - Enter test email and password
   - Should successfully log in
   - Should redirect to dashboard

3. **Verify Authentication:**
   - Check localStorage for 'currentUser'
   - User should have verified=true status

## Testing Edge Cases

### Test 1: Invalid Token

1. **Modify URL Parameters:**
   ```
   http://localhost:8082/auth/verify-email?token=invalid&uid=test
   ```

2. **Expected Result:**
   - Should show error message
   - Should not verify user
   - Should log audit event

### Test 2: Expired Token

1. **Create Expired Token:**
   ```javascript
   // In browser console:
   const users = JSON.parse(localStorage.getItem('users') || '[]');
   const user = users.find(u => u.email === 'test@example.com');
   if (user) {
     user.verified = false;
     localStorage.setItem('users', JSON.stringify(users));
   }
   ```

2. **Wait for Expiry:**
   - Tokens expire after 24 hours
   - Or manually set expiry to past date

3. **Test Expired Token:**
   - Should show expiration error message

### Test 3: Rate Limiting

1. **Test Signup Rate Limiting:**
   ```bash
   # Make multiple requests to /api/signup
   curl -X POST http://localhost:8082/api/signup \
     -H "Content-Type: application/json" \
     -d '{"firstName":"Test","surname":"User","companyName":"Test Co","email":"test@example.com","position":"CEO","password":"pass123","confirmPassword":"pass123"}'
   ```

2. **After 5 attempts:**
   - Should receive HTTP 429 response
   - Should see rate limit error message

### Test 4: Resend Verification

1. **Navigate to Resend Page:**
   ```
   http://localhost:8082/auth/resend-verification
   ```

2. **Submit Email:**
   - Enter test email address
   - Should receive success message

3. **Check Postmark:**
   - Should see new verification email
   - Should have different token than original

## Debugging Tools

### 1. Browser Developer Tools

**Network Tab:**
- Monitor API calls
- Check response status codes
- View request/response payloads

**Console Tab:**
```javascript
// Debug user data
const users = JSON.parse(localStorage.getItem('users') || '[]');
console.log('Users:', users);

// Debug tokens
const tokens = JSON.parse(localStorage.getItem('verification_tokens') || '[]');
console.log('Tokens:', tokens);

// Debug audit logs
const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
console.log('Audit logs:', logs);
```

### 2. Server Logs

**Check Application Logs:**
```bash
# View real-time logs
tail -f /path/to/application/logs

# Or check console output if running in terminal
```

### 3. Postmark Dashboard

**Activity Tab:**
- View sent emails
- Check delivery status
- View email content

**Test Server Settings:**
- Verify server configuration
- Check sending limits
- View API usage

## Common Issues and Solutions

### Issue 1: Emails Not Being Sent

**Symptoms:**
- Signup succeeds but no email in Postmark inbox

**Solutions:**
1. **Check Postmark Token:**
   ```bash
   # Verify token in environment
   echo $POSTMARK_SERVER_TOKEN
   ```

2. **Check Postmark Server:**
   - Ensure using test server, not live server
   - Verify server has test email sending enabled

3. **Check Network:**
   - Verify application can reach Postmark API
   - Check for firewall/proxy issues

### Issue 2: Verification Links Not Working

**Symptoms:**
- Clicking verification link shows error
- Token validation fails

**Solutions:**
1. **Check Token Format:**
   - Ensure token is URL-safe base64
   - Verify token length (should be ~44 characters)

2. **Check Token Storage:**
   ```javascript
   // Verify token exists and is not expired
   const tokens = JSON.parse(localStorage.getItem('verification_tokens') || '[]');
   console.log('Stored tokens:', tokens);
   ```

3. **Check APP_HOST:**
   - Ensure APP_HOST matches actual application URL
   - For local testing: `http://localhost:8082`

### Issue 3: Rate Limiting Not Working

**Symptoms:**
- Can make unlimited signup attempts
- No rate limit errors

**Solutions:**
1. **Check Rate Limit Implementation:**
   - Verify rate limiting code is active
   - Check if rate limit storage is working

2. **Clear Rate Limit Data:**
   ```javascript
   // Reset rate limiting (for testing)
   localStorage.removeItem('rateLimitData');
   ```

### Issue 4: Database Issues

**Symptoms:**
- Users not being created
- Tokens not being stored
- Data not persisting

**Solutions:**
1. **Check localStorage:**
   ```javascript
   console.log('localStorage available:', !!window.localStorage);
   console.log('localStorage size:', JSON.stringify(localStorage).length);
   ```

2. **Clear and Reset:**
   ```javascript
   localStorage.clear();
   location.reload();
   ```

## Performance Testing

### Load Testing

```bash
# Install load testing tool
npm install -g artillery

# Create test script
cat > load-test.yml << 'EOF'
config:
  target: 'http://localhost:8082'
  phases:
    - duration: 60
      arrivalRate: 5
scenarios:
  - name: 'Signup flow'
    flow:
      - post:
          url: '/api/signup'
          json:
            firstName: 'Test'
            surname: 'User'
            companyName: 'Test Company'
            email: 'test{{ $timestamp }}@example.com'
            position: 'CEO'
            password: 'TestPass123!'
            confirmPassword: 'TestPass123!'
EOF

# Run load test
artillery run load-test.yml
```

### Memory Usage

```javascript
// Monitor memory usage
setInterval(() => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const tokens = JSON.parse(localStorage.getItem('verification_tokens') || '[]');
  const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');

  console.log('Memory usage:', {
    users: users.length,
    tokens: tokens.length,
    logs: logs.length,
    totalSize: JSON.stringify(localStorage).length
  });
}, 5000);
```

## Cleanup After Testing

### Clear Test Data

```javascript
// Complete cleanup script
const cleanup = () => {
  // Clear all data
  localStorage.removeItem('users');
  localStorage.removeItem('companies');
  localStorage.removeItem('verification_tokens');
  localStorage.removeItem('audit_logs');
  localStorage.removeItem('email_logs');
  localStorage.removeItem('rateLimitData');

  // Reset current user
  localStorage.removeItem('currentUser');

  console.log('All test data cleared');
};

cleanup();
```

### Reset Application State

```bash
# Stop development server
Ctrl+C

# Clear all localStorage
# (Run cleanup script above)

# Restart server
npm run dev
```

## Monitoring and Alerts

### Health Checks

```bash
# Check if application is responding
curl -f http://localhost:8082

# Check API endpoints
curl -f http://localhost:8082/api/signup -X POST \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Health","surname":"Check","companyName":"Test","email":"health@example.com","position":"CEO","password":"test123","confirmPassword":"test123"}'
```

### Log Monitoring

```javascript
// Real-time log monitoring
const logs = [];
const originalLog = console.log;

console.log = (...args) => {
  logs.push({ timestamp: new Date(), message: args });
  originalLog.apply(console, args);

  // Keep only last 100 logs
  if (logs.length > 100) {
    logs.shift();
  }
};

// View recent logs
window.viewLogs = () => console.table(logs.slice(-10));
```

## Security Testing

### Penetration Testing Checklist

- [ ] Test SQL injection in form fields
- [ ] Test XSS in form fields
- [ ] Test CSRF protection
- [ ] Verify HTTPS enforcement
- [ ] Check password hashing strength
- [ ] Test token entropy
- [ ] Verify rate limiting effectiveness
- [ ] Check audit logging completeness

### Security Headers

```bash
# Check security headers
curl -I http://localhost:8082

# Expected headers:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
```

## Final Verification

### Complete Flow Test

1. **Start Clean:**
   ```javascript
   localStorage.clear();
   location.reload();
   ```

2. **Complete Signup Flow:**
   - Navigate to signup
   - Fill and submit form
   - Verify email sent
   - Click verification link
   - Verify login works

3. **Verify Data Integrity:**
   ```javascript
   // Check all data is consistent
   const users = JSON.parse(localStorage.getItem('users') || '[]');
   const companies = JSON.parse(localStorage.getItem('companies') || '[]');
   const tokens = JSON.parse(localStorage.getItem('verification_tokens') || '[]');
   const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');

   console.log('Final state:', {
     usersCount: users.length,
     companiesCount: companies.length,
     tokensCount: tokens.length,
     logsCount: logs.length,
     userVerified: users[0]?.verified,
     tokenUsed: tokens[0]?.usedAt
   });
   ```

4. **Success Criteria:**
   - ✅ User created and verified
   - ✅ Company created with proper association
   - ✅ Token created, used, and marked consumed
   - ✅ Audit logs show complete flow
   - ✅ Email logs show successful sending
   - ✅ User can successfully log in

## Emergency Procedures

### If Tests Fail

1. **Check Environment:**
   ```bash
   # Verify all environment variables
   env | grep -E "(POSTMARK|APP_HOST|NODE_ENV)"
   ```

2. **Clear All Data:**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

3. **Restart Application:**
   ```bash
   # Stop server (Ctrl+C)
   # Clear node_modules/.cache if exists
   # Restart server
   npm run dev
   ```

4. **Check Dependencies:**
   ```bash
   npm ls bcryptjs
   npm ls @types/bcryptjs
   ```

### Contact Information

**For Issues:**
- Check application logs first
- Review Postmark dashboard
- Verify environment configuration
- Test with minimal data

**Support:**
- Development team: [Contact Info]
- Postmark support: https://postmarkapp.com/support
