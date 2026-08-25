const prisma = require("../prisma/client");

// @desc    Create business profile
// @route   POST /api/business
const createBusiness = async (req, res) => {
  try {
    const {
      businessName,
      businessType,
      rcNumber,
      registrationDate,
      address,
      state,
    } = req.body;

    // Validate required fields
    if (!businessName || !businessType) {
      return res.status(400).json({
        success: false,
        message: "Business name and type are required",
      });
    }

    // Check if RC number already exists
    if (rcNumber) {
      const existing = await prisma.business.findUnique({
        where: { rcNumber },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "A business with this RC number already exists",
        });
      }
    }

    // Create business
    const business = await prisma.business.create({
      data: {
        businessName,
        businessType,
        rcNumber: rcNumber || null,
        registrationDate: registrationDate ? new Date(registrationDate) : null,
        address: address || null,
        state: state || null,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Business profile created successfully!",
      business,
    });
  } catch (error) {
    console.error("Create business error:", error.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// @desc    Get all businesses for logged in user
// @route   GET /api/business
const getMyBusinesses = async (req, res) => {
  try {
    const businesses = await prisma.business.findMany({
      where: { userId: req.user.id },
      include: {
        filings: true,
      },
    });

    res.status(200).json({
      success: true,
      businesses,
    });
  } catch (error) {
    console.error("Get businesses error:", error.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// @desc    Get single business
// @route   GET /api/business/:id
const getBusinessById = async (req, res) => {
  try {
    const business = await prisma.business.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: {
        filings: true,
        directors: true,
        trustees: true,
      },
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    res.status(200).json({
      success: true,
      business,
    });
  } catch (error) {
    console.error("Get business error:", error.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// @desc    Update business profile
// @route   PUT /api/business/:id
const updateBusiness = async (req, res) => {
  try {
    const business = await prisma.business.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const updated = await prisma.business.update({
      where: { id: req.params.id },
      data: {
        businessName: req.body.businessName || business.businessName,
        businessType: req.body.businessType || business.businessType,
        rcNumber: req.body.rcNumber || business.rcNumber,
        registrationDate: req.body.registrationDate
          ? new Date(req.body.registrationDate)
          : business.registrationDate,
        address: req.body.address || business.address,
        state: req.body.state || business.state,
      },
    });

    res.status(200).json({
      success: true,
      message: "Business profile updated successfully!",
      business: updated,
    });
  } catch (error) {
    console.error("Update business error:", error.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

module.exports = {
  createBusiness,
  getMyBusinesses,
  getBusinessById,
  updateBusiness,
};
