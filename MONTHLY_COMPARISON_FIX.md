# Perbaikan Perbandingan Bulan di Perbandingan Kategori

## Masalah
Sebelumnya, komponen `MonthlyComparison` dan `CategoryStats` terpisah dan tidak saling terhubung. Ketika user memilih bulan untuk perbandingan di `MonthlyComparison`, data kategori tidak menampilkan perbandingan berdasarkan bulan yang dipilih.

## Solusi yang Diterapkan

### 1. Menambahkan State Management di Context
- Menambahkan `selectedMonths` dan `setSelectedMonths` ke `AppContext`
- State ini dibagikan antara komponen `MonthlyComparison` dan `CategoryStats`

### 2. Memodifikasi CategoryStats Component
- Menambahkan props `selectedMonths` untuk menerima bulan yang dipilih
- Menampilkan perbandingan kategori berdasarkan bulan yang dipilih
- Menambahkan breakdown per bulan untuk setiap kategori
- Menampilkan trend indicator ketika 2 bulan dipilih

### 3. Memodifikasi MonthlyComparison Component
- Menggunakan `selectedMonths` dari context
- Menginisialisasi bulan default ketika komponen pertama kali dimuat
- Memperbarui context ketika user memilih bulan

### 4. Memodifikasi Dashboard Component
- Menggunakan `selectedMonths` dari context
- Meneruskan `selectedMonths` ke `CategoryStats` component

## Fitur Baru yang Ditambahkan

### Di CategoryStats:
1. **Judul Dinamis**: Menampilkan bulan yang dipilih di judul komponen
2. **Breakdown Per Bulan**: Setiap kategori menampilkan data per bulan yang dipilih
3. **Trend Indicator**: Ketika 2 bulan dipilih, menampilkan perubahan (naik/turun) dengan persentase
4. **Filter Data**: Hanya menampilkan transaksi dari bulan yang dipilih

### Contoh Tampilan:
```
Statistik Kategori (Jan 2024 vs Feb 2024)

🍽️ Makanan & Minuman
   2 transaksi • 15.2%
   Rp 1,500,000
   Pengeluaran
   
   Jan 2024: Rp 800,000 (5 transaksi)
   Feb 2024: Rp 700,000 (3 transaksi)
   Trend: -Rp 100,000 (-12.5%)
```

## File yang Dimodifikasi:
1. `frontend/src/contexts/AppContext.tsx` - Menambahkan selectedMonths state
2. `frontend/src/components/dashboard/CategoryStats.tsx` - Menambahkan perbandingan bulan
3. `frontend/src/components/dashboard/MonthlyComparison.tsx` - Menggunakan context
4. `frontend/src/pages/Dashboard.tsx` - Meneruskan props

## Cara Kerja:
1. User memilih bulan di komponen `MonthlyComparison`
2. State `selectedMonths` di context diperbarui
3. `CategoryStats` menerima props `selectedMonths` yang baru
4. Komponen memfilter transaksi berdasarkan bulan yang dipilih
5. Menampilkan perbandingan kategori dengan breakdown per bulan

## Keuntungan:
- User dapat melihat perbandingan kategori berdasarkan bulan yang dipilih
- Data konsisten antara chart dan statistik kategori
- UX yang lebih baik dengan informasi yang terintegrasi
- Trend analysis otomatis untuk 2 bulan 