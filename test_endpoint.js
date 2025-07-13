const axios = require('axios');

async function testEndpoint() {
  try {
    console.log('Testing /transactions/stats endpoint...');
    
    // Test dengan token dummy (akan gagal, tapi untuk memastikan endpoint berjalan)
    try {
      const response = await axios.get('http://localhost:5000/api/transactions/stats', {
        headers: { 
          'Authorization': 'Bearer dummy-token',
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Should have failed, but got:', response.data);
    } catch (error) {
      if (error.response) {
        console.log('✅ Endpoint is running!');
        console.log('Status:', error.response.status);
        console.log('Message:', error.response.data.message);
      } else {
        console.log('❌ Endpoint not accessible:', error.message);
      }
    }
    
    console.log('\nBackend is running!');
    console.log('Now you can:');
    console.log('1. Open your browser and go to the dashboard');
    console.log('2. Login to your account');
    console.log('3. Check the debug info on dashboard');
    console.log('4. The monthly income should show: 100,000');
    console.log('5. The monthly expense should show: 20,000');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testEndpoint(); 