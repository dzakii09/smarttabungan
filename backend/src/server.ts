import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import transactionRoutes from './routes/transactions'
import goalRoutes from './routes/goals'
import categoryRoutes from './routes/categories'
import budgetRoutes from './routes/budgets'
import analyticsRoutes from './routes/analytics'
import importExportRoutes from './routes/import'
import aiRoutes from './routes/ai'
import notificationRoutes from './routes/notifications'
import scheduledNotificationRoutes from './routes/scheduledNotifications'
import exportRoutes from './routes/export'
import bankIntegrationRoutes from './routes/bankIntegration'
import paymentGatewayRoutes from './routes/paymentGateway'
import dataImportExportRoutes from './routes/dataImportExport'
import externalAPIRoutes from './routes/externalAPI'
import groupBudgetRoutes from './routes/groupBudgets'
import settingsRoutes from './routes/settings'
import chatbotRoutes from './routes/chatbot';

dotenv.config()

console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY);

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/goals', goalRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/budgets', budgetRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/import-export', importExportRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/scheduled-notifications', scheduledNotificationRoutes)
app.use('/api/export', exportRoutes)
app.use('/api/bank', bankIntegrationRoutes)
app.use('/api/payment', paymentGatewayRoutes)
app.use('/api/data', dataImportExportRoutes)
app.use('/api/external', externalAPIRoutes)
app.use('/api/group-budgets', groupBudgetRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/chatbot', chatbotRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
}) 