Edit webhook
Webhook URL
https://www.mokmzansibooks.com/api/postmark-webhook
Custom headers and basic auth
Custom headers
Default headers
Authorization
Bearer e27a62e3-6b1a-4f8a-9d3b-2a5b6a7c8d9e
Add header
Basic auth credentials
Username
Password
Note: This will override any basic auth credentials hard coded in the webhook URL.

Which events should we send?

Test your webhook URL

Delivery
{
  "RecordType": "Delivery",
  "ServerID": 23,
  "MessageStream": "outbound",
  "MessageID": "00000000-0000-0000-0000-000000000000",
  "Recipient": "john@example.com",
  "Tag": "welcome-email",
  "DeliveredAt": "2025-09-19T02:02:51Z",
  "Details": "Test delivery webhook details",
  "Metadata": {
    "example": "value",
    "example_2": "value"
  }
}
