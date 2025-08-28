# Audit Testing Procedure

## Data Security Tab
1. Navigate to Data Security Tab and verify navigation audit log
2. Toggle Data Retention switch and verify log entry
3. Toggle Auto Cleanup switch and verify log entry
4. Toggle Encryption Enabled switch and verify log entry
5. Toggle Encrypt Sensitive Data switch and verify log entry
6. Toggle Anonymize Data switch and verify log entry
7. Click Save Settings button and verify log entry
8. Test Export Data functionality and verify log entry
9. Test Import Data functionality and verify log entry (with valid and invalid data)
10. Test Clear All Data functionality and verify log entry

## System Maintenance Tab
1. Navigate to Maintenance Tab and verify navigation audit log
2. Click Initialize Services button and verify log entry
3. Click Run Diagnostics button and verify log entry
4. Click Force Cleanup Stuck Toasts button and verify log entry
5. Click Cleanup Sample Data button and verify log entry
6. Click Reset Auth State button and verify log entry
7. Click Sign Out button and verify log entry (if possible without disrupting testing)

## Verification Procedure
For each action:
1. Perform the action in the UI
2. Open the Audit Test page: http://localhost:8084/audit-test.html
3. Click "Load Audit Logs"
4. Filter by appropriate category (data_security or maintenance)
5. Verify the log entry contains:
   - Correct action name
   - Descriptive message
   - Appropriate metadata (counts, status, error messages if applicable)
   - Proper category, page, section values
   - Appropriate timestamps
