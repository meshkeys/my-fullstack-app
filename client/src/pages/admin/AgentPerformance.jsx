import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const FILING_LABELS = {
  ANNUAL_RETURNS: "Annual Returns",
  CHANGE_OF_DIRECTORS: "Change of Directors",
  CHANGE_OF_ADDRESS: "Change of Address",
  CHANGE_OF_NAME: "Change of Name",
  INCREASE_SHARE_CAPITAL: "Increase Share Capital",
  AUDITED_ACCOUNTS: "Audited Accounts",
};

function AgentPerformance() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [performance, setPerformance] = useState(null);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };
  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!token) {
      navigate("/admin");
      return;
    }

    const fetchData = async () => {
      try {
        const [perfRes, agentsRes] = await Promise.all([
          axios.get(`${baseUrl}/api/admin/agents/${id}/performance`, {
            headers,
          }),
          axios.get(`${baseUrl}/api/admin/agents`, { headers }),
        ]);
        setPerformance(perfRes.data.performance);
        const found = agentsRes.data.agents.find((a) => a.id === id);
        setAgent(found);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const getPerformanceColor = (rate) => {
    if (rate >= 90) return "#0f5c2e";
    if (rate >= 70) return "#d97706";
    return "#dc2626";
  };

  const getPerformanceLabel = (rate) => {
    if (rate >= 90)
      return { label: "Excellent", bg: "#f0fdf4", color: "#0f5c2e" };
    if (rate >= 70) return { label: "Good", bg: "#fffbeb", color: "#d97706" };
    return { label: "Needs Improvement", bg: "#fef2f2", color: "#dc2626" };
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f4f6f4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ fontSize: "16px", color: "#64748b" }}>
          Loading performance data...
        </p>
      </div>
    );
  }

  const perfLabel = performance
    ? getPerformanceLabel(performance.slaComplianceRate)
    : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f6f4",
        fontFamily: "-apple-system, 'Inter', sans-serif",
      }}
    >
      <nav
        style={{
          background: "#0a1628",
          padding: "14px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => navigate("/admin/agents")}
          style={{
            color: "#94a3b8",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ← Back to Agents
        </button>
        <span style={{ fontSize: "16px", fontWeight: "800", color: "#fff" }}>
          CAC<span style={{ color: "#4ade80" }}>Filing</span> · Agent
          Performance
        </span>
        <div />
      </nav>

      <div
        style={{ maxWidth: "860px", margin: "0 auto", padding: "24px 20px" }}
      >
        {/* Agent Header */}
        {agent && (
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              border: "1px solid #e8ede8",
              padding: "24px",
              marginBottom: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "#e8f5ee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  fontWeight: "800",
                  color: "#0f5c2e",
                }}
              >
                {agent.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <p
                  style={{
                    fontSize: "20px",
                    fontWeight: "800",
                    color: "#0a1628",
                  }}
                >
                  {agent.fullName}
                </p>
                <p style={{ fontSize: "14px", color: "#64748b" }}>
                  {agent.email}
                </p>
              </div>
            </div>
            {perfLabel && (
              <div
                style={{
                  padding: "8px 18px",
                  borderRadius: "10px",
                  background: perfLabel.bg,
                  color: perfLabel.color,
                  fontSize: "15px",
                  fontWeight: "700",
                }}
              >
                {performance.slaComplianceRate >= 90
                  ? "⭐"
                  : performance.slaComplianceRate >= 70
                    ? "👍"
                    : "⚠️"}{" "}
                {perfLabel.label}
              </div>
            )}
          </div>
        )}

        {/* Stats Grid */}
        {performance && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              {[
                {
                  label: "Total Filings",
                  value: performance.totalFilings,
                  icon: "📋",
                  bg: "#eff6ff",
                },
                {
                  label: "Completed",
                  value: performance.completed,
                  icon: "✅",
                  bg: "#f0fdf4",
                },
                {
                  label: "This Month",
                  value: performance.completedThisMonth,
                  icon: "📅",
                  bg: "#faf5ff",
                },
                {
                  label: "Pending",
                  value: performance.pending,
                  icon: "⏳",
                  bg: "#fefce8",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    border: "1px solid #e8ede8",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      background: s.bg,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      marginBottom: "10px",
                    }}
                  >
                    {s.icon}
                  </div>
                  <p
                    style={{
                      fontSize: "26px",
                      fontWeight: "900",
                      color: "#0a1628",
                      letterSpacing: "-1px",
                    }}
                  >
                    {s.value}
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#64748b",
                      marginTop: "2px",
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Performance Metrics */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              {/* SLA Compliance */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: "14px",
                  border: "1px solid #e8ede8",
                  padding: "22px",
                }}
              >
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "#0a1628",
                    marginBottom: "16px",
                  }}
                >
                  ⏱️ SLA Compliance
                </h3>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "120px",
                      height: "120px",
                    }}
                  >
                    <svg
                      viewBox="0 0 36 36"
                      style={{
                        width: "120px",
                        height: "120px",
                        transform: "rotate(-90deg)",
                      }}
                    >
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#f1f5f1"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={getPerformanceColor(
                          performance.slaComplianceRate,
                        )}
                        strokeWidth="3"
                        strokeDasharray={`${performance.slaComplianceRate}, 100`}
                      />
                    </svg>
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "22px",
                          fontWeight: "900",
                          color: getPerformanceColor(
                            performance.slaComplianceRate,
                          ),
                          lineHeight: 1,
                        }}
                      >
                        {performance.slaComplianceRate}%
                      </p>
                      <p style={{ fontSize: "11px", color: "#64748b" }}>
                        Compliance
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      padding: "10px",
                      background: "#fef2f2",
                      borderRadius: "8px",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "18px",
                        fontWeight: "800",
                        color: "#dc2626",
                      }}
                    >
                      {performance.slaBreached}
                    </p>
                    <p style={{ fontSize: "11px", color: "#dc2626" }}>
                      Breached
                    </p>
                  </div>
                  <div
                    style={{
                      padding: "10px",
                      background: "#fffbeb",
                      borderRadius: "8px",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "18px",
                        fontWeight: "800",
                        color: "#d97706",
                      }}
                    >
                      {performance.slaAtRisk}
                    </p>
                    <p style={{ fontSize: "11px", color: "#d97706" }}>
                      At Risk
                    </p>
                  </div>
                </div>
              </div>

              {/* Avg Response Time */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: "14px",
                  border: "1px solid #e8ede8",
                  padding: "22px",
                }}
              >
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "#0a1628",
                    marginBottom: "16px",
                  }}
                >
                  ⚡ Response Time
                </h3>
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p
                    style={{
                      fontSize: "48px",
                      fontWeight: "900",
                      color: "#0f5c2e",
                      letterSpacing: "-2px",
                      lineHeight: 1,
                    }}
                  >
                    {performance.avgResponseHrs}
                  </p>
                  <p
                    style={{
                      fontSize: "16px",
                      color: "#64748b",
                      marginTop: "4px",
                    }}
                  >
                    avg hours per filing
                  </p>
                </div>
                <div
                  style={{
                    padding: "12px",
                    background:
                      performance.avgResponseHrs <= 24 ? "#f0fdf4" : "#fef2f2",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color:
                        performance.avgResponseHrs <= 24
                          ? "#0f5c2e"
                          : "#dc2626",
                    }}
                  >
                    {performance.avgResponseHrs <= 24
                      ? "✅ Within SLA target"
                      : "⚠️ Above SLA target"}
                  </p>
                </div>
              </div>
            </div>

            {/* Filing Type Breakdown */}
            <div
              style={{
                background: "#fff",
                borderRadius: "14px",
                border: "1px solid #e8ede8",
                padding: "22px",
              }}
            >
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#0a1628",
                  marginBottom: "16px",
                }}
              >
                📊 Filing Type Breakdown
              </h3>
              {Object.keys(performance.byType).length === 0 ? (
                <p
                  style={{
                    fontSize: "14px",
                    color: "#94a3b8",
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  No filings yet
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {Object.entries(performance.byType).map(([type, count]) => {
                    const pct = Math.round(
                      (count / performance.totalFilings) * 100,
                    );
                    return (
                      <div key={type}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "4px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "14px",
                              color: "#0a1628",
                              fontWeight: "500",
                            }}
                          >
                            {FILING_LABELS[type] || type}
                          </span>
                          <span
                            style={{
                              fontSize: "14px",
                              fontWeight: "700",
                              color: "#0f5c2e",
                            }}
                          >
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div
                          style={{
                            height: "6px",
                            background: "#f1f5f1",
                            borderRadius: "100px",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              background: "#0f5c2e",
                              borderRadius: "100px",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Improvement Tips */}
            {performance.slaComplianceRate < 90 && (
              <div
                style={{
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: "14px",
                  padding: "22px",
                  marginTop: "16px",
                }}
              >
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "#92400e",
                    marginBottom: "12px",
                  }}
                >
                  💡 Performance Tips
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {performance.slaBreached > 0 && (
                    <p style={{ fontSize: "14px", color: "#92400e" }}>
                      • You have {performance.slaBreached} SLA breach(es) —
                      prioritize pending filings to avoid further breaches
                    </p>
                  )}
                  {performance.avgResponseHrs > 24 && (
                    <p style={{ fontSize: "14px", color: "#92400e" }}>
                      • Your average response time is{" "}
                      {performance.avgResponseHrs}hrs — aim to respond within
                      24hrs
                    </p>
                  )}
                  {performance.pending > 5 && (
                    <p style={{ fontSize: "14px", color: "#92400e" }}>
                      • You have {performance.pending} pending filings — work
                      through the queue starting with oldest
                    </p>
                  )}
                  <p style={{ fontSize: "14px", color: "#92400e" }}>
                    • Check filings marked "At Risk" first — they are about to
                    breach SLA
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AgentPerformance;
