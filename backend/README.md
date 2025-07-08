# Smart Tabungan Backend

Backend API untuk aplikasi Smart Tabungan menggunakan Node.js, Express, TypeScript, dan PostgreSQL dengan Prisma ORM.

## Setup

### Prerequisites
- Node.js (v16 atau lebih baru)
- PostgreSQL
- pgAdmin4 (untuk mengelola database)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup Database**
   - Buka pgAdmin4
   - Buat database baru dengan nama: `smarttabungan`
   - Pastikan PostgreSQL berjalan di port 5432

3. **Konfigurasi Environment**
   - Edit file `.env`
   - Pastikan `DATABASE_URL` sudah benar:
     ```
     DATABASE_URL="postgresql://postgres:smartwealth@localhost:5432/smarttabungan?schema=public"
     JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
     ```

4. **Migrasi Database**
   ```bash
   npx prisma migrate dev
   ```

5. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

Server akan berjalan di `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user

### Transactions
- `GET /api/transactions` - Ambil semua transaksi user
- `POST /api/transactions` - Buat transaksi baru
- `GET /api/transactions/:id` - Ambil transaksi berdasarkan ID
- `PUT /api/transactions/:id` - Update transaksi
- `DELETE /api/transactions/:id` - Hapus transaksi
- `GET /api/transactions/stats` - Ambil statistik transaksi

### Goals
- `GET /api/goals` - Ambil semua goals user
- `POST /api/goals` - Buat goal baru
- `GET /api/goals/:id` - Ambil goal berdasarkan ID
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Hapus goal
- `PATCH /api/goals/:id/progress` - Update progress goal

### Health Check
- `GET /api/health` - Cek status server

## Database Schema

### Users
- id (String, Primary Key)
- email (String, Unique)
- password (String, Hashed)
- name (String)
- createdAt (DateTime)
- updatedAt (DateTime)

### Categories
- id (String, Primary Key)
- name (String)
- type (String) - "income" atau "expense"
- icon (String, Optional)
- color (String, Optional)
- createdAt (DateTime)
- updatedAt (DateTime)

### Transactions
- id (String, Primary Key)
- amount (Float)
- description (String)
- type (String) - "income" atau "expense"
- date (DateTime)
- userId (String, Foreign Key)
- categoryId (String, Foreign Key, Optional)
- createdAt (DateTime)
- updatedAt (DateTime)

### Goals
- id (String, Primary Key)
- title (String)
- description (String, Optional)
- targetAmount (Float)
- currentAmount (Float)
- targetDate (DateTime, Optional)
- isCompleted (Boolean)
- userId (String, Foreign Key)
- createdAt (DateTime)
- updatedAt (DateTime)

## Authentication

Semua endpoint kecuali `/api/auth/*` dan `/api/health` memerlukan autentikasi JWT.

Header yang diperlukan:
```
Authorization: Bearer <token>
```

## Error Handling

API mengembalikan response dengan format:
```json
{
  "message": "Error description"
}
```

Status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error 