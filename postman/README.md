# MOK Mzansi Books - Postman API Testing & Automation

This directory contains Postman collections, environments, and comprehensive automation scripts for testing the MOK Mzansi Books API with both local CLI and cloud integration.

## Postman CLI Capabilities and Limitations

### Current CLI Version: 1.19.4

**Supported Commands:**
- `postman collection run <collection-file>` - Run collections from local files
- `postman collection run <collection-file> -e <environment-file>` - Run with environment
- `postman login` - Authenticate with Postman account
- `postman logout` - Sign out from Postman
- `postman monitor run <monitor-id>` - Run monitors
- `postman api lint <api-file>` - Lint API schemas
- `postman api publish <api-file>` - Publish API schemas

**Limitations:**
- ❌ No `import` commands for collections or environments
- ❌ No `list` commands for collections or environments  
- ❌ Cannot upload collections/environments via CLI
- ❌ Cannot create workspaces via CLI
- ❌ Limited cloud integration features

**Workarounds:**
- Collections and environments must be imported manually via Postman app
- Use Postman API directly for cloud operations (handled by our scripts)
- File-based collection running works perfectly for local testing
## 🚀 Quick Start

### One-Command Setup (Recommended)

```bash
# Complete automated setup (CLI + Cloud)
./postman/scripts/postman-quick-setup.sh

# Or choose specific setup type
./postman/scripts/postman-quick-setup.sh --full      # Complete setup
./postman/scripts/postman-quick-setup.sh --cli-only # CLI only
./postman/scripts/postman-quick-setup.sh --cloud-only # Cloud only
```

This will automatically:
- ✅ Install and configure Postman CLI
- ✅ Upload collections to Postman Cloud
- ✅ Set up environments and monitoring
- ✅ Create sync automation
- ✅ Generate desktop shortcuts (macOS)

## 📁 Directory Structure

```
postman/
├── MOK_Mzansi_Books_API.postman_collection.json    # Main API collection
├── environments/                                    # Environment configurations
│   ├── development.postman_environment.json
│   ├── staging.postman_environment.json
│   └── production.postman_environment.json
├── tests/                                          # Test collections
│   ├── authentication-tests.postman_collection.json
│   └── business-operations-tests.postman_collection.json
└── scripts/                                        # Automation scripts
    ├── postman-quick-setup.sh                     # 🆕 One-command setup
    ├── auto-configure-postman.sh                  # 🆕 Cloud automation
    ├── setup-postman-cli.sh                       # CLI setup
    ├── run-tests.sh                               # Test execution
    └── sync-postman.sh                            # 🆕 Auto-generated sync
```

## 🛠️ Setup Options

### Option 1: Automated Setup (Recommended)
```bash
./postman/scripts/postman-quick-setup.sh
```
Interactive setup with multiple options and complete automation.

### Option 2: Manual CLI Setup
```bash
./postman/scripts/setup-postman-cli.sh
```
Traditional CLI-only setup for local testing.

### Manual CLI Setup (Alternative)

If you prefer manual setup or need more control:

```bash
# 1. Install Postman CLI (if not already installed)
brew install postman-cli

# 2. Authenticate with Postman
postman login

# 3. Run collections directly from files
postman collection run "postman/MOK_Mzansi_Books_API.postman_collection.json"

# 4. Run with environment
postman collection run "postman/MOK_Mzansi_Books_API.postman_collection.json" \
  -e "postman/environments/development.postman_environment.json"
```

**Note:** Collections and environments must be imported manually into Postman app for cloud features.

## VS Code Extension (Postman)

- Develop and test APIs directly in your editor using the Postman VS Code extension.
- Project summary: `docs/postman-vscode-extension.md`
- Official overview: https://learning.postman.com/docs/developer/vs-code-extension/overview/
- Recommended flow:
  - Open the `postman/` folder, import `MOK_Mzansi_Books_API.postman_collection.json`.
  - Use `postman/environments/development.postman_environment.json` for local runs.
  - Ensure the backend is running on `http://localhost:3000` before sending requests.

### Option 3: Cloud-Only Setup
```bash
# Set your API key first
export POSTMAN_API_KEY="your-api-key-here"
./postman/scripts/auto-configure-postman.sh
```
Upload collections to Postman Cloud for web-based testing.

## 📋 Collections Overview

### 1. Main API Collection (`MOK_Mzansi_Books_API.postman_collection.json`)

Complete API collection organized into logical groups:

- **Authentication** - User registration, email verification, resend verification
- **Billing & Payments** - Subscription management, Paystack integration, billing info
- **Email Services** - Welcome emails, password reset, account notifications
- **Business Operations** - Invoice creation, quotation management, client management
- **Monitoring & Analytics** - Email statistics, system monitoring
- **Webhooks** - Postmark and Paystack webhook handlers
- **Utility** - Logo endpoints, health checks

### 2. Authentication Tests (`authentication-tests.postman_collection.json`)

Comprehensive authentication testing:

- ✅ Valid user registration
- ❌ Invalid email format validation
- ❌ Weak password validation
- ❌ Duplicate email handling
- ✅ Email verification with valid token
- ❌ Email verification with invalid token
- ✅ Resend verification email
- 🔒 Rate limiting tests

### 3. Business Operations Tests (`business-operations-tests.postman_collection.json`)

Business logic validation:

- 📄 Invoice creation (valid/invalid data)
- 💼 Quotation management
- 👥 Client management
- 🔐 Authorization tests
- 📊 Data validation tests

## 🌍 Environment Configuration

### Development Environment
- **Base URL:** `http://localhost:3000`
- **Purpose:** Local development and testing
- **Auth:** Test credentials and tokens

### Staging Environment
- **Base URL:** `https://staging.mokmzansibooks.com`
- **Purpose:** Pre-production testing
- **Auth:** Staging-specific credentials

### Production Environment
- **Base URL:** `https://mokmzansibooks.com`
- **Purpose:** Live environment testing
- **Auth:** Production credentials (handle with care)

### Environment Variables

Each environment includes:

| Variable | Description | Example |
|----------|-------------|---------|
| `base_url` | API base URL | `http://localhost:3000` |
| `auth_token` | Bearer token for authentication | `your-jwt-token` |
| `test_email` | Test user email | `test@example.com` |
| `test_password` | Test user password | `SecurePass123!` |
| `test_user_id` | Test user ID | `uuid-string` |
| `test_client_id` | Test client ID | `uuid-string` |
| `webhook_secret` | Webhook verification secret | `your-webhook-secret` |

## 🧪 Running Tests

### Using the Test Runner Script

```bash
# Run all collections with development environment
./postman/scripts/run-tests.sh

# Run specific collection by file path
./postman/scripts/run-tests.sh "postman/MOK_Mzansi_Books_API.postman_collection.json"

# Run with specific environment
./postman/scripts/run-tests.sh "postman/MOK_Mzansi_Books_API.postman_collection.json" \
  "postman/environments/staging.postman_environment.json"
```

### Direct CLI Commands

```bash
# Run collection directly
postman collection run "postman/MOK_Mzansi_Books_API.postman_collection.json"

# Run with environment
postman collection run "postman/MOK_Mzansi_Books_API.postman_collection.json" \
  -e "postman/environments/development.postman_environment.json"

# Run authentication tests
postman collection run "postman/tests/auth-tests.json" -e "postman/environments/development.postman_environment.json"
```

**Important Notes:**
- Collections are run from local files, not from Postman cloud
- Environment files are applied locally during test execution
- Test results are displayed in the terminal
- Connection errors (like ECONNREFUSED) indicate the API server is not running

## 🔐 Authentication Setup

The API uses Bearer token authentication. Configure authentication in your environment:

### For Development/Testing:
1. Register a test user via the signup endpoint
2. Verify the email using the verification endpoint
3. Use the returned JWT token as your `auth_token`

### For Production:
1. Use your actual user credentials
2. Store tokens securely
3. Implement token refresh logic

### Environment Variable Setup:
```bash
# Add to your shell profile (.zshrc, .bashrc, etc.)
export POSTMAN_API_KEY="your-postman-api-key"
export MOK_AUTH_TOKEN="your-jwt-token"
```

## 📊 Test Scripts and Validation

### Global Pre-request Scripts
- Request logging and debugging
- Dynamic variable generation
- Authentication token validation
- Rate limiting handling

### Global Test Scripts
- Response status validation
- Response time monitoring
- Security header checks
- Data integrity validation
- Error handling verification

### Custom Assertions
- Email format validation
- Password strength checking
- UUID format validation
- Date format verification
- Business logic validation

## 🔧 Customization

### Adding New Endpoints

1. **Update the main collection:**
   - Add new requests to appropriate folders
   - Include proper authentication
   - Add test scripts for validation

2. **Create test cases:**
   - Add positive test scenarios
   - Add negative test scenarios
   - Include edge cases

3. **Update environments:**
   - Add new variables if needed
   - Update base URLs if required

### Modifying Test Scripts

Test scripts are written in JavaScript and can include:

```javascript
// Response validation
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Data validation
pm.test("Response has required fields", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData).to.have.property('email');
});

// Set variables for subsequent requests
pm.test("Set auth token", function () {
    const jsonData = pm.response.json();
    pm.environment.set("auth_token", jsonData.token);
});
```

## 🚨 Troubleshooting

### Common Issues

1. **Authentication Failures:**
   ```bash
   # Check if authenticated
   postman collection list
   
   # Re-authenticate
   postman login
   ```

2. **Collection Import Errors:**
   ```bash
   # Verify file exists and is valid JSON
   cat MOK_Mzansi_Books_API.postman_collection.json | jq .
   
   # Force import (overwrite existing)
   postman collection import --force MOK_Mzansi_Books_API.postman_collection.json
   ```

3. **Environment Variable Issues:**
   ```bash
   # Check current environment variables
   postman environment get "Development"
   
   # Update environment variables
   postman environment update "Development" --update-file updated-env.json
   ```

4. **Test Failures:**
   - Check API server is running
   - Verify environment variables are correct
   - Check authentication tokens are valid
   - Review test logs for specific error messages

### Debug Mode

Enable verbose logging:
```bash
# Set debug environment variable
export DEBUG=postman*

# Run with verbose output
postman collection run "Collection Name" --verbose
```

## 📚 Additional Resources

- [Postman CLI Documentation](https://learning.postman.com/docs/postman-cli/postman-cli-overview/)
- [Postman Scripting Reference](https://learning.postman.com/docs/writing-scripts/script-references/postman-sandbox-api-reference/)
- [Newman (Postman CLI) GitHub](https://github.com/postmanlabs/newman)
- [MOK Mzansi Books API Documentation](../README.md)

## 🤝 Contributing

When adding new API endpoints or modifying existing ones:

1. Update the main collection with new requests
2. Add appropriate test cases
3. Update environment variables if needed
4. Update this documentation
5. Test thoroughly across all environments

## 📝 License

This Postman integration is part of the MOK Mzansi Books project and follows the same licensing terms.