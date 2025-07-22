import prisma from '../utils/database'

async function checkData() {
  try {
    console.log('=== CHECKING DATABASE DATA ===')
    
    // Check users
    const users = await prisma.user.findMany()
    console.log('Users count:', users.length)
    if (users.length > 0) {
      console.log('First user:', {
        id: users[0].id,
        email: users[0].email,
        name: users[0].name
      })
    }
    
    // Check categories
    const categories = await prisma.category.findMany()
    console.log('Categories count:', categories.length)
    console.log('Categories:', categories.map(c => ({ name: c.name, type: c.type, id: c.id })))
    
    // Check transactions
    const transactions = await prisma.transaction.findMany({
      include: {
        category: true,
        user: true
      }
    })
    console.log('Transactions count:', transactions.length)
    
    if (transactions.length > 0) {
      console.log('Sample transactions:')
      transactions.slice(0, 3).forEach(tx => {
        console.log({
          id: tx.id,
          description: tx.description,
          amount: tx.amount,
          type: tx.type,
          date: tx.date,
          category: tx.category?.name,
          user: tx.user?.email
        })
      })
    }
    
    // Check transactions by user
    if (users.length > 0) {
      const userId = users[0].id
      const userTransactions = await prisma.transaction.findMany({
        where: { userId },
        include: { category: true }
      })
      console.log(`Transactions for user ${userId}:`, userTransactions.length)
      
      const expenseTransactions = userTransactions.filter(tx => tx.type === 'expense')
      console.log('Expense transactions:', expenseTransactions.length)
      
      expenseTransactions.forEach(tx => {
        console.log({
          description: tx.description,
          amount: tx.amount,
          category: tx.category?.name,
          date: tx.date
        })
      })
    }
    
    console.log('=== END CHECKING DATA ===')
  } catch (error) {
    console.error('Error checking data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkData() 