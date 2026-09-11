import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AgentDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [filings, setFilings] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("adminToken");
  const agentUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const headers = { Authorization: `Bearer ${token}` };
  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!token) {
      navigate("/admin");
      return;
    }

    const fetchData = async () => {
      try {
        const [statsRes, filingsRes] = await Promise.all([
          axios.get(`${baseUrl}/api/agent/stats`, { headers }),
          axios.get(
            `${baseUrl}/api/agent/filings${filter !== "ALL" ? `?status=${filter}` : ""}`,
            { headers },
          ),
        ]);
        setStats(statsRes.data.stats);
        setFilings(filingsRes.data.filings);
      } catch (error) {
        console.error("Error:", error);
        if (error.response?.status === 403) navigate("/admin");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filter]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin");
  };

  const getSLAStyle = (slaStatus) =>
    ({
      ON_TRACK: { bg: "#f0fdf4", color: "#0f5c2e", label: "✅ On Track" },
      AT_RISK: { bg: "#fffbeb", color: "#d97706", label: "⚠️ At Risk" },
      BREACHED: { bg: "#fef2f2", color: "#dc2626", label: "🔴 Breached" },
    })[slaStatus] || { bg: "#f8fafc", color: "#475569", label: slaStatus };

  const getStatusStyle = (status) =>
    ({
      PENDING: { bg: "#fefce8", color: "#854d0e" },
      IN_REVIEW: { bg: "#eff6ff", color: "#1e40af" },
      AWAITING_INFO: { bg: "#fff7ed", color: "#9a3412" },
      PROCESSING: { bg: "#faf5ff", color: "#6b21a8" },
      SUBMITTED_TO_CAC: { bg: "#eef2ff", color: "#3730a3" },
      COMPLETED: { bg: "#f0fdf4", color: "#15803d" },
      REJECTED: { bg: "#fef2f2", color: "#dc2626" },
    })[status] || { bg: "#f8fafc", color: "#475569" };

  const formatFilingType = (type) =>
    ({
      ANNUAL_RETURNS: "Annual Returns",
      CHANGE_OF_DIRECTORS: "Change of Directors",
      CHANGE_OF_ADDRESS: "Change of Address",
      CHANGE_OF_NAME: "Change of Name",
      INCREASE_SHARE_CAPITAL: "Increase Share Capital",
      AUDITED_ACCOUNTS: "Audited Accounts",
    })[type] || type;

  const initials =
    agentUser?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "A";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f6f4",
        fontFamily: "-apple-system, 'Inter', sans-serif",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          background: "#0a1628",
          padding: "14px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "#0f5c2e",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{ color: "#fff", fontSize: "13px", fontWeight: "800" }}
            >
              CF
            </span>
          </div>
          <span style={{ fontSize: "16px", fontWeight: "800", color: "#fff" }}>
            CAC<span style={{ color: "#4ade80" }}>Filing</span>
            <span
              style={{
                marginLeft: "8px",
                fontSize: "12px",
                color: "#64748b",
                fontWeight: "500",
              }}
            >
              Agent Portal
            </span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "#0f5c2e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "800",
              color: "#fff",
            }}
          >
            {initials}
          </div>
          <span style={{ fontSize: "14px", color: "#94a3b8" }}>
            {agentUser.fullName}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: "7px 16px",
              border: "1px solid #1e293b",
              borderRadius: "7px",
              fontSize: "13px",
              color: "#94a3b8",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
        {/* Welcome */}
        <div
          style={{
            background: "linear-gradient(135deg, #0f5c2e 0%, #1a7a3f 100%)",
            borderRadius: "14px",
            padding: "22px 28px",
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "20px",
                fontWeight: "800",
                color: "#fff",
                marginBottom: "4px",
              }}
            >
              Good day, {agentUser.fullName?.split(" ")[0]} 👋
            </h1>
            <p style={{ fontSize: "14px", color: "#86efac" }}>
              {stats
                ? `${stats.pending + stats.inReview} active filing(s) need your attention`
                : "Loading your workload..."}
            </p>
          </div>
          {stats && (
            <div style={{ display: "flex", gap: "12px" }}>
              <div
                style={{
                  textAlign: "center",
                  padding: "12px 20px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                }}
              >
                <p
                  style={{ fontSize: "22px", fontWeight: "900", color: "#fff" }}
                >
                  {stats.slaComplianceRate}%
                </p>
                <p style={{ fontSize: "12px", color: "#86efac" }}>SLA Rate</p>
              </div>
              <div
                style={{
                  textAlign: "center",
                  padding: "12px 20px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                }}
              >
                <p
                  style={{ fontSize: "22px", fontWeight: "900", color: "#fff" }}
                >
                  {stats.completedThisMonth}
                </p>
                <p style={{ fontSize: "12px", color: "#86efac" }}>This Month</p>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            {[
              {
                label: "Total Assigned",
                value: stats.totalAssigned,
                icon: "📋",
                bg: "#eff6ff",
              },
              {
                label: "Pending",
                value: stats.pending,
                icon: "⏳",
                bg: "#fefce8",
              },
              {
                label: "In Review",
                value: stats.inReview,
                icon: "👀",
                bg: "#faf5ff",
              },
              {
                label: "Awaiting Info",
                value: stats.awaitingInfo,
                icon: "📎",
                bg: "#fff7ed",
              },
              {
                label: "Completed",
                value: stats.completed,
                icon: "✅",
                bg: "#f0fdf4",
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: "1px solid #e8ede8",
                  borderRadius: "12px",
                  padding: "14px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    background: s.bg,
                    borderRadius: "7px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    marginBottom: "8px",
                  }}
                >
                  {s.icon}
                </div>
                <p
                  style={{
                    fontSize: "24px",
                    fontWeight: "900",
                    color: "#0a1628",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {s.value}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    marginTop: "2px",
                  }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* SLA Alerts */}
        {stats && (stats.slaBreached > 0 || stats.slaAtRisk > 0) && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                stats.slaBreached > 0 && stats.slaAtRisk > 0
                  ? "1fr 1fr"
                  : "1fr",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            {stats.slaBreached > 0 && (
              <div
                style={{
                  padding: "14px 18px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: "700",
                      color: "#dc2626",
                    }}
                  >
                    🔴 {stats.slaBreached} SLA Breach(es)
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#dc2626",
                      marginTop: "2px",
                    }}
                  >
                    These filings have exceeded response time targets
                  </p>
                </div>
                <button
                  onClick={() => setFilter("PENDING")}
                  style={{
                    padding: "8px 16px",
                    background: "#dc2626",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  View Now
                </button>
              </div>
            )}
            {stats.slaAtRisk > 0 && (
              <div
                style={{
                  padding: "14px 18px",
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: "700",
                      color: "#d97706",
                    }}
                  >
                    ⚠️ {stats.slaAtRisk} At Risk
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#d97706",
                      marginTop: "2px",
                    }}
                  >
                    These filings are approaching their SLA deadline
                  </p>
                </div>
                <button
                  onClick={() => setFilter("IN_REVIEW")}
                  style={{
                    padding: "8px 16px",
                    background: "#d97706",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Review
                </button>
              </div>
            )}
          </div>
        )}

        {/* Filings */}
        <div
          style={{
            background: "#fff",
            borderRadius: "14px",
            border: "1px solid #e8ede8",
            overflow: "hidden",
          }}
        >
          <div style={{ borderBottom: "1px solid #f1f5f1" }}>
            <div style={{ display: "flex", overflowX: "auto" }}>
              {[
                "ALL",
                "PENDING",
                "IN_REVIEW",
                "AWAITING_INFO",
                "PROCESSING",
                "COMPLETED",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  style={{
                    padding: "14px 18px",
                    fontSize: "13px",
                    fontWeight: "600",
                    background: "none",
                    border: "none",
                    borderBottom:
                      filter === s
                        ? "2px solid #0f5c2e"
                        : "2px solid transparent",
                    color: filter === s ? "#0f5c2e" : "#64748b",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div
              style={{ padding: "60px", textAlign: "center", color: "#64748b" }}
            >
              Loading filings...
            </div>
          ) : filings.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#0a1628",
                }}
              >
                No filings found
              </p>
              <p
                style={{ fontSize: "14px", color: "#94a3b8", marginTop: "4px" }}
              >
                Filings assigned to you will appear here
              </p>
            </div>
          ) : (
            <div>
              {filings.map((filing, i) => {
                const sla = getSLAStyle(filing.slaStatus);
                const status = getStatusStyle(filing.status);
                const hasNewMessage =
                  filing.messages?.[0]?.sender === "USER" &&
                  !filing.messages?.[0]?.isRead;
                const slaDeadline = filing.slaDeadline
                  ? new Date(filing.slaDeadline)
                  : null;
                const hoursLeft = slaDeadline
                  ? Math.round((slaDeadline - new Date()) / (1000 * 60 * 60))
                  : null;

                return (
                  <div
                    key={filing.id}
                    onClick={() => navigate(`/admin/filing/${filing.id}`)}
                    style={{
                      padding: "16px 20px",
                      borderBottom:
                        i < filings.length - 1 ? "1px solid #f8faf8" : "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f8faf8")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "4px",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "15px",
                            fontWeight: "600",
                            color: "#0a1628",
                          }}
                        >
                          {formatFilingType(filing.filingType)}
                        </p>
                        {hasNewMessage && (
                          <span
                            style={{
                              padding: "2px 8px",
                              background: "#dc2626",
                              color: "#fff",
                              borderRadius: "100px",
                              fontSize: "11px",
                              fontWeight: "700",
                            }}
                          >
                            New Reply
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "13px", color: "#64748b" }}>
                        {filing.business?.businessName} ·{" "}
                        {filing.business?.user?.fullName} ·{" "}
                        {new Date(filing.createdAt).toLocaleDateString(
                          "en-NG",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </p>
                      {hoursLeft !== null && (
                        <p
                          style={{
                            fontSize: "12px",
                            color:
                              hoursLeft < 0
                                ? "#dc2626"
                                : hoursLeft < 4
                                  ? "#d97706"
                                  : "#64748b",
                            fontWeight: "600",
                            marginTop: "4px",
                          }}
                        >
                          {hoursLeft < 0
                            ? `⚠️ SLA exceeded by ${Math.abs(hoursLeft)}hrs`
                            : `⏰ ${hoursLeft}hrs remaining`}
                        </p>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: "6px",
                        flexShrink: 0,
                        marginLeft: "16px",
                      }}
                    >
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "100px",
                          background: status.bg,
                          color: status.color,
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        {filing.status.replace(/_/g, " ")}
                      </span>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: "100px",
                          background: sla.bg,
                          color: sla.color,
                          fontSize: "11px",
                          fontWeight: "600",
                        }}
                      >
                        {sla.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AgentDashboard;
