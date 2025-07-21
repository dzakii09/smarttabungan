# Fitur Analytics SmartTabungan

## Deskripsi
Fitur Analytics memberikan analisis mendalam tentang pola keuangan pengguna dengan visualisasi data yang interaktif dan insights berbasis AI.

## Fitur Utama

### 1. Dashboard Analytics
- **Ringkasan Keuangan**: Total pengeluaran, pemasukan, tabungan, dan rasio tabungan
- **Perbandingan Bulanan**: Chart perbandingan pengeluaran bulan ini vs bulan lalu
- **Distribusi Kategori**: Pie chart untuk melihat distribusi pengeluaran per kategori
- **Tren Pengeluaran**: Area chart untuk melihat tren pengeluaran harian

### 2. Navigasi Chart
- **Ringkasan**: Overview semua metrik penting
- **Tren Pengeluaran**: Analisis tren pengeluaran harian
- **Kategori**: Breakdown pengeluaran per kategori
- **Pemasukan vs Pengeluaran**: Perbandingan pemasukan dan pengeluaran
- **Tren Tabungan**: Analisis rasio tabungan bulanan

### 3. Filter Periode
- **3 Bulan Terakhir**: Data 3 bulan terakhir
- **6 Bulan Terakhir**: Data 6 bulan terakhir (default)
- **12 Bulan Terakhir**: Data 12 bulan terakhir
- **Tahun Ini**: Data dari awal tahun

### 4. AI Insights
- **Analisis Otomatis**: AI menganalisis pola keuangan
- **Rekomendasi**: Saran untuk optimasi keuangan
- **Prediksi**: Estimasi pengeluaran dan tabungan
- **Insights Kategori**: Analisis mendalam per kategori

### 5. Metrik Keuangan
- **Total Pengeluaran**: Jumlah pengeluaran periode tertentu
- **Total Tabungan**: Jumlah tabungan periode tertentu
- **Rasio Tabungan**: Persentase tabungan dari pemasukan
- **Kategori Terbesar**: Kategori dengan pengeluaran tertinggi

## Komponen Frontend

### 1. Halaman Analytics (`frontend/src/pages/Analytics.tsx`)
- Halaman utama analytics dengan semua chart dan metrik
- Navigasi antar chart yang fleksibel
- Filter periode yang dinamis
- Toggle view sederhana/detail

### 2. Komponen Analytics
- **SpendingInsights**: Komponen untuk menampilkan AI insights
- **FinancialMetrics**: Komponen untuk metrik keuangan
- **ComparisonChart**: Komponen chart perbandingan

### 3. Service Analytics (`frontend/src/services/analyticsService.ts`)
- API calls untuk data analytics
- Interface TypeScript untuk type safety
- Error handling dan response formatting

## Backend API

### 1. Controller Analytics (`backend/src/controllers/analyticsController.ts`)

#### `getAnalyticsOverview`
- **Endpoint**: `GET /api/analytics/overview`
- **Query Parameters**: `period` (3months, 6months, 12months, year)
- **Response**: Data ringkasan, breakdown kategori, data bulanan, AI insights

#### `getSpendingTrends`
- **Endpoint**: `GET /api/analytics/trends`
- **Query Parameters**: `days` (jumlah hari)
- **Response**: Data tren pengeluaran harian

#### `getCategoryAnalysis`
- **Endpoint**: `GET /api/analytics/categories`
- **Query Parameters**: `period` (periode analisis)
- **Response**: Analisis kategori dengan trend

#### `getSavingsAnalysis`
- **Endpoint**: `GET /api/analytics/savings`
- **Query Parameters**: `months` (jumlah bulan)
- **Response**: Analisis tabungan bulanan

### 2. Route Analytics (`backend/src/routes/analytics.ts`)
- Semua endpoint memerlukan autentikasi
- Middleware auth untuk keamanan
- Error handling terpusat

## Integrasi AI

### 1. Groq AI Integration
- **Model**: llama3-8b-8192
- **Fitur**: Generate insights otomatis
- **Input**: Data keuangan pengguna
- **Output**: Insights dalam format JSON

### 2. AI Insights Types
- **Positive**: Insight positif tentang pola keuangan
- **Negative**: Peringatan tentang masalah keuangan
- **Warning**: Alert untuk perhatian khusus
- **Suggestion**: Rekomendasi untuk perbaikan

## Chart Types

### 1. Bar Chart
- Perbandingan pengeluaran bulanan
- Perbandingan pemasukan vs pengeluaran
- Analisis kategori

### 2. Line Chart
- Tren pengeluaran harian
- Tren rasio tabungan
- Prediksi keuangan

### 3. Area Chart
- Tren pengeluaran dengan budget
- Visualisasi pemasukan vs pengeluaran

### 4. Pie Chart
- Distribusi kategori pengeluaran
- Breakdown sumber pemasukan

## Data Processing

### 1. Aggregation
- Grouping transaksi per periode
- Kalkulasi total dan rata-rata
- Perhitungan persentase dan rasio

### 2. Trend Analysis
- Perbandingan periode
- Kalkulasi perubahan persentase
- Identifikasi pola

### 3. Category Analysis
- Breakdown per kategori
- Trend per kategori
- Ranking kategori

## UI/UX Features

### 1. Responsive Design
- Mobile-first approach
- Grid layout yang fleksibel
- Chart yang responsive

### 2. Interactive Elements
- Hover effects pada chart
- Tooltip dengan detail data
- Filter yang mudah digunakan

### 3. Loading States
- Skeleton loading untuk chart
- Progress indicators
- Error handling yang user-friendly

### 4. Export Functionality
- Export data analytics
- Download chart sebagai gambar
- Share insights

## Security

### 1. Authentication
- Semua endpoint memerlukan JWT token
- User-specific data filtering
- Session management

### 2. Data Privacy
- Data hanya diakses oleh user yang bersangkutan
- No data sharing antar user
- Secure API communication

## Performance

### 1. Optimization
- Lazy loading untuk chart
- Caching data analytics
- Efficient database queries

### 2. Scalability
- Pagination untuk data besar
- Efficient aggregation queries
- Optimized chart rendering

## Error Handling

### 1. Frontend
- Graceful error display
- Retry mechanisms
- Fallback data

### 2. Backend
- Comprehensive error logging
- User-friendly error messages
- Database connection handling

## Testing

### 1. Unit Tests
- Service layer testing
- Component testing
- API endpoint testing

### 2. Integration Tests
- End-to-end analytics flow
- Data accuracy validation
- Performance testing

## Deployment

### 1. Environment Variables
- `GROQ_API_KEY`: API key untuk Groq AI
- Database connection settings
- Server configuration

### 2. Dependencies
- Recharts untuk chart rendering
- Groq SDK untuk AI integration
- Prisma untuk database queries

## Monitoring

### 1. Analytics Usage
- Track chart interactions
- Monitor API performance
- User engagement metrics

### 2. Error Tracking
- Log analytics errors
- Monitor AI service availability
- Performance bottlenecks

## Future Enhancements

### 1. Advanced Analytics
- Predictive analytics
- Machine learning insights
- Custom report generation

### 2. Integration
- Bank account integration
- Real-time data sync
- Third-party financial tools

### 3. Personalization
- Custom dashboard layouts
- Personalized insights
- Goal-based analytics

## Troubleshooting

### 1. Common Issues
- Chart not loading: Check API connectivity
- AI insights missing: Verify Groq API key
- Data not updating: Check database connection

### 2. Debug Steps
- Check browser console for errors
- Verify API endpoints
- Test database queries
- Monitor AI service status

## Support

Untuk bantuan teknis atau pertanyaan tentang fitur Analytics, silakan hubungi tim development atau buat issue di repository. 