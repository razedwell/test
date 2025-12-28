import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function activateUser() {
  const email = process.argv[2];

  if (!email) {
    console.error('Please provide an email address');
    console.log('Usage: npx tsx scripts/activate-user.ts user@example.com');
    process.exit(1);
  }

  console.log(`\nActivating user: ${email}...\n`);

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { isActive: true },
    });

    console.log('User activated successfully!');
    console.log('User:', user.email, '-', user.fullName);
    console.log('Role:', user.role);
    console.log('Active:', user.isActive, '\n');
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

activateUser();