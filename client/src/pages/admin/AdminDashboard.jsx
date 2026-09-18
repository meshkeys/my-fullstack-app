import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [filings, setFilings] = useState([]);
  const [agents, setAgents] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFilings, setSelectedFilings] = useState([]);
  const [bulkAgent, setBulkAgent] = useState("");
  const [bulkAssigning, setBulkAssigning] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const token = localStorage.getItem("adminToken");
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const headers = { Authorization: `Bearer ${token}` };
  const baseUrl = import.meta.env.VITE_API_URL;

  const fetchData = async () => {
    try {
      const [statsRes, filingsRes, agentsRes] = await Promise.all([
        axios.get(`${baseUrl}/api/admin/stats`, { headers }),
        axios.get(
          `${baseUrl}/api/admin/filings${filter !== "ALL" ? `?status=${filter}` : ""}`,
          { headers },
        ),
        axios.get(`${baseUrl}/api/admin/agents`, { headers }),
      ]);
      setStats(statsRes.data.stats);
      setFilings(filingsRes.data.filings);
      setAgents(agentsRes.data.agents);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      if (error.response?.status === 403) navigate("/admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/admin");
      return;
    }
    fetchData();
  }, [filter]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin");
  };

  const handleSelectFiling = (id) => {
    setSelectedFilings((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedFilings.length === filteredFilings.length) {
      setSelectedFilings([]);
    } else {
      setSelectedFilings(filteredFilings.map((f) => f.id));
    }
  };

  const handleBulkAssign = async () => {
    if (!bulkAgent || selectedFilings.length === 0) return;
    setBulkAssigning(true);
    try {
      const res = await axios.post(
        `${baseUrl}/api/admin/filings/bulk-assign`,
        { filingIds: selectedFilings, agentId: bulkAgent },
        { headers },
      );
      setSuccessMsg(res.data.message);
      setSelectedFilings([]);
      setBulkAgent("");
      fetchData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (error) {
      console.error("Bulk assign error:", error);
    } finally {
      setBulkAssigning(false);
    }
  };

  // Filter and search
  const filteredFilings = filings.filter((filing) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      filing.business?.businessName?.toLowerCase().includes(q) ||
      filing.business?.user?.fullName?.toLowerCase().includes(q) ||
      filing.business?.user?.email?.toLowerCase().includes(q) ||
      filing.business?.rcNumber?.toLowerCase().includes(q) ||
      filing.id?.toLowerCase().includes(q) ||
      filing.filingType?.toLowerCase().includes(q)
    );
  });

  const getStatusColor = (status) =>
    ({
      PENDING: "bg-yellow-100 text-yellow-700",
      IN_REVIEW: "bg-blue-100 text-blue-700",
      AWAITING_INFO: "bg-orange-100 text-orange-700",
      PROCESSING: "bg-purple-100 text-purple-700",
      SUBMITTED_TO_CAC: "bg-indigo-100 text-indigo-700",
      COMPLETED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
    })[status] || "bg-gray-100 text-gray-700";

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

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount || 0);

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
              Admin
            </span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {[
            { label: "👥 Agents", path: "/admin/agents" },
            { label: "⚙️ Settings", path: "/admin/settings" },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              style={{
                padding: "7px 14px",
                background: "#1e293b",
                color: "#94a3b8",
                border: "none",
                borderRadius: "7px",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              {item.label}
            </button>
          ))}
          <span
            style={{ fontSize: "13px", color: "#94a3b8", marginLeft: "4px" }}
          >
            👋 {adminUser.fullName}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: "7px 14px",
              background: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: "7px",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        {successMsg && (
          <div
            style={{
              marginBottom: "16px",
              padding: "14px 18px",
              background: "#f0fdf4",
              border: "1px solid #86efac",
              borderRadius: "10px",
              fontSize: "15px",
              color: "#15803d",
              fontWeight: "500",
            }}
          >
            ✅ {successMsg}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              {[
                {
                  label: "Total Filings",
                  value: stats.totalFilings,
                  icon: "📋",
                  bg: "#eff6ff",
                },
                {
                  label: "Pending Review",
                  value: stats.pendingFilings,
                  icon: "⏳",
                  bg: "#fefce8",
                },
                {
                  label: "Awaiting Info",
                  value: stats.awaitingInfoFilings,
                  icon: "📎",
                  bg: "#fff7ed",
                },
                {
                  label: "Completed",
                  value: stats.completedFilings,
                  icon: "✅",
                  bg: "#f0fdf4",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "16px",
                    border: "1px solid #e8ede8",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      background: s.bg,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
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
                  <p style={{ fontSize: "13px", color: "#64748b" }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  border: "1px solid #e8ede8",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span style={{ fontSize: "28px" }}>👥</span>
                <div>
                  <p
                    style={{
                      fontSize: "22px",
                      fontWeight: "800",
                      color: "#0a1628",
                    }}
                  >
                    {stats.totalUsers}
                  </p>
                  <p style={{ fontSize: "13px", color: "#64748b" }}>
                    Registered Users
                  </p>
                </div>
              </div>
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  border: "1px solid #e8ede8",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span style={{ fontSize: "28px" }}>🏢</span>
                <div>
                  <p
                    style={{
                      fontSize: "22px",
                      fontWeight: "800",
                      color: "#0a1628",
                    }}
                  >
                    {stats.totalBusinesses}
                  </p>
                  <p style={{ fontSize: "13px", color: "#64748b" }}>
                    Registered Businesses
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Filings Table */}
        <div
          style={{
            background: "#fff",
            borderRadius: "14px",
            border: "1px solid #e8ede8",
            overflow: "hidden",
          }}
        >
          {/* Search + Filter Bar */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f1f5f1",
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: "240px", position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "16px",
                }}
              >
                🔍
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by client name, company, RC number or filing ID..."
                style={{
                  width: "100%",
                  padding: "10px 14px 10px 36px",
                  border: "1.5px solid #d1dbd1",
                  borderRadius: "9px",
                  fontSize: "14px",
                  color: "#0a1628",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0f5c2e")}
                onBlur={(e) => (e.target.style.borderColor = "#d1dbd1")}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#94a3b8",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                whiteSpace: "nowrap",
              }}
            >
              {filteredFilings.length} filing(s){" "}
              {search ? `matching "${search}"` : ""}
            </p>
          </div>

          {/* Status Filter Tabs */}
          <div
            style={{
              display: "flex",
              overflowX: "auto",
              borderBottom: "1px solid #f1f5f1",
            }}
          >
            {[
              "ALL",
              "PENDING",
              "IN_REVIEW",
              "AWAITING_INFO",
              "PROCESSING",
              "SUBMITTED_TO_CAC",
              "COMPLETED",
              "REJECTED",
            ].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilter(status);
                  setSelectedFilings([]);
                }}
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  fontWeight: "600",
                  background: "none",
                  border: "none",
                  borderBottom:
                    filter === status
                      ? "2px solid #0f5c2e"
                      : "2px solid transparent",
                  color: filter === status ? "#0f5c2e" : "#64748b",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {status.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          {/* Bulk Actions Bar */}
          {selectedFilings.length > 0 && (
            <div
              style={{
                padding: "12px 20px",
                background: "#f0fdf4",
                border: "1px solid #86efac",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#0f5c2e",
                }}
              >
                ✅ {selectedFilings.length} filing(s) selected
              </span>
              <select
                value={bulkAgent}
                onChange={(e) => setBulkAgent(e.target.value)}
                style={{
                  padding: "8px 12px",
                  border: "1.5px solid #86efac",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#0a1628",
                  background: "#fff",
                  outline: "none",
                }}
              >
                <option value="">Select agent to assign...</option>
                {agents
                  .filter((a) => a.isActive)
                  .map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.fullName} ({agent.totalAssigned} active)
                    </option>
                  ))}
              </select>
              <button
                onClick={handleBulkAssign}
                disabled={!bulkAgent || bulkAssigning}
                style={{
                  padding: "8px 18px",
                  background: "#0f5c2e",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  opacity: !bulkAgent ? 0.5 : 1,
                }}
              >
                {bulkAssigning ? "Assigning..." : "⚡ Assign to Agent"}
              </button>
              <button
                onClick={() => setSelectedFilings([])}
                style={{
                  padding: "8px 14px",
                  background: "#fff",
                  color: "#64748b",
                  border: "1px solid #d1dbd1",
                  borderRadius: "8px",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Clear Selection
              </button>
            </div>
          )}

          {/* Filings Table */}
          {loading ? (
            <div
              style={{
                padding: "60px",
                textAlign: "center",
                color: "#64748b",
                fontSize: "15px",
              }}
            >
              Loading filings...
            </div>
          ) : filteredFilings.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#0a1628",
                }}
              >
                {search
                  ? `No filings matching "${search}"`
                  : "No filings found"}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8faf8" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>
                      <input
                        type="checkbox"
                        checked={
                          selectedFilings.length === filteredFilings.length &&
                          filteredFilings.length > 0
                        }
                        onChange={handleSelectAll}
                        style={{
                          width: "16px",
                          height: "16px",
                          cursor: "pointer",
                          accentColor: "#0f5c2e",
                        }}
                      />
                    </th>
                    {[
                      "Client",
                      "Business",
                      "Filing Type",
                      "Amount",
                      "Status",
                      "Agent",
                      "Date",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "#64748b",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredFilings.map((filing, i) => {
                    const s = getStatusStyle(filing.status);
                    const isSelected = selectedFilings.includes(filing.id);
                    return (
                      <tr
                        key={filing.id}
                        style={{
                          borderTop: "1px solid #f8faf8",
                          background: isSelected ? "#f0fdf4" : "transparent",
                          transition: "background 0.1s",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = "#f8faf8";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <td style={{ padding: "14px 16px" }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectFiling(filing.id)}
                            style={{
                              width: "16px",
                              height: "16px",
                              cursor: "pointer",
                              accentColor: "#0f5c2e",
                            }}
                          />
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <p
                            style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#0a1628",
                            }}
                          >
                            {filing.business?.user?.fullName}
                          </p>
                          <p style={{ fontSize: "12px", color: "#64748b" }}>
                            {filing.business?.user?.email}
                          </p>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <p style={{ fontSize: "14px", color: "#0a1628" }}>
                            {filing.business?.businessName}
                          </p>
                          {filing.business?.rcNumber && (
                            <p
                              style={{
                                fontSize: "12px",
                                color: "#0f5c2e",
                                fontWeight: "600",
                              }}
                            >
                              RC: {filing.business.rcNumber}
                            </p>
                          )}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <p style={{ fontSize: "14px", color: "#0a1628" }}>
                            {formatFilingType(filing.filingType)}
                          </p>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <p
                            style={{
                              fontSize: "14px",
                              fontWeight: "700",
                              color: "#0f5c2e",
                            }}
                          >
                            {formatCurrency(filing.amount)}
                          </p>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              padding: "4px 12px",
                              borderRadius: "100px",
                              background: s.bg,
                              color: s.color,
                              fontSize: "12px",
                              fontWeight: "700",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {filing.status.replace(/_/g, " ")}
                          </span>
                          {filing.messages?.length > 0 &&
                            filing.messages[0].sender === "USER" &&
                            !filing.messages[0].isRead && (
                              <span
                                style={{
                                  marginLeft: "6px",
                                  padding: "2px 7px",
                                  background: "#dc2626",
                                  color: "#fff",
                                  borderRadius: "100px",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                }}
                              >
                                New
                              </span>
                            )}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          {filing.agent ? (
                            <p
                              style={{
                                fontSize: "13px",
                                fontWeight: "600",
                                color: "#0a1628",
                              }}
                            >
                              {filing.agent.fullName}
                            </p>
                          ) : (
                            <p style={{ fontSize: "13px", color: "#94a3b8" }}>
                              Unassigned
                            </p>
                          )}
                        </td>
                        <td
                          style={{ padding: "14px 16px", whiteSpace: "nowrap" }}
                        >
                          <p style={{ fontSize: "12px", color: "#64748b" }}>
                            {new Date(filing.createdAt).toLocaleDateString(
                              "en-NG",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <button
                            onClick={() =>
                              navigate(`/admin/filing/${filing.id}`)
                            }
                            style={{
                              padding: "7px 16px",
                              background: "#0f5c2e",
                              color: "#fff",
                              border: "none",
                              borderRadius: "8px",
                              fontSize: "13px",
                              fontWeight: "600",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            View →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
