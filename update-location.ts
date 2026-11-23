import { PrismaClient } from '@prisma/client';
import { properties } from './src/data/properties.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating properties with location...');
  
  for (const prop of properties) {
    if (prop.location) {
      await prisma.property.updateMany({
        where: { title: prop.title },
        data: { location: prop.location }
      });
    }
  }
  
  console.log('Update completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
