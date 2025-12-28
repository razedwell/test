import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  console.log('\n=================================');
  console.log('👤 CREATE ADMIN USER');
  console.log('=================================\n');

  try {
    const fullName = await question('Full Name: ');
    const email = await question('Email: ');
    const password = await question('Password (min 8 chars): ');
    const birthDate = await question('Birth Date (YYYY-MM-DD): ');

    // Validate inputs
    if (!fullName || !email || password.length < 8 || !birthDate) {
      console.error('\nInvalid input. Please check all fields.');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error(`\nUser with email ${email} already exists!`);
      
      const update = await question('\nDo you want to make this user an ADMIN? (yes/no): ');
      if (update.toLowerCase() === 'yes') {
        await prisma.user.update({
          where: { email },
          data: { 
            role: 'ADMIN',
            isActive: true 
          },
        });
        console.log('\nUser updated to ADMIN successfully!');
      }
      
      rl.close();
      await prisma.$disconnect();
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        birthDate: new Date(birthDate),
        role: 'ADMIN',
        isActive: true, // Auto-activate admin
      },
    });

    console.log('\nAdmin user created successfully!');
    console.log('=================================');
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Active:', admin.isActive);
    console.log('=================================\n');
  } catch (error) {
    console.error('\nError creating admin:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
    process.exit(0);
  }
}

createAdmin();