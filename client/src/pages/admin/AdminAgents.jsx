import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const FILING_TYPES = [
  { value: "ANNUAL_RETURNS", label: "Annual Returns", icon: "📝" },
  { value: "CHANGE_OF_DIRECTORS", label: "Change of Directors", icon: "👥" },
  { value: "CHANGE_OF_ADDRESS", label: "Change of Address", icon: "📍" },
  { value: "CHANGE_OF_NAME", label: "Change of Name", icon: "✏️" },
  {
    value: "INCREASE_SHARE_CAPITAL",
    label: "Increase Share Capital",
    icon: "💰",
  },
  { value: "AUDITED_ACCOUNTS", label: "Audited Accounts", icon: "📊" },
];

function AdminAgents() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [expandedAgent, setExpandedAgent] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const token = localStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };
  const baseUrl = import.meta.env.VITE_API_URL;

  const fetchData = async () => {
    try {
      const agentsRes = await axios.get(`${baseUrl}/api/admin/agents`, {
        headers,
      });
      setAgents(agentsRes.data.agents);
    } catch (error) {
      console.error("Error fetching data:", error);
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
  }, []);

  const handleToggleAgentAutoAssign = async (agent) => {
    const newValue = !agent.autoAssignEnabled;
    // Optimistically update UI immediately
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agent.id ? { ...a, autoAssignEnabled: newValue } : a,
      ),
    );
    try {
      await axios.put(
        `${baseUrl}/api/admin/agents/${agent.id}/assignment`,
        {
          autoAssignEnabled: newValue,
          assignedTypes: agent.assignedTypes || [],
          maxFilings: agent.maxFilings || 20,
        },
        { headers },
      );
      // Always expand when enabling
      if (newValue) {
        setExpandedAgent(agent.id);
      } else {
        setExpandedAgent(null);
      }
      fetchData();
    } catch (error) {
      console.error("Error toggling auto assign:", error);
    }
  };

  const handleUpdateAgentTypes = async (agent, types) => {
    // Optimistically update UI
    setAgents((prev) =>
      prev.map((a) => (a.id === agent.id ? { ...a, assignedTypes: types } : a)),
    );
    try {
      await axios.put(
        `${baseUrl}/api/admin/agents/${agent.id}/assignment`,
        {
          autoAssignEnabled: agent.autoAssignEnabled,
          assignedTypes: types,
          maxFilings: agent.maxFilings || 20,
        },
        { headers },
      );
      fetchData();
    } catch (error) {
      console.error("Error updating agent types:", error);
    }
  };

  const handleUpdateMaxFilings = async (agent, maxFilings) => {
    try {
      await axios.put(
        `${baseUrl}/api/admin/agents/${agent.id}/assignment`,
        {
          autoAssignEnabled: agent.autoAssignEnabled,
          assignedTypes: agent.assignedTypes || [],
          maxFilings: parseInt(maxFilings),
        },
        { headers },
      );
      fetchData();
    } catch (error) {
      console.error("Error updating max filings:", error);
    }
  };

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await axios.post(`${baseUrl}/api/admin/agents`, formData, { headers });
      setSuccessMsg("Agent created! Login details sent to their email.");
      setShowForm(false);
      setFormData({ fullName: "", email: "", phoneNumber: "", password: "" });
      fetchData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAgent = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await axios.put(
        `${baseUrl}/api/admin/agents/${editingAgent.id}`,
        {
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          ...(formData.password ? { password: formData.password } : {}),
        },
        { headers },
      );
      setSuccessMsg("Agent updated successfully!");
      setEditingAgent(null);
      setFormData({ fullName: "", email: "", phoneNumber: "", password: "" });
      fetchData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAgent = async (id) => {
    try {
      await axios.delete(`${baseUrl}/api/admin/agents/${id}`, { headers });
      setConfirmDelete(null);
      setSuccessMsg("Agent deleted successfully!");
      fetchData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Cannot delete agent with active filings.",
      );
      setConfirmDelete(null);
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      await axios.put(
        `${baseUrl}/api/admin/agents/${id}`,
        { isActive: !isActive },
        { headers },
      );
      fetchData();
    } catch (error) {
      console.error("Error updating agent:", error);
    }
  };

  const handleAutoAssignNow = async () => {
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

  const openEditForm = (agent) => {
    setEditingAgent(agent);
    setFormData({
      fullName: agent.fullName,
      email: agent.email,
      phoneNumber: agent.phoneNumber || "",
      password: "",
    });
    setShowForm(false);
    setError("");
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
        style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px 20px" }}
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

        {error && (
          <div
            style={{
              marginBottom: "16px",
              padding: "14px 18px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "10px",
              fontSize: "15px",
              color: "#dc2626",
              fontWeight: "500",
            }}
          >
            ❌ {error}
          </div>
        )}

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: "900",
                color: "#0a1628",
                letterSpacing: "-0.5px",
              }}
            >
              👥 Agents
            </h1>
            <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
              {agents.length} agent(s) ·{" "}
              {agents.filter((a) => a.isActive).length} active ·{" "}
              {agents.filter((a) => a.autoAssignEnabled).length} with
              auto-assign on
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleAutoAssignNow}
              style={{
                padding: "10px 18px",
                background: "#1e40af",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              ⚡ Auto-Assign Now
            </button>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingAgent(null);
                setFormData({
                  fullName: "",
                  email: "",
                  phoneNumber: "",
                  password: "",
                });
                setError("");
              }}
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
              + Add Agent
            </button>
          </div>
        </div>

        {/* Create Agent Form */}
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
                fontSize: "17px",
                fontWeight: "800",
                color: "#0a1628",
                marginBottom: "20px",
              }}
            >
              ➕ Create New Agent
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
                    Full Name *
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
                    Email *
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
                    Temporary Password *
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

        {/* Edit Agent Form */}
        {editingAgent && (
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              border: "2px solid #0f5c2e",
              padding: "24px",
              marginBottom: "20px",
            }}
          >
            <h3
              style={{
                fontSize: "17px",
                fontWeight: "800",
                color: "#0a1628",
                marginBottom: "20px",
              }}
            >
              ✏️ Edit Agent — {editingAgent.fullName}
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
            <form onSubmit={handleUpdateAgent}>
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
                    Full Name *
                  </label>
                  <input
                    style={inputStyle}
                    type="text"
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
                    Email *
                  </label>
                  <input
                    style={inputStyle}
                    type="email"
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
                    New Password{" "}
                    <span style={{ color: "#94a3b8", fontWeight: "400" }}>
                      (leave blank to keep)
                    </span>
                  </label>
                  <input
                    style={inputStyle}
                    type="text"
                    placeholder="Leave blank to keep current"
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
                  onClick={() => setEditingAgent(null)}
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
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Delete Confirmation */}
        {confirmDelete && (
          <div
            style={{
              background: "#fef2f2",
              borderRadius: "14px",
              border: "1px solid #fecaca",
              padding: "20px",
              marginBottom: "20px",
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
                ⚠️ Delete {confirmDelete.fullName}?
              </p>
              <p
                style={{ fontSize: "13px", color: "#dc2626", marginTop: "4px" }}
              >
                This cannot be undone. Agent must have no active filings.
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  padding: "9px 18px",
                  border: "1px solid #d1dbd1",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAgent(confirmDelete.id)}
                style={{
                  padding: "9px 18px",
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Delete Agent
              </button>
            </div>
          </div>
        )}

        {/* Agents Grid */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px",
              color: "#64748b",
              fontSize: "15px",
            }}
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
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {agents.map((agent) => (
              <div
                key={agent.id}
                style={{
                  background: "#fff",
                  borderRadius: "14px",
                  border: `1.5px solid ${agent.autoAssignEnabled ? "#86efac" : "#e8ede8"}`,
                  overflow: "hidden",
                }}
              >
                {/* Agent Card Header */}
                <div
                  style={{
                    padding: "18px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: agent.isActive ? "#e8f5ee" : "#f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "17px",
                        fontWeight: "800",
                        color: agent.isActive ? "#0f5c2e" : "#94a3b8",
                        flexShrink: 0,
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "16px",
                            fontWeight: "800",
                            color: "#0a1628",
                          }}
                        >
                          {agent.fullName}
                        </p>
                        <span
                          style={{
                            padding: "3px 10px",
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
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#64748b",
                          marginTop: "2px",
                        }}
                      >
                        {agent.email}
                      </p>
                      {agent.phoneNumber && (
                        <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                          {agent.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    {[
                      {
                        label: "Assigned",
                        value: agent.totalAssigned,
                        color: "#1e40af",
                        bg: "#eff6ff",
                      },
                      {
                        label: "Done",
                        value: agent.completed,
                        color: "#0f5c2e",
                        bg: "#f0fdf4",
                      },
                      {
                        label: "SLA %",
                        value: `${agent.slaComplianceRate}%`,
                        color:
                          agent.slaComplianceRate >= 90 ? "#0f5c2e" : "#dc2626",
                        bg:
                          agent.slaComplianceRate >= 90 ? "#f0fdf4" : "#fef2f2",
                      },
                    ].map((s, i) => (
                      <div
                        key={i}
                        style={{
                          background: s.bg,
                          borderRadius: "8px",
                          padding: "8px 14px",
                          textAlign: "center",
                          minWidth: "60px",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "18px",
                            fontWeight: "800",
                            color: s.color,
                          }}
                        >
                          {s.value}
                        </p>
                        <p style={{ fontSize: "11px", color: "#64748b" }}>
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Auto-assign Toggle Row */}
                <div
                  style={{
                    padding: "12px 20px",
                    background: "#f8faf8",
                    borderTop: "1px solid #f1f5f1",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#64748b",
                      }}
                    >
                      Auto-assign tickets:
                    </span>
                    <button
                      onClick={() => handleToggleAgentAutoAssign(agent)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 14px",
                        background: agent.autoAssignEnabled
                          ? "#e8f5ee"
                          : "#f1f5f9",
                        color: agent.autoAssignEnabled ? "#0f5c2e" : "#64748b",
                        border: `1.5px solid ${agent.autoAssignEnabled ? "#86efac" : "#d1dbd1"}`,
                        borderRadius: "100px",
                        fontSize: "13px",
                        fontWeight: "700",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: agent.autoAssignEnabled
                            ? "#0f5c2e"
                            : "#94a3b8",
                        }}
                      />
                      {agent.autoAssignEnabled ? "✅ Enabled" : "⭕ Disabled"}
                    </button>
                    {agent.autoAssignEnabled && (
                      <span style={{ fontSize: "12px", color: "#0f5c2e" }}>
                        {agent.assignedTypes?.length > 0
                          ? `Handling: ${agent.assignedTypes.length} type(s)`
                          : "Handling all types"}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() =>
                        navigate(`/admin/agent/${agent.id}/performance`)
                      }
                      style={{
                        padding: "7px 14px",
                        background: "#0f5c2e",
                        color: "#fff",
                        border: "none",
                        borderRadius: "7px",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      📊 Performance
                    </button>
                    <button
                      onClick={() => openEditForm(agent)}
                      style={{
                        padding: "7px 14px",
                        background: "#1e40af",
                        color: "#fff",
                        border: "none",
                        borderRadius: "7px",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() =>
                        handleToggleActive(agent.id, agent.isActive)
                      }
                      style={{
                        padding: "7px 14px",
                        background: agent.isActive ? "#fff7ed" : "#f0fdf4",
                        color: agent.isActive ? "#d97706" : "#0f5c2e",
                        border: `1px solid ${agent.isActive ? "#fed7aa" : "#bbf7d0"}`,
                        borderRadius: "7px",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      {agent.isActive ? "⏸️ Deactivate" : "▶️ Activate"}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(agent)}
                      style={{
                        padding: "7px 14px",
                        background: "#fef2f2",
                        color: "#dc2626",
                        border: "1px solid #fecaca",
                        borderRadius: "7px",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Expanded Auto-assign Settings */}
                {expandedAgent === agent.id && (
                  <div
                    style={{
                      padding: "16px 20px",
                      borderTop: "1px solid #f1f5f1",
                      background: "#f0fdf4",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: "16px",
                        alignItems: "start",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "#0f5c2e",
                            marginBottom: "10px",
                          }}
                        >
                          📋 Select filing types for this agent:
                        </p>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: "8px",
                          }}
                        >
                          {FILING_TYPES.map((type) => {
                            const isSelected = (
                              agent.assignedTypes || []
                            ).includes(type.value);
                            return (
                              <label
                                key={type.value}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  padding: "8px 12px",
                                  background: isSelected ? "#e8f5ee" : "#fff",
                                  border: `1.5px solid ${isSelected ? "#0f5c2e" : "#e8ede8"}`,
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  fontSize: "13px",
                                  fontWeight: isSelected ? "600" : "400",
                                  color: isSelected ? "#0f5c2e" : "#0a1628",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    const current = agent.assignedTypes || [];
                                    const updated = isSelected
                                      ? current.filter((t) => t !== type.value)
                                      : [...current, type.value];
                                    handleUpdateAgentTypes(agent, updated);
                                  }}
                                  style={{ display: "none" }}
                                />
                                <span>{type.icon}</span>
                                <span>{type.label}</span>
                                {isSelected && (
                                  <span style={{ marginLeft: "auto" }}>✓</span>
                                )}
                              </label>
                            );
                          })}
                        </div>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#64748b",
                            marginTop: "8px",
                          }}
                        >
                          {(agent.assignedTypes || []).length === 0
                            ? "⚠️ No types selected — agent will receive all types"
                            : `✅ Agent will only receive selected filing types`}
                        </p>
                      </div>
                      <div style={{ minWidth: "140px" }}>
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "#0f5c2e",
                            marginBottom: "8px",
                          }}
                        >
                          Max tickets:
                        </p>
                        <input
                          type="number"
                          defaultValue={agent.maxFilings || 20}
                          min={1}
                          max={50}
                          onBlur={(e) =>
                            handleUpdateMaxFilings(agent, e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1.5px solid #86efac",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#0f5c2e",
                            background: "#fff",
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                        <p
                          style={{
                            fontSize: "11px",
                            color: "#64748b",
                            marginTop: "4px",
                          }}
                        >
                          Max active filings
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAgents;
