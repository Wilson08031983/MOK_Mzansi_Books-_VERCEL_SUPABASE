// Update Admin Subscription Script (localStorage Only)
// This script updates admin@mokmzansibooks.com from Trial to Monthly Subscription

const ADMIN_EMAIL = 'admin@mokmzansibooks.com';
const MONTHLY_PLAN = {
  tier: 'monthly',
  status: 'active',
  duration: 31, // days
  price: 60 // R60
};

function updateAdminSubscription() {
  console.log('=== MOK Mzansi Books - Admin Subscription Update ===\n');
  
  // Calculate subscription dates
  const now = new Date();
  const endDate = new Date(now.getTime() + MONTHLY_PLAN.duration * 24 * 60 * 60 * 1000);
  
  console.log('📅 Subscription Details:');
  console.log(`   User: ${ADMIN_EMAIL}`);
  console.log(`   Plan: ${MONTHLY_PLAN.tier.toUpperCase()}`);
  console.log(`   Status: ${MONTHLY_PLAN.status.toUpperCase()}`);
  console.log(`   Start: ${now.toLocaleDateString()}`);
  console.log(`   End: ${endDate.toLocaleDateString()}`);
  console.log(`   Price: R${MONTHLY_PLAN.price}/month`);
  
  console.log('\n🔧 Browser localStorage Update Instructions:');
  console.log('1. Open your browser and navigate to: http://localhost:8082');
  console.log('2. Login with: admin@mokmzansibooks.com / admin123');
  console.log('3. Open Developer Tools (F12)');
  console.log('4. Go to Console tab');
  console.log('5. Copy and paste the following commands:\n');
  
  console.log('// Update admin subscription to Monthly');
  console.log(`localStorage.setItem('mokSubscription', JSON.stringify({`);
  console.log(`  tier: '${MONTHLY_PLAN.tier}',`);
  console.log(`  status: '${MONTHLY_PLAN.status}',`);
  console.log(`  end_date: '${endDate.toISOString()}',`);
  console.log(`  validUntil: '${endDate.toISOString()}',`);
  console.log(`  cancelAtPeriodEnd: false`);
  console.log(`}));`);
  console.log('');
  console.log('// Verify the update');
  console.log('console.log("Updated subscription:", JSON.parse(localStorage.getItem("mokSubscription")));');
  console.log('');
  console.log('// Refresh the page to see changes');
  console.log('window.location.reload();');
  
  console.log('\n6. Press Enter after each command');
  console.log('7. Navigate to Settings > Billing to verify the Monthly subscription');
  console.log('\n✅ After completing these steps, the admin user will have:');
  console.log('   • Monthly subscription (R60/month)');
  console.log('   • Active status with blue badge');
  console.log('   • Full access to all features');
  console.log('   • Next billing date in 31 days');
  
  console.log('\n🎉 Admin subscription update instructions generated successfully!');
}

// Run the update
updateAdminSubscription();