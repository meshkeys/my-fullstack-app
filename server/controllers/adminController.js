const prisma = require("../prisma/client");
const bcrypt = require("bcryptjs");
const {
  sendEmail,
  sendDocumentRequestEmail,
} = require("../utils/emailService");

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

// @desc    Get all prices
// @route   GET /api/admin/prices
const getPrices = async (req, res) => {
  try {
    const prices = await prisma.filingPrice.findMany({
      orderBy: { filingType: "asc" },
    });
    res.status(200).json({ success: true, prices });
  } catch (error) {
    console.error("Get prices error:", error.message);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

// @desc    Update price
// @route   PUT /api/admin/prices/:filingType
const updatePrice = async (req, res) => {
  try {
    const { serviceFee, govtFee } = req.body;
    const { filingType } = req.params;

    const price = await prisma.filingPrice.update({
      where: { filingType },
      data: {
        serviceFee: parseFloat(serviceFee),
        govtFee: parseFloat(govtFee),
        updatedBy: req.user.fullName,
      },
    });

    res.status(200).json({
      success: true,
      message: "Price updated successfully!",
      price,
    });
  } catch (error) {
    console.error("Update price error:", error.message);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

// @desc    Get all agents
// @route   GET /api/admin/agents
const getAgents = async (req, res) => {
  try {
    const agents = await prisma.user.findMany({
      where: { isAgent: true },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        isActive: true,
        createdAt: true,
        assignedFilings: {
          select: {
            id: true,
            status: true,
            slaStatus: true,
          },
        },
      },
    });

    const agentsWithStats = agents.map((agent) => ({
      ...agent,
      totalAssigned: agent.assignedFilings.length,
      pending: agent.assignedFilings.filter((f) => f.status === "PENDING")
        .length,
      completed: agent.assignedFilings.filter((f) => f.status === "COMPLETED")
        .length,
      slaBreached: agent.assignedFilings.filter(
        (f) => f.slaStatus === "BREACHED",
      ).length,
      slaComplianceRate:
        agent.assignedFilings.length > 0
          ? Math.round(
              ((agent.assignedFilings.length -
                agent.assignedFilings.filter((f) => f.slaStatus === "BREACHED")
                  .length) /
                agent.assignedFilings.length) *
                100,
            )
          : 100,
    }));

    res.status(200).json({ success: true, agents: agentsWithStats });
  } catch (error) {
    console.error("Get agents error:", error.message);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

// @desc    Create agent
// @route   POST /api/admin/agents
const createAgent = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const agent = await prisma.user.create({
      data: {
        fullName,
        email,
        phoneNumber,
        password: hashedPassword,
        isAgent: true,
      },
    });

    // Send welcome email
    try {
      await sendEmail({
        to: email,
        subject: "Welcome to CAC Filing — Agent Account Created",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #0a1628; padding: 24px; text-align: center;">
              <h1 style="color: #fff; margin: 0;">CAC<span style="color: #4ade80;">Filing</span></h1>
            </div>
            <div style="padding: 32px;">
              <h2 style="color: #0f5c2e;">Welcome, ${fullName}!</h2>
              <p>Your agent account has been created. Here are your login details:</p>
              <div style="background: #f8faf8; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Password:</strong> ${password}</p>
                <p><strong>Portal:</strong> ${process.env.CLIENT_URL}/admin</p>
              </div>
              <p style="color: #dc2626;">Please change your password after first login.</p>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Welcome email error:", emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Agent created successfully!",
      agent: { id: agent.id, fullName: agent.fullName, email: agent.email },
    });
  } catch (error) {
    console.error("Create agent error:", error.message);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

/// @desc    Update agent details
// @route   PUT /api/admin/agents/:id
const updateAgent = async (req, res) => {
  try {
    const { isActive, fullName, email, phoneNumber, password } = req.body;

    const updateData = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const agent = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.status(200).json({ success: true, message: "Agent updated!", agent });
  } catch (error) {
    console.error("Update agent error:", error.message);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

// @desc    Delete agent
// @route   DELETE /api/admin/agents/:id
const deleteAgent = async (req, res) => {
  try {
    // Check if agent has active filings
    const activeFilings = await prisma.filing.count({
      where: {
        agentId: req.params.id,
        status: { notIn: ["COMPLETED", "REJECTED"] },
      },
    });

    if (activeFilings > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete agent with ${activeFilings} active filing(s). Reassign or complete them first.`,
      });
    }

    // Unassign completed filings
    await prisma.filing.updateMany({
      where: { agentId: req.params.id },
      data: { agentId: null },
    });

    await prisma.user.delete({ where: { id: req.params.id } });

    res
      .status(200)
      .json({ success: true, message: "Agent deleted successfully!" });
  } catch (error) {
    console.error("Delete agent error:", error.message);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

// @desc    Manually assign filing to agent
// @route   PUT /api/admin/filings/:id/assign
const assignFiling = async (req, res) => {
  try {
    const { agentId } = req.body;

    const agent = await prisma.user.findFirst({
      where: { id: agentId, isAgent: true },
    });

    if (!agent) {
      return res
        .status(404)
        .json({ success: false, message: "Agent not found" });
    }

    const slaConfig = await prisma.sLAConfig.findFirst({
      where: { filingType: req.body.filingType },
    });

    const slaDeadline = new Date();
    slaDeadline.setHours(
      slaDeadline.getHours() + (slaConfig?.responseTimeHrs || 24),
    );

    const filing = await prisma.filing.update({
      where: { id: req.params.id },
      data: {
        agentId,
        status: "IN_REVIEW",
        slaDeadline,
        slaStatus: "ON_TRACK",
      },
    });

    await prisma.filingMessage.create({
      data: {
        filingId: req.params.id,
        sender: "AGENT",
        message: `Filing assigned to ${agent.fullName} and is now under review.`,
      },
    });

    res
      .status(200)
      .json({ success: true, message: "Filing assigned!", filing });
  } catch (error) {
    console.error("Assign filing error:", error.message);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

// @desc    Auto assign all pending filings
// @route   POST /api/admin/filings/auto-assign
const autoAssignFilings = async (req, res) => {
  try {
    const setting = await prisma.appSetting.findUnique({
      where: { key: "auto_assign_method" },
    });
    const method = setting?.value || "round_robin";
    const maxFilings = parseInt(
      (
        await prisma.appSetting.findUnique({
          where: { key: "max_filings_per_agent" },
        })
      )?.value || "20",
    );

    const pendingFilings = await prisma.filing.findMany({
      where: { agentId: null, status: "PENDING" },
      orderBy: { createdAt: "asc" },
    });

    const agents = await prisma.user.findMany({
      where: { isAgent: true, isActive: true },
      include: {
        assignedFilings: {
          where: { status: { notIn: ["COMPLETED", "REJECTED"] } },
          select: { id: true },
        },
      },
    });

    if (agents.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No active agents available" });
    }

    let assigned = 0;
    for (const filing of pendingFilings) {
      let selectedAgent;

      if (method === "round_robin") {
        selectedAgent = agents[assigned % agents.length];
      } else {
        // least loaded
        selectedAgent = agents.sort(
          (a, b) => a.assignedFilings.length - b.assignedFilings.length,
        )[0];
      }

      if (selectedAgent.assignedFilings.length >= maxFilings) continue;

      const slaConfig = await prisma.sLAConfig.findFirst({
        where: { filingType: filing.filingType },
      });

      const slaDeadline = new Date();
      slaDeadline.setHours(
        slaDeadline.getHours() + (slaConfig?.responseTimeHrs || 24),
      );

      await prisma.filing.update({
        where: { id: filing.id },
        data: {
          agentId: selectedAgent.id,
          status: "IN_REVIEW",
          slaDeadline,
          slaStatus: "ON_TRACK",
        },
      });

      selectedAgent.assignedFilings.push({ id: filing.id });
      assigned++;
    }

    res.status(200).json({
      success: true,
      message: `${assigned} filing(s) assigned successfully!`,
      assigned,
    });
  } catch (error) {
    console.error("Auto assign error:", error.message);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

// @desc    Get SLA configs
// @route   GET /api/admin/sla
const getSLAConfigs = async (req, res) => {
  try {
    const configs = await prisma.sLAConfig.findMany();
    res.status(200).json({ success: true, configs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

// @desc    Update SLA config
// @route   PUT /api/admin/sla/:filingType
const updateSLAConfig = async (req, res) => {
  try {
    const { responseTimeHrs, displayText, warningAtHrs, escalateAtHrs } =
      req.body;
    const config = await prisma.sLAConfig.update({
      where: { filingType: req.params.filingType },
      data: {
        responseTimeHrs,
        displayText,
        warningAtHrs,
        escalateAtHrs,
        updatedBy: req.user.fullName,
      },
    });
    res.status(200).json({ success: true, message: "SLA updated!", config });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

// @desc    Get app settings
// @route   GET /api/admin/settings
const getSettings = async (req, res) => {
  try {
    const settings = await prisma.appSetting.findMany();
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

// @desc    Update app setting
// @route   PUT /api/admin/settings/:key
const updateSetting = async (req, res) => {
  try {
    const { value } = req.body;
    const setting = await prisma.appSetting.update({
      where: { key: req.params.key },
      data: { value, updatedBy: req.user.fullName },
    });
    res
      .status(200)
      .json({ success: true, message: "Setting updated!", setting });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

// @desc    Get agent performance report
// @route   GET /api/admin/agents/:id/performance
const getAgentPerformance = async (req, res) => {
  try {
    const agentId = req.params.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const filings = await prisma.filing.findMany({
      where: { agentId },
      select: {
        status: true,
        slaStatus: true,
        submittedAt: true,
        completedAt: true,
        createdAt: true,
        filingType: true,
      },
    });

    const completed = filings.filter((f) => f.status === "COMPLETED");
    const thisMonth = completed.filter(
      (f) => new Date(f.completedAt) >= startOfMonth,
    );

    const avgResponseHrs =
      completed.length > 0
        ? Math.round(
            completed.reduce((acc, f) => {
              return (
                acc +
                (new Date(f.completedAt) - new Date(f.submittedAt)) /
                  (1000 * 60 * 60)
              );
            }, 0) / completed.length,
          )
        : 0;

    const slaComplianceRate =
      filings.length > 0
        ? Math.round(
            ((filings.length -
              filings.filter((f) => f.slaStatus === "BREACHED").length) /
              filings.length) *
              100,
          )
        : 100;

    // Filing type breakdown
    const byType = {};
    filings.forEach((f) => {
      if (!byType[f.filingType]) byType[f.filingType] = 0;
      byType[f.filingType]++;
    });

    res.status(200).json({
      success: true,
      performance: {
        totalFilings: filings.length,
        completed: completed.length,
        completedThisMonth: thisMonth.length,
        pending: filings.filter((f) => f.status === "PENDING").length,
        slaBreached: filings.filter((f) => f.slaStatus === "BREACHED").length,
        slaAtRisk: filings.filter((f) => f.slaStatus === "AT_RISK").length,
        avgResponseHrs,
        slaComplianceRate,
        byType,
      },
    });
  } catch (error) {
    console.error("Agent performance error:", error.message);
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
  getPrices,
  updatePrice,
  getAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  assignFiling,
  autoAssignFilings,
  getSLAConfigs,
  updateSLAConfig,
  getSettings,
  updateSetting,
  getAgentPerformance,
};
