import prisma from './config/database.js';

async function seed() {
  console.log('Seeding pre-authorized counselor emails...');

  const authorizedEmails = [
    'counselor@aktu.edu',
    'counselor@test.com',
    'admin@aktu.edu',
  ];

  for (const email of authorizedEmails) {
    await prisma.authorizedCounselor.upsert({
      where: { email },
      update: {},
      create: { email },
    });
  }

  console.log(`Successfully authorized ${authorizedEmails.length} counselor emails.`);
}

seed()
  .catch((e) => {
    console.error('Error seeding authorized counselors:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
