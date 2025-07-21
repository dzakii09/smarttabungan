# Fitur Perbandingan Bulan Lalu di ExpenseChart

## Fitur Baru yang Ditambahkan

### 1. **Toggle Perbandingan**
- Tombol "Tampilkan/Sembunyikan Perbandingan" di header komponen
- User dapat mengaktifkan/menonaktifkan fitur perbandingan

### 2. **Perbandingan Otomatis**
- Membandingkan bulan saat ini dengan bulan lalu
- Menampilkan data dalam format bar chart
- Perbandingan detail untuk setiap kategori

### 3. **Visualisasi Data**
- **Bar Chart**: Menampilkan perbandingan bulan saat ini vs bulan lalu
- **Detail Cards**: Kartu detail untuk setiap kategori dengan:
  - Nilai bulan saat ini
  - Nilai bulan lalu
  - Perubahan absolut dan persentase
  - Indikator trend (naik/turun)

### 4. **Indikator Trend**
- Icon TrendingUp (merah) untuk pengeluaran yang naik
- Icon TrendingDown (hijau) untuk pengeluaran yang turun
- Persentase perubahan ditampilkan

## Contoh Tampilan

```
Pengeluaran Berdasarkan Kategori    [Tampilkan Perbandingan]

Perbandingan Jan 2024 vs Des 2023

[Bar Chart - Makanan & Minuman, Transportasi, dll]

┌─────────────────┬─────────────────┬─────────────────┐
│ Makanan & Min   │ Transportasi    │ Belanja         │
│ Sekarang: 2.5M  │ Sekarang: 1.5M  │ Sekarang: 1.0M  │
│ Lalu: 2.0M      │ Lalu: 1.8M      │ Lalu: 1.2M      │
│ Perubahan: +500K│ Perubahan: -300K│ Perubahan: -200K│
│ (+25%) ↗        │ (-16.7%) ↘      │ (-16.7%) ↘      │
└─────────────────┴─────────────────┴─────────────────┘
```

## File yang Dimodifikasi
- `frontend/src/components/dashboard/ExpenseChart.tsx`

## Keuntungan
- User dapat melihat tren pengeluaran per kategori
- Perbandingan visual yang mudah dipahami
- Insight tentang kategori mana yang naik/turun
- Data real-time berdasarkan transaksi user 