import { PrismaClient } from '@prisma/client'
import { ethers } from 'ethers'

const prisma = new PrismaClient()

async function main() {
  // Create sample users
  const users = []
  for (let i = 0; i < 5; i++) {
    const wallet = ethers.Wallet.createRandom()
    const user = await prisma.user.create({
      data: {
        address: wallet.address,
        username: `user${i + 1}`,
        bio: `I'm user ${i + 1}, and I love trading on the bazaar!`,
        avatarUrl: `https://api.dicebear.com/6.x/avataaars/svg?seed=${wallet.address}`,
      },
    })
    users.push(user)
  }

  // Create sample categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Electronics' } }),
    prisma.category.create({ data: { name: 'Clothing' } }),
    prisma.category.create({ data: { name: 'Books' } }),
    prisma.category.create({ data: { name: 'Home & Garden' } }),
    prisma.category.create({ data: { name: 'Sports & Outdoors' } }),
  ])

  // Create sample items
  const items = [
    {
      title: 'iPhone 12 Pro',
      description: 'Barely used iPhone 12 Pro, great condition!',
      price: 699.99,
      categoryId: categories[0].id,
      sellerId: users[0].id,
    },
    {
      title: 'Vintage Leather Jacket',
      description: 'Cool vintage leather jacket, size M',
      price: 89.99,
      categoryId: categories[1].id,
      sellerId: users[1].id,
    },
    {
      title: 'The Great Gatsby',
      description: 'Classic novel by F. Scott Fitzgerald, paperback',
      price: 9.99,
      categoryId: categories[2].id,
      sellerId: users[2].id,
    },
    {
      title: 'Garden Tools Set',
      description: 'Complete set of garden tools, perfect for beginners',
      price: 49.99,
      categoryId: categories[3].id,
      sellerId: users[3].id,
    },
    {
      title: 'Mountain Bike',
      description: 'High-quality mountain bike, barely used',
      price: 299.99,
      categoryId: categories[4].id,
      sellerId: users[4].id,
    },
  ]

  for (const posting of items) {
    await prisma.item.create({ data: posting })
  }

  console.log('Seed data inserted successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })