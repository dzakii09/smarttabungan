# Panduan Gambar untuk Paper SmartTabungan

## Gambar yang Diperlukan untuk Paper

### 1. Gambar 1: Alur Metodologi Penelitian (R&D dengan Model Waterfall)
**Deskripsi:** Diagram alur yang menunjukkan tahapan pengembangan sistem
**Konten:**
- Research (Analisis Kebutuhan)
- Design (Perancangan Sistem) 
- Development (Implementasi)
- Testing (Pengujian)
- Maintenance (Pemeliharaan)

**Format:** Flowchart dengan panah yang menunjukkan alur dari atas ke bawah

### 2. Gambar 2: Arsitektur Sistem SmartTabungan
**Deskripsi:** Diagram arsitektur sistem yang menunjukkan komponen-komponen utama
**Konten:**
- Frontend Layer (ReactJS + TypeScript)
- Backend Layer (Node.js + Express + TypeScript)
- Database Layer (PostgreSQL + Prisma)
- AI Service Layer (GROQ AI API)
- External Services Layer (Bank APIs, Payment Gateway)

**Format:** Layered architecture diagram

### 3. Gambar 3: Database Schema (ERD)
**Deskripsi:** Entity Relationship Diagram yang menunjukkan struktur database
**Konten:**
- User, Transaction, Category, Budget, Goal
- GroupBudget, GroupBudgetMember, GroupBudgetInvitation
- ChatMessage, Notification, PaymentTransaction
- Relasi antar entitas dengan cardinality

**Format:** ERD dengan entity boxes dan relationship lines

### 4. Gambar 4: Dashboard Utama SmartTabungan
**Deskripsi:** Screenshot dashboard utama aplikasi
**Konten:**
- Financial metrics cards (balance, income, expenses)
- Expense chart dengan visualisasi
- Recent transactions list
- Quick actions panel
- Goal progress indicators

**Format:** Screenshot aplikasi yang sedang berjalan

### 5. Gambar 5: AI Chatbot Interface
**Deskripsi:** Screenshot interface chatbot dengan contoh percakapan
**Konten:**
- Chat interface dengan bubble messages
- Contoh pertanyaan user tentang keuangan
- Respons AI chatbot dalam bahasa Indonesia
- Topic restriction warning (jika ada)
- Suggested topics panel

**Format:** Screenshot chat interface

### 6. Gambar 6: Topic Restriction Algorithm Flow
**Deskripsi:** Diagram alur algoritma pembatasan topik chatbot
**Konten:**
- Input message dari user
- Keyword matching dengan 100+ kata kunci keuangan
- Scoring algorithm
- Decision point (financial topic or not)
- Response generation atau warning

**Format:** Flowchart dengan decision diamonds

### 7. Gambar 7: Group Budgeting Feature
**Deskripsi:** Screenshot fitur anggaran kelompok
**Konten:**
- Group budget creation interface
- Member invitation system
- Budget tracking dengan multiple users
- Period confirmation interface
- Group transaction history

**Format:** Screenshot aplikasi

### 8. Gambar 8: Analytics Dashboard
**Deskripsi:** Screenshot halaman analitik dengan berbagai chart
**Konten:**
- Monthly comparison charts
- Category breakdown pie chart
- Spending trends line chart
- Financial insights panel
- Export options

**Format:** Screenshot halaman analytics

### 9. Gambar 9: Security Features Implementation
**Deskripsi:** Diagram yang menunjukkan fitur keamanan
**Konten:**
- JWT Authentication flow
- Two-factor authentication process
- Password hashing dengan bcrypt
- Rate limiting mechanism
- Input validation layers

**Format:** Security architecture diagram

### 10. Gambar 10: API Endpoints Structure
**Deskripsi:** Diagram yang menunjukkan struktur API endpoints
**Konten:**
- Authentication endpoints (/api/auth/*)
- Transaction endpoints (/api/transactions/*)
- Budget endpoints (/api/budgets/*)
- AI endpoints (/api/ai/*)
- External service endpoints (/api/external/*)

**Format:** API structure diagram dengan endpoint grouping

## Tips Pengambilan Screenshot

### Untuk Dashboard dan Interface:
1. **Gunakan data yang realistis** - Jangan gunakan data dummy yang terlalu jelas
2. **Ambil dalam resolusi tinggi** - Minimal 1920x1080 untuk kualitas yang baik
3. **Pilih waktu yang tepat** - Pastikan semua komponen terlihat jelas
4. **Hilangkan informasi sensitif** - Blur atau hapus data pribadi jika ada

### Untuk Diagram Arsitektur:
1. **Gunakan tool yang profesional** - Draw.io, Lucidchart, atau Visio
2. **Konsisten dalam styling** - Warna, font, dan style yang seragam
3. **Jelaskan dengan legend** - Tambahkan keterangan untuk simbol-simbol
4. **Fokus pada detail penting** - Jangan terlalu kompleks

### Untuk ERD:
1. **Tunjukkan relasi yang jelas** - Gunakan simbol cardinality yang standar
2. **Kelompokkan entitas yang berhubungan** - Atur layout yang logis
3. **Tampilkan atribut penting** - Primary key, foreign key, dan field utama
4. **Gunakan warna untuk membedakan** - Entity types dengan warna berbeda

## Format File yang Disarankan

- **Screenshot:** PNG atau JPG dengan resolusi tinggi
- **Diagram:** PNG dengan background transparan
- **Flowchart:** SVG atau PNG dengan resolusi tinggi
- **ERD:** PNG atau PDF untuk kualitas terbaik

## Caption untuk Setiap Gambar

### Gambar 1:
"Alur Metodologi Penelitian menggunakan pendekatan R&D dengan model Waterfall"

### Gambar 2:
"Arsitektur Sistem SmartTabungan dengan komponen Frontend, Backend, Database, dan AI Service"

### Gambar 3:
"Entity Relationship Diagram (ERD) database SmartTabungan dengan 15+ model dan relasi kompleks"

### Gambar 4:
"Dashboard Utama SmartTabungan dengan financial metrics, charts, dan quick actions"

### Gambar 5:
"Interface AI Chatbot dengan topic restriction dan respons dalam bahasa Indonesia"

### Gambar 6:
"Algoritma Pembatasan Topik Chatbot menggunakan 100+ kata kunci keuangan"

### Gambar 7:
"Fitur Anggaran Kelompok dengan sistem invitation dan tracking multi-user"

### Gambar 8:
"Dashboard Analitik dengan visualisasi data keuangan yang interaktif"

### Gambar 9:
"Implementasi Fitur Keamanan dengan JWT, 2FA, dan enkripsi data"

### Gambar 10:
"Struktur API Endpoints SmartTabungan dengan grouping berdasarkan fungsionalitas"

## Urutan Penempatan dalam Paper

1. **Gambar 1** - Setelah bagian 2. METODOLOGI
2. **Gambar 2** - Setelah bagian 2.2 Perancangan Sistem
3. **Gambar 3** - Setelah bagian 2.3 Implementasi
4. **Gambar 4** - Setelah bagian 3.1.1 Implementasi Sistem
5. **Gambar 5** - Setelah bagian 3.1.3 AI Chatbot
6. **Gambar 6** - Setelah bagian 3.3.1 Keunggulan Sistem
7. **Gambar 7** - Setelah bagian 3.1.2 Sistem Anggaran
8. **Gambar 8** - Setelah bagian 3.1.4 Dashboard dan Analitik
9. **Gambar 9** - Setelah bagian 3.1.5 Sistem Keamanan
10. **Gambar 10** - Setelah bagian 2.3 Implementasi (Backend)

## Catatan Penting

- **Konsistensi visual** - Gunakan style yang konsisten untuk semua diagram
- **Kualitas tinggi** - Pastikan semua gambar jelas dan mudah dibaca
- **Relevansi** - Setiap gambar harus mendukung poin dalam paper
- **Referensi** - Sebutkan setiap gambar dalam teks dengan format "Gambar X"
- **Caption informatif** - Berikan deskripsi yang jelas untuk setiap gambar 