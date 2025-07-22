import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import prisma from '../utils/database'

async function loginUser() {
  try {
    console.log('=== LOGIN USER ===')
    
    // Get first user
    const users = await prisma.user.findMany()
    if (users.length === 0) {
      console.log('No users found')
      return
    }
    
    const user = users[0]
    console.log('User found:', {
      id: user.id,
      email: user.email,
      name: user.name
    })
    
    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        name: user.name 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    console.log('Generated token:', token)
    console.log('Token payload:', jwt.decode(token))
    
    // Test token verification
    const decoded = jwt.verify(token, JWT_SECRET)
    console.log('Token verified:', decoded)
    
    console.log('=== END LOGIN ===')
  } catch (error) {
    console.error('Error logging in user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

loginUser() 