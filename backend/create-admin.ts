import * as dotenv from 'dotenv';
dotenv.config();
import prisma from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const email = process.env.OWNER_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'vishwajeetsrk@gmail.com';
  const password = process.env.OWNER_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '12345678';
  const hashed = await bcrypt.hash(password, 10);
  
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { role: 'SUPER_ADMIN', password: hashed }
    });
    console.log('Updated existing admin user');
  } else {
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        email,
        password: hashed,
        role: 'SUPER_ADMIN',
        phone: '9663574728'
      }
    });
    console.log('Created new admin user');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
