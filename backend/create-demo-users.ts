import * as dotenv from 'dotenv';
dotenv.config();
import prisma from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const password = 'Demo@12345';
  const hashed = await bcrypt.hash(password, 10);

  const roles = [
    { name: 'Admin User', email: 'admin@luxwash.com', role: 'SUPER_ADMIN', phone: '9999999991' },
    { name: 'Staff User', email: 'staff@luxwash.com', role: 'STAFF', phone: '9999999992' },
    { name: 'Delivery User', email: 'delivery@luxwash.com', role: 'DELIVERY', phone: '9999999993' },
    { name: 'Demo Customer', email: 'customer@luxwash.com', role: 'CUSTOMER', phone: '9999999994' }
  ];

  for (const user of roles) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });
    if (existing) {
      await prisma.user.update({
        where: { email: user.email },
        data: { role: user.role, password: hashed }
      });
      console.log(`Updated existing user: ${user.email} (${user.role})`);
    } else {
      await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: hashed,
          role: user.role,
          phone: user.phone
        }
      });
      console.log(`Created new user: ${user.email} (${user.role})`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
