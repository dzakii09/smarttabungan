# Phase 6: Notifikasi & Reminder - SmartWealth

## Overview
Phase 6 mengimplementasikan sistem notifikasi yang komprehensif untuk SmartWealth, termasuk in-app notifications, smart alerts, dan scheduled reminders. Notifikasi ditempatkan di header (bell icon) sesuai permintaan user, bukan di sidebar.

## Fitur yang Diimplementasikan

### 1. In-App Notifications
- **Notification Bell**: Icon bell di header dengan badge unread count
- **Dropdown Notifications**: Panel dropdown dengan daftar notifikasi terbaru
- **Real-time Updates**: Polling setiap 30 detik untuk notifikasi baru
- **Toast Notifications**: Notifikasi popup untuk alert penting
- **Mark as Read**: Tandai notifikasi sebagai dibaca
- **Delete Notifications**: Hapus notifikasi yang tidak diperlukan

### 2. Smart Alerts
- **Unusual Spending Detection**: Deteksi pengeluaran yang tidak biasa (>200% dari rata-rata)
- **Spending Trends**: Analisis tren pengeluaran bulanan
- **Savings Opportunities**: Saran penghematan berdasarkan kategori pengeluaran
- **Income Patterns**: Analisis pola pemasukan
- **Budget Alerts**: Peringatan ketika budget hampir habis atau terlampaui

### 3. Scheduled Notifications
- **Daily Reminders**: Ringkasan transaksi kemarin atau pengingat mencatat
- **Weekly Summaries**: Ringkasan keuangan mingguan dengan analisis kategori
- **Monthly Reports**: Laporan keuangan bulanan lengkap
- **Goal Reminders**: Pengingat deadline tujuan keuangan
- **Budget Check**: Peringatan budget yang hampir habis

### 4. Transaction-based Notifications
- **New Transaction Alerts**: Notifikasi untuk setiap transaksi baru
- **Budget Impact**: Peringatan ketika transaksi mempengaruhi budget
- **Category Insights**: Analisis pengeluaran per kategori

### 5. Goal & Budget Notifications
- **Goal Progress**: Update progress tujuan keuangan
- **Goal Completion**: Notifikasi ketika tujuan tercapai
- **Budget Status**: Status budget dan peringatan
- **Budget Creation**: Notifikasi ketika budget baru dibuat

## Komponen yang Dibuat

### Backend Services
1. **NotificationService** (`backend/src/services/notificationService.ts`)
   - Manajemen notifikasi dasar
   - CRUD operations untuk notifikasi
   - Budget, goal, dan transaction alerts

2. **SmartAlertService** (`backend/src/services/smartAlertService.ts`)
   - Deteksi pola pengeluaran tidak biasa
   - Analisis tren keuangan
   - Saran penghematan

3. **ScheduledNotificationService** (`backend/src/services/scheduledNotificationService.ts`)
   - Daily, weekly, monthly summaries
   - Goal dan budget reminders
   - Smart insights scheduling

4. **EmailService** (`backend/src/services/emailService.ts`)
   - Email notifications (opsional)
   - HTML email templates
   - Budget dan goal email alerts

5. **PushNotificationService** (`backend/src/services/pushNotificationService.ts`)
   - Web push notifications (opsional)
   - VAPID key management
   - Push notification templates

### Frontend Components
1. **NotificationBell** (`frontend/src/components/layout/NotificationBell.tsx`)
   - Bell icon dengan badge
   - Dropdown notifications panel
   - Real-time updates

2. **useNotifications Hook** (`frontend/src/hooks/useNotifications.ts`)
   - Custom hook untuk manajemen notifikasi
   - Polling untuk updates
   - Toast notifications

3. **Notifications Page** (`frontend/src/pages/Notifications.tsx`)
   - Halaman notifikasi lengkap
   - Filter dan search
   - Bulk actions

### Controllers & Routes
1. **NotificationController** - CRUD operations untuk notifikasi
2. **ScheduledNotificationController** - Scheduled notifications
3. **Updated TransactionController** - Auto-notifications untuk transaksi baru
4. **Updated GoalController** - Goal progress notifications
5. **Updated BudgetController** - Budget alerts
6. **Updated RecurringTransactionController** - Recurring transaction alerts

## Database Schema

### Notification Model
```prisma
model Notification {
  id          String   @id @default(cuid())
  title       String
  message     String
  type        String   // "info", "warning", "success", "error", "budget_alert", "goal_reminder", "recurring_due"
  isRead      Boolean  @default(false)
  priority    String   @default("medium") // "low", "medium", "high", "urgent"
  scheduledAt DateTime?
  sentAt      DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  metadata    Json?    // Additional data like budgetId, goalId, etc.
}
```

## API Endpoints

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `POST /api/notifications/check` - Check and create notifications

### Scheduled Notifications
- `POST /api/scheduled-notifications/daily` - Run daily notifications
- `POST /api/scheduled-notifications/weekly` - Run weekly notifications
- `POST /api/scheduled-notifications/monthly` - Run monthly notifications
- `POST /api/scheduled-notifications/goals` - Run goal reminders
- `POST /api/scheduled-notifications/budgets` - Run budget reminders
- `POST /api/scheduled-notifications/smart-insights` - Run smart insights
- `POST /api/scheduled-notifications/all` - Run all scheduled notifications

## Jenis Notifikasi

### 1. System Notifications
- Transaksi baru (pemasukan/pengeluaran)
- Budget baru dibuat
- Tujuan baru dibuat
- Transaksi berulang dibuat

### 2. Budget Alerts
- Budget hampir habis (80-99%)
- Budget terlampaui (100%+)
- Update progress budget

### 3. Goal Reminders
- Progress tujuan (50%, 75%, 100%)
- Deadline mendekati (30 hari)
- Tujuan tercapai

### 4. Smart Alerts
- Pengeluaran tidak biasa
- Peningkatan/penurunan pengeluaran
- Peluang penghematan
- Pemasukan tinggi

### 5. Scheduled Reminders
- Daily summary
- Weekly summary
- Monthly summary
- Goal deadline reminders
- Budget check reminders

## Konfigurasi

### Environment Variables (Opsional)
```env
# Email Notifications
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Push Notifications
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

### Polling Configuration
- **Frontend Polling**: 30 detik untuk notifikasi baru
- **Scheduled Notifications**: Dapat dijalankan manual atau via cron job
- **Smart Alerts**: Berjalan otomatis saat transaksi baru

## Cara Penggunaan

### 1. Melihat Notifikasi
- Klik bell icon di header
- Lihat daftar notifikasi terbaru
- Tandai sebagai dibaca atau hapus

### 2. Halaman Notifikasi Lengkap
- Akses `/notifications`
- Filter berdasarkan tipe dan prioritas
- Search notifikasi
- Bulk actions (mark all as read)

### 3. Scheduled Notifications
- Jalankan manual via API endpoints
- Atau setup cron job untuk otomatis

### 4. Smart Alerts
- Berjalan otomatis saat transaksi baru
- Dapat dijalankan manual via API

## Testing

### Manual Testing
1. Buat transaksi baru → Cek notifikasi transaksi
2. Update goal progress → Cek notifikasi goal
3. Buat budget → Cek notifikasi budget
4. Jalankan scheduled notifications → Cek notifikasi scheduled

### API Testing
```bash
# Test notifications
curl -X GET http://localhost:3000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test scheduled notifications
curl -X POST http://localhost:3000/api/scheduled-notifications/daily \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Dependencies

### Backend
- `nodemailer` - Email notifications
- `web-push` - Push notifications
- `@types/nodemailer` - TypeScript types
- `@types/web-push` - TypeScript types

### Frontend
- `sonner` - Toast notifications (sudah ada)
- Custom hooks untuk notifikasi management

## Next Steps (Phase 7+)

### Phase 7: User Personalization & AI Recommendation
- Personalized notification preferences
- AI-based financial recommendations
- Smart budgeting suggestions
- Personalized dashboard

### Phase 8: Integrasi Eksternal
- Bank API integration
- Payment gateway integration
- Import data from external sources

### Phase 9: Mobile App (Flutter)
- Push notifications mobile
- Offline notifications
- Mobile-specific features

## Troubleshooting

### Common Issues
1. **Notifikasi tidak muncul**: Cek browser console, pastikan polling berjalan
2. **Backend error**: Cek server logs, pastikan database connection
3. **Email tidak terkirim**: Cek email credentials, pastikan SMTP settings
4. **Push notifications error**: Cek VAPID keys, pastikan service worker

### Debug Commands
```bash
# Check notification service
curl -X GET http://localhost:3000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test smart alerts
curl -X POST http://localhost:3000/api/scheduled-notifications/smart-insights \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Performance Considerations

### Optimization
- Polling interval: 30 detik (dapat disesuaikan)
- Notification limit: 10 di dropdown, 100 di halaman lengkap
- Database indexing pada userId dan createdAt
- Cleanup old notifications (30+ days)

### Scalability
- Redis untuk caching notifications
- Queue system untuk scheduled notifications
- WebSocket untuk real-time updates (future enhancement)

---

**Phase 6 selesai!** Sistem notifikasi yang komprehensif telah diimplementasikan dengan fitur in-app notifications, smart alerts, dan scheduled reminders. Notifikasi ditempatkan di header sesuai permintaan user dan terintegrasi dengan semua fitur aplikasi. 