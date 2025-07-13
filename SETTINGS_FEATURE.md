# Fitur Pengaturan (Settings) - SmartTabungan

## Overview
Fitur preferences telah dihapus dan diganti dengan fitur pengaturan yang lebih sederhana dan fokus pada kebutuhan utama user.

## Perubahan yang Dilakukan

### 1. Penghapusan Fitur Preferences
- **Dihapus dari Backend:**
  - `backend/src/services/userPersonalizationService.ts`
  - `backend/src/controllers/personalizationController.ts`
  - `backend/src/routes/personalization.ts`
  - Model `UserPreferences` dari database schema

- **Dihapus dari Frontend:**
  - `frontend/src/pages/UserPreferences.tsx`
  - Referensi personalization dari `App.tsx`
  - Referensi preferences dari `Sidebar.tsx`

- **Database:**
  - Migration untuk menghapus tabel `user_preferences`
  - Data preferences lama telah dihapus

### 2. Fitur Pengaturan Baru

#### Backend Components
- **SettingsController** (`backend/src/controllers/settingsController.ts`)
  - `getUserSettings()` - Mendapatkan pengaturan user
  - `updateUserSettings()` - Update pengaturan umum
  - `updateUserProfile()` - Update profil user
  - `changePassword()` - Ganti password
  - `updateNotificationSettings()` - Update pengaturan notifikasi
  - `updateAppearanceSettings()` - Update pengaturan tampilan

- **SettingsService** (`backend/src/services/settingsService.ts`)
  - Manajemen pengaturan user
  - Validasi password
  - Update profil user

- **Settings Routes** (`backend/src/routes/settings.ts`)
  - `GET /api/settings` - Get user settings
  - `PUT /api/settings` - Update user settings
  - `PUT /api/settings/profile` - Update user profile
  - `PUT /api/settings/change-password` - Change password
  - `PUT /api/settings/notifications` - Update notification settings
  - `PUT /api/settings/appearance` - Update appearance settings

#### Frontend Components
- **Settings Page** (`frontend/src/pages/Settings.tsx`)
  - Tab-based interface dengan 4 kategori:
    1. **Profil** - Update nama, email, avatar
    2. **Notifikasi** - Pengaturan notifikasi email, push, in-app
    3. **Tampilan** - Tema, bahasa, mata uang
    4. **Keamanan** - Ganti password, 2FA

### 3. Fitur Pengaturan

#### A. Profil Akun
- **Nama Lengkap** - Update nama user
- **Email** - Update email user
- **Avatar** - Upload foto profil (UI ready, backend pending)

#### B. Notifikasi
- **Email Notifications** - Notifikasi melalui email
- **Push Notifications** - Notifikasi di browser
- **In-App Notifications** - Notifikasi dalam aplikasi
- **Budget Alerts** - Peringatan ketika budget melebihi batas
- **Goal Reminders** - Pengingat untuk tujuan keuangan
- **Unusual Spending** - Deteksi pengeluaran anomali

#### C. Tampilan
- **Tema** - Light, Dark, Auto
- **Bahasa** - Bahasa Indonesia, English
- **Mata Uang** - IDR, USD, EUR, SGD, MYR

#### D. Keamanan
- **Ganti Password** - Validasi password lama, hash password baru
- **Two-Factor Authentication** - UI ready, backend pending

### 4. API Endpoints

```typescript
// Get user settings
GET /api/settings
Authorization: Bearer <token>

// Update user settings
PUT /api/settings
Authorization: Bearer <token>
Body: {
  profile: { name, email },
  notifications: { email, push, inApp, ... },
  appearance: { theme, language, currency },
  security: { changePassword, twoFactorAuth }
}

// Update user profile
PUT /api/settings/profile
Authorization: Bearer <token>
Body: { name, email }

// Change password
PUT /api/settings/change-password
Authorization: Bearer <token>
Body: { currentPassword, newPassword }

// Update notification settings
PUT /api/settings/notifications
Authorization: Bearer <token>
Body: { email, push, inApp, budgetAlerts, goalReminders, unusualSpending }

// Update appearance settings
PUT /api/settings/appearance
Authorization: Bearer <token>
Body: { theme, language, currency }
```

### 5. Database Schema
Tabel `user_preferences` telah dihapus. Pengaturan sekarang disimpan di level aplikasi atau dapat ditambahkan tabel terpisah di masa depan jika diperlukan.

### 6. Navigation
- Menu "Preferences" di sidebar telah dihapus
- Menu "Pengaturan" di sidebar mengarah ke halaman Settings baru
- Route `/preferences` telah dihapus
- Route `/settings` baru untuk halaman Settings

### 7. Integrasi dengan Fitur Lain
- **Dashboard** - Tidak lagi bergantung pada personalization preferences
- **AI Recommendations** - Menggunakan endpoint `/ai/recommendations` dan `/ai/insights`
- **Chatbot** - Menggunakan endpoint AI yang baru
- **Notifications** - Menggunakan pengaturan notifikasi dari Settings

## Keuntungan Fitur Baru

### 1. Kesederhanaan
- Interface yang lebih bersih dan mudah dipahami
- Fokus pada pengaturan yang benar-benar diperlukan
- Tidak ada kompleksitas personalization yang berlebihan

### 2. Performa
- Tidak ada query database yang kompleks untuk preferences
- Loading time yang lebih cepat
- Memory usage yang lebih rendah

### 3. Maintainability
- Kode yang lebih sederhana dan mudah dipelihara
- Tidak ada dependensi pada personalization service
- Struktur yang lebih modular

### 4. User Experience
- Interface yang intuitif dengan tab-based navigation
- Feedback visual yang jelas untuk setiap perubahan
- Validasi yang proper untuk form input

## Roadmap Masa Depan

### 1. Fitur yang Dapat Ditambahkan
- **Avatar Upload** - Upload dan crop foto profil
- **Two-Factor Authentication** - Implementasi 2FA lengkap
- **Export Settings** - Export/import pengaturan
- **Advanced Notifications** - Custom notification rules
- **Theme Customization** - Custom color schemes

### 2. Database Enhancement
- **Settings Table** - Tabel terpisah untuk menyimpan pengaturan
- **Settings History** - Riwayat perubahan pengaturan
- **Settings Backup** - Backup dan restore pengaturan

### 3. Integration
- **Email Service** - Integrasi dengan email service untuk notifikasi
- **Push Notifications** - Integrasi dengan push notification service
- **Analytics** - Tracking penggunaan fitur settings

## Testing

### Manual Testing Checklist
- [ ] Login dan akses halaman Settings
- [ ] Update profil (nama, email)
- [ ] Ganti password dengan validasi
- [ ] Toggle pengaturan notifikasi
- [ ] Ubah tema aplikasi
- [ ] Ubah bahasa aplikasi
- [ ] Ubah mata uang
- [ ] Responsive design di mobile
- [ ] Error handling untuk invalid input
- [ ] Loading states dan feedback

### API Testing
- [ ] GET /api/settings - Get user settings
- [ ] PUT /api/settings/profile - Update profile
- [ ] PUT /api/settings/change-password - Change password
- [ ] PUT /api/settings/notifications - Update notifications
- [ ] PUT /api/settings/appearance - Update appearance
- [ ] Error handling untuk invalid requests
- [ ] Authentication validation

## Deployment Notes

### Backend
1. Pastikan migration `remove_user_preferences` telah dijalankan
2. Restart server untuk memuat routes baru
3. Test semua endpoint settings

### Frontend
1. Build dan deploy frontend dengan komponen Settings baru
2. Pastikan routing `/settings` berfungsi
3. Test semua fitur settings di production

### Database
1. Backup data sebelum migration (jika ada data penting)
2. Jalankan migration untuk menghapus tabel user_preferences
3. Verifikasi tidak ada referensi ke tabel yang dihapus

## Troubleshooting

### Common Issues
1. **401 Unauthorized** - Pastikan token valid dan user authenticated
2. **500 Server Error** - Check logs untuk error di settings service
3. **Migration Failed** - Pastikan tidak ada foreign key constraints
4. **Frontend Routing** - Pastikan route `/settings` terdaftar di App.tsx

### Debug Steps
1. Check browser console untuk error JavaScript
2. Check server logs untuk error backend
3. Verify database schema dengan `npx prisma db pull`
4. Test API endpoints dengan Postman/curl

## Conclusion
Fitur pengaturan baru memberikan pengalaman yang lebih sederhana dan fokus pada kebutuhan utama user. Penghapusan fitur preferences yang kompleks membuat aplikasi lebih mudah dipelihara dan memberikan performa yang lebih baik. 