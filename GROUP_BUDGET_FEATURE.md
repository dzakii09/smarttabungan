# 🎯 Fitur Group Budget - SmartTabungan

## 📋 Overview

Fitur **Group Budget** memungkinkan user untuk membuat dan mengelola budget bersama dengan user lain. Fitur ini ideal untuk:
- **Keluarga** yang ingin mengatur keuangan bersama
- **Teman** yang berbagi pengeluaran
- **Tim** yang mengelola budget proyek
- **Komunitas** yang ingin menabung bersama

## ✨ Fitur Utama

### 1. **Budget Individu** (Sudah Ada)
- Budget pribadi untuk pengeluaran individual
- Tracking pengeluaran per kategori
- Progress monitoring

### 2. **Budget Group** (Baru)
- Budget bersama dengan multiple user
- Pencarian dan undangan user
- Notifikasi real-time
- Progress tracking bersama
- Pilihan frekuensi: Harian/Mingguan/Bulanan

## 🏗️ Arsitektur Database

### Model Baru yang Ditambahkan:

#### `GroupBudget`
```sql
- id: String (Primary Key)
- name: String
- description: String?
- amount: Float
- spent: Float (default: 0)
- period: String (daily/weekly/monthly)
- startDate: DateTime
- endDate: DateTime
- isActive: Boolean
- createdBy: String (Foreign Key ke User)
- categoryId: String? (Foreign Key ke Category)
```

#### `GroupBudgetMember`
```sql
- id: String (Primary Key)
- role: String (owner/admin/member)
- joinedAt: DateTime
- groupBudgetId: String (Foreign Key)
- userId: String (Foreign Key ke User)
```

#### `GroupBudgetInvitation`
```sql
- id: String (Primary Key)
- email: String
- status: String (pending/accepted/declined)
- invitedAt: DateTime
- respondedAt: DateTime?
- groupBudgetId: String (Foreign Key)
- invitedBy: String (Foreign Key ke User)
```

## 🔧 Backend API

### Endpoints yang Tersedia:

#### Group Budget CRUD
- `POST /api/group-budgets` - Buat group budget baru
- `GET /api/group-budgets` - Ambil semua group budget user
- `GET /api/group-budgets/:id` - Ambil detail group budget
- `PUT /api/group-budgets/:id` - Update group budget
- `DELETE /api/group-budgets/:id` - Hapus group budget

#### User Management
- `GET /api/group-budgets/search/users` - Cari user untuk diundang
- `POST /api/group-budgets/:id/invite` - Undang user ke group budget

#### Invitation Management
- `GET /api/group-budgets/invitations/user` - Ambil undangan user
- `POST /api/group-budgets/invitations/:id/accept` - Terima undangan
- `POST /api/group-budgets/invitations/:id/decline` - Tolak undangan

## 🎨 Frontend Components

### 1. **GroupBudgets.tsx** - Halaman Utama
- Daftar semua group budget
- Create/Edit/Delete group budget
- Search dan filter
- Progress tracking visual

### 2. **GroupBudgetInvitations.tsx** - Component Undangan
- Tampilkan undangan pending
- Accept/Decline undangan
- Real-time updates

### 3. **NotificationBell.tsx** - Update Notification
- Tab untuk notifications biasa
- Tab untuk group budget invitations
- Real-time notification

## 🚀 Cara Menggunakan

### 1. **Membuat Group Budget**
1. Klik menu "Group Budget" di sidebar
2. Klik tombol "Create Group Budget"
3. Isi form:
   - **Name**: Nama budget group
   - **Description**: Deskripsi (opsional)
   - **Amount**: Jumlah target budget
   - **Period**: Frekuensi (Daily/Weekly/Monthly)
   - **Start Date**: Tanggal mulai
   - **End Date**: Tanggal berakhir
   - **Category**: Kategori budget (opsional)
4. Klik "Create"

### 2. **Mengundang User**
1. Di halaman group budget, klik icon "Users"
2. Search user berdasarkan nama atau email
3. Pilih user dari hasil search
4. Klik "Send Invitation"

### 3. **Menerima Undangan**
1. User yang diundang akan menerima notifikasi
2. Klik icon bell di header
3. Pilih tab "Invitations"
4. Klik "Accept" atau "Decline"

### 4. **Monitoring Progress**
- Progress bar visual
- Jumlah spent vs target
- Daftar member dan kontribusi
- Notifikasi ketika budget hampir habis

## 🔔 Notifikasi System

### Jenis Notifikasi:
1. **Budget Invitation** - Ketika diundang ke group budget
2. **Budget Alert** - Ketika budget hampir habis
3. **Member Joined** - Ketika member baru bergabung
4. **Budget Completed** - Ketika target budget tercapai

## 📊 Fitur Tambahan

### 1. **Role Management**
- **Owner**: Dapat edit/delete budget, undang user
- **Admin**: Dapat edit budget, undang user
- **Member**: Hanya dapat lihat dan update progress

### 2. **Progress Tracking**
- Visual progress bar
- Percentage completion
- Color coding (Green/Yellow/Red)
- Real-time updates

### 3. **Search & Filter**
- Search budget berdasarkan nama/deskripsi
- Filter berdasarkan periode
- Filter berdasarkan status

## 🛡️ Security Features

### 1. **Authentication**
- Semua endpoint memerlukan JWT token
- User hanya bisa akses budget yang mereka buat atau ikuti

### 2. **Authorization**
- Owner hanya bisa edit/delete budget mereka
- Member hanya bisa lihat dan update progress
- Invitation hanya bisa dikirim oleh owner/admin

### 3. **Data Validation**
- Validasi input form
- Sanitasi data
- Rate limiting untuk search

## 🔧 Setup & Installation

### 1. **Database Migration**
```bash
cd backend
npx prisma migrate dev --name add_group_budget
```

### 2. **Generate Prisma Client**
```bash
npx prisma generate
```

### 3. **Start Servers**
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

## 📱 UI/UX Features

### 1. **Responsive Design**
- Mobile-friendly interface
- Tablet optimization
- Desktop experience

### 2. **Modern UI**
- Clean dan minimal design
- Smooth animations
- Intuitive navigation

### 3. **Real-time Updates**
- Live progress updates
- Instant notification
- Auto-refresh data

## 🎯 Use Cases

### 1. **Keluarga**
- Budget bulanan keluarga
- Pengeluaran anak-anak
- Tabungan bersama

### 2. **Teman**
- Budget liburan bersama
- Pengeluaran kost
- Hobi bersama

### 3. **Tim/Organisasi**
- Budget proyek
- Event planning
- Komunitas

## 🔮 Future Enhancements

### 1. **Advanced Features**
- Split expenses
- Payment integration
- Export reports
- Mobile app

### 2. **AI Integration**
- Smart budget recommendations
- Spending pattern analysis
- Automated alerts

### 3. **Social Features**
- Comments/discussion
- Photo sharing
- Achievement badges

## 🐛 Troubleshooting

### Common Issues:
1. **Migration Error**: Pastikan database connection benar
2. **API Error**: Cek JWT token dan authentication
3. **UI Not Loading**: Cek network connection dan API endpoints

### Debug Steps:
1. Check browser console untuk error
2. Check backend logs
3. Verify database connection
4. Test API endpoints dengan Postman

## 📞 Support

Untuk bantuan teknis atau bug report, silakan:
1. Check documentation ini
2. Review error logs
3. Test dengan data minimal
4. Contact development team

---

**🎉 Fitur Group Budget siap digunakan!** 

User sekarang dapat membuat budget bersama, mengundang teman, dan menabung bersama dengan mudah dan aman. 