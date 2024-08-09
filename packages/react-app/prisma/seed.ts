import { ItemStatus, PrismaClient } from '@prisma/client'
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

  // Create sample items
  const items = [
    {
      title: 'iPhone 12 Pro',
      description: 'Barely used iPhone 12 Pro, great condition!',
      price: 699.99,
      status: 'AVAILABLE' as ItemStatus,
      sellerId: users[0].id,
      longitude: -122.4194,
      latitude: 37.7749,
      placeName: 'San Francisco, CA',
    },
    {
      title: 'Vintage Leather Jacket',
      description: 'Cool vintage leather jacket, size M',
      price: 89.99,
      status: 'AVAILABLE' as ItemStatus,
      sellerId: users[1].id,
      longitude: -74.0060,
      latitude: 40.7128,
      placeName: 'New York, NY',
    },
    {
      title: 'The Great Gatsby',
      description: 'Classic novel by F. Scott Fitzgerald, paperback',
      price: 9.99,
      status: 'AVAILABLE' as ItemStatus,
      sellerId: users[2].id,
      longitude: -87.6298,
      latitude: 41.8781,
      placeName: 'Chicago, IL',
    },
    {
      title: 'Garden Tools Set',
      description: 'Complete set of garden tools, perfect for beginners',
      price: 49.99,
      status: 'AVAILABLE' as ItemStatus,
      sellerId: users[3].id,
      longitude: -118.2437,
      latitude: 34.0522,
      placeName: 'Los Angeles, CA',
    },
    {
      title: 'Mountain Bike',
      description: 'High-quality mountain bike, barely used',
      price: 299.99,
      status: 'AVAILABLE' as ItemStatus,
      sellerId: users[4].id,
      longitude: -71.0589,
      latitude: 42.3601,
      placeName: 'Boston, MA',
    },
  ]

  for (const item of items) {
    await prisma.item.create({ data: item })
  }

  // Create sample conversations and messages
  for (let i = 0; i < 3; i++) {
    const seller = users[i]
    const buyer = users[(i + 1) % users.length]
    const item = await prisma.item.findFirst({ where: { sellerId: seller.id } })

    if (item) {
      const conversation = await prisma.conversation.create({
        data: {
          sellerId: seller.id,
          buyerId: buyer.id,
          itemId: item.id,
        },
      })

      await prisma.message.createMany({
        data: [
          {
            content: `Hi, is this ${item.title} still available?`,
            senderId: buyer.id,
            conversationId: conversation.id,
          },
          {
            content: 'Yes, it is! Are you interested in buying?',
            senderId: seller.id,
            conversationId: conversation.id,
          },
          {
            content: 'Great! Can we arrange a meeting to see it?',
            senderId: buyer.id,
            conversationId: conversation.id,
          },
        ],
      })
    }
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