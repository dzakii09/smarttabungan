# Group Budget Enhancement - Smart Period Management

## Fitur Baru yang Diimplementasikan

### 1. Perhitungan Target Otomatis
- **Target per Periode**: Sistem otomatis menghitung target yang harus dikumpulkan per periode
- **Formula**: `Total Budget ÷ Jumlah Periode`
- **Contoh**: Budget 1.000.000 untuk 3 bulan = 333.333 per bulan

### 2. Perhitungan Tanggal Otomatis
- **Start Date**: Default ke hari ini
- **End Date**: Dihitung otomatis berdasarkan:
  - **Daily**: Start Date + (Duration - 1) hari
  - **Weekly**: Start Date + (Duration × 7 - 1) hari  
  - **Monthly**: Start Date + Duration bulan (akhir bulan)

### 3. Status Periode Cerdas
- **Aktif**: Periode masih berjalan
- **Hampir Berakhir**: ≤ 3 hari tersisa (warna orange)
- **Berakhir**: Periode sudah selesai (warna merah)

### 4. Notifikasi Transaksi Terlambat
- **Deteksi Otomatis**: Sistem mengecek apakah tanggal transaksi melewati end date periode
- **Warning**: Menampilkan pesan berapa hari terlambat
- **Notifikasi**: Mengirim notifikasi ke user jika terlambat
- **Tetap Bisa Input**: Transaksi terlambat tetap bisa ditambahkan

### 5. UI/UX Improvements
- **Target Display**: Menampilkan target per periode dengan jelas
- **Status Badge**: Badge warna untuk status periode
- **Progress Bar**: Visual progress pengeluaran per periode
- **Modal Warning**: Warning di modal transaksi jika periode hampir berakhir

## Cara Kerja

### 1. Membuat Group Budget
```typescript
// Form data
{
  name: "Tabungan Liburan",
  amount: 1000000,
  period: "monthly", // daily/weekly/monthly
  duration: 3, // 3 bulan
  startDate: "2024-01-01" // otomatis hari ini
}

// Sistem menghitung:
// - Target per bulan: 1.000.000 ÷ 3 = 333.333
// - End date: 2024-03-31 (akhir bulan ke-3)
// - 3 periode: Jan, Feb, Mar
```

### 2. Menambah Transaksi
```typescript
// User input transaksi
{
  periodId: "period-1",
  amount: 100000,
  description: "Makan siang",
  date: "2024-01-15" // Tanggal transaksi
}

// Sistem mengecek:
// - Periode 1 end date: 2024-01-31
// - Transaksi date: 2024-01-15
// - Status: Tidak terlambat ✅
```

### 3. Transaksi Terlambat
```typescript
// User input transaksi terlambat
{
  periodId: "period-1", 
  amount: 50000,
  description: "Snack",
  date: "2024-02-05" // Setelah periode berakhir
}

// Sistem mengecek:
// - Periode 1 end date: 2024-01-31
// - Transaksi date: 2024-02-05
// - Status: Terlambat 5 hari ⚠️
// - Warning: "Transaksi terlambat 5 hari"
```

## Database Schema

### GroupBudgetPeriod
```sql
CREATE TABLE GroupBudgetPeriod (
  id STRING PRIMARY KEY,
  periodNumber INT, -- 1, 2, 3, dst
  startDate DATETIME,
  endDate DATETIME,
  budget DECIMAL, -- Target per periode
  spent DECIMAL DEFAULT 0,
  groupBudgetId STRING,
  createdAt DATETIME,
  updatedAt DATETIME
);
```

### GroupBudgetTransaction
```sql
CREATE TABLE GroupBudgetTransaction (
  id STRING PRIMARY KEY,
  amount DECIMAL,
  description STRING,
  type STRING, -- 'income' | 'expense'
  date DATETIME, -- Tanggal transaksi
  periodId STRING,
  groupBudgetId STRING,
  createdBy STRING,
  createdAt DATETIME,
  updatedAt DATETIME
);
```

## API Endpoints

### 1. Create Group Budget
```http
POST /api/group-budgets
{
  "name": "Tabungan Liburan",
  "amount": 1000000,
  "period": "monthly",
  "duration": 3,
  "startDate": "2024-01-01"
}
```

### 2. Add Transaction
```http
POST /api/group-budgets/{id}/transactions
{
  "periodId": "period-1",
  "amount": 100000,
  "description": "Makan siang",
  "type": "expense",
  "date": "2024-01-15"
}

// Response
{
  "message": "Transaction added successfully",
  "transaction": { ... },
  "isLate": false,
  "warning": null
}
```

### 3. Get Periods
```http
GET /api/group-budgets/{id}/periods

// Response
[
  {
    "id": "period-1",
    "periodNumber": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-01-31", 
    "budget": 333333,
    "spent": 150000,
    "transactions": [...]
  }
]
```

## Frontend Components

### 1. GroupBudgets.tsx
- Form create dengan perhitungan otomatis
- Display target per periode
- Auto-calculated end date

### 2. GroupBudgetDetail.tsx  
- Status badge untuk setiap periode
- Progress bar visual
- Warning modal untuk transaksi terlambat
- Period status (Aktif/Hampir Berakhir/Berakhir)

## Notifikasi System

### 1. Late Transaction Notification
```typescript
// Backend mengirim notifikasi
await sendNotification({
  userId,
  title: '⚠️ Transaksi Terlambat',
  message: `Transaksi "${description}" untuk periode ${periodNumber} terlambat ${daysLate} hari`,
  type: 'budget_late_transaction',
  metadata: {
    groupBudgetId,
    periodId,
    transactionId,
    daysLate
  }
})
```

### 2. Frontend Warning
```typescript
// Frontend menampilkan alert
if (response.isLate) {
  alert(`⚠️ Transaksi terlambat!\n\n${response.warning}\n\nTransaksi tetap berhasil ditambahkan.`)
}
```

## Keuntungan Fitur

### 1. User Experience
- **Mudah**: Tidak perlu hitung manual target per periode
- **Jelas**: Visual progress dan status periode
- **Fleksibel**: Tetap bisa input transaksi terlambat
- **Informative**: Warning dan notifikasi yang jelas

### 2. Business Logic
- **Akurat**: Perhitungan otomatis mengurangi kesalahan
- **Konsisten**: Format periode yang seragam
- **Trackable**: Progress tracking per periode
- **Compliant**: Tetap bisa input terlambat dengan warning

### 3. Technical Benefits
- **Scalable**: Schema yang mendukung multiple periods
- **Maintainable**: Logic terpisah dan reusable
- **Extensible**: Mudah ditambah fitur baru
- **Robust**: Error handling yang baik

## Testing

### 1. Test Cases
- ✅ Create budget dengan periode berbeda
- ✅ Hitung target otomatis
- ✅ Transaksi tepat waktu
- ✅ Transaksi terlambat dengan warning
- ✅ Status periode (Aktif/Hampir Berakhir/Berakhir)
- ✅ Progress bar visual
- ✅ Notifikasi terlambat

### 2. Edge Cases
- ✅ Periode 0 hari
- ✅ Transaksi sebelum periode dimulai
- ✅ Transaksi setelah periode berakhir
- ✅ Multiple transaksi terlambat
- ✅ Periode dengan 0 transaksi

## Future Enhancements

### 1. Planned Features
- **Auto-reminder**: Notifikasi otomatis sebelum periode berakhir
- **Budget adjustment**: Ubah target per periode
- **Period extension**: Perpanjang periode jika perlu
- **Bulk transactions**: Input multiple transaksi sekaligus

### 2. Analytics
- **Spending patterns**: Analisis pola pengeluaran
- **Late transaction trends**: Statistik keterlambatan
- **Period performance**: Perbandingan antar periode
- **Member contribution**: Kontribusi per member

### 3. Mobile Features
- **Push notifications**: Notifikasi real-time
- **Offline support**: Sync ketika online
- **Quick add**: Input transaksi cepat
- **Voice input**: Input dengan suara

## Conclusion

Fitur enhancement ini membuat Group Budget lebih cerdas dan user-friendly dengan:
- Perhitungan otomatis yang akurat
- Visual feedback yang jelas
- Fleksibilitas input transaksi
- Warning system yang informatif

Sistem ini mendukung berbagai skenario penggunaan dari budget harian hingga bulanan dengan tetap memberikan kontrol penuh kepada user. 