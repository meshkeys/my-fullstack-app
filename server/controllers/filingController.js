const prisma = require("../prisma/client");
const { sendFilingConfirmationEmail } = require("../utils/emailService");

const FILING_COSTS = {
  ANNUAL_RETURNS: 15000,
  CHANGE_OF_DIRECTORS: 25000,
  CHANGE_OF_ADDRESS: 20000,
  CHANGE_OF_NAME: 30000,
  INCREASE_SHARE_CAPITAL: 35000,
  AUDITED_ACCOUNTS: 20000,
};

const REQUIRED_DOCUMENTS = {
  ANNUAL_RETURNS: [
    {
      id: "cac_certificate",
      label: "CAC Registration Certificate",
      required: true,
    },
    {
      id: "tax_clearance",
      label: "Tax Clearance Certificate (TCC)",
      required: true,
    },
    {
      id: "financial_statements",
      label: "Audited Financial Statements",
      required: false,
    },
    {
      id: "valid_id",
      label: "Valid ID of Director/Proprietor",
      required: true,
    },
  ],
  CHANGE_OF_DIRECTORS: [
    {
      id: "cac_certificate",
      label: "CAC Registration Certificate",
      required: true,
    },
    {
      id: "board_resolution",
      label: "Board Resolution Approving Change",
      required: true,
    },
    {
      id: "valid_id",
      label: "Valid ID of New/Outgoing Director",
      required: true,
    },
    {
      id: "passport_photo",
      label: "Passport Photograph of New Director",
      required: true,
    },
  ],
  CHANGE_OF_ADDRESS: [
    {
      id: "cac_certificate",
      label: "CAC Registration Certificate",
      required: true,
    },
    {
      id: "board_resolution",
      label: "Board Resolution Approving New Address",
      required: true,
    },
    {
      id: "proof_of_address",
      label: "Proof of New Address (Utility Bill/Tenancy)",
      required: true,
    },
  ],
  CHANGE_OF_NAME: [
    {
      id: "cac_certificate",
      label: "CAC Registration Certificate",
      required: true,
    },
    {
      id: "board_resolution",
      label: "Board Resolution Approving Name Change",
      required: true,
    },
    {
      id: "name_availability",
      label: "Evidence of Name Availability Search",
      required: true,
    },
  ],
  INCREASE_SHARE_CAPITAL: [
    {
      id: "cac_certificate",
      label: "CAC Registration Certificate",
      required: true,
    },
    {
      id: "board_resolution",
      label: "Board Resolution Approving Increase",
      required: true,
    },
    {
      id: "shareholders_resolution",
      label: "Shareholders Resolution",
      required: true,
    },
  ],
  AUDITED_ACCOUNTS: [
    {
      id: "cac_certificate",
      label: "CAC Registration Certificate",
      required: true,
    },
    {
      id: "audited_accounts",
      label: "Signed Audited Financial Accounts",
      required: true,
    },
    { id: "auditor_report", label: "Auditor's Report", required: true },
  ],
};

const getFilingTypes = async (req, res) => {
  try {
    const filingTypes = [
      {
        type: "ANNUAL_RETURNS",
        label: "Annual Returns",
        description: "File your yearly annual returns with CAC",
        cost: FILING_COSTS.ANNUAL_RETURNS,
        requiredDocuments: REQUIRED_DOCUMENTS.ANNUAL_RETURNS,
        estimatedTime: "24-48 hours",
        icon: "📝",
      },
      {
        type: "CHANGE_OF_DIRECTORS",
        label: "Change of Directors",
        description: "Add, remove or update director information",
        cost: FILING_COSTS.CHANGE_OF_DIRECTORS,
        requiredDocuments: REQUIRED_DOCUMENTS.CHANGE_OF_DIRECTORS,
        estimatedTime: "48-72 hours",
        icon: "👥",
      },
      {
        type: "CHANGE_OF_ADDRESS",
        label: "Change of Address",
        description: "Update your registered business address",
        cost: FILING_COSTS.CHANGE_OF_ADDRESS,
        requiredDocuments: REQUIRED_DOCUMENTS.CHANGE_OF_ADDRESS,
        estimatedTime: "24-48 hours",
        icon: "📍",
      },
      {
        type: "CHANGE_OF_NAME",
        label: "Change of Name",
        description: "Change your registered business name",
        cost: FILING_COSTS.CHANGE_OF_NAME,
        requiredDocuments: REQUIRED_DOCUMENTS.CHANGE_OF_NAME,
        estimatedTime: "5-7 days",
        icon: "✏️",
      },
      {
        type: "INCREASE_SHARE_CAPITAL",
        label: "Increase Share Capital",
        description: "Increase your company share capital",
        cost: FILING_COSTS.INCREASE_SHARE_CAPITAL,
        requiredDocuments: REQUIRED_DOCUMENTS.INCREASE_SHARE_CAPITAL,
        estimatedTime: "5-7 days",
        icon: "💰",
      },
      {
        type: "AUDITED_ACCOUNTS",
        label: "Audited Accounts",
        description: "Submit your audited financial accounts",
        cost: FILING_COSTS.AUDITED_ACCOUNTS,
        requiredDocuments: REQUIRED_DOCUMENTS.AUDITED_ACCOUNTS,
        estimatedTime: "48-72 hours",
        icon: "📊",
      },
    ];

    res.status(200).json({ success: true, filingTypes });
  } catch (error) {
    console.error("Get filing types error:", error.message);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

const createFiling = async (req, res) => {
  try {
    const { filingType, businessId, formData } = req.body;

    if (!filingType || !businessId || !formData) {
      return res.status(400).json({
        success: false,
        message: "Filing type, business and form data are required",
      });
    }

    const business = await prisma.business.findFirst({
      where: { id: businessId, userId: req.user.id },
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Get uploaded document URLs from Cloudinary
    const uploadedDocuments = req.files
      ? req.files.map((file) => ({
          fieldname: file.fieldname,
          originalname: file.originalname,
          url: file.path,
          publicId: file.filename,
        }))
      : [];

    const filing = await prisma.filing.create({
      data: {
        filingType,
        status: "PENDING",
        dueDate,
        businessId,
        amount: FILING_COSTS[filingType],
        notes: JSON.stringify({
          formData: JSON.parse(formData),
          documents: uploadedDocuments,
        }),
      },
    });

    // Send confirmation email
    try {
      await sendFilingConfirmationEmail(
        req.user.email,
        req.user.fullName,
        filingType,
        business.businessName,
      );
    } catch (emailError) {
      console.error("Filing confirmation email error:", emailError.message);
    }

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

const getMyFilings = async (req, res) => {
  try {
    const businesses = await prisma.business.findMany({
      where: { userId: req.user.id },
      select: { id: true },
    });

    const businessIds = businesses.map((b) => b.id);

    const filings = await prisma.filing.findMany({
      where: { businessId: { in: businessIds } },
      include: { business: true },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, filings });
  } catch (error) {
    console.error("Get filings error:", error.message);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

const getFilingById = async (req, res) => {
  try {
    const filing = await prisma.filing.findFirst({
      where: { id: req.params.id },
      include: { business: true },
    });

    if (!filing) {
      return res
        .status(404)
        .json({ success: false, message: "Filing not found" });
    }

    res.status(200).json({ success: true, filing });
  } catch (error) {
    console.error("Get filing error:", error.message);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

module.exports = { getFilingTypes, createFiling, getMyFilings, getFilingById };
