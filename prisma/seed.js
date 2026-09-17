const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Create or update Demo Business
  const business = await prisma.business.upsert({
    where: { slug: "demo-store" },
    update: {},
    create: {
      name: "SmartBiz Demo Store",
      slug: "demo-store",
      email: "owner@smartbiz.lk",
      phone: "+94 77 123 4567",
      address: "123 Galle Road, Colombo 03, Sri Lanka",
      currency: "LKR",
      timezone: "Asia/Colombo",
      taxRate: 0.0,
      subscriptionTier: "PRO",
      isActive: true,
    },
  });

  console.log(`✅ Business ensured: ${business.name} (${business.id})`);

  // 2. Create or update Demo Business Owner
  const passwordHash = await bcrypt.hash("SmartBiz2026!", 12);
  const user = await prisma.user.upsert({
    where: { email: "owner@smartbiz.lk" },
    update: {
      passwordHash,
      isActive: true,
      isEmailVerified: true,
      businessId: business.id,
    },
    create: {
      name: "Demo Store Owner",
      email: "owner@smartbiz.lk",
      passwordHash,
      phone: "+94 77 123 4567",
      role: "BUSINESS_OWNER",
      businessId: business.id,
      isActive: true,
      isEmailVerified: true,
    },
  });

  console.log(`✅ Demo Merchant User ensured: ${user.email} (Password: SmartBiz2026!)`);

  // 3. Seed Default Expense Categories
  const expenseCategories = [
    "Rent",
    "Salaries",
    "Utilities",
    "Supplies",
    "Marketing",
    "Maintenance",
    "Other",
  ];

  for (const catName of expenseCategories) {
    const existing = await prisma.expenseCategory.findFirst({
      where: { businessId: business.id, name: catName },
    });
    if (!existing) {
      await prisma.expenseCategory.create({
        data: {
          businessId: business.id,
          name: catName,
        },
      });
    }
  }

  // 4. Seed Product Categories
  const productCategories = ["Electronics", "Groceries", "Beverages", "Office Supplies"];
  const createdCategories = [];

  for (const catName of productCategories) {
    const slug = catName.toLowerCase().replace(/\s+/g, "-");
    const category = await prisma.category.upsert({
      where: {
        businessId_name: {
          businessId: business.id,
          name: catName,
        },
      },
      update: {},
      create: {
        businessId: business.id,
        name: catName,
        slug,
      },
    });
    createdCategories.push(category);
  }

  // 5. Seed Sample Products
  const sampleProducts = [
    {
      name: "Wireless Optical Mouse",
      sku: "ELEC-001",
      costPrice: 1200,
      sellingPrice: 2200,
      stockQuantity: 45,
      categoryId: createdCategories[0]?.id,
    },
    {
      name: "Mechanical Gaming Keyboard",
      sku: "ELEC-002",
      costPrice: 4500,
      sellingPrice: 7900,
      stockQuantity: 18,
      categoryId: createdCategories[0]?.id,
    },
    {
      name: "Ceylon Premium Tea 500g",
      sku: "BEV-001",
      costPrice: 650,
      sellingPrice: 1100,
      stockQuantity: 80,
      categoryId: createdCategories[2]?.id,
    },
    {
      name: "A4 Copy Paper Ream (500 sheets)",
      sku: "OFF-001",
      costPrice: 850,
      sellingPrice: 1400,
      stockQuantity: 30,
      categoryId: createdCategories[3]?.id,
    },
  ];

  for (const p of sampleProducts) {
    await prisma.product.upsert({
      where: {
        businessId_sku: {
          businessId: business.id,
          sku: p.sku,
        },
      },
      update: {},
      create: {
        businessId: business.id,
        name: p.name,
        sku: p.sku,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
        stockQuantity: p.stockQuantity,
        categoryId: p.categoryId,
        isActive: true,
      },
    });
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
