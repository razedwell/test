import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteUser() {
  const email = process.argv[2];

  if (!email) {
    console.error('Please provide an email address');
    console.log('Usage: npx tsx scripts/delete-user.ts user@example.com');
    process.exit(1);
  }

  console.log(`\n🗑️  Deleting user: ${email}...\n`);

  try {
    const user = await prisma.user.delete({
      where: { email },
    });

    console.log('User deleted successfully!');
    console.log('Deleted:', user.email, '-', user.fullName, '\n');
  } catch (error: any) {
    if (error.code === 'P2025') {
      console.error(`User with email ${email} not found\n`);
    } else {
      console.error('Error:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

deleteUser();