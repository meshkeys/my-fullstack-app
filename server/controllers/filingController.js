const prisma = require("../prisma/client");

// Filing costs in Naira
const FILING_COSTS = {
  ANNUAL_RETURNS: 15000,
  CHANGE_OF_DIRECTORS: 25000,
  CHANGE_OF_ADDRESS: 20000,
  CHANGE_OF_NAME: 30000,
  INCREASE_SHARE_CAPITAL: 35000,
  AUDITED_ACCOUNTS: 20000,
};

// @desc    Get filing types with costs
// @route   GET /api/filings/types
const getFilingTypes = async (req, res) => {
  try {
    const filingTypes = [
      {
        type: "ANNUAL_RETURNS",
        label: "Annual Returns",
        description: "File your yearly annual returns with CAC",
        cost: FILING_COSTS.ANNUAL_RETURNS,
        requiredFor: [
          "BUSINESS_NAME",
          "PRIVATE_LIMITED_COMPANY",
          "PUBLIC_LIMITED_COMPANY",
          "INCORPORATED_TRUSTEE",
          "LIMITED_LIABILITY_PARTNERSHIP",
        ],
        estimatedTime: "24-48 hours",
        icon: "📝",
      },
      {
        type: "CHANGE_OF_DIRECTORS",
        label: "Change of Directors",
        description: "Add, remove or update director information",
        cost: FILING_COSTS.CHANGE_OF_DIRECTORS,
        requiredFor: ["PRIVATE_LIMITED_COMPANY", "PUBLIC_LIMITED_COMPANY"],
        estimatedTime: "48-72 hours",
        icon: "👥",
      },
      {
        type: "CHANGE_OF_ADDRESS",
        label: "Change of Address",
        description: "Update your registered business address",
        cost: FILING_COSTS.CHANGE_OF_ADDRESS,
        requiredFor: [
          "BUSINESS_NAME",
          "PRIVATE_LIMITED_COMPANY",
          "PUBLIC_LIMITED_COMPANY",
          "INCORPORATED_TRUSTEE",
        ],
        estimatedTime: "24-48 hours",
        icon: "📍",
      },
      {
        type: "CHANGE_OF_NAME",
        label: "Change of Name",
        description: "Change your registered business name",
        cost: FILING_COSTS.CHANGE_OF_NAME,
        requiredFor: [
          "BUSINESS_NAME",
          "PRIVATE_LIMITED_COMPANY",
          "PUBLIC_LIMITED_COMPANY",
        ],
        estimatedTime: "5-7 days",
        icon: "✏️",
      },
      {
        type: "INCREASE_SHARE_CAPITAL",
        label: "Increase Share Capital",
        description: "Increase your company share capital",
        cost: FILING_COSTS.INCREASE_SHARE_CAPITAL,
        requiredFor: ["PRIVATE_LIMITED_COMPANY", "PUBLIC_LIMITED_COMPANY"],
        estimatedTime: "5-7 days",
        icon: "💰",
      },
      {
        type: "AUDITED_ACCOUNTS",
        label: "Audited Accounts",
        description: "Submit your audited financial accounts",
        cost: FILING_COSTS.AUDITED_ACCOUNTS,
        requiredFor: ["PRIVATE_LIMITED_COMPANY", "PUBLIC_LIMITED_COMPANY"],
        estimatedTime: "48-72 hours",
        icon: "📊",
      },
    ];

    res.status(200).json({
      success: true,
      filingTypes,
    });
  } catch (error) {
    console.error("Get filing types error:", error.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// @desc    Create a new filing
// @route   POST /api/filings
const createFiling = async (req, res) => {
  try {
    const { filingType, businessId, formData } = req.body;

    if (!filingType || !businessId || !formData) {
      return res.status(400).json({
        success: false,
        message: "Filing type, business and form data are required",
      });
    }

    // Verify business belongs to user
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId: req.user.id,
      },
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // Calculate due date (30 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Create filing
    const filing = await prisma.filing.create({
      data: {
        filingType,
        status: "PENDING",
        dueDate,
        businessId,
        amount: FILING_COSTS[filingType],
        notes: JSON.stringify(formData),
      },
    });

    res.status(201).json({
      success: true,
      message: "Filing submitted successfully!",
      filing,
    });
  } catch (error) {
    console.error("Create filing error:", error.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// @desc    Get all filings for user
// @route   GET /api/filings
const getMyFilings = async (req, res) => {
  try {
    const businesses = await prisma.business.findMany({
      where: { userId: req.user.id },
      select: { id: true },
    });

    const businessIds = businesses.map((b) => b.id);

    const filings = await prisma.filing.findMany({
      where: {
        businessId: { in: businessIds },
      },
      include: {
        business: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      filings,
    });
  } catch (error) {
    console.error("Get filings error:", error.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// @desc    Get single filing
// @route   GET /api/filings/:id
const getFilingById = async (req, res) => {
  try {
    const filing = await prisma.filing.findFirst({
      where: { id: req.params.id },
      include: { business: true },
    });

    if (!filing) {
      return res.status(404).json({
        success: false,
        message: "Filing not found",
      });
    }

    res.status(200).json({
      success: true,
      filing,
    });
  } catch (error) {
    console.error("Get filing error:", error.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

module.exports = {
  getFilingTypes,
  createFiling,
  getMyFilings,
  getFilingById,
};
