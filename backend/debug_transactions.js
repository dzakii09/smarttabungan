const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugTransactions() {
  try {
    console.log('=== DEBUG TRANSACTIONS ===');
    
    // Get all transactions
    const allTransactions = await prisma.transaction.findMany({
      take: 10,
      orderBy: { date: 'desc' },
      include: { category: true }
    });
    
    console.log('\n=== ALL TRANSACTIONS (last 10) ===');
    allTransactions.forEach(tx => {
      console.log(`ID: ${tx.id}`);
      console.log(`Type: ${tx.type}`);
      console.log(`Amount: ${tx.amount}`);
      console.log(`Date: ${tx.date}`);
      console.log(`Category: ${tx.category?.name || 'No category'}`);
      console.log('---');
    });
    
    // Check current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    console.log('\n=== CURRENT MONTH RANGE ===');
    console.log('Start of month:', startOfMonth);
    console.log('End of month:', endOfMonth);
    console.log('Current date:', now);
    
    // Check transactions in current month
    const currentMonthTransactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      include: { category: true }
    });
    
    console.log('\n=== CURRENT MONTH TRANSACTIONS ===');
    console.log(`Found ${currentMonthTransactions.length} transactions in current month`);
    
    currentMonthTransactions.forEach(tx => {
      console.log(`ID: ${tx.id}`);
      console.log(`Type: ${tx.type}`);
      console.log(`Amount: ${tx.amount}`);
      console.log(`Date: ${tx.date}`);
      console.log(`Category: ${tx.category?.name || 'No category'}`);
      console.log('---');
    });
    
    // Check income transactions in current month
    const currentMonthIncome = await prisma.transaction.aggregate({
      where: {
        type: 'income',
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      _sum: { amount: true }
    });
    
    // Check expense transactions in current month
    const currentMonthExpense = await prisma.transaction.aggregate({
      where: {
        type: 'expense',
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      _sum: { amount: true }
    });
    
    console.log('\n=== AGGREGATE RESULTS ===');
    console.log('Current month income:', currentMonthIncome._sum.amount || 0);
    console.log('Current month expense:', currentMonthExpense._sum.amount || 0);
    
    // Check if there are any transactions with different date formats
    const allDates = await prisma.transaction.findMany({
      select: { date: true },
      orderBy: { date: 'desc' },
      take: 5
    });
    
    console.log('\n=== SAMPLE DATES ===');
    allDates.forEach((tx, index) => {
      console.log(`Transaction ${index + 1} date:`, tx.date);
      console.log(`Date type:`, typeof tx.date);
      console.log(`Is Date object:`, tx.date instanceof Date);
    });
    
  } catch (error) {
    console.error('Error debugging transactions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugTransactions(); 