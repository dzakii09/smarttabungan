# Debug Guide: Group Budget 401 Error

## Masalah
Error 401 Unauthorized saat membuat group budget. User ID undefined di backend.

## Langkah Debug

### 1. Cek Status Login
Buka browser console dan jalankan:
```javascript
// Cek apakah user sudah login
console.log('Token exists:', !!localStorage.getItem('token'));
console.log('Token:', localStorage.getItem('token'));

// Jika tidak ada token, user perlu login
if (!localStorage.getItem('token')) {
  console.log('❌ User belum login!');
} else {
  console.log('✅ Token ditemukan');
}
```

### 2. Test Login Manual
Jika tidak ada token, login manual:
```javascript
// Ganti dengan email dan password yang benar
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'your-email@example.com',
    password: 'your-password'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Login response:', data);
  if (data.token) {
    localStorage.setItem('token', data.token);
    console.log('✅ Token disimpan');
  }
});
```

### 3. Test API Manual
Setelah login, test group budget API:
```javascript
const token = localStorage.getItem('token');
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
    categoryId: 'your-category-id',
    invitedEmails: []
  })
})
.then(res => {
  console.log('Status:', res.status);
  return res.json();
})
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

### 4. Cek Network Tab
1. Buka Developer Tools > Network
2. Coba buat group budget
3. Lihat request ke `/api/group-budgets`
4. Cek apakah header `Authorization: Bearer <token>` terkirim

### 5. Cek Backend Logs
Backend sekarang memiliki logging detail. Lihat terminal backend untuk:
```
🔍 Debug: Auth middleware called for: POST /group-budgets
🔍 Debug: Authorization header: Bearer <token>
🔍 Debug: Token decoded successfully: { id: '...', ... }
```

### 6. Solusi Cepat

**Jika token tidak ada:**
1. Logout dari aplikasi
2. Login kembali
3. Cek localStorage untuk token

**Jika token ada tapi masih 401:**
1. Token mungkin expired
2. Logout dan login kembali
3. Cek JWT_SECRET di backend

**Jika backend tidak merespons:**
1. Restart backend server
2. Cek apakah server berjalan di port 5000
3. Cek database connection

### 7. Test Endpoint Lain
Test endpoint yang tidak memerlukan auth:
```javascript
// Test categories
fetch('http://localhost:5000/api/categories')
.then(res => res.json())
.then(data => console.log('Categories:', data));
```

### 8. Debug Button
Di halaman Group Budgets, ada tombol "Debug Auth" yang akan:
- Cek token di localStorage
- Test auth endpoint
- Log hasil ke console

### Expected Behavior
1. User login → token tersimpan
2. Request group budget → Authorization header terkirim
3. Backend → token terverifikasi → user ID tersedia
4. Group budget terbuat dengan user ID yang benar

### Common Issues
- ❌ Token tidak tersimpan setelah login
- ❌ Token expired
- ❌ JWT_SECRET mismatch
- ❌ Backend server tidak berjalan
- ❌ Database connection error

### Quick Fix
Jika semua di atas sudah dicek tapi masih bermasalah:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Restart backend dan frontend
3. Login ulang
4. Test dengan curl atau Postman 