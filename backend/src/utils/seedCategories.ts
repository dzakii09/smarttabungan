import prisma from './database'

const defaultCategories = [
  // Income categories
  { name: 'Gaji', type: 'income', icon: 'DollarSign', color: '#10B981' },
  { name: 'Bonus', type: 'income', icon: 'DollarSign', color: '#059669' },
  
  // Expense categories
  { name: 'Makanan & Minuman', type: 'expense', icon: 'Utensils', color: '#2563EB' },
  { name: 'Transportasi', type: 'expense', icon: 'Car', color: '#059669' },
  { name: 'Belanja', type: 'expense', icon: 'ShoppingBag', color: '#F59E0B' },
  { name: 'Tagihan', type: 'expense', icon: 'DollarSign', color: '#8B5CF6' },
  { name: 'Hiburan', type: 'expense', icon: 'DollarSign', color: '#EF4444' },
  { name: 'Investasi', type: 'expense', icon: 'DollarSign', color: '#DC2626' },
  { name: 'Lainnya', type: 'expense', icon: 'DollarSign', color: '#6B7280' }
]

async function seedCategories() {
  try {
    console.log('Seeding categories...')
    
    // First, delete all existing categories
    await prisma.category.deleteMany({})
    console.log('Deleted existing categories')
    
    // Then create new categories
    for (const category of defaultCategories) {
      try {
        await prisma.category.create({
          data: category
        })
        console.log(`Created category: ${category.name} (${category.type})`)
      } catch (error) {
        console.error(`Error creating category ${category.name} (${category.type}):`, error)
        // Log more details about the error
        if (error instanceof Error) {
          console.error('Error message:', error.message)
        }
      }
    }
    
    console.log('Categories seeded successfully!')
  } catch (error) {
    console.error('Error seeding categories:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if this file is executed directly
if (require.main === module) {
  seedCategories()
}

export default seedCategories 