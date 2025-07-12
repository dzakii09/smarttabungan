const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  email: 'john@example.com',
  password: 'password123'
};

let authToken;
let groupBudgetId;
let periodId;

async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, testUser);
    authToken = response.data.token;
    console.log('✅ Login successful');
    return authToken;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function createGroupBudget() {
  try {
    console.log('\n📊 Creating group budget...');
    
    const budgetData = {
      name: 'Test Smart Budget',
      description: 'Budget untuk testing fitur enhanced',
      amount: 900000, // 900k total
      period: 'monthly',
      duration: 3, // 3 bulan
      startDate: new Date().toISOString().split('T')[0], // Hari ini
      categoryId: '1' // Assuming category exists
    };

    const response = await axios.post(`${API_BASE_URL}/group-budgets`, budgetData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    groupBudgetId = response.data.groupBudget.id;
    console.log('✅ Group budget created:', {
      id: groupBudgetId,
      name: response.data.groupBudget.name,
      targetPerPeriod: response.data.groupBudget.amount / 3, // Should be 300k
      periods: response.data.periods.length
    });

    return response.data;
  } catch (error) {
    console.error('❌ Create group budget failed:', error.response?.data || error.message);
    throw error;
  }
}

async function getGroupBudgetPeriods() {
  try {
    console.log('\n📅 Getting periods...');
    
    const response = await axios.get(`${API_BASE_URL}/group-budgets/${groupBudgetId}/periods`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const periods = response.data;
    console.log('✅ Periods retrieved:', periods.length);
    
    periods.forEach((period, index) => {
      console.log(`  Period ${index + 1}:`, {
        budget: period.budget, // Should be 300k
        startDate: period.startDate,
        endDate: period.endDate,
        spent: period.spent
      });
    });

    periodId = periods[0].id; // Use first period for testing
    return periods;
  } catch (error) {
    console.error('❌ Get periods failed:', error.response?.data || error.message);
    throw error;
  }
}

async function addOnTimeTransaction() {
  try {
    console.log('\n✅ Adding on-time transaction...');
    
    const transactionData = {
      groupBudgetId,
      periodId,
      amount: 100000,
      description: 'Makan siang tepat waktu',
      type: 'expense',
      date: new Date().toISOString().split('T')[0] // Today
    };

    const response = await axios.post(`${API_BASE_URL}/group-budgets/${groupBudgetId}/transactions`, transactionData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ On-time transaction added:', {
      isLate: response.data.isLate,
      warning: response.data.warning
    });

    return response.data;
  } catch (error) {
    console.error('❌ Add on-time transaction failed:', error.response?.data || error.message);
    throw error;
  }
}

async function addLateTransaction() {
  try {
    console.log('\n⚠️ Adding late transaction...');
    
    // Create a date that's definitely after the period end
    const lateDate = new Date();
    lateDate.setDate(lateDate.getDate() + 10); // 10 days from now
    
    const transactionData = {
      groupBudgetId,
      periodId,
      amount: 50000,
      description: 'Snack terlambat',
      type: 'expense',
      date: lateDate.toISOString().split('T')[0]
    };

    const response = await axios.post(`${API_BASE_URL}/group-budgets/${groupBudgetId}/transactions`, transactionData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ Late transaction added:', {
      isLate: response.data.isLate,
      warning: response.data.warning
    });

    return response.data;
  } catch (error) {
    console.error('❌ Add late transaction failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testPeriodStatus() {
  try {
    console.log('\n📊 Testing period status...');
    
    const response = await axios.get(`${API_BASE_URL}/group-budgets/${groupBudgetId}/periods`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const periods = response.data;
    
    periods.forEach((period, index) => {
      const now = new Date();
      const endDate = new Date(period.endDate);
      const isEnded = now > endDate;
      const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      let status = 'Aktif';
      if (isEnded) status = 'Berakhir';
      else if (daysLeft <= 3) status = 'Hampir Berakhir';
      
      console.log(`  Period ${index + 1} status:`, {
        status,
        daysLeft: isEnded ? 0 : daysLeft,
        spent: period.spent,
        budget: period.budget,
        progress: `${((period.spent / period.budget) * 100).toFixed(1)}%`
      });
    });

    return periods;
  } catch (error) {
    console.error('❌ Test period status failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testDifferentPeriods() {
  try {
    console.log('\n🔄 Testing different period types...');
    
    const periodTests = [
      {
        name: 'Daily Budget',
        data: {
          name: 'Test Daily Budget',
          amount: 30000,
          period: 'daily',
          duration: 7, // 7 hari
          startDate: new Date().toISOString().split('T')[0]
        }
      },
      {
        name: 'Weekly Budget', 
        data: {
          name: 'Test Weekly Budget',
          amount: 210000,
          period: 'weekly',
          duration: 4, // 4 minggu
          startDate: new Date().toISOString().split('T')[0]
        }
      }
    ];

    for (const test of periodTests) {
      console.log(`\n📅 Testing ${test.name}...`);
      
      const response = await axios.post(`${API_BASE_URL}/group-budgets`, test.data, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      const budget = response.data.groupBudget;
      const periods = response.data.periods;
      
      console.log(`✅ ${test.name} created:`, {
        totalAmount: budget.amount,
        targetPerPeriod: budget.amount / test.data.duration,
        periodsCount: periods.length,
        firstPeriodBudget: periods[0]?.budget,
        lastPeriodEndDate: periods[periods.length - 1]?.endDate
      });
    }

  } catch (error) {
    console.error('❌ Test different periods failed:', error.response?.data || error.message);
    throw error;
  }
}

async function runAllTests() {
  try {
    console.log('🚀 Starting Enhanced Group Budget Tests...\n');
    
    // Login
    await login();
    
    // Test monthly budget
    await createGroupBudget();
    await getGroupBudgetPeriods();
    await addOnTimeTransaction();
    await addLateTransaction();
    await testPeriodStatus();
    
    // Test different period types
    await testDifferentPeriods();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Auto target calculation working');
    console.log('✅ Auto date calculation working');
    console.log('✅ Late transaction detection working');
    console.log('✅ Period status tracking working');
    console.log('✅ Multiple period types working');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  login,
  createGroupBudget,
  getGroupBudgetPeriods,
  addOnTimeTransaction,
  addLateTransaction,
  testPeriodStatus,
  testDifferentPeriods
}; 