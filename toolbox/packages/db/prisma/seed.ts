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
        title: 'Electrical Apprenticeship — IBEW 613',
        trade: 'ELECTRICAL',
        locationCity: 'Athens',
        locationState: 'GA',
        paid: true,
        durationMonths: 48,
        description: 'IBEW Local 613 apprenticeship program.',
      },
      {
        title: 'HVAC Technician Apprenticeship',
        trade: 'HVAC',
        locationCity: 'Austin',
        locationState: 'TX',
        paid: true,
        durationMonths: 36,
        description: 'NATE-certified HVAC program with ABC.',
      },
      {
        title: 'Carpentry Apprenticeship',
        trade: 'CARPENTRY',
        locationCity: 'Chicago',
        locationState: 'IL',
        paid: true,
        durationMonths: 48,
        description: 'Chicago Regional Council of Carpenters.',
      },
      {
        title: 'Roofing Apprenticeship',
        trade: 'ROOFING',
        locationCity: 'Denver',
        locationState: 'CO',
        paid: true,
        durationMonths: 24,
        description: 'Commercial roofing with NRCA-affiliated contractor.',
      },
      {
        title: 'Painting Apprenticeship',
        trade: 'PAINTING',
        locationCity: 'Seattle',
        locationState: 'WA',
        paid: true,
        durationMonths: 36,
        description: 'IUPAT District Council 5 program.',
      },
      {
        title: 'Landscaping Apprenticeship',
        trade: 'LANDSCAPING',
        locationCity: 'Phoenix',
        locationState: 'AZ',
        paid: false,
        durationMonths: 12,
        description: 'Unpaid internship with a regional landscape design firm.',
      },
      {
        title: 'Masonry Apprenticeship',
        trade: 'MASONRY',
        locationCity: 'Philadelphia',
        locationState: 'PA',
        paid: true,
        durationMonths: 36,
        description: 'Bricklayers & Allied Craftworkers Local 1.',
      },
      {
        title: 'Tile Setter Apprenticeship',
        trade: 'TILE',
        locationCity: 'Los Angeles',
        locationState: 'CA',
        paid: true,
        durationMonths: 48,
        description: 'Finishing Trades Institute tile program.',
      },
      {
        title: 'Handyman Pre-Apprenticeship',
        trade: 'HANDYMAN',
        locationCity: 'Athens',
        locationState: 'GA',
        paid: true,
        durationMonths: 6,
        description: 'Short-form entry to the trades, multi-skill exposure.',
      },
      {
        title: 'Locksmith Apprenticeship',
        trade: 'LOCKSMITH',
        locationCity: 'Boston',
        locationState: 'MA',
        paid: true,
        durationMonths: 24,
        description: 'ALOA-accredited locksmith training program.',
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
