// Debug Authentication Script
// Jalankan di browser console

console.log('=== DEBUG AUTHENTICATION ===');

// 1. Cek token di localStorage
const token = localStorage.getItem('token');
console.log('1. Token exists:', !!token);
if (token) {
  console.log('   Token preview:', token.substring(0, 50) + '...');
} else {
  console.log('   ❌ No token found - user needs to login');
}

// 2. Test login jika tidak ada token
if (!token) {
  console.log('2. Testing login...');
  // Ganti dengan email dan password yang benar
  fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@example.com', // Ganti dengan email yang benar
      password: 'password123'     // Ganti dengan password yang benar
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log('   Login response:', data);
    if (data.token) {
      localStorage.setItem('token', data.token);
      console.log('   ✅ Token saved');
    } else {
      console.log('   ❌ Login failed:', data.message);
    }
  })
  .catch(err => {
    console.log('   ❌ Login error:', err);
  });
}

// 3. Test auth endpoint
if (token) {
  console.log('3. Testing auth endpoint...');
  fetch('http://localhost:5000/api/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(res => {
    console.log('   Auth status:', res.status);
    return res.json();
  })
  .then(data => {
    console.log('   Auth response:', data);
  })
  .catch(err => {
    console.log('   ❌ Auth error:', err);
  });
}

// 4. Test group budget API
if (token) {
  console.log('4. Testing group budget API...');
  fetch('http://localhost:5000/api/group-budgets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'Test Budget',
      description: 'Test Description',
      amount: 1000000,
      period: 'monthly',
      startDate: '2025-01-01',
      endDate: '2025-02-01',
      categoryId: 'cmd002ix20002u6qghlafn07m', // Ganti dengan category ID yang valid
      invitedEmails: []
    })
  })
  .then(res => {
    console.log('   Group budget status:', res.status);
    return res.json();
  })
  .then(data => {
    console.log('   Group budget response:', data);
  })
  .catch(err => {
    console.log('   ❌ Group budget error:', err);
  });
}

console.log('=== DEBUG COMPLETE ==='); 