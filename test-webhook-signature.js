const crypto = require('crypto');

// Test payload as specified in the instructions
const testPayload = {
  "RecordType": "Delivery",
  "MessageID": "test-message-123",
  "Email": "test@example.com",
  "DeliveredAt": "2024-01-15T10:30:00Z"
};

// Convert to JSON string (this is what Postmark sends as raw body)
const rawBody = JSON.stringify(testPayload);

// Use the webhook secret from environment (placeholder value)
const webhookSecret = "your-postmark-webhook-secret-secret-here";

// Generate HMAC-SHA256 signature in base64 format
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(rawBody)
  .digest('base64');

console.log('Test Payload:');
console.log(rawBody);
console.log('\nGenerated Signature:');
console.log(signature);

console.log('\nCurl command to test:');
console.log(`curl -X POST https://www.mokmzansibooks.com/api/postmark-webhook \\
  -H "Content-Type: application/json" \\
  -H "X-Postmark-Signature: ${signature}" \\
  -d '${rawBody}'`);