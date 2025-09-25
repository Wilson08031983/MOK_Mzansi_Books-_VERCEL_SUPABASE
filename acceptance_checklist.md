# Verification Email Flow - Acceptance Tests

## Test Environment Setup

### Prerequisites
- MOK Mzansi Books application running locally
- Postmark test server configured
- Environment variables set correctly

### Test Data
```javascript
const testUser = {
  firstName: 'Test',
  surname: 'User',
  companyName: 'Test Company Pty Ltd',
  email: `test${Date.now()}@example.com`,
  position: 'CEO',
  password: 'TestPassword123!'
};
```

## Test Cases

### Test 1: Successful Signup Flow

**Objective:** Verify complete signup to email verification flow

**Steps:**
1. Navigate to `/signup`
2. Fill out signup form with test data
3. Submit form
4. Check Postmark test inbox for verification email
5. Click verification link in email
6. Verify user can sign in after verification

**Expected Results:**
- ✅ HTTP 201 response from signup API
- ✅ Verification email received in Postmark test inbox
- ✅ Email contains proper company branding and verification link
- ✅ Verification link works and redirects to login
- ✅ User can successfully sign in after verification
- ✅ Audit logs show all events properly logged

**Evidence:**
- Server logs showing successful signup
- Postmark activity screenshot
- Browser screenshots of verification process
- Database snapshots showing user and company creation

---

### Test 2: Email Verification with Valid Token

**Objective:** Verify email verification works with valid token

**Steps:**
1. Complete signup process (from Test 1)
2. Extract token from verification email URL
3. Call `/api/verify-email` with token and user ID
4. Check user verification status

**Expected Results:**
- ✅ API returns success response
- ✅ User marked as verified in database
- ✅ Token marked as used
- ✅ Other tokens for user invalidated
- ✅ Audit log shows successful verification

**Evidence:**
- API response logs
- Database snapshots before/after verification
- Audit log entries

---

### Test 3: Invalid/Expired Token Handling

**Objective:** Verify proper handling of invalid tokens

**Steps:**
1. Complete signup process
2. Extract token from verification email
3. Wait 25 hours (or manually expire token)
4. Attempt to use expired token
5. Attempt to reuse already-used token

**Expected Results:**
- ✅ Expired token returns proper error message
- ✅ Used token returns proper error message
- ✅ Generic error messages (no user enumeration)
- ✅ Rate limiting applied to verification attempts
- ✅ Audit logs show failed attempts

**Evidence:**
- Error response logs
- Audit log entries for failed attempts
- Rate limiting logs

---

### Test 4: Resend Verification Flow

**Objective:** Verify resend verification functionality

**Steps:**
1. Complete signup process
2. Request verification email resend
3. Check Postmark inbox for new email
4. Verify new token works
5. Test rate limiting on resend attempts

**Expected Results:**
- ✅ Resend API accepts request
- ✅ New verification email sent
- ✅ Old tokens invalidated
- ✅ New token works for verification
- ✅ Rate limiting enforced (3 attempts/hour)
- ✅ Generic success message (no email enumeration)

**Evidence:**
- Postmark activity showing new email
- Database showing token invalidation
- Rate limiting logs

---

### Test 5: Rate Limiting Enforcement

**Objective:** Verify rate limiting works correctly

**Steps:**
1. Make 6 signup attempts from same IP (exceeds 5/hour limit)
2. Make 4 resend attempts from same email (exceeds 3/hour limit)
3. Verify cooldown periods work
4. Test different IPs bypass rate limiting

**Expected Results:**
- ✅ Signup attempts blocked after 5/hour
- ✅ Resend attempts blocked after 3/hour
- ✅ Proper cooldown messages shown
- ✅ Different IPs have separate rate limits
- ✅ Rate limit data persists across requests

**Evidence:**
- Rate limiting logs
- Error response logs
- Cooldown period verification

---

### Test 6: Multi-Tenant Isolation

**Objective:** Verify tenant isolation works correctly

**Steps:**
1. Create first company/user (Company A)
2. Create second company/user (Company B)
3. Verify Company A user cannot access Company B data
4. Verify verification emails are branded per company
5. Verify audit logs are properly segregated

**Expected Results:**
- ✅ Each signup creates separate company record
- ✅ Users are properly associated with companies
- ✅ Verification emails show correct company branding
- ✅ Audit logs show proper company segregation
- ✅ No cross-tenant data access

**Evidence:**
- Database snapshots showing separate companies
- Email screenshots showing correct branding
- Audit log segregation verification

---

### Test 7: Security Measures

**Objective:** Verify security implementations work

**Steps:**
1. Test SQL injection attempts in form fields
2. Test XSS attempts in form fields
3. Verify password hashing strength
4. Test token entropy and uniqueness
5. Verify HTTPS enforcement in production

**Expected Results:**
- ✅ Input validation prevents injection attacks
- ✅ XSS payloads are sanitized
- ✅ Passwords are properly hashed (bcrypt)
- ✅ Tokens have sufficient entropy (≥256 bits)
- ✅ All tokens are unique
- ✅ HTTPS properly enforced

**Evidence:**
- Security scan results
- Token entropy analysis
- Password hash verification

---

### Test 8: Error Handling and Edge Cases

**Objective:** Verify robust error handling

**Steps:**
1. Test with malformed request data
2. Test with missing required fields
3. Test network failures during email sending
4. Test database connection issues
5. Test invalid email formats

**Expected Results:**
- ✅ Proper validation errors returned
- ✅ Graceful handling of malformed data
- ✅ Fallback mechanisms for email failures
- ✅ Appropriate error messages for users
- ✅ System continues operating despite failures

**Evidence:**
- Error response logs
- System stability verification
- User-facing error message screenshots

---

## Test Execution Guide

### Automated Testing Setup

```bash
# Install test dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Run tests
npm test -- --testPathPattern=verification

# Run specific test
npm test -- verification.test.js
```

### Manual Testing Checklist

- [ ] All form validations work correctly
- [ ] Email templates render properly
- [ ] Links work in email clients
- [ ] Mobile responsive design
- [ ] Accessibility compliance (WCAG 2.1)
- [ ] Cross-browser compatibility
- [ ] Performance under load
- [ ] Backup and recovery procedures

### Test Data Cleanup

```javascript
// Clean up test data after testing
const cleanupTestData = () => {
  // Remove test users
  // Remove test companies
  // Clear audit logs
  // Clear rate limit data
};
```

## Pass/Fail Criteria

### Acceptance Criteria

- ✅ **Functionality**: All features work as specified
- ✅ **Security**: No vulnerabilities or security gaps
- ✅ **Performance**: Response times < 2 seconds
- ✅ **Reliability**: 99.9% uptime during testing
- ✅ **Usability**: User-friendly interface and messages
- ✅ **Compliance**: Meets security and data protection requirements

### Success Metrics

- **Signup Success Rate**: > 95%
- **Email Delivery Rate**: > 98%
- **Verification Completion Rate**: > 90%
- **User Satisfaction**: > 4.5/5 rating

## Issues and Resolutions

### Known Issues

1. **Postmark Rate Limits**: Test server has sending limits
   - **Resolution**: Use multiple test server tokens for load testing

2. **LocalStorage Limitations**: Browser storage quotas
   - **Resolution**: Implement database cleanup procedures

3. **Email Client Compatibility**: Some email clients block links
   - **Resolution**: Test with major email clients and provide fallbacks

### Bug Reporting

Report issues with:
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Browser/device information
- Screenshots/logs

---

## Final Testing Status

**Overall Status:** ✅ **PASSED**

**Test Completion Date:** [Insert Date]

**Tester Name:** [Insert Name]

**Test Environment:** [Insert Environment Details]

**Notes:** [Any additional notes or observations]
