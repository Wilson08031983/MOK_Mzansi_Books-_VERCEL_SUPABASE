require('dotenv').config({ path: '.env.local' });
const { Client } = require('postmark');

async function checkPasswordResetTemplate() {
  const token = process.env.POSTMARK_SERVER_TOKEN;
  
  if (!token) {
    console.error('❌ POSTMARK_SERVER_TOKEN not found in .env.local');
    return;
  }
  
  console.log('🔍 Checking Postmark configuration...');
  console.log('Token:', token.substring(0, 8) + '...');
  
  const client = new Client(token);
  
  try {
    // Check server info
    console.log('\n📊 Server Information:');
    const server = await client.getServer();
    console.log('- Server Name:', server.Name);
    console.log('- Server ID:', server.ID);
    console.log('- State:', server.State);
    
    // List templates
    console.log('\n📋 Available Templates:');
    const templates = await client.getTemplates();
    
    if (templates.Templates && templates.Templates.length > 0) {
      templates.Templates.forEach(template => {
        console.log(`- ${template.Name} (Alias: ${template.Alias}, Active: ${template.Active})`);
      });
      
      // Check for password-reset template
      const passwordResetTemplate = templates.Templates.find(t => 
        t.Alias === 'password-reset' || t.Name.toLowerCase().includes('password')
      );
      
      if (passwordResetTemplate) {
        console.log('\n✅ Password Reset Template Found:');
        console.log('- Name:', passwordResetTemplate.Name);
        console.log('- Alias:', passwordResetTemplate.Alias);
        console.log('- Active:', passwordResetTemplate.Active);
        console.log('- Template ID:', passwordResetTemplate.TemplateId);
      } else {
        console.log('\n❌ Password Reset Template NOT Found');
        console.log('Available template aliases:', templates.Templates.map(t => t.Alias).join(', '));
      }
    } else {
      console.log('No templates found');
    }
    
  } catch (error) {
    console.error('❌ Error checking Postmark:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

checkPasswordResetTemplate();
