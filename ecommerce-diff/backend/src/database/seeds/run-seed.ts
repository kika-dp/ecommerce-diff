import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { User } from '../../modules/users/entities/user.entity';
import { ProductType } from '../../modules/product-types/entities/product-type.entity';
import { Product } from '../../modules/products/entities/product.entity';
import { ProductImage } from '../../modules/products/entities/product-image.entity';
import { Role } from '../../common/enums/role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';
import { slugify } from '../../common/utils/slug.util';

interface SeedProduct {
  name: string;
  sku: string;
  short: string;
  description: string;
  brand: string;
  price: string;
  compareAtPrice?: string;
  stock: number;
  imageUrl: string;
  flags?: Partial<{ isFeatured: boolean; isTrending: boolean; isBestseller: boolean }>;
}

const CATALOGUE: Record<string, SeedProduct[]> = {
  Shoes: [
    {
      name: 'Aura Stealth Runner',
      sku: 'AURA-SHO-001',
      short: 'Carbon-weave performance sneaker with floating sole architecture.',
      description:
        'Hand-finished carbon-weave upper paired with a magnetic-cushion floating sole. Engineered for elite mobility.',
      brand: 'Aura',
      price: '12500.00',
      compareAtPrice: '14500.00',
      stock: 40,
      imageUrl:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
      flags: { isFeatured: true, isBestseller: true },
    },
    {
      name: 'Obsidian Court',
      sku: 'AURA-SHO-002',
      short: 'Minimal court silhouette in matte obsidian leather.',
      description: 'Whisper-quiet leather build with a sculpted heel counter and ghost-stitched eyelets.',
      brand: 'Aura',
      price: '9800.00',
      stock: 25,
      imageUrl:
        'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1200&q=80',
      flags: { isTrending: true },
    },
    {
      name: 'Pearl Voyager',
      sku: 'AURA-SHO-003',
      short: 'Translucent pearl-white runner with iridescent overlay.',
      description: 'Layered translucent shell with a holographic midsole — built for cinematic streetwear.',
      brand: 'Aura',
      price: '11200.00',
      stock: 18,
      imageUrl:
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80',
      flags: { isFeatured: true },
    },
  ],
  Watches: [
    {
      name: 'Aura Eclipse Chrono',
      sku: 'AURA-WAT-001',
      short: 'Skeleton chronograph with sapphire dial.',
      description: 'Self-winding skeleton movement framed by a brushed titanium case. Sapphire crystal both sides.',
      brand: 'Aura Haute Horlogerie',
      price: '185000.00',
      compareAtPrice: '210000.00',
      stock: 6,
      imageUrl:
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
      flags: { isFeatured: true, isBestseller: true },
    },
    {
      name: 'Noir Tourbillon',
      sku: 'AURA-WAT-002',
      short: 'PVD black tourbillon with rhodium-plated hands.',
      description: 'Hand-assembled tourbillon inside a black PVD case. 72-hour power reserve.',
      brand: 'Aura Haute Horlogerie',
      price: '420000.00',
      stock: 3,
      imageUrl:
        'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=80',
      flags: { isTrending: true },
    },
    {
      name: 'Stratos Diver',
      sku: 'AURA-WAT-003',
      short: 'Ceramic bezel diver with luminous ghost markers.',
      description: 'Anti-magnetic 300m diver with sapphire crystal and ghost-applied luminous indices.',
      brand: 'Aura Marine',
      price: '92000.00',
      stock: 9,
      imageUrl:
        'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=80',
    },
  ],
  Jewellery: [
    {
      name: 'Halo Diamond Pendant',
      sku: 'AURA-JEW-001',
      short: '0.75ct VVS diamond on platinum chain.',
      description: 'Solitaire halo pendant cut to internally flawless standard, suspended on a 950 platinum chain.',
      brand: 'Aura Atelier',
      price: '215000.00',
      stock: 7,
      imageUrl:
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80',
      flags: { isFeatured: true },
    },
    {
      name: 'Onyx Signet Ring',
      sku: 'AURA-JEW-002',
      short: 'Black onyx signet set in 18k white gold.',
      description: 'A sculptural signet with hand-carved monogram bezel — quiet luxury for the modern silhouette.',
      brand: 'Aura Atelier',
      price: '78500.00',
      stock: 14,
      imageUrl:
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1200&q=80',
      flags: { isBestseller: true },
    },
    {
      name: 'Lunar Pavé Bracelet',
      sku: 'AURA-JEW-003',
      short: 'Pavé diamond tennis bracelet, 4.2ct total.',
      description: 'Brilliant-cut pavé bracelet with hidden butterfly clasp and matte white gold finish.',
      brand: 'Aura Atelier',
      price: '498000.00',
      stock: 4,
      imageUrl:
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
      flags: { isTrending: true },
    },
  ],
};

async function seed() {
  await AppDataSource.initialize();
  // eslint-disable-next-line no-console
  console.log('Seeding AURA luxury catalogue...');

  const userRepo = AppDataSource.getRepository(User);
  const typeRepo = AppDataSource.getRepository(ProductType);
  const productRepo = AppDataSource.getRepository(Product);

  const adminEmail = 'admin@aura.luxe';
  if (!(await userRepo.findOne({ where: { email: adminEmail } }))) {
    await userRepo.save(
      userRepo.create({
        email: adminEmail,
        fullName: 'Aura Atelier',
        mobile: '+919876500001',
        passwordHash: await bcrypt.hash('admin@123', 12),
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
      }),
    );
    // eslint-disable-next-line no-console
    console.log('Admin user created: admin@aura.luxe / admin@123');
  }

  const demoEmail = 'guest@aura.luxe';
  if (!(await userRepo.findOne({ where: { email: demoEmail } }))) {
    await userRepo.save(
      userRepo.create({
        email: demoEmail,
        fullName: 'Maya Chen',
        mobile: '+919876500002',
        passwordHash: await bcrypt.hash('guest@123', 12),
        role: Role.USER,
        status: UserStatus.ACTIVE,
      }),
    );
    // eslint-disable-next-line no-console
    console.log('Guest user created: guest@aura.luxe / guest@123');
  }

  for (const [name, products] of Object.entries(CATALOGUE)) {
    let type = await typeRepo.findOne({ where: { slug: slugify(name) } });
    if (!type) {
      type = await typeRepo.save(
        typeRepo.create({
          name,
          slug: slugify(name),
          description: `${name} — curated artifacts from the Aura collection.`,
          isActive: true,
        }),
      );
    }
    for (const p of products) {
      const exists = await productRepo.findOne({ where: { sku: p.sku } });
      if (exists) continue;
      const product = productRepo.create({
        name: p.name,
        slug: slugify(p.name),
        sku: p.sku,
        shortDescription: p.short,
        description: p.description,
        brand: p.brand,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        stock: p.stock,
        rating: '4.8',
        ratingCount: 128,
        isActive: true,
        isFeatured: p.flags?.isFeatured ?? false,
        isTrending: p.flags?.isTrending ?? false,
        isBestseller: p.flags?.isBestseller ?? false,
        productTypeId: type.id,
        images: [
          { url: p.imageUrl, alt: p.name, isPrimary: true, position: 0 } as ProductImage,
        ],
      } as Partial<Product>);
      await productRepo.save(product);
    }
  }

  // eslint-disable-next-line no-console
  console.log('Seed complete.');
  await AppDataSource.destroy();
}

seed().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
  process.exit(1);
});
