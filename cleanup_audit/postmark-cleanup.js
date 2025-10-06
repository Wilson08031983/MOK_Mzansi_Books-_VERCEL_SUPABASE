const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '../.env.local' });

const POSTMARK_SERVER_TOKEN = process.env.POSTMARK_SERVER_TOKEN;
const TARGET_EMAILS = [
  'mokgethamoabelo@yahoo.com',
  'cindyramatladi@gmail.com',
  'wilsonmoabelo1@yahoo.com'
];

function makePostmarkRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.postmarkapp.com',
      path: endpoint,
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': POSTMARK_SERVER_TOKEN
      }
    };

    if (data && method !== 'GET') {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function checkSuppressionLists() {
  console.log('🔍 Checking Postmark suppression lists...');
  
  // Default message stream ID (outbound is the default for most Postmark setups)
  const MESSAGE_STREAM_ID = 'outbound';
  
  const results = {
    timestamp: new Date().toISOString(),
    target_emails: TARGET_EMAILS,
    message_stream_id: MESSAGE_STREAM_ID,
    suppression_findings: {},
    cleanup_actions: []
  };
  
  try {
    console.log(`📊 Checking suppressions in message stream: ${MESSAGE_STREAM_ID}...`);
    
    const response = await makePostmarkRequest(`/message-streams/${MESSAGE_STREAM_ID}/suppressions/dump`);
    
    if (response.statusCode === 200 && response.data.Suppressions) {
      const targetSuppressions = response.data.Suppressions.filter(suppression =>
        TARGET_EMAILS.includes(suppression.EmailAddress?.toLowerCase())
      );
      
      results.suppression_findings.suppressions = {
        total_found: response.data.Suppressions.length,
        target_suppressions: targetSuppressions,
        target_count: targetSuppressions.length
      };
      
      console.log(`✅ Found ${targetSuppressions.length} target emails in suppressions`);
      
      // Attempt to remove suppressions for target emails
      for (const suppression of targetSuppressions) {
        console.log(`🗑️ Attempting to remove ${suppression.EmailAddress} (${suppression.SuppressionReason})...`);
        
        // Note: SpamComplaint suppressions cannot be deleted according to Postmark docs
        if (suppression.SuppressionReason === 'SpamComplaint') {
          console.log(`⚠️ Skipping ${suppression.EmailAddress} - SpamComplaint suppressions cannot be deleted`);
          const action = {
            email: suppression.EmailAddress,
            suppression_reason: suppression.SuppressionReason,
            action: 'delete_skipped',
            success: false,
            response: 'SpamComplaint suppressions cannot be deleted via API',
            timestamp: new Date().toISOString()
          };
          results.cleanup_actions.push(action);
          continue;
        }
        
        const deleteResponse = await makePostmarkRequest(
          `/message-streams/${MESSAGE_STREAM_ID}/suppressions/delete`,
          'POST',
          {
            Suppressions: [{
              EmailAddress: suppression.EmailAddress
            }]
          }
        );
        
        const action = {
          email: suppression.EmailAddress,
          suppression_reason: suppression.SuppressionReason,
          action: 'delete_attempted',
          success: deleteResponse.statusCode === 200,
          response: deleteResponse.data,
          timestamp: new Date().toISOString()
        };
        
        results.cleanup_actions.push(action);
        
        if (deleteResponse.statusCode === 200) {
          console.log(`✅ Successfully removed ${suppression.EmailAddress}`);
        } else {
          console.log(`❌ Failed to remove ${suppression.EmailAddress}:`, deleteResponse.data);
        }
      }
      
    } else {
      console.log(`❌ Error checking suppressions:`, response.data);
      results.suppression_findings.suppressions = {
        error: response.data,
        status_code: response.statusCode
      };
    }
    
    // Save results
    const resultsFile = path.join(__dirname, 'postmark-cleanup-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    
    console.log(`✅ Postmark cleanup completed: ${resultsFile}`);
    
    // Log the cleanup
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: 'postmark_cleanup_completed',
      file: resultsFile,
      message_stream_id: MESSAGE_STREAM_ID,
      total_cleanup_actions: results.cleanup_actions.length,
      successful_removals: results.cleanup_actions.filter(a => a.success).length,
      target_emails: TARGET_EMAILS
    };
    
    // Append to logs
    const logsFile = path.join(__dirname, 'logs.json');
    let logs = [];
    try {
      logs = JSON.parse(fs.readFileSync(logsFile, 'utf8'));
    } catch (error) {
      // File doesn't exist or is invalid, start with empty array
      logs = [];
    }
    logs.push(logEntry);
    fs.writeFileSync(logsFile, JSON.stringify(logs, null, 2));
    
    return results;
    
  } catch (error) {
    console.error('❌ Postmark cleanup failed:', error);
    throw error;
  }
}

// Run cleanup if called directly
if (require.main === module) {
  if (!POSTMARK_SERVER_TOKEN) {
    console.error('❌ POSTMARK_SERVER_TOKEN not found in environment variables');
    process.exit(1);
  }
  
  checkSuppressionLists()
    .then(results => {
      console.log('🎉 Postmark cleanup successful');
      console.log('📋 Summary:');
      Object.entries(results.suppression_findings).forEach(([type, findings]) => {
        if (findings.error) {
          console.log(`  ${type}: ERROR - ${findings.error}`);
        } else {
          console.log(`  ${type}: ${findings.target_count || 0} target emails found`);
        }
      });
      console.log(`📧 Message Stream: ${results.message_stream_id}`);
      console.log(`🔧 Total cleanup actions: ${results.cleanup_actions.length}`);
      console.log(`✅ Successful removals: ${results.cleanup_actions.filter(a => a.success).length}`);
      console.log(`⚠️ Skipped actions: ${results.cleanup_actions.filter(a => a.action === 'delete_skipped').length}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Postmark cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = { checkSuppressionLists };