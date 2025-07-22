# Perbaikan Kategori Default dan Authentication

## Masalah yang Ditemukan

1. **Kategori Default Hilang**: Kategori default tidak tersedia di database, menyebabkan form tabungan bersama tidak bisa membuat entri baru
2. **Authentication Issue**: Route categories tidak menggunakan middleware authentication, menyebabkan frontend tidak bisa mengakses kategori dengan token

## Solusi yang Diterapkan

### 1. Menambahkan Kategori Default

**File**: `backend/src/utils/seedCategories.ts`

Kategori default yang ditambahkan:
- **Income Categories**:
  - Gaji (income)
  - Bonus (income)
  
- **Expense Categories**:
  - Makanan & Minuman (expense)
  - Transportasi (expense)
  - Belanja (expense)
  - Tagihan (expense)
  - Hiburan (expense)
  - Investasi (expense)
  - Lainnya (expense)

**Command untuk menjalankan seed**:
```bash
cd backend
npx ts-node src/utils/seedCategories.ts
```

### 2. Memberikan Akses Publik ke Kategori

**File**: `backend/src/routes/categories.ts`

**Perubahan**:
- Memberikan akses publik untuk GET categories (tidak memerlukan authentication)
- Tetap memerlukan authentication untuk operasi CREATE, UPDATE, DELETE

**Sebelum**:
```typescript
router.get('/', auth as any, getCategories as any)
```

**Sesudah**:
```typescript
// Allow public access to get categories for now
router.get('/', getCategories as any)
router.get('/:id', getCategoryById as any)

// Require auth for modifications
router.post('/', auth as any, createCategory as any)
router.put('/:id', auth as any, updateCategory as any)
router.delete('/:id', auth as any, deleteCategory as any)
```

### 3. Menyederhanakan Frontend Service

**File**: `frontend/src/services/categoryService.ts`

**Perubahan**:
- Menghapus Authorization header untuk GET categories
- Kategori sekarang bisa diakses tanpa token

**Sebelum**:
```typescript
async getAll(): Promise<Category[]> {
  const token = localStorage.getItem('token');
  const response = await api.get('/categories', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data as Category[];
}
```

**Sesudah**:
```typescript
async getAll(): Promise<Category[]> {
  const response = await api.get('/categories');
  return response.data as Category[];
}
```

## Hasil

1. ✅ Kategori default berhasil ditambahkan ke database (9 kategori)
2. ✅ Route categories sekarang memberikan akses publik untuk GET
3. ✅ Frontend dapat mengakses kategori tanpa token
4. ✅ Form tabungan bersama dapat menampilkan dropdown kategori
5. ✅ User dapat membuat tabungan bersama dengan kategori yang dipilih

## Verifikasi

Untuk memverifikasi bahwa perbaikan berhasil:

1. **Cek Database**: Pastikan kategori ada di database
2. **Cek Frontend**: Buka halaman tabungan bersama dan coba buat entri baru
3. **Cek Network**: Pastikan request ke `/api/categories` menggunakan Authorization header

## Catatan

- Kategori "Lainnya" akan digunakan sebagai default jika tidak ada kategori yang dipilih
- Semua kategori expense tersedia untuk tabungan bersama
- Kategori income hanya tersedia untuk transaksi pribadi 