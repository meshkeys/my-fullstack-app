const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedPrices() {
  const prices = [
    { filingType: "ANNUAL_RETURNS", serviceFee: 15000, govtFee: 3000 },
    { filingType: "CHANGE_OF_DIRECTORS", serviceFee: 25000, govtFee: 3000 },
    { filingType: "CHANGE_OF_ADDRESS", serviceFee: 20000, govtFee: 3000 },
    { filingType: "CHANGE_OF_NAME", serviceFee: 30000, govtFee: 3000 },
    { filingType: "INCREASE_SHARE_CAPITAL", serviceFee: 35000, govtFee: 3000 },
    { filingType: "AUDITED_ACCOUNTS", serviceFee: 20000, govtFee: 3000 },
  ];

  for (const price of prices) {
    await prisma.filingPrice.upsert({
      where: { filingType: price.filingType },
      update: {},
      create: price,
    });
  }

  console.log("Prices seeded successfully!");
  prisma.$disconnect();
}

seedPrices();
