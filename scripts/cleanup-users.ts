import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupUsers() {
  console.log('\n=================================');
  console.log('🧹 CLEANUP UNVERIFIED USERS');
  console.log('=================================\n');

  try {
    // Delete unverified users older than 24 hours
    const result = await prisma.user.deleteMany({
      where: {
        isActive: false,
        createdAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    console.log(`Deleted ${result.count} unverified user(s)\n`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupUsers();