const prisma = require("../prisma/client");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../utils/emailService");

// @desc    Get agent dashboard stats
// @route   GET /api/agent/stats
const getAgentStats = async (req, res) => {
  try {
    const agentId = req.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const [
      totalAssigned,
      pending,
      inReview,
      completed,
      completedThisWeek,
      completedThisMonth,
      slaBreached,
      slaAtRisk,
      awaitingInfo,
    ] = await Promise.all([
      prisma.filing.count({ where: { agentId } }),
      prisma.filing.count({ where: { agentId, status: "PENDING" } }),
      prisma.filing.count({ where: { agentId, status: "IN_REVIEW" } }),
      prisma.filing.count({ where: { agentId, status: "COMPLETED" } }),
      prisma.filing.count({
        where: {
          agentId,
          status: "COMPLETED",
          completedAt: { gte: startOfWeek },
        },
      }),
      prisma.filing.count({
        where: {
          agentId,
          status: "COMPLETED",
          completedAt: { gte: startOfMonth },
        },
      }),
      prisma.filing.count({ where: { agentId, slaStatus: "BREACHED" } }),
      prisma.filing.count({ where: { agentId, slaStatus: "AT_RISK" } }),
      prisma.filing.count({ where: { agentId, status: "AWAITING_INFO" } }),
    ]);

    // Calculate average response time
    const completedFilings = await prisma.filing.findMany({
      where: {
        agentId,
        status: "COMPLETED",
        completedAt: { not: null },
        submittedAt: { not: null },
      },
      select: { submittedAt: true, completedAt: true },
    });

    let avgResponseHrs = 0;
    if (completedFilings.length > 0) {
      const totalHrs = completedFilings.reduce((acc, f) => {
        const hrs =
          (new Date(f.completedAt) - new Date(f.submittedAt)) /
          (1000 * 60 * 60);
        return acc + hrs;
      }, 0);
      avgResponseHrs = Math.round(totalHrs / completedFilings.length);
    }

    // SLA compliance rate
    const slaComplianceRate =
      totalAssigned > 0
        ? Math.round(((totalAssigned - slaBreached) / totalAssigned) * 100)
        : 100;

    // Team average for comparison
    const teamStats = await prisma.filing.groupBy({
      by: ["agentId"],
      where: { agentId: { not: null }, status: "COMPLETED" },
      _count: { id: true },
    });

    const teamAvgFilings =
      teamStats.length > 0
        ? Math.round(
            teamStats.reduce((acc, s) => acc + s._count.id, 0) /
              teamStats.length,
          )
        : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalAssigned,
        pending,
        inReview,
        completed,
        completedThisWeek,
        completedThisMonth,
        slaBreached,
        slaAtRisk,
        awaitingInfo,
        avgResponseHrs,
        slaComplianceRate,
        teamAvgFilings,
      },
    });
  } catch (error) {
    console.error("Agent stats error:", error.message);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

// @desc    Get agent's filings
// @route   GET /api/agent/filings
const getAgentFilings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = { agentId: req.user.id };
    if (status && status !== "ALL") where.status = status;

    const filings = await prisma.filing.findMany({
      where,
      include: {
        business: { include: { user: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: [{ slaStatus: "asc" }, { createdAt: "asc" }],
      skip: (page - 1) * limit,
      take: parseInt(limit),
    });

    const total = await prisma.filing.count({ where });

    res.status(200).json({ success: true, filings, total });
  } catch (error) {
    console.error("Get agent filings error:", error.message);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

// @desc    Claim an unassigned filing
// @route   POST /api/agent/filings/:id/claim
const claimFiling = async (req, res) => {
  try {
    const filing = await prisma.filing.findFirst({
      where: { id: req.params.id, agentId: null },
    });

    if (!filing) {
      return res.status(404).json({
        success: false,
        message: "Filing not found or already assigned",
      });
    }

    const updated = await prisma.filing.update({
      where: { id: req.params.id },
      data: {
        agentId: req.user.id,
        status: "IN_REVIEW",
      },
    });

    res
      .status(200)
      .json({ success: true, message: "Filing claimed!", filing: updated });
  } catch (error) {
    console.error("Claim filing error:", error.message);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

module.exports = { getAgentStats, getAgentFilings, claimFiling };
