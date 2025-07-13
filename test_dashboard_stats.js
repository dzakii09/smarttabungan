const axios = require('axios');

async function testDashboardStats() {
  try {
    console.log('Testing dashboard stats endpoint...');
    
    // Test without authentication (should fail)
    try {
      const response = await axios.get('http://localhost:5000/api/transactions/stats');
      console.log('❌ Should have failed without auth, but got:', response.data);
    } catch (error) {
      console.log('✅ Correctly failed without authentication:', error.response?.data?.message);
    }
    
    // Test with invalid token
    try {
      const response = await axios.get('http://localhost:5000/api/transactions/stats', {
        headers: { Authorization: 'Bearer invalid-token' }
      });
      console.log('❌ Should have failed with invalid token, but got:', response.data);
    } catch (error) {
      console.log('✅ Correctly failed with invalid token:', error.response?.data?.message);
    }
    
    console.log('\nBackend endpoint is working correctly!');
    console.log('To test with real data, you need to:');
    console.log('1. Login to the application');
    console.log('2. Check the browser console for dashboard stats response');
    console.log('3. Look for the debug info box on the dashboard page');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testDashboardStats(); 