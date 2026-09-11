import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminAgents() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
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

  useEffect(() => {
    if (!token) {
      navigate("/admin");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [agentsRes, settingsRes] = await Promise.all([
        axios.get(`${baseUrl}/api/admin/agents`, { headers }),
        axios.get(`${baseUrl}/api/admin/settings`, { headers }),
      ]);
      setAgents(agentsRes.data.agents);
      setSettings(settingsRes.data.settings);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSetting = (key) => settings.find((s) => s.key === key)?.value;

  const handleSaveSetting = async (key, value) => {
    try {
      await axios.put(
        `${baseUrl}/api/admin/settings/${key}`,
        { value },
        { headers },
      );
      fetchData();
      setSuccessMsg("Setting updated!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error("Error updating setting:", error);
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

  const autoAssignEnabled = getSetting("auto_assign_enabled") === "true";
  const autoAssignMethod = getSetting("auto_assign_method") || "round_robin";
  const maxFilings = getSetting("max_filings_per_agent") || "20";

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

        {/* Assignment Settings Panel */}
        <div
          style={{
            background: "#fff",
            borderRadius: "14px",
            border: "1px solid #e8ede8",
            padding: "22px",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              fontWeight: "800",
              color: "#0a1628",
              marginBottom: "16px",
            }}
          >
            ⚙️ Assignment Settings
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
            }}
          >
            {/* Auto Assign Toggle */}
            <div
              style={{
                padding: "16px",
                background: "#f8faf8",
                borderRadius: "10px",
                border: "1px solid #e8ede8",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#64748b",
                  marginBottom: "8px",
                }}
              >
                Auto-Assignment
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "#0a1628",
                  }}
                >
                  {autoAssignEnabled ? "🟢 Enabled" : "🔴 Disabled"}
                </p>
                <button
                  onClick={() =>
                    handleSaveSetting(
                      "auto_assign_enabled",
                      autoAssignEnabled ? "false" : "true",
                    )
                  }
                  style={{
                    padding: "6px 14px",
                    background: autoAssignEnabled ? "#fef2f2" : "#e8f5ee",
                    color: autoAssignEnabled ? "#dc2626" : "#0f5c2e",
                    border: "none",
                    borderRadius: "7px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  {autoAssignEnabled ? "Disable" : "Enable"}
                </button>
              </div>
              <p
                style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}
              >
                New filings auto-assigned when enabled
              </p>
            </div>

            {/* Assignment Method */}
            <div
              style={{
                padding: "16px",
                background: "#f8faf8",
                borderRadius: "10px",
                border: "1px solid #e8ede8",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#64748b",
                  marginBottom: "8px",
                }}
              >
                Assignment Method
              </p>
              <select
                value={autoAssignMethod}
                onChange={(e) =>
                  handleSaveSetting("auto_assign_method", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1.5px solid #d1dbd1",
                  borderRadius: "7px",
                  fontSize: "14px",
                  color: "#0a1628",
                  background: "#fff",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="round_robin">🔄 Round Robin</option>
                <option value="least_loaded">⚖️ Least Loaded</option>
              </select>
              <p
                style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}
              >
                {autoAssignMethod === "round_robin"
                  ? "Distribute evenly across agents"
                  : "Assign to agent with fewest filings"}
              </p>
            </div>

            {/* Max Filings */}
            <div
              style={{
                padding: "16px",
                background: "#f8faf8",
                borderRadius: "10px",
                border: "1px solid #e8ede8",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#64748b",
                  marginBottom: "8px",
                }}
              >
                Max Filings Per Agent
              </p>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <input
                  type="number"
                  defaultValue={maxFilings}
                  onBlur={(e) =>
                    handleSaveSetting("max_filings_per_agent", e.target.value)
                  }
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    border: "1.5px solid #d1dbd1",
                    borderRadius: "7px",
                    fontSize: "14px",
                    color: "#0a1628",
                    background: "#fff",
                    outline: "none",
                  }}
                />
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  filings
                </span>
              </div>
              <p
                style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}
              >
                Agent won't receive more than this
              </p>
            </div>
          </div>

          {/* Auto Assign Now Button */}
          <div
            style={{
              marginTop: "16px",
              paddingTop: "16px",
              borderTop: "1px solid #f1f5f1",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#0a1628",
                }}
              >
                Manually trigger assignment
              </p>
              <p style={{ fontSize: "13px", color: "#64748b" }}>
                Assign all unassigned pending filings to available agents right
                now
              </p>
            </div>
            <button
              onClick={handleAutoAssign}
              style={{
                padding: "10px 20px",
                background: "#1e40af",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              ⚡ Auto-Assign Now
            </button>
          </div>
        </div>

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
              {agents.filter((a) => a.isActive).length} active
            </p>
          </div>
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
                      (leave blank to keep current)
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
                This action cannot be undone. Agent must have no active filings.
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
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "12px",
            }}
          >
            {agents.map((agent) => (
              <div
                key={agent.id}
                style={{
                  background: "#fff",
                  borderRadius: "14px",
                  border: `1px solid ${editingAgent?.id === agent.id ? "#0f5c2e" : "#e8ede8"}`,
                  padding: "20px",
                }}
              >
                {/* Agent Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "14px",
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
                        width: "46px",
                        height: "46px",
                        borderRadius: "50%",
                        background: agent.isActive ? "#e8f5ee" : "#f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
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
                      {agent.phoneNumber && (
                        <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                          {agent.phoneNumber}
                        </p>
                      )}
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
                      flexShrink: 0,
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
                    marginBottom: "14px",
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
                      label: "Completed",
                      value: agent.completed,
                      color: "#0f5c2e",
                      bg: "#f0fdf4",
                    },
                    {
                      label: "SLA %",
                      value: `${agent.slaComplianceRate}%`,
                      color:
                        agent.slaComplianceRate >= 90
                          ? "#0f5c2e"
                          : agent.slaComplianceRate >= 70
                            ? "#d97706"
                            : "#dc2626",
                      bg:
                        agent.slaComplianceRate >= 90
                          ? "#f0fdf4"
                          : agent.slaComplianceRate >= 70
                            ? "#fffbeb"
                            : "#fef2f2",
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      style={{
                        background: s.bg,
                        borderRadius: "8px",
                        padding: "10px",
                        textAlign: "center",
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

                {/* Pending indicator */}
                {agent.pending > 0 && (
                  <div
                    style={{
                      padding: "8px 12px",
                      background: "#fefce8",
                      border: "1px solid #fde68a",
                      borderRadius: "8px",
                      marginBottom: "12px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#854d0e",
                        fontWeight: "600",
                      }}
                    >
                      ⏳ {agent.pending} pending filing(s)
                    </p>
                  </div>
                )}

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
                        fontSize: "13px",
                        color: "#dc2626",
                        fontWeight: "600",
                      }}
                    >
                      🔴 {agent.slaBreached} SLA breach(es)
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                  }}
                >
                  <button
                    onClick={() =>
                      navigate(`/admin/agent/${agent.id}/performance`)
                    }
                    style={{
                      padding: "9px",
                      background: "#0f5c2e",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    📊 Performance
                  </button>
                  <button
                    onClick={() => openEditForm(agent)}
                    style={{
                      padding: "9px",
                      background: "#1e40af",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(agent.id, agent.isActive)}
                    style={{
                      padding: "9px",
                      background: agent.isActive ? "#fff7ed" : "#f0fdf4",
                      color: agent.isActive ? "#d97706" : "#0f5c2e",
                      border: `1px solid ${agent.isActive ? "#fed7aa" : "#bbf7d0"}`,
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    {agent.isActive ? "⏸️ Deactivate" : "▶️ Activate"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(agent)}
                    style={{
                      padding: "9px",
                      background: "#fef2f2",
                      color: "#dc2626",
                      border: "1px solid #fecaca",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    🗑️ Delete
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
