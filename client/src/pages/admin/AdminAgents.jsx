import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminAgents() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };
  const baseUrl = import.meta.env.VITE_API_URL;

  const fetchAgents = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/admin/agents`, { headers });
      setAgents(res.data.agents);
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/admin");
      return;
    }
    fetchAgents();
  }, []);

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await axios.post(`${baseUrl}/api/admin/agents`, formData, { headers });
      setSuccessMsg(
        "Agent created successfully! Login details sent to their email.",
      );
      setShowForm(false);
      setFormData({ fullName: "", email: "", phoneNumber: "", password: "" });
      fetchAgents();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      await axios.put(
        `${baseUrl}/api/admin/agents/${id}`,
        { isActive: !isActive },
        { headers },
      );
      fetchAgents();
    } catch (error) {
      console.error("Error updating agent:", error);
    }
  };

  const handleAutoAssign = async () => {
    try {
      const res = await axios.post(
        `${baseUrl}/api/admin/filings/auto-assign`,
        {},
        { headers },
      );
      setSuccessMsg(res.data.message);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (error) {
      console.error("Auto assign error:", error);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    border: "1.5px solid #d1dbd1",
    borderRadius: "8px",
    fontSize: "15px",
    color: "#0a1628",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
  };

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
        <button
          onClick={() => navigate("/admin/dashboard")}
          style={{
            color: "#94a3b8",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ← Back
        </button>
        <span style={{ fontSize: "16px", fontWeight: "800", color: "#fff" }}>
          CAC<span style={{ color: "#4ade80" }}>Filing</span> · Agent Management
        </span>
        <div />
      </nav>

      <div
        style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 20px" }}
      >
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

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "900",
                color: "#0a1628",
                letterSpacing: "-0.5px",
              }}
            >
              👥 Agents
            </h1>
            <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
              {agents.length} agent(s) registered
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleAutoAssign}
              style={{
                padding: "10px 18px",
                background: "#1e40af",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ⚡ Auto-Assign Filings
            </button>
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding: "10px 18px",
                background: "#0f5c2e",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              + Add Agent
            </button>
          </div>
        </div>

        {/* Add Agent Form */}
        {showForm && (
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              border: "1px solid #e8ede8",
              padding: "24px",
              marginBottom: "20px",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#0a1628",
                marginBottom: "20px",
              }}
            >
              Create New Agent
            </h3>
            {error && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "12px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#dc2626",
                }}
              >
                {error}
              </div>
            )}
            <form onSubmit={handleCreateAgent}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#0a1628",
                      marginBottom: "6px",
                    }}
                  >
                    Full Name
                  </label>
                  <input
                    style={inputStyle}
                    type="text"
                    placeholder="John Doe"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#0a1628",
                      marginBottom: "6px",
                    }}
                  >
                    Email
                  </label>
                  <input
                    style={inputStyle}
                    type="email"
                    placeholder="agent@cacfiling.com"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#0a1628",
                      marginBottom: "6px",
                    }}
                  >
                    Phone Number
                  </label>
                  <input
                    style={inputStyle}
                    type="tel"
                    placeholder="08012345678"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#0a1628",
                      marginBottom: "6px",
                    }}
                  >
                    Temporary Password
                  </label>
                  <input
                    style={inputStyle}
                    type="text"
                    placeholder="TempPass@123"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: "10px 20px",
                    border: "1px solid #d1dbd1",
                    borderRadius: "8px",
                    fontSize: "14px",
                    background: "#fff",
                    cursor: "pointer",
                    color: "#64748b",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "10px 20px",
                    background: "#0f5c2e",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  {saving ? "Creating..." : "Create Agent"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Agents Grid */}
        {loading ? (
          <div
            style={{ textAlign: "center", padding: "60px", color: "#64748b" }}
          >
            Loading agents...
          </div>
        ) : agents.length === 0 ? (
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              border: "1px solid #e8ede8",
              padding: "60px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>👥</div>
            <p
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#0a1628",
                marginBottom: "6px",
              }}
            >
              No agents yet
            </p>
            <p style={{ fontSize: "14px", color: "#94a3b8" }}>
              Add your first agent to start assigning filings
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "12px",
            }}
          >
            {agents.map((agent) => (
              <div
                key={agent.id}
                style={{
                  background: "#fff",
                  borderRadius: "14px",
                  border: "1px solid #e8ede8",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: "#e8f5ee",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
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
                          fontSize: "15px",
                          fontWeight: "700",
                          color: "#0a1628",
                        }}
                      >
                        {agent.fullName}
                      </p>
                      <p style={{ fontSize: "13px", color: "#64748b" }}>
                        {agent.email}
                      </p>
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "100px",
                      background: agent.isActive ? "#e8f5ee" : "#fef2f2",
                      color: agent.isActive ? "#0f5c2e" : "#dc2626",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    {agent.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Stats */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "8px",
                    marginBottom: "16px",
                  }}
                >
                  {[
                    { label: "Assigned", value: agent.totalAssigned },
                    { label: "Completed", value: agent.completed },
                    { label: "SLA %", value: `${agent.slaComplianceRate}%` },
                  ].map((s, i) => (
                    <div
                      key={i}
                      style={{
                        background: "#f8faf8",
                        borderRadius: "8px",
                        padding: "10px",
                        textAlign: "center",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "18px",
                          fontWeight: "800",
                          color: "#0a1628",
                        }}
                      >
                        {s.value}
                      </p>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#64748b",
                          marginTop: "2px",
                        }}
                      >
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>

                {agent.slaBreached > 0 && (
                  <div
                    style={{
                      padding: "8px 12px",
                      background: "#fef2f2",
                      borderRadius: "8px",
                      marginBottom: "12px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#dc2626",
                        fontWeight: "600",
                      }}
                    >
                      🔴 {agent.slaBreached} SLA breach(es)
                    </p>
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() =>
                      navigate(`/admin/agent/${agent.id}/performance`)
                    }
                    style={{
                      flex: 1,
                      padding: "8px",
                      background: "#0f5c2e",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    View Performance
                  </button>
                  <button
                    onClick={() => handleToggleActive(agent.id, agent.isActive)}
                    style={{
                      padding: "8px 14px",
                      background: agent.isActive ? "#fef2f2" : "#e8f5ee",
                      color: agent.isActive ? "#dc2626" : "#0f5c2e",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    {agent.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAgents;
