// Test Group Budget API
// Jalankan dengan: node test_group_budget.js

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testGroupBudgetAPI() {
  console.log('=== TESTING GROUP BUDGET API ===');
  
  try {
    // 1. Test login
    console.log('\n1. Testing login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token:', token.substring(0, 50) + '...');
    
    // 2. Test auth endpoint
    console.log('\n2. Testing auth endpoint...');
    const authResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Auth successful, user:', authResponse.data);
    
    // 3. Test categories endpoint
    console.log('\n3. Testing categories endpoint...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/categories`);
    const categories = categoriesResponse.data;
    console.log('✅ Categories loaded:', categories.length, 'categories');
    
    if (categories.length === 0) {
      console.log('❌ No categories found! Need to seed categories first.');
      return;
    }
    
    // 4. Test create group budget
    console.log('\n4. Testing create group budget...');
    const groupBudgetData = {
      name: 'Test Group Budget',
      description: 'Test Description',
      amount: 1000000,
      period: 'monthly',
      startDate: '2025-01-01',
      endDate: '2025-02-01',
      categoryId: categories[0].id,
      invitedEmails: []
    };
    
    console.log('Request data:', groupBudgetData);
    
    const createResponse = await axios.post(`${API_BASE_URL}/group-budgets`, groupBudgetData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Group budget created successfully!');
    console.log('Response:', createResponse.data);
    
    // 5. Test get group budgets
    console.log('\n5. Testing get group budgets...');
    const getResponse = await axios.get(`${API_BASE_URL}/group-budgets`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Group budgets retrieved:', getResponse.data.length, 'budgets');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔍 Debug: 401 Unauthorized - Check token and auth middleware');
    } else if (error.response?.status === 500) {
      console.log('🔍 Debug: 500 Server Error - Check backend logs');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('🔍 Debug: Connection refused - Backend server not running');
    } else if (error.code === 'ENOTFOUND') {
      console.log('🔍 Debug: Host not found - Check API URL');
    }
  }
}

testGroupBudgetAPI(); 