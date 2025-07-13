# 🚀 Setup GROQ AI untuk SmartTabungan

## Overview
GROQ adalah platform AI yang sangat cepat dan akurat dengan model Llama-3.1 8B. Perfect untuk aplikasi keuangan yang membutuhkan response time cepat dan akurasi tinggi.

## 🎯 Keunggulan GROQ

### ⚡ **Performance**
- **10-100x lebih cepat** dari OpenAI/Gemini
- Response time < 1 detik
- Throughput tinggi untuk concurrent requests

### 💰 **Cost-Effective**
- **$5 credit gratis** per bulan
- Harga sangat murah: $0.05 per 1M tokens
- Tidak ada biaya setup atau subscription

### 🎯 **Accuracy**
- Model Llama-3.1 8B yang sangat powerful
- Akurasi tinggi untuk financial advice
- Support JSON output yang konsisten

### 🌍 **Global Support**
- Support bahasa Indonesia
- Tidak ada geo-restriction
- API yang reliable

## 📋 Setup Step-by-Step

### 1. Daftar GROQ Account
1. Kunjungi [console.groq.com](https://console.groq.com)
2. Klik "Sign Up" atau "Get Started"
3. Daftar dengan email atau GitHub
4. Verifikasi email Anda

### 2. Dapatkan API Key
1. Login ke GROQ Console
2. Klik "API Keys" di sidebar
3. Klik "Create API Key"
4. Beri nama: "SmartTabungan AI"
5. Copy API key yang dihasilkan

### 3. Install GROQ SDK
```bash
cd backend
npm install groq-sdk
```

### 4. Update Environment Variables
Buat file `.env` di folder `backend/`:

```env
# AI Configuration
GROQ_API_KEY="your-groq-api-key-here"

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/smarttabungan"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"

# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 5. Update AI Service
Ganti import di file yang menggunakan AI:

```typescript
// Ganti ini:
import geminiAIService from '../services/geminiAIService';

// Menjadi ini:
import groqAIService from '../services/groqAIService';
```

### 6. Update Controllers
Update file `backend/src/controllers/chatbotController.ts`:

```typescript
import groqAIService from '../services/groqAIService';

// Ganti semua geminiAIService menjadi groqAIService
```

### 7. Update Recommendation Service
Update file `backend/src/services/aiRecommendationService.ts`:

```typescript
import groqAIService from './groqAIService';

// Ganti semua geminiAIService menjadi groqAIService
```

### 8. Test Setup
```bash
cd backend
npm run dev
```

## 🔧 Konfigurasi Model

### Model yang Tersedia
- **llama3-8b-8192** (Recommended) - Fast & Accurate
- **llama3-70b-8192** - More Accurate, Slower
- **mixtral-8x7b-32768** - Good Balance

### Optimasi untuk SmartTabungan
```typescript
// Di groqAIService.ts
this.model = 'llama3-8b-8192'; // Best for financial apps

// Temperature settings
temperature: 0.7, // Balanced creativity
max_tokens: 1000, // Sufficient for responses
```

## 📊 Monitoring & Analytics

### Track Usage
```typescript
// Add to groqAIService.ts
private async logUsage(model: string, tokens: number) {
  console.log(`GROQ Usage: ${model} - ${tokens} tokens`);
  // Add to your analytics
}
```

### Error Handling
```typescript
try {
  const response = await groqAIService.generateResponse(prompt);
  return response;
} catch (error) {
  console.error('GROQ Error:', error);
  return fallbackResponse();
}
```

## 🎯 Performance Comparison

| Feature | Gemini | GROQ | Improvement |
|---------|--------|------|-------------|
| Response Time | 2-5s | 0.5-1s | **5x Faster** |
| Cost per 1M tokens | $0.50 | $0.05 | **10x Cheaper** |
| Free Tier | $0 | $5 | **$5 Free** |
| JSON Output | ✅ | ✅ | Same |
| Indonesian Support | ✅ | ✅ | Same |

## 🔄 Migration dari Gemini

### 1. Backup Current Setup
```bash
cp backend/src/services/geminiAIService.ts backend/src/services/geminiAIService_backup.ts
```

### 2. Update Environment
```env
# Comment out Gemini
# GEMINI_API_KEY="your-gemini-key"

# Add GROQ
GROQ_API_KEY="your-groq-key"
```

### 3. Update Imports
```typescript
// Find all files with geminiAIService import
grep -r "geminiAIService" backend/src/

// Replace with groqAIService
```

### 4. Test Migration
```bash
# Test chatbot
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "Bagaimana cara menabung?"}'

# Test recommendations
curl -X GET http://localhost:5000/api/ai/recommendations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🚀 Production Deployment

### Environment Variables
```env
# Production
GROQ_API_KEY="your-production-groq-key"
NODE_ENV=production
```

### Error Monitoring
```typescript
// Add to your error tracking
if (error.code === 'GROQ_RATE_LIMIT') {
  // Handle rate limiting
  return fallbackResponse();
}
```

### Load Balancing
```typescript
// Multiple API keys for high traffic
const groqKeys = [
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3
];
```

## 📈 Cost Optimization

### Token Usage
- **Chatbot**: ~200-500 tokens per response
- **Recommendations**: ~800-1200 tokens per response
- **Insights**: ~600-1000 tokens per response

### Monthly Cost Estimate
- 1000 chatbot responses: ~$0.02
- 500 recommendations: ~$0.03
- 200 insights: ~$0.01
- **Total**: ~$0.06 per bulan

## 🔒 Security Best Practices

### API Key Security
```typescript
// Never log API keys
console.log('GROQ API Key:', process.env.GROQ_API_KEY?.substring(0, 8) + '...');
```

### Rate Limiting
```typescript
// Add rate limiting
const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/ai', aiLimiter);
```

## 🎯 Testing Checklist

### ✅ Setup Complete
- [ ] GROQ account created
- [ ] API key obtained
- [ ] SDK installed
- [ ] Environment variables set
- [ ] Service files updated
- [ ] Controllers updated

### ✅ Functionality Tested
- [ ] Chatbot responses
- [ ] AI recommendations
- [ ] Financial insights
- [ ] Budget suggestions
- [ ] Investment advice
- [ ] Receipt classification

### ✅ Performance Verified
- [ ] Response time < 1s
- [ ] JSON parsing works
- [ ] Error handling works
- [ ] Fallback system works

## 🆘 Troubleshooting

### Common Issues

#### 1. API Key Not Found
```bash
# Check environment
echo $GROQ_API_KEY

# Restart server
npm run dev
```

#### 2. Slow Responses
```typescript
// Check model selection
this.model = 'llama3-8b-8192'; // Fastest model
```

#### 3. JSON Parse Errors
```typescript
// Add better error handling
try {
  return JSON.parse(text);
} catch (error) {
  console.error('JSON Parse Error:', text);
  return fallbackResponse();
}
```

#### 4. Rate Limiting
```typescript
// Add retry logic
const retry = async (fn: Function, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

## 📞 Support

### GROQ Support
- **Documentation**: [docs.groq.com](https://docs.groq.com)
- **Discord**: [discord.gg/groq](https://discord.gg/groq)
- **Email**: support@groq.com

### SmartTabungan Support
- **GitHub Issues**: Report bugs
- **Documentation**: Check setup guides
- **Community**: Join discussions

## 🎉 Success Metrics

### Performance Targets
- ✅ Response time < 1 second
- ✅ 99.9% uptime
- ✅ < 5% error rate
- ✅ Cost < $1 per month

### User Experience
- ✅ Natural Indonesian responses
- ✅ Accurate financial advice
- ✅ Helpful recommendations
- ✅ Fast chatbot responses

---

**GROQ adalah pilihan terbaik untuk SmartTabungan karena kecepatan, akurasi, dan cost-effectiveness yang unggul!** 🚀 