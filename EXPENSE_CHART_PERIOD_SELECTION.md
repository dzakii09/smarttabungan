# Fitur Pemilihan Periode Fleksibel - ExpenseChart

## Deskripsi
Fitur ini memungkinkan pengguna untuk memilih periode yang fleksibel untuk menampilkan data pengeluaran berdasarkan kategori pada chart. Pengguna dapat memilih dari opsi preset atau memilih bulan dan tahun secara custom.

## Fitur Utama

### 1. Pilihan Cepat (Preset Options)
- **Bulan Ini**: Menampilkan data bulan berjalan
- **Bulan Lalu**: Menampilkan data bulan sebelumnya
- **3 Bulan Lalu**: Menampilkan data 3 bulan yang lalu

### 2. Pemilihan Bulan & Tahun Custom
- Dropdown untuk memilih bulan (Jan-Des)
- Dropdown untuk memilih tahun (10 tahun terakhir)
- Tombol "Pilih" untuk mengkonfirmasi pilihan

### 3. Bulan Tersedia dari Transaksi
- Menampilkan daftar bulan yang memiliki data transaksi
- Maksimal 8 bulan terbaru ditampilkan
- Memudahkan akses ke data yang sudah ada

## Implementasi Teknis

### State Management
```typescript
const [selectedPeriod, setSelectedPeriod] = useState<string>('current');
const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
const [customMonth, setCustomMonth] = useState<string>('');
const [customYear, setCustomYear] = useState<string>(new Date().getFullYear().toString());
```

### Fungsi Utama

#### 1. getPeriodOptions()
Menghasilkan daftar opsi periode yang tersedia:
- Opsi preset (bulan ini, bulan lalu, 3 bulan lalu)
- Opsi custom untuk pemilihan bulan/tahun
- Daftar bulan yang memiliki data transaksi

#### 2. getSelectedMonth()
Mengkonversi pilihan periode menjadi format bulan (YYYY-MM):
- `current` → bulan berjalan
- `last` → bulan sebelumnya
- `threeMonthsAgo` → 3 bulan lalu
- `custom` → berdasarkan customMonth dan customYear
- Direct value → bulan langsung dari transaksi

#### 3. getComparisonMonth()
Menghitung bulan perbandingan (bulan sebelumnya dari bulan yang dipilih):
- Menggunakan logika Date untuk menghitung bulan sebelumnya
- Memastikan perbandingan yang akurat

### UI/UX Features

#### 1. Dropdown dengan Click Outside
- Menggunakan `useRef` dan `useEffect` untuk mendeteksi klik di luar dropdown
- Menutup dropdown secara otomatis ketika user mengklik di luar area

#### 2. Visual Feedback
- Indikator periode yang sedang dipilih
- Highlight pada opsi yang aktif
- Disabled state untuk tombol "Pilih" ketika input tidak lengkap

#### 3. Responsive Design
- Dropdown yang responsif dengan lebar yang sesuai
- Layout yang adaptif untuk berbagai ukuran layar

## Struktur Data

### PeriodOption Type
```typescript
type PeriodOption = {
  label: string;      // Label yang ditampilkan
  value: string;      // Value yang digunakan
  type: 'preset' | 'custom';  // Jenis opsi
};
```

### Chart Data Structure
```typescript
interface ChartDataItem {
  name: string;       // Nama kategori
  value: number;      // Total pengeluaran
  color: string;      // Warna kategori
}
```

## Integrasi dengan Komponen Lain

### 1. AppContext
- Menggunakan `transactions` dan `categories` dari context
- Memanfaatkan data yang sudah ada untuk menghitung chart

### 2. Comparison Feature
- Perbandingan otomatis dengan bulan sebelumnya
- Chart bar untuk visualisasi perbandingan
- Detail cards dengan trend indicators

### 3. Sample Data
- Menampilkan data contoh ketika tidak ada transaksi
- Memastikan chart tetap terlihat menarik

## Cara Penggunaan

### 1. Memilih Periode Preset
1. Klik dropdown periode
2. Pilih salah satu opsi: "Bulan Ini", "Bulan Lalu", atau "3 Bulan Lalu"
3. Chart akan otomatis update

### 2. Memilih Bulan & Tahun Custom
1. Klik dropdown periode
2. Pilih bulan dari dropdown "Bulan"
3. Pilih tahun dari dropdown "Tahun"
4. Klik tombol "Pilih"
5. Chart akan update sesuai pilihan

### 3. Memilih dari Bulan Tersedia
1. Klik dropdown periode
2. Scroll ke bagian "Bulan Tersedia"
3. Pilih bulan yang memiliki data transaksi
4. Chart akan update dengan data bulan tersebut

## Keunggulan Fitur

### 1. Fleksibilitas
- Berbagai cara untuk memilih periode
- Mendukung data historis dan real-time

### 2. User Experience
- Interface yang intuitif
- Feedback visual yang jelas
- Responsif dan mudah digunakan

### 3. Performa
- Perhitungan yang efisien
- Caching data yang sudah dihitung
- Update yang smooth

### 4. Integrasi
- Terintegrasi dengan sistem perbandingan
- Mendukung fitur AI insights
- Konsisten dengan design system

## Testing

### Test Cases
1. **Preset Selection**: Memastikan opsi preset berfungsi dengan benar
2. **Custom Selection**: Memastikan pemilihan custom bulan/tahun berfungsi
3. **Available Months**: Memastikan daftar bulan tersedia akurat
4. **Click Outside**: Memastikan dropdown menutup ketika klik di luar
5. **Data Update**: Memastikan chart update sesuai pilihan periode
6. **Comparison**: Memastikan perbandingan berfungsi dengan periode yang dipilih

### Edge Cases
- Tidak ada data transaksi
- Periode yang dipilih tidak memiliki data
- Pemilihan bulan/tahun yang tidak valid
- Responsivitas pada layar kecil

## Maintenance

### Regular Tasks
- Monitor performa perhitungan data
- Update daftar tahun yang tersedia
- Optimasi query untuk data besar
- Review dan update UI/UX berdasarkan feedback

### Future Enhancements
- Tambahan opsi periode (6 bulan lalu, tahun lalu)
- Filter berdasarkan kategori
- Export data berdasarkan periode
- Integrasi dengan calendar picker 