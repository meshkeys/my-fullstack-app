import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalFilings: 0,
    pendingFilings: 0,
    completedFilings: 0,
    dueSoonFilings: 0,
  });
  const [businesses, setBusinesses] = useState([]);
  const [filings, setFilings] = useState([]);
  const [loading, setLoading] = useState(true);

  const quickActionsRef = useRef(null);
  const recentFilingsRef = useRef(null);
  const myBusinessesRef = useRef(null);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const [statsRes, filingsRes] = await Promise.all([
        api.get("/api/business/stats"),
        api.get("/api/filings"),
      ]);
      setStats(statsRes.data.stats);
      setBusinesses(statsRes.data.businesses);
      setFilings(filingsRes.data.filings);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const scrollTo = (ref) =>
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatBusinessType = (type) =>
    ({
      BUSINESS_NAME: "Business Name",
      PRIVATE_LIMITED_COMPANY: "Private Limited Company",
      PUBLIC_LIMITED_COMPANY: "Public Limited Company",
      INCORPORATED_TRUSTEE: "Incorporated Trustee",
      LIMITED_LIABILITY_PARTNERSHIP: "Limited Liability Partnership",
    })[type] || type;

  const formatFilingType = (type) =>
    ({
      ANNUAL_RETURNS: "Annual Returns",
      CHANGE_OF_DIRECTORS: "Change of Directors",
      CHANGE_OF_ADDRESS: "Change of Address",
      CHANGE_OF_NAME: "Change of Name",
      INCREASE_SHARE_CAPITAL: "Increase Share Capital",
      AUDITED_ACCOUNTS: "Audited Accounts",
    })[type] || type;

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

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  if (!user) return null;

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
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
          <p style={{ color: "#0f5c2e", fontWeight: "600", fontSize: "16px" }}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f6f4",
        fontFamily: "-apple-system, 'Inter', sans-serif",
      }}
    >
      {/* Dark Navbar */}
      <nav
        style={{
          background: "#0a1628",
          padding: "14px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 50,
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
          <span
            style={{
              fontSize: "16px",
              fontWeight: "800",
              color: "#fff",
              letterSpacing: "-0.3px",
            }}
          >
            CAC<span style={{ color: "#4ade80" }}>Filing</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
            <span style={{ fontSize: "13px", color: "#94a3b8" }}>
              {user.fullName}
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: "7px 16px",
              border: "1px solid #1e293b",
              borderRadius: "7px",
              fontSize: "13px",
              fontWeight: "500",
              color: "#94a3b8",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "20px" }}>
        {/* Welcome Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #0f5c2e 0%, #1a7a3f 100%)",
            borderRadius: "14px",
            padding: "24px 28px",
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: "800",
                color: "#fff",
                letterSpacing: "-0.5px",
                marginBottom: "6px",
              }}
            >
              Good day, {user.fullName.split(" ")[0]} 👋
            </h1>
            <p style={{ fontSize: "14px", color: "#86efac" }}>
              {businesses.length === 0
                ? "Add your first business to get started"
                : `Managing ${businesses.length} business${businesses.length > 1 ? "es" : ""} · Stay compliant`}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => navigate("/new-filing")}
              style={{
                padding: "10px 20px",
                background: "#fff",
                color: "#0f5c2e",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              + New Filing
            </button>
            <button
              onClick={() => navigate("/business/setup")}
              style={{
                padding: "10px 20px",
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              + Add Business
            </button>
          </div>
        </div>

        {/* Stats Cards */}
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
              value: stats.totalFilings,
              icon: "📋",
              bg: "#eff6ff",
              ref: recentFilingsRef,
            },
            {
              label: "Pending",
              value: stats.pendingFilings,
              icon: "⏳",
              bg: "#fefce8",
              ref: recentFilingsRef,
            },
            {
              label: "Completed",
              value: stats.completedFilings,
              icon: "✅",
              bg: "#f0fdf4",
              ref: recentFilingsRef,
            },
            {
              label: "Due Soon",
              value: stats.dueSoonFilings,
              icon: "🔔",
              bg: "#fef2f2",
              ref: myBusinessesRef,
            },
          ].map((s, i) => (
            <button
              key={i}
              onClick={() => scrollTo(s.ref)}
              style={{
                background: "#fff",
                border: "1px solid #e8ede8",
                borderRadius: "12px",
                padding: "16px 18px",
                textAlign: "left",
                cursor: "pointer",
                transition: "border-color 0.15s",
                width: "100%",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#0f5c2e")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "#e8ede8")
              }
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
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
                  }}
                >
                  {s.icon}
                </div>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>↓</span>
              </div>
              <div
                style={{
                  fontSize: "30px",
                  fontWeight: "900",
                  color: "#0a1628",
                  letterSpacing: "-1px",
                  marginBottom: "4px",
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  fontWeight: "500",
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#0f5c2e",
                  fontWeight: "600",
                  marginTop: "6px",
                }}
              >
                Tap to view →
              </div>
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Quick Actions */}
          <div
            ref={quickActionsRef}
            style={{
              background: "#fff",
              borderRadius: "14px",
              border: "1px solid #e8ede8",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f1f5f1",
              }}
            >
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#0a1628",
                }}
              >
                ⚡ Quick Actions
              </span>
            </div>
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}
            >
              {[
                {
                  icon: "📝",
                  label: "Annual Returns",
                  desc: "File yearly returns",
                  type: "ANNUAL_RETURNS",
                },
                {
                  icon: "👥",
                  label: "Change Directors",
                  desc: "Update director info",
                  type: "CHANGE_OF_DIRECTORS",
                },
                {
                  icon: "📍",
                  label: "Change Address",
                  desc: "Update address",
                  type: "CHANGE_OF_ADDRESS",
                },
                {
                  icon: "✏️",
                  label: "Change Name",
                  desc: "Update business name",
                  type: "CHANGE_OF_NAME",
                },
              ].map((a, i) => (
                <button
                  key={i}
                  onClick={() => navigate(`/new-filing?type=${a.type}`)}
                  style={{
                    padding: "18px 16px",
                    borderRight: i < 3 ? "1px solid #f1f5f1" : "none",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f8faf8")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div style={{ fontSize: "26px", marginBottom: "10px" }}>
                    {a.icon}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#0a1628",
                      marginBottom: "4px",
                    }}
                  >
                    {a.label}
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {a.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Filings */}
          <div
            ref={recentFilingsRef}
            style={{
              background: "#fff",
              borderRadius: "14px",
              border: "1px solid #e8ede8",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f1f5f1",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#0a1628",
                }}
              >
                📋 Recent Filings
              </span>
              <button
                onClick={() => navigate("/new-filing")}
                style={{
                  fontSize: "13px",
                  color: "#0f5c2e",
                  fontWeight: "600",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                + New Filing
              </button>
            </div>
            {filings.length === 0 ? (
              <div style={{ padding: "48px", textAlign: "center" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#0a1628",
                    marginBottom: "6px",
                  }}
                >
                  No filings yet
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#94a3b8",
                    marginBottom: "20px",
                  }}
                >
                  Start your first CAC filing to see it here
                </p>
                <button
                  onClick={() => navigate("/new-filing")}
                  style={{
                    padding: "10px 24px",
                    background: "#0f5c2e",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Start Filing
                </button>
              </div>
            ) : (
              <div>
                {filings.slice(0, 5).map((filing, i) => {
                  const s = getStatusStyle(filing.status);
                  return (
                    <div
                      key={filing.id}
                      onClick={() => navigate(`/filing/${filing.id}`)}
                      style={{
                        padding: "14px 20px",
                        borderBottom:
                          i < filings.slice(0, 5).length - 1
                            ? "1px solid #f8faf8"
                            : "none",
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
                      <div>
                        <p
                          style={{
                            fontSize: "15px",
                            fontWeight: "600",
                            color: "#0a1628",
                            marginBottom: "4px",
                          }}
                        >
                          {formatFilingType(filing.filingType)}
                        </p>
                        <p style={{ fontSize: "13px", color: "#64748b" }}>
                          {filing.business?.businessName} ·{" "}
                          {new Date(filing.createdAt).toLocaleDateString(
                            "en-NG",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </p>
                        {filing.status === "AWAITING_INFO" && (
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#ea580c",
                              fontWeight: "600",
                              marginTop: "4px",
                            }}
                          >
                            ⚠️ Action required — tap to respond
                          </p>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: "100px",
                            background: s.bg,
                            color: s.color,
                            fontSize: "12px",
                            fontWeight: "700",
                          }}
                        >
                          {filing.status.replace(/_/g, " ")}
                        </span>
                        {filing.amount && (
                          <span
                            style={{
                              fontSize: "13px",
                              color: "#0f5c2e",
                              fontWeight: "700",
                            }}
                          >
                            {formatCurrency(filing.amount)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* My Businesses */}
          <div
            ref={myBusinessesRef}
            style={{
              background: "#fff",
              borderRadius: "14px",
              border: "1px solid #e8ede8",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f1f5f1",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#0a1628",
                }}
              >
                🏢 My Businesses
              </span>
              <button
                onClick={() => navigate("/business/setup")}
                style={{
                  fontSize: "13px",
                  color: "#0f5c2e",
                  fontWeight: "600",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                + Add New
              </button>
            </div>
            {businesses.length === 0 ? (
              <div style={{ padding: "48px", textAlign: "center" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏢</div>
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#0a1628",
                    marginBottom: "6px",
                  }}
                >
                  No businesses yet
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#94a3b8",
                    marginBottom: "20px",
                  }}
                >
                  Add your first business to start filing
                </p>
                <button
                  onClick={() => navigate("/business/setup")}
                  style={{
                    padding: "10px 24px",
                    background: "#0f5c2e",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Add Business
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    businesses.length === 1
                      ? "1fr"
                      : "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "1px",
                  background: "#f1f5f1",
                }}
              >
                {businesses.map((business) => (
                  <div
                    key={business.id}
                    style={{ background: "#fff", padding: "18px 20px" }}
                  >
                    {/* Compliance Alert */}
                    {business.complianceInfo &&
                      business.complianceInfo.complianceStatus !== "good" && (
                        <div
                          style={{
                            padding: "10px 14px",
                            borderRadius: "8px",
                            marginBottom: "14px",
                            background:
                              business.complianceInfo.complianceColor === "red"
                                ? "#fef2f2"
                                : "#fffbeb",
                            border: `1px solid ${business.complianceInfo.complianceColor === "red" ? "#fecaca" : "#fde68a"}`,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <p
                            style={{
                              fontSize: "13px",
                              fontWeight: "600",
                              color:
                                business.complianceInfo.complianceColor ===
                                "red"
                                  ? "#dc2626"
                                  : "#92400e",
                            }}
                          >
                            {business.complianceInfo.complianceColor === "red"
                              ? "🔴"
                              : "🟡"}{" "}
                            {business.complianceInfo.complianceMessage}
                          </p>
                          <button
                            onClick={() =>
                              navigate("/new-filing?type=ANNUAL_RETURNS")
                            }
                            style={{
                              padding: "5px 12px",
                              background:
                                business.complianceInfo.complianceColor ===
                                "red"
                                  ? "#dc2626"
                                  : "#d97706",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              marginLeft: "8px",
                            }}
                          >
                            File Now
                          </button>
                        </div>
                      )}

                    {/* Business Info */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "14px",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontSize: "16px",
                            fontWeight: "800",
                            color: "#0a1628",
                            marginBottom: "4px",
                            letterSpacing: "-0.3px",
                          }}
                        >
                          {business.businessName}
                        </p>
                        <p
                          style={{
                            fontSize: "13px",
                            color: "#64748b",
                            marginBottom: "4px",
                          }}
                        >
                          {formatBusinessType(business.businessType)}
                        </p>
                        {business.rcNumber && (
                          <p
                            style={{
                              fontSize: "13px",
                              color: "#0f5c2e",
                              fontWeight: "700",
                            }}
                          >
                            RC: {business.rcNumber}
                          </p>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: "100px",
                            background: "#e8f5ee",
                            color: "#0f5c2e",
                            fontSize: "12px",
                            fontWeight: "700",
                          }}
                        >
                          {business.status}
                        </span>
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                          {business.filings.length} filing(s)
                        </span>
                      </div>
                    </div>

                    {/* Compliance Timeline */}
                    {business.complianceInfo && business.registrationDate && (
                      <div
                        style={{
                          borderTop: "1px solid #f1f5f1",
                          paddingTop: "12px",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "12px",
                            marginBottom: "10px",
                          }}
                        >
                          <div>
                            <p
                              style={{
                                fontSize: "12px",
                                color: "#94a3b8",
                                marginBottom: "4px",
                              }}
                            >
                              Date Registered
                            </p>
                            <p
                              style={{
                                fontSize: "13px",
                                fontWeight: "600",
                                color: "#0a1628",
                              }}
                            >
                              {new Date(
                                business.registrationDate,
                              ).toLocaleDateString("en-NG", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <div>
                            <p
                              style={{
                                fontSize: "12px",
                                color: "#94a3b8",
                                marginBottom: "4px",
                              }}
                            >
                              Next Filing Due
                            </p>
                            <p
                              style={{
                                fontSize: "13px",
                                fontWeight: "600",
                                color:
                                  business.complianceInfo.complianceColor ===
                                  "red"
                                    ? "#dc2626"
                                    : business.complianceInfo
                                          .complianceColor === "amber"
                                      ? "#d97706"
                                      : "#0f5c2e",
                              }}
                            >
                              {new Date(
                                business.complianceInfo.nextDueDate,
                              ).toLocaleDateString("en-NG", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "6px",
                          }}
                        >
                          <span style={{ fontSize: "12px", color: "#64748b" }}>
                            Compliance Status
                          </span>
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "700",
                              color:
                                business.complianceInfo.complianceColor ===
                                "red"
                                  ? "#dc2626"
                                  : business.complianceInfo.complianceColor ===
                                      "amber"
                                    ? "#d97706"
                                    : "#0f5c2e",
                            }}
                          >
                            {business.complianceInfo.complianceStatus ===
                              "good" && "✅ Good Standing"}
                            {business.complianceInfo.complianceStatus ===
                              "warning" && "⚠️ Due Soon"}
                            {business.complianceInfo.complianceStatus ===
                              "critical" && "🔴 Critical"}
                            {business.complianceInfo.complianceStatus ===
                              "overdue" && "🔴 Overdue"}
                          </span>
                        </div>
                        <div
                          style={{
                            height: "5px",
                            borderRadius: "100px",
                            background: "#f1f5f1",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              borderRadius: "100px",
                              background:
                                business.complianceInfo.complianceColor ===
                                "red"
                                  ? "#dc2626"
                                  : business.complianceInfo.complianceColor ===
                                      "amber"
                                    ? "#d97706"
                                    : "#0f5c2e",
                              width: `${Math.min(100, Math.max(5, business.complianceInfo.daysUntilDue > 365 ? 100 : (business.complianceInfo.daysUntilDue / 365) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {!business.registrationDate && (
                      <div
                        style={{
                          borderTop: "1px solid #f1f5f1",
                          paddingTop: "10px",
                        }}
                      >
                        <p style={{ fontSize: "13px", color: "#d97706" }}>
                          ⚠️ Add registration date to track compliance deadlines
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
