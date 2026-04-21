import { prisma } from '../src';

async function main() {
  await prisma.apprenticeship.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Plumbing Apprenticeship',
        trade: 'PLUMBING',
        locationCity: 'Atlanta',
        locationState: 'GA',
        paid: true,
        durationMonths: 48,
        description: 'Four-year union plumbing apprenticeship.',
      },
      {
        title: 'Electrical Apprenticeship',
        trade: 'ELECTRICAL',
        locationCity: 'Athens',
        locationState: 'GA',
        paid: true,
        durationMonths: 48,
        description: 'IBEW Local 613 apprenticeship program.',
      },
    ],
  });
  // eslint-disable-next-line no-console
  console.warn('Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
