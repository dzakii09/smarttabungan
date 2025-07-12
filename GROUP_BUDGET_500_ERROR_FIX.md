# Group Budget 500 Error Fix

## Masalah Terbaru: Error 401 Unauthorized

### Gejala:
- Error 401 Unauthorized saat membuat group budget
- "User ID: undefined" di log backend
- Token tidak terkirim dengan benar

### Debugging Steps:

#### 1. Cek Status Autentikasi di Frontend
```javascript
// Buka browser console dan jalankan:
console.log('Token exists:', !!localStorage.getItem('token'));
console.log('Token preview:', localStorage.getItem('token')?.substring(0, 50));
```

#### 2. Cek Network Tab di Browser
- Buka Developer Tools > Network
- Coba buat group budget
- Lihat request ke `/api/group-budgets`
- Cek apakah header `Authorization: Bearer <token>` terkirim

#### 3. Cek Log Backend
Backend sekarang memiliki logging yang lebih detail:
```
🔍 Debug: Auth middleware called for: POST /group-budgets
🔍 Debug: Authorization header: Bearer <token>
🔍 Debug: Extracted token: Token exists
🔍 Debug: Token decoded successfully: { id: '...', ... }
```

#### 4. Solusi Manual:

**Jika token tidak ada:**
1. Logout dari aplikasi
2. Login kembali dengan email dan password yang benar
3. Cek apakah token tersimpan di localStorage

**Jika token ada tapi masih 401:**
1. Token mungkin expired
2. Logout dan login kembali
3. Cek apakah JWT_SECRET di backend sama dengan yang digunakan saat login

#### 5. Test Login Manual:
```javascript
// Di browser console:
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
    console.log('Token saved');
  }
});
```

#### 6. Test Group Budget API Manual:
```javascript
// Setelah login, test API:
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
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

### Troubleshooting Checklist:

- [ ] User sudah login dengan benar
- [ ] Token tersimpan di localStorage
- [ ] Token tidak expired
- [ ] Header Authorization terkirim dengan benar
- [ ] Backend server berjalan di port 5000
- [ ] JWT_SECRET di backend benar
- [ ] Database connection normal
- [ ] Prisma client ter-generate dengan benar

### Jika Masih Bermasalah:

1. **Restart Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Restart Frontend Server:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Clear Browser Cache:**
   - Clear localStorage
   - Hard refresh (Ctrl+F5)

4. **Check Database:**
   ```bash
   cd backend
   npx prisma db push
   npx prisma generate
   ```

### Log Debug yang Ditambahkan:

**Frontend (`api.ts`):**
- Log token existence
- Log Authorization header
- Log request URL dan headers
- Log response errors

**Backend (`auth.ts`):**
- Log middleware calls
- Log headers
- Log token extraction
- Log token verification
- Log user object

**Frontend (`GroupBudgets.tsx`):**
- Log authentication status on mount
- Log token existence before create
- Log form data

### Expected Behavior:

1. User login → token tersimpan di localStorage
2. Request ke group budget API → Authorization header terkirim
3. Backend middleware → token terverifikasi → user ID tersedia
4. Controller → group budget terbuat dengan user ID yang benar

### Common Issues:

1. **Token tidak tersimpan:** Login gagal atau localStorage bermasalah
2. **Token expired:** Perlu login ulang
3. **JWT_SECRET mismatch:** Backend dan frontend menggunakan secret berbeda
4. **CORS issues:** Request diblokir browser
5. **Network issues:** Backend tidak accessible

---

## Previous 500 Error Fix (Masih Relevan):

### Masalah:
- Error 500 Internal Server Error saat membuat group budget
- "User ID: undefined" di log backend
- Group budget tidak terbuat

### Penyebab:
1. **Authentication Middleware Issue:** User ID tidak tersedia di request
2. **Prisma Client Issue:** Client tidak ter-generate dengan benar
3. **Database Connection Issue:** Koneksi database bermasalah

### Solusi:

#### 1. Fix Authentication Middleware
```typescript
// backend/src/middleware/auth.ts
export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' })
  }
}
```

#### 2. Fix Group Budget Controller
```typescript
// backend/src/controllers/groupBudgetController.ts
export const createGroupBudget = async (req: AuthRequest, res: Response) => {
  try {
    console.log('=== CREATE GROUP BUDGET START ===')
    console.log('Request body:', req.body)
    console.log('User ID:', req.user?.id)
    
    if (!req.user?.id) {
      console.log('No user ID found in request')
      return res.status(401).json({ message: 'User not authenticated' })
    }

    const { name, description, amount, period, startDate, endDate, categoryId, invitedEmails } = req.body

    const parsedData = {
      name,
      description,
      amount: Number(amount),
      period,
      startDate,
      endDate,
      categoryId
    }

    console.log('Parsed data:', parsedData)

    const groupBudget = await prisma.groupBudget.create({
      data: {
        ...parsedData,
        createdBy: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: 'owner'
          }
        }
      },
      include: {
        members: {
          include: {
            user: true
          }
        },
        category: true,
        creator: true,
        invitations: true
      }
    })

    console.log('Group budget created successfully:', groupBudget.id)

    // Handle invitations if any
    if (invitedEmails && invitedEmails.length > 0) {
      for (const email of invitedEmails) {
        await prisma.groupBudgetInvitation.create({
          data: {
            email,
            groupBudgetId: groupBudget.id,
            invitedBy: req.user.id
          }
        })
      }
    }

    res.status(201).json({ groupBudget })
  } catch (error) {
    console.error('Error creating group budget:', error)
    res.status(500).json({ message: 'Failed to create group budget', error: error.message })
  }
}
```

#### 3. Regenerate Prisma Client
```bash
cd backend
npx prisma generate
```

#### 4. Restart Backend Server
```bash
cd backend
npm run dev
```

#### 5. Test API Endpoint
```bash
# Test dengan curl
curl -X POST http://localhost:5000/api/group-budgets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Budget",
    "description": "Test Description", 
    "amount": 1000000,
    "period": "monthly",
    "startDate": "2025-01-01",
    "endDate": "2025-02-01",
    "categoryId": "your-category-id",
    "invitedEmails": []
  }'
```

### Debugging Steps:

1. **Check Backend Logs:**
   - Lihat log "=== CREATE GROUP BUDGET START ==="
   - Cek apakah "User ID:" menampilkan ID yang benar
   - Cek apakah "Parsed data:" menampilkan data yang benar

2. **Check Database:**
   ```bash
   cd backend
   npx prisma studio
   ```

3. **Check Prisma Schema:**
   ```bash
   cd backend
   npx prisma validate
   ```

4. **Check Environment Variables:**
   ```bash
   # backend/.env
   DATABASE_URL="your-database-url"
   JWT_SECRET="your-jwt-secret"
   ```

### Expected Behavior:

1. Request POST ke `/api/group-budgets`
2. Middleware auth memverifikasi token
3. User ID tersedia di `req.user.id`
4. Group budget terbuat dengan `createdBy: req.user.id`
5. Member owner terbuat dengan `userId: req.user.id`
6. Response 201 dengan data group budget

### Common Issues:

1. **Token tidak valid:** Perlu login ulang
2. **JWT_SECRET salah:** Token tidak bisa diverifikasi
3. **Database connection error:** Prisma tidak bisa connect
4. **Schema validation error:** Data tidak sesuai schema
5. **Foreign key constraint:** Category ID tidak valid

### Testing:

1. **Test Authentication:**
   ```bash
   curl -X GET http://localhost:5000/api/auth/me \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **Test Categories:**
   ```bash
   curl -X GET http://localhost:5000/api/categories
   ```

3. **Test Group Budget Creation:**
   ```bash
   curl -X POST http://localhost:5000/api/group-budgets \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "name": "Test Budget",
       "description": "Test Description",
       "amount": 1000000,
       "period": "monthly", 
       "startDate": "2025-01-01",
       "endDate": "2025-02-01",
       "categoryId": "your-category-id"
     }'
   ```

### Jika Masih Bermasalah:

1. **Check Database Connection:**
   ```bash
   cd backend
   npx prisma db push
   npx prisma generate
   ```

2. **Restart All Services:**
   ```bash
   # Terminal 1
   cd backend && npm run dev
   
   # Terminal 2  
   cd frontend && npm run dev
   ```

3. **Clear Browser Cache:**
   - Clear localStorage
   - Hard refresh (Ctrl+F5)

4. **Check Network Tab:**
   - Buka Developer Tools
   - Lihat request ke `/api/group-budgets`
   - Cek response status dan body

### Log yang Diharapkan:

```
=== CREATE GROUP BUDGET START ===
Request body: { name: 'Test Budget', ... }
User ID: user-id-here
Parsed data: { name: 'Test Budget', amount: 1000000, ... }
Group budget created successfully: group-budget-id-here
```

Jika log tidak muncul atau "User ID: undefined", berarti ada masalah dengan autentikasi. 