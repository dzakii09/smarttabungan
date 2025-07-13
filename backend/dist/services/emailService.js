"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    constructor() {
        // For development, you can use Gmail or other email services
        // For production, consider using services like SendGrid, Mailgun, etc.
        this.transporter = nodemailer_1.default.createTransport({
            service: 'gmail', // or your email service
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    sendEmail(emailData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: emailData.to,
                    subject: emailData.subject,
                    html: emailData.html
                };
                yield this.transporter.sendMail(mailOptions);
                console.log('Email sent successfully to:', emailData.to);
                return true;
            }
            catch (error) {
                console.error('Error sending email:', error);
                return false;
            }
        });
    }
    // Send budget alert email
    sendBudgetAlertEmail(userEmail, budgetData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { budget, spent, remaining, progress } = budgetData;
            const subject = progress >= 100 ? '🚨 Budget Terlampaui!' : '⚠️ Peringatan Budget';
            const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${progress >= 100 ? '#dc2626' : '#f59e0b'};">${subject}</h2>
        <p>Halo,</p>
        <p>Budget Anda memerlukan perhatian:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>${((_a = budget.category) === null || _a === void 0 ? void 0 : _a.name) || 'Total Budget'}</h3>
          <p><strong>Target:</strong> Rp ${budget.amount.toLocaleString('id-ID')}</p>
          <p><strong>Terpakai:</strong> Rp ${spent.toLocaleString('id-ID')}</p>
          <p><strong>Sisa:</strong> Rp ${remaining.toLocaleString('id-ID')}</p>
          <p><strong>Progress:</strong> ${progress.toFixed(1)}%</p>
        </div>
        <p>Silakan cek aplikasi SmartWealth untuk detail lebih lanjut.</p>
        <p>Terima kasih,<br>Tim SmartWealth</p>
      </div>
    `;
            return yield this.sendEmail({
                to: userEmail,
                subject,
                html
            });
        });
    }
    // Send goal reminder email
    sendGoalReminderEmail(userEmail, goalData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { goal, currentAmount, targetAmount } = goalData;
            const progress = (currentAmount / targetAmount) * 100;
            const subject = progress >= 100 ? '🎉 Tujuan Tercapai!' : '📈 Update Progress Tujuan';
            const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${progress >= 100 ? '#059669' : '#3b82f6'};">${subject}</h2>
        <p>Halo,</p>
        <p>Update terbaru untuk tujuan keuangan Anda:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>${goal.title}</h3>
          <p><strong>Target:</strong> Rp ${targetAmount.toLocaleString('id-ID')}</p>
          <p><strong>Terkumpul:</strong> Rp ${currentAmount.toLocaleString('id-ID')}</p>
          <p><strong>Progress:</strong> ${progress.toFixed(1)}%</p>
          ${progress < 100 ? `<p><strong>Sisa:</strong> Rp ${(targetAmount - currentAmount).toLocaleString('id-ID')}</p>` : ''}
        </div>
        ${progress >= 100 ? '<p>🎉 Selamat! Anda telah mencapai tujuan keuangan Anda!</p>' : '<p>Terus semangat menabung!</p>'}
        <p>Silakan cek aplikasi SmartWealth untuk detail lebih lanjut.</p>
        <p>Terima kasih,<br>Tim SmartWealth</p>
      </div>
    `;
            return yield this.sendEmail({
                to: userEmail,
                subject,
                html
            });
        });
    }
    // Send monthly summary email
    sendMonthlySummaryEmail(userEmail, summaryData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { month, totalIncome, totalExpense, savings, savingsRate } = summaryData;
            const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">📊 Ringkasan Keuangan Bulanan</h2>
        <p>Halo,</p>
        <p>Berikut adalah ringkasan keuangan Anda untuk bulan ${month}:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Ringkasan ${month}</h3>
          <p><strong>Total Pemasukan:</strong> Rp ${totalIncome.toLocaleString('id-ID')}</p>
          <p><strong>Total Pengeluaran:</strong> Rp ${totalExpense.toLocaleString('id-ID')}</p>
          <p><strong>Tabungan:</strong> Rp ${savings.toLocaleString('id-ID')}</p>
          <p><strong>Rasio Tabungan:</strong> ${savingsRate.toFixed(1)}%</p>
        </div>
        <p>Silakan cek aplikasi SmartWealth untuk analisis detail dan tips keuangan.</p>
        <p>Terima kasih,<br>Tim SmartWealth</p>
      </div>
    `;
            return yield this.sendEmail({
                to: userEmail,
                subject: `📊 Ringkasan Keuangan ${month}`,
                html
            });
        });
    }
}
exports.default = new EmailService();
