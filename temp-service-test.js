
import { runServiceTest } from './src/utils/serviceTest';

// Run the service test
runServiceTest().then(() => {
  console.log('Test completed, exiting...');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
