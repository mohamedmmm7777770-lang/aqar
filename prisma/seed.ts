import { PrismaClient } from '@prisma/client';
import { properties } from '../src/data/properties.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Find or create a seller
  let seller = await prisma.user.findFirst({ where: { role: 'seller' } });
  if (!seller) {
    seller = await prisma.user.create({
      data: {
        name: 'المالك',
        email: 'owner@example.com',
        role: 'seller'
      }
    });
  }

  for (const prop of properties) {
    await prisma.property.create({
      data: {
        title: prop.title,
        location: prop.location,
        price: prop.priceValue,
        description: prop.description,
        type: prop.type,
        status: "نشط",
        statusType: prop.status,
        bedrooms: prop.bedrooms || 0,
        bathrooms: prop.bathrooms || 0,
        area: prop.area,
        latitude: prop.coordinates.lat,
        longitude: prop.coordinates.lng,
        image: prop.image,
        sellerId: seller.id
      }
    });
  }
  
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
