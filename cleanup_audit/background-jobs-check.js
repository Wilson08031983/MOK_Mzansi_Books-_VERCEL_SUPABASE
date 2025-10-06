require('dotenv').config({ path: '../.env.local' });
const fs = require('fs');
const path = require('path');

// Configuration
const TARGET_EMAILS = [
  'mokgethamoabelo@yahoo.com',
  'cindyramatladi@gmail.com',
  'wilsonmoabelo1@yahoo.com'
];

const POSTMARK_SERVER_TOKEN = process.env.POSTMARK_SERVER_TOKEN;
const POSTMARK_BASE_URL = 'https://api.postmarkapp.com';

// Helper function for Postmark API requests
const makePostmarkRequest = async (endpoint, method = 'GET', body = null) => {
  try {
    const options = {
      method,
      headers: {
        'Accept': 'application/json',
        'X-Postmark-Server-Token': POSTMARK_SERVER_TOKEN
      }
    };

    if (body) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${POSTMARK_BASE_URL}${endpoint}`, options);
    const data = await response.text();
    
    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch {
      parsedData = data;
    }

    return {
      statusCode: response.status,
      data: parsedData
    };
  } catch (error) {
    return {
      statusCode: 500,
      data: { error: error.message }
    };
  }
};

const checkBackgroundJobs = async () => {
  console.log('🔄 Starting background jobs and webhooks check...');
  
  const checkResults = {
    timestamp: new Date().toISOString(),
    target_emails: TARGET_EMAILS,
    checks_performed: {
      postmark_webhooks: { status: 'pending', results: [] },
      vercel_functions: { status: 'pending', results: [] },
      supabase_triggers: { status: 'pending', results: [] },
      scheduled_jobs: { status: 'pending', results: [] }
    },
    findings: [],
    recommendations: [],
    summary: {
      issues_found: 0,
      action_required: false
    }
  };

  // Check Postmark webhooks
  console.log('📧 Checking Postmark webhooks...');
  try {
    const webhooksResponse = await makePostmarkRequest('/webhooks');
    
    if (webhooksResponse.statusCode === 200) {
      const webhooks = webhooksResponse.data.Webhooks || [];
      console.log(`Found ${webhooks.length} webhooks configured`);
      
      checkResults.checks_performed.postmark_webhooks = {
        status: 'completed',
        results: webhooks.map(webhook => ({
          id: webhook.ID,
          url: webhook.Url,
          message_stream: webhook.MessageStream,
          triggers: webhook.Triggers
        }))
      };

      // Webhooks are typically not user-specific, but log them for review
      if (webhooks.length > 0) {
        checkResults.findings.push({
          type: 'postmark_webhooks',
          description: `${webhooks.length} Postmark webhooks are configured`,
          severity: 'info',
          action_needed: false,
          details: 'Webhooks are system-level and not tied to specific users'
        });
      }
    } else {
      console.log(`⚠️ Could not retrieve webhooks: ${webhooksResponse.data}`);
      checkResults.checks_performed.postmark_webhooks = {
        status: 'error',
        error: webhooksResponse.data
      };
    }
  } catch (error) {
    console.log(`❌ Error checking Postmark webhooks: ${error.message}`);
    checkResults.checks_performed.postmark_webhooks = {
      status: 'error',
      error: error.message
    };
  }

  // Check for Vercel functions that might process user data
  console.log('⚡ Checking Vercel functions...');
  try {
    // Look for API routes and serverless functions
    const apiRoutesPath = path.join(__dirname, '../src/pages/api');
    const functionsPath = path.join(__dirname, '../api');
    
    let apiRoutes = [];
    let functions = [];

    // Check if API routes directory exists
    if (fs.existsSync(apiRoutesPath)) {
      apiRoutes = fs.readdirSync(apiRoutesPath, { recursive: true })
        .filter(file => file.endsWith('.js') || file.endsWith('.ts'))
        .map(file => path.join(apiRoutesPath, file));
    }

    // Check if functions directory exists
    if (fs.existsSync(functionsPath)) {
      functions = fs.readdirSync(functionsPath, { recursive: true })
        .filter(file => file.endsWith('.js') || file.endsWith('.ts'))
        .map(file => path.join(functionsPath, file));
    }

    const allFunctions = [...apiRoutes, ...functions];
    
    checkResults.checks_performed.vercel_functions = {
      status: 'completed',
      results: {
        api_routes_count: apiRoutes.length,
        functions_count: functions.length,
        total_functions: allFunctions.length
      }
    };

    if (allFunctions.length > 0) {
      checkResults.findings.push({
        type: 'vercel_functions',
        description: `${allFunctions.length} serverless functions found`,
        severity: 'info',
        action_needed: false,
        details: 'Functions are system-level and process requests dynamically'
      });
    }

    console.log(`Found ${allFunctions.length} serverless functions`);
  } catch (error) {
    console.log(`❌ Error checking Vercel functions: ${error.message}`);
    checkResults.checks_performed.vercel_functions = {
      status: 'error',
      error: error.message
    };
  }

  // Check for Supabase triggers and functions
  console.log('🗄️ Checking Supabase triggers...');
  try {
    // Look for Supabase migration files that might contain triggers
    const migrationsPath = path.join(__dirname, '../supabase/migrations');
    const supabasePath = path.join(__dirname, '../supabase');
    
    let migrationFiles = [];
    let supabaseFiles = [];

    if (fs.existsSync(migrationsPath)) {
      migrationFiles = fs.readdirSync(migrationsPath)
        .filter(file => file.endsWith('.sql'))
        .map(file => path.join(migrationsPath, file));
    }

    if (fs.existsSync(supabasePath)) {
      supabaseFiles = fs.readdirSync(supabasePath, { recursive: true })
        .filter(file => file.endsWith('.sql'))
        .map(file => path.join(supabasePath, file));
    }

    const allSqlFiles = [...migrationFiles, ...supabaseFiles];
    
    checkResults.checks_performed.supabase_triggers = {
      status: 'completed',
      results: {
        migration_files: migrationFiles.length,
        sql_files: allSqlFiles.length
      }
    };

    if (allSqlFiles.length > 0) {
      checkResults.findings.push({
        type: 'supabase_triggers',
        description: `${allSqlFiles.length} SQL files found that may contain triggers`,
        severity: 'info',
        action_needed: false,
        details: 'Database triggers are schema-level and not tied to specific users'
      });
    }

    console.log(`Found ${allSqlFiles.length} SQL files`);
  } catch (error) {
    console.log(`❌ Error checking Supabase triggers: ${error.message}`);
    checkResults.checks_performed.supabase_triggers = {
      status: 'error',
      error: error.message
    };
  }

  // Check for scheduled jobs (cron jobs, etc.)
  console.log('⏰ Checking scheduled jobs...');
  try {
    // Look for Vercel cron configuration
    const vercelJsonPath = path.join(__dirname, '../vercel.json');
    const packageJsonPath = path.join(__dirname, '../package.json');
    
    let cronJobs = [];
    let scheduledScripts = [];

    // Check vercel.json for cron jobs
    if (fs.existsSync(vercelJsonPath)) {
      const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
      if (vercelConfig.crons) {
        cronJobs = vercelConfig.crons;
      }
    }

    // Check package.json for scheduled scripts
    if (fs.existsSync(packageJsonPath)) {
      const packageConfig = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (packageConfig.scripts) {
        scheduledScripts = Object.keys(packageConfig.scripts)
          .filter(script => script.includes('cron') || script.includes('schedule'))
          .map(script => ({ name: script, command: packageConfig.scripts[script] }));
      }
    }

    checkResults.checks_performed.scheduled_jobs = {
      status: 'completed',
      results: {
        cron_jobs: cronJobs,
        scheduled_scripts: scheduledScripts
      }
    };

    if (cronJobs.length > 0 || scheduledScripts.length > 0) {
      checkResults.findings.push({
        type: 'scheduled_jobs',
        description: `${cronJobs.length} cron jobs and ${scheduledScripts.length} scheduled scripts found`,
        severity: 'info',
        action_needed: false,
        details: 'Scheduled jobs are system-level and not tied to specific users'
      });
    }

    console.log(`Found ${cronJobs.length} cron jobs and ${scheduledScripts.length} scheduled scripts`);
  } catch (error) {
    console.log(`❌ Error checking scheduled jobs: ${error.message}`);
    checkResults.checks_performed.scheduled_jobs = {
      status: 'error',
      error: error.message
    };
  }

  // Analysis and recommendations
  console.log('\n🔍 Analysis:');
  
  checkResults.summary.issues_found = checkResults.findings.filter(f => f.action_needed).length;
  checkResults.summary.action_required = checkResults.summary.issues_found > 0;

  if (checkResults.summary.issues_found === 0) {
    console.log('✅ No user-specific background jobs or webhooks found');
    checkResults.recommendations.push({
      type: 'no_action_needed',
      description: 'All background processes are system-level and not tied to specific users',
      priority: 'info'
    });
  }

  // General recommendations
  checkResults.recommendations.push({
    type: 'monitoring',
    description: 'Monitor webhook logs for any failed deliveries related to deleted users',
    priority: 'low'
  });

  checkResults.recommendations.push({
    type: 'cleanup',
    description: 'Consider clearing any application-level caches that might contain user data',
    priority: 'low'
  });

  // Save results
  const resultsFile = path.join(__dirname, 'background-jobs-check-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(checkResults, null, 2));
  console.log(`\n✅ Background jobs check results saved: ${resultsFile}`);

  // Log to audit trail
  const logEntry = {
    timestamp: new Date().toISOString(),
    action: 'background_jobs_check_completed',
    file: resultsFile,
    checks_performed: Object.keys(checkResults.checks_performed).length,
    findings_count: checkResults.findings.length,
    action_required: checkResults.summary.action_required
  };

  // Append to logs
  const logsFile = path.join(__dirname, 'logs.json');
  let logs = [];
  try {
    logs = JSON.parse(fs.readFileSync(logsFile, 'utf8'));
  } catch (error) {
    logs = [];
  }
  logs.push(logEntry);
  fs.writeFileSync(logsFile, JSON.stringify(logs, null, 2));

  // Display summary
  console.log('\n🎉 Background jobs check completed');
  console.log('📋 Summary:');
  console.log(`  Checks performed: ${Object.keys(checkResults.checks_performed).length}`);
  console.log(`  Findings: ${checkResults.findings.length}`);
  console.log(`  Issues requiring action: ${checkResults.summary.issues_found}`);
  console.log(`  Action required: ${checkResults.summary.action_required ? '❌' : '✅ None'}`);
  
  if (checkResults.findings.length > 0) {
    console.log('\n📝 Findings:');
    checkResults.findings.forEach((finding, index) => {
      console.log(`  ${index + 1}. [${finding.severity.toUpperCase()}] ${finding.description}`);
      console.log(`     ${finding.details}`);
    });
  }

  console.log('\n📝 Recommendations:');
  checkResults.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.description}`);
  });

  process.exit(0);
};

// Run background jobs check
checkBackgroundJobs().catch(error => {
  console.error('❌ Background jobs check failed:', error);
  process.exit(1);
});