# AI Integration Guide - SmartTabungan 🤖

## Overview
SmartTabungan menggunakan Google Gemini AI untuk memberikan pengalaman yang lebih cerdas dan personal dalam manajemen keuangan. Fitur AI ini memberikan insight, rekomendasi, dan bantuan yang disesuaikan dengan data keuangan pengguna.

## Cara Menggunakan API Key Gemini

### 1. Dapatkan API Key Gemini
1. Kunjungi [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Login dengan akun Google Anda
3. Klik "Create API Key"
4. Salin API key yang dihasilkan

### 2. Konfigurasi Environment Variables
Buat file `.env` di folder `backend/` dengan konfigurasi berikut:

```env
# AI Configuration
GEMINI_API_KEY="your-gemini-api-key-here"

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/smarttabungan"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"

# Email Configuration (untuk notifikasi)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Restart Server
Setelah menambahkan API key, restart server backend:

```bash
cd backend
npm run dev
```

## Fitur AI yang Tersedia

### 1. 🤖 Smart Chatbot
**Lokasi**: `/chatbot`
**Fitur**:
- Percakapan natural language dalam bahasa Indonesia
- Jawaban kontekstual berdasarkan data keuangan pengguna
- Saran follow-up yang relevan
- Insight keuangan personal

**Contoh Pertanyaan**:
- "Bagaimana cara membuat budget yang efektif?"
- "Tips menabung untuk pemula"
- "Investasi apa yang cocok untuk saya?"
- "Analisis pengeluaran bulanan saya"

### 2. 💡 AI Recommendations
**Lokasi**: `/ai-recommendations`
**Fitur**:
- Rekomendasi personal berdasarkan pola keuangan
- Saran budget yang optimal
- Tips penghematan yang actionable
- Rekomendasi investasi sesuai profil risiko

**Jenis Rekomendasi**:
- **Budget Recommendations**: Saran alokasi budget per kategori
- **Savings Recommendations**: Tips menabung dan dana darurat
- **Investment Recommendations**: Saran investasi sesuai profil
- **Spending Optimization**: Cara mengoptimalkan pengeluaran
- **Goal Planning**: Strategi mencapai tujuan keuangan

### 3. 📊 Financial Insights
**Lokasi**: Dashboard dan Analytics
**Fitur**:
- Analisis pola pengeluaran otomatis
- Identifikasi tren keuangan
- Prediksi pengeluaran bulanan
- Insight kesehatan keuangan

### 4. 🎯 Smart Budget Suggestions
**Lokasi**: `/budgets`
**Fitur**:
- Saran budget berdasarkan riwayat pengeluaran
- Alokasi optimal per kategori
- Tips mengelola budget
- Alert ketika budget terlampaui

### 5. 🔄 Auto-Categorization
**Lokasi**: Saat menambah transaksi
**Fitur**:
- Kategorisasi otomatis transaksi
- Pembelajaran dari transaksi sebelumnya
- Akurasi yang terus meningkat
- Kustomisasi kategori

## Cara Kerja AI

### 1. Data Collection
AI mengumpulkan data dari:
- Transaksi keuangan pengguna
- Tujuan keuangan
- Budget yang dibuat
- Preferensi pengguna
- Riwayat percakapan

### 2. Analysis & Processing
- Analisis pola pengeluaran
- Identifikasi tren keuangan
- Perhitungan metrik keuangan
- Profiling risiko pengguna

### 3. AI Generation
- Menggunakan Gemini Pro model
- Prompt engineering untuk konteks keuangan
- Response parsing dan formatting
- Fallback ke rule-based system

### 4. Personalization
- Rekomendasi disesuaikan dengan profil pengguna
- Bahasa dan tone yang personal
- Prioritas berdasarkan impact dan kemudahan
- Saran yang actionable

## API Endpoints AI

### Chatbot
```http
POST /api/ai/chat
Content-Type: application/json
Authorization: Bearer <token>

{
  "message": "Bagaimana cara membuat budget yang efektif?",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### AI Recommendations
```http
GET /api/ai/recommendations
Authorization: Bearer <token>
```

### Financial Insights
```http
GET /api/ai/insights
Authorization: Bearer <token>
```

### Budget Suggestions
```http
GET /api/ai/budget-suggestions
Authorization: Bearer <token>
```

## Konfigurasi AI Service

### Gemini AI Service
File: `backend/src/services/geminiAIService.ts`

**Fitur**:
- Integrasi dengan Google Gemini API
- Fallback ke rule-based system
- Error handling dan logging
- Response parsing dan formatting

**Methods**:
- `generateFinancialInsights()` - Insight keuangan
- `generatePersonalizedRecommendations()` - Rekomendasi personal
- `generateChatbotResponse()` - Response chatbot
- `generateBudgetSuggestions()` - Saran budget
- `generateInvestmentAdvice()` - Saran investasi

### AI Recommendation Service
File: `backend/src/services/aiRecommendationService.ts`

**Fitur**:
- Analisis pola pengeluaran
- Rekomendasi berdasarkan data
- Prioritasi rekomendasi
- Integrasi dengan Gemini AI

### Chatbot Controller
File: `backend/src/controllers/chatbotController.ts`

**Fitur**:
- Handling chat messages
- Context management
- Response generation
- Conversation history

## Prompt Engineering

### Financial Insights Prompt
```
Sebagai asisten keuangan AI, analisis data keuangan berikut dan berikan insight yang berguna:

DATA KEUANGAN:
- Total pendapatan: Rp X
- Total pengeluaran: Rp Y
- Tingkat tabungan: Z%
- Jumlah transaksi: N
- Tujuan keuangan: M tujuan
- Budget aktif: P budget

TUGAS:
1. Analisis pola pengeluaran dan pendapatan
2. Identifikasi area yang bisa dioptimalkan
3. Berikan 3-5 insight yang actionable
4. Sertakan saran untuk meningkatkan kesehatan keuangan
5. Berikan estimasi potensi penghematan
```

### Chatbot Prompt
```
Sebagai asisten keuangan AI yang ramah dan membantu, jawab pertanyaan pengguna dengan bijak dan praktis.

PERTANYAAN PENGGUNA: "[message]"

KONTEKS PENGGUNA:
- Pendapatan bulanan: Rp X
- Pengeluaran bulanan: Rp Y
- Tingkat tabungan: Z%
- Jumlah tujuan: N
- Total transaksi: M

INSTRUKSI:
1. Jawab dengan ramah dan profesional
2. Berikan saran yang praktis dan actionable
3. Gunakan bahasa Indonesia yang mudah dipahami
4. Sertakan contoh konkret jika relevan
5. Berikan 3-4 saran follow-up yang relevan
```

## Error Handling & Fallback

### When Gemini is Unavailable
1. **API Key Missing**: Fallback ke rule-based system
2. **Network Error**: Cached responses atau rule-based
3. **Rate Limit**: Queue requests atau fallback
4. **Invalid Response**: Parse error dan fallback

### Fallback System
- Rule-based keyword matching
- Predefined responses
- Basic financial calculations
- Static recommendations

## Monitoring & Analytics

### AI Usage Metrics
- Number of AI requests
- Response time
- Success rate
- User satisfaction
- Feature adoption

### Error Tracking
- API errors
- Response parsing errors
- Fallback usage
- Performance issues

## Security & Privacy

### Data Protection
- API key encryption
- User data anonymization
- Secure API communication
- Data retention policies

### Privacy Compliance
- GDPR compliance
- Data minimization
- User consent
- Right to deletion

## Troubleshooting

### Common Issues

#### 1. "GEMINI_API_KEY not found"
**Solution**: 
- Pastikan file `.env` ada di folder `backend/`
- Periksa nama variabel `GEMINI_API_KEY`
- Restart server setelah menambah API key

#### 2. "Error generating AI response"
**Solution**:
- Periksa koneksi internet
- Validasi API key di Google AI Studio
- Cek rate limit dan quota
- Periksa log error di console

#### 3. "AI responses not personalized"
**Solution**:
- Pastikan user sudah login
- Periksa data keuangan user
- Cek konteks user di database
- Restart AI service

### Debug Mode
Aktifkan debug mode untuk troubleshooting:

```env
NODE_ENV=development
DEBUG=ai:*
```

## Best Practices

### 1. API Key Management
- Jangan commit API key ke repository
- Gunakan environment variables
- Rotate API key secara berkala
- Monitor usage dan quota

### 2. Error Handling
- Implement proper fallback system
- Log errors untuk debugging
- Provide user-friendly error messages
- Monitor AI service health

### 3. Performance
- Cache AI responses jika memungkinkan
- Implement rate limiting
- Optimize prompt engineering
- Monitor response times

### 4. User Experience
- Provide loading states
- Show AI confidence levels
- Allow user feedback
- Personalize responses

## Future Enhancements

### Planned Features
1. **Voice Commands**: Integrasi speech-to-text
2. **Image Analysis**: Analisis foto receipt
3. **Predictive Analytics**: Prediksi keuangan masa depan
4. **Multi-language Support**: Support bahasa lain
5. **Advanced Personalization**: Machine learning untuk personalisasi

### Technical Improvements
1. **Response Caching**: Cache AI responses
2. **Batch Processing**: Process multiple requests
3. **Model Fine-tuning**: Custom model untuk keuangan
4. **Real-time Updates**: Live financial insights

## Support & Documentation

### Resources
- [Google AI Studio Documentation](https://ai.google.dev/docs)
- [Gemini API Reference](https://ai.google.dev/api/gemini-api)
- [SmartTabungan AI Documentation](internal)

### Contact
- Technical Support: support@smarttabungan.com
- AI Integration Issues: ai@smarttabungan.com
- General Inquiries: info@smarttabungan.com

---

**Status**: ✅ Active
**Last Updated**: January 2024
**Version**: 1.0.0 