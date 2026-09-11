const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedSLA() {
  const slaConfigs = [
    {
      filingType: "ANNUAL_RETURNS",
      responseTimeHrs: 24,
      displayText: "24-48 hours",
      warningAtHrs: 20,
      escalateAtHrs: 24,
    },
    {
      filingType: "CHANGE_OF_DIRECTORS",
      responseTimeHrs: 48,
      displayText: "48-72 hours",
      warningAtHrs: 40,
      escalateAtHrs: 48,
    },
    {
      filingType: "CHANGE_OF_ADDRESS",
      responseTimeHrs: 24,
      displayText: "24-48 hours",
      warningAtHrs: 20,
      escalateAtHrs: 24,
    },
    {
      filingType: "CHANGE_OF_NAME",
      responseTimeHrs: 120,
      displayText: "5-7 days",
      warningAtHrs: 96,
      escalateAtHrs: 120,
    },
    {
      filingType: "INCREASE_SHARE_CAPITAL",
      responseTimeHrs: 120,
      displayText: "5-7 days",
      warningAtHrs: 96,
      escalateAtHrs: 120,
    },
    {
      filingType: "AUDITED_ACCOUNTS",
      responseTimeHrs: 48,
      displayText: "48-72 hours",
      warningAtHrs: 40,
      escalateAtHrs: 48,
    },
  ];

  for (const config of slaConfigs) {
    await prisma.sLAConfig.upsert({
      where: { filingType: config.filingType },
      update: {},
      create: config,
    });
  }

  // App settings
  const settings = [
    {
      key: "response_time_display",
      value: "1 hour",
      description: "Response time shown to customers on website",
    },
    {
      key: "auto_assign_enabled",
      value: "true",
      description: "Enable auto assignment of filings to agents",
    },
    {
      key: "auto_assign_method",
      value: "round_robin",
      description: "Method for auto assignment: round_robin or least_loaded",
    },
    {
      key: "max_filings_per_agent",
      value: "20",
      description: "Maximum active filings per agent",
    },
  ];

  for (const setting of settings) {
    await prisma.appSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log("SLA configs and app settings seeded!");
  prisma.$disconnect();
}

seedSLA();
