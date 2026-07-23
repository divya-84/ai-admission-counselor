import prisma from './config/database.js';
import { AdmissionStatus } from '@prisma/client';

async function resetStatuses() {
  console.log('Resetting all student application statuses in PostgreSQL database to APPLIED...');

  const admissions = await prisma.admission.findMany();

  for (const admission of admissions) {
    await prisma.admission.update({
      where: { id: admission.id },
      data: {
        status: AdmissionStatus.APPLIED,
        notes: 'Application registered and pending counselor review.',
      },
    });
  }

  console.log(`Successfully reset ${admissions.length} admission application statuses to APPLIED.`);
}

resetStatuses()
  .catch((e) => console.error('Error resetting admission statuses:', e))
  .finally(() => prisma.$disconnect());
