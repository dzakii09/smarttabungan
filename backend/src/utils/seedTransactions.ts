import prisma from '../utils/database'

async function seedTransactions() {
  try {
    console.log('Seeding transactions...')

    // Get all users
    const users = await prisma.user.findMany()
    if (users.length === 0) {
      console.log('No users found. Please create a user first.')
      return
    }

    const userId = users[0].id // Use first user
    console.log('Using user ID:', userId)

    // Get categories
    const categories = await prisma.category.findMany()
    console.log('Found categories:', categories.length)

    if (categories.length === 0) {
      console.log('No categories found. Please seed categories first.')
      return
    }

    // Find expense categories
    const expenseCategories = categories.filter(cat => cat.type === 'expense')
    const incomeCategories = categories.filter(cat => cat.type === 'income')

    console.log('Expense categories:', expenseCategories.length)
    console.log('Income categories:', incomeCategories.length)

    // Sample transactions data
    const sampleTransactions = [
      // Income transactions
      {
        amount: 5000000,
        description: 'Gaji Bulan Ini',
        type: 'income' as const,
        categoryId: incomeCategories[0]?.id,
        date: new Date(),
        userId
      },
      {
        amount: 1000000,
        description: 'Bonus Tahunan',
        type: 'income' as const,
        categoryId: incomeCategories[1]?.id || incomeCategories[0]?.id,
        date: new Date(),
        userId
      },
      // Expense transactions
      {
        amount: 150000,
        description: 'Makan Siang',
        type: 'expense' as const,
        categoryId: expenseCategories[0]?.id,
        date: new Date(),
        userId
      },
      {
        amount: 250000,
        description: 'Belanja Bulanan',
        type: 'expense' as const,
        categoryId: expenseCategories[2]?.id || expenseCategories[0]?.id, // Use Belanja category
        date: new Date(),
        userId
      },
      {
        amount: 50000,
        description: 'Transportasi',
        type: 'expense' as const,
        categoryId: expenseCategories[1]?.id || expenseCategories[0]?.id, // Use Transportasi category
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        userId
      },
      {
        amount: 300000,
        description: 'Tagihan Listrik',
        type: 'expense' as const,
        categoryId: expenseCategories[3]?.id || expenseCategories[0]?.id, // Use Tagihan category
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        userId
      }
    ]

    console.log('🔍 Debug: Income categories:', incomeCategories.map(c => c.name));
    console.log('🔍 Debug: Expense categories:', expenseCategories.map(c => c.name));

    // Delete existing transactions for this user
    await prisma.transaction.deleteMany({
      where: { userId }
    })
    console.log('Deleted existing transactions')

    // Create new transactions
    for (const transaction of sampleTransactions) {
      console.log('🔍 Debug: Processing transaction:', transaction.description);
      console.log('🔍 Debug: CategoryId:', transaction.categoryId);
      
      if (transaction.categoryId) {
        try {
          const created = await prisma.transaction.create({
            data: transaction,
            include: {
              category: true
            }
          })
          console.log(`✅ Created transaction: ${created.description} - ${created.amount}`)
        } catch (error) {
          console.error(`❌ Error creating transaction ${transaction.description}:`, error)
        }
      } else {
        console.log(`⚠️ Skipping transaction ${transaction.description} - no categoryId`)
      }
    }

    console.log('Transactions seeded successfully!')
  } catch (error) {
    console.error('Error seeding transactions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedTransactions() 