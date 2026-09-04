const prisma = require("../prisma/client");
const { sendDocumentRequestEmail } = require("../utils/emailService");

// @desc    Get all filings
// @route   GET /api/admin/filings
const getAllFilings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const where = status ? { status } : {};

    const filings = await prisma.filing.findMany({
      where,
      include: {
        business: {
          include: { user: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: parseInt(limit),
    });

    const total = await prisma.filing.count({ where });

    res.status(200).json({
      success: true,
      filings,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get all filings error:", error.message);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

// @desc    Get single filing with all details
// @route   GET /api/admin/filings/:id
const getFilingDetail = async (req, res) => {
  try {
    const filing = await prisma.filing.findUnique({
      where: { id: req.params.id },
      include: {
        business: {
          include: { user: true },
        },
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!filing) {
      return res.status(404).json({
        success: false,
        message: "Filing not found",
      });
    }

    // Mark user messages as read
    await prisma.filingMessage.updateMany({
      where: {
        filingId: req.params.id,
        sender: "USER",
        isRead: false,
      },
      data: { isRead: true },
    });

    res.status(200).json({ success: true, filing });
  } catch (error) {
    console.error("Get filing detail error:", error.message);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

// @desc    Update filing status
// @route   PUT /api/admin/filings/:id/status
const updateFilingStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const validStatuses = [
      "PENDING",
      "IN_REVIEW",
      "AWAITING_INFO",
      "PROCESSING",
      "SUBMITTED_TO_CAC",
      "COMPLETED",
      "REJECTED",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const filing = await prisma.filing.update({
      where: { id: req.params.id },
      data: {
        status,
        completedAt: status === "COMPLETED" ? new Date() : undefined,
        notes: notes || undefined,
      },
      include: {
        business: {
          include: { user: true },
        },
      },
    });

    // Add system message about status change
    await prisma.filingMessage.create({
      data: {
        filingId: req.params.id,
        sender: "AGENT",
        message: `Filing status updated to: ${status.replace(/_/g, " ")}${notes ? `. Note: ${notes}` : ""}`,
      },
    });

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      filing,
    });
  } catch (error) {
    console.error("Update status error:", error.message);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

// @desc    Send message to client
// @route   POST /api/admin/filings/:id/message
const sendMessageToClient = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const filing = await prisma.filing.findUnique({
      where: { id: req.params.id },
      include: {
        business: {
          include: { user: true },
        },
      },
    });

    if (!filing) {
      return res.status(404).json({
        success: false,
        message: "Filing not found",
      });
    }

    await prisma.filingMessage.create({
      data: {
        filingId: req.params.id,
        sender: "AGENT",
        message,
      },
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Send message error:", error.message);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

// @desc    Request documents from client
// @route   POST /api/admin/filings/:id/request-docs
const requestDocuments = async (req, res) => {
  try {
    const { message, requestedDocs } = req.body;

    if (!message || !requestedDocs || requestedDocs.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message and requested documents are required",
      });
    }

    const filing = await prisma.filing.findUnique({
      where: { id: req.params.id },
      include: {
        business: {
          include: { user: true },
        },
      },
    });

    if (!filing) {
      return res.status(404).json({
        success: false,
        message: "Filing not found",
      });
    }

    // Create agent message with document request
    await prisma.filingMessage.create({
      data: {
        filingId: req.params.id,
        sender: "AGENT",
        message,
        requiresAction: true,
        actionType: "UPLOAD_DOCUMENT",
        requestedDocs,
      },
    });

    // Update filing status
    await prisma.filing.update({
      where: { id: req.params.id },
      data: { status: "AWAITING_INFO" },
    });

    // Send email to client
    const clientEmail = filing.business.user.email;
    const clientName = filing.business.user.fullName;
    const filingUrl = `${process.env.CLIENT_URL}/filing/${req.params.id}`;

    await sendDocumentRequestEmail(
      clientEmail,
      clientName,
      message,
      requestedDocs,
      filingUrl,
    );

    res.status(201).json({
      success: true,
      message: "Document request sent to client",
    });
  } catch (error) {
    console.error("Request documents error:", error.message);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
const getAdminStats = async (req, res) => {
  try {
    const [
      totalFilings,
      pendingFilings,
      inReviewFilings,
      awaitingInfoFilings,
      completedFilings,
      totalUsers,
      totalBusinesses,
    ] = await Promise.all([
      prisma.filing.count(),
      prisma.filing.count({ where: { status: "PENDING" } }),
      prisma.filing.count({ where: { status: "IN_REVIEW" } }),
      prisma.filing.count({ where: { status: "AWAITING_INFO" } }),
      prisma.filing.count({ where: { status: "COMPLETED" } }),
      prisma.user.count({ where: { isAdmin: false } }),
      prisma.business.count(),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalFilings,
        pendingFilings,
        inReviewFilings,
        awaitingInfoFilings,
        completedFilings,
        totalUsers,
        totalBusinesses,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error.message);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

module.exports = {
  getAllFilings,
  getFilingDetail,
  updateFilingStatus,
  sendMessageToClient,
  requestDocuments,
  getAdminStats,
};
