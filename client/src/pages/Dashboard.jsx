import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalFilings: 0,
    pendingFilings: 0,
    completedFilings: 0,
    dueSoonFilings: 0,
  });
  const [businesses, setBusinesses] = useState([]);
  const [filings, setFilings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
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
        console.error("Error fetching stats:", error.response?.data);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatBusinessType = (type) => {
    const types = {
      BUSINESS_NAME: "Business Name",
      PRIVATE_LIMITED_COMPANY: "Private Limited Company",
      PUBLIC_LIMITED_COMPANY: "Public Limited Company",
      INCORPORATED_TRUSTEE: "Incorporated Trustee",
      LIMITED_LIABILITY_PARTNERSHIP: "Limited Liability Partnership",
    };
    return types[type] || type;
  };

  const formatFilingType = (type) => {
    const types = {
      ANNUAL_RETURNS: "Annual Returns",
      CHANGE_OF_DIRECTORS: "Change of Directors",
      CHANGE_OF_ADDRESS: "Change of Address",
      CHANGE_OF_NAME: "Change of Name",
      INCREASE_SHARE_CAPITAL: "Increase Share Capital",
      AUDITED_ACCOUNTS: "Audited Accounts",
    };
    return types[type] || type;
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-700",
      IN_REVIEW: "bg-blue-100 text-blue-700",
      PROCESSING: "bg-purple-100 text-purple-700",
      SUBMITTED_TO_CAC: "bg-indigo-100 text-indigo-700",
      COMPLETED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-green-800 font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-green-800">CAC</span>
          <span className="text-xl font-semibold text-green-600">Filing</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 hidden md:block">
            👋 Welcome, {user.fullName}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <div className="bg-green-800 text-white rounded-2xl p-6 md:p-8 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome back, {user.fullName.split(" ")[0]}! 👋
          </h1>
          <p className="mt-2 text-green-200">
            Here's an overview of your business compliance status.
          </p>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => navigate("/new-filing")}
              className="px-6 py-2 bg-white text-green-800 font-semibold rounded-xl hover:bg-green-50 transition text-sm"
            >
              + Start New Filing
            </button>
            <button
              onClick={() => navigate("/business/setup")}
              className="px-6 py-2 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-600 transition text-sm border border-green-600"
            >
              + Add Business
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Filings",
              value: stats.totalFilings,
              icon: "📋",
              color: "bg-blue-50 text-blue-700",
            },
            {
              label: "Pending",
              value: stats.pendingFilings,
              icon: "⏳",
              color: "bg-yellow-50 text-yellow-700",
            },
            {
              label: "Completed",
              value: stats.completedFilings,
              icon: "✅",
              color: "bg-green-50 text-green-700",
            },
            {
              label: "Due Soon",
              value: stats.dueSoonFilings,
              icon: "🔔",
              color: "bg-red-50 text-red-700",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
              <div
                className={`inline-block px-2 py-1 rounded-lg text-lg ${stat.color}`}
              >
                {stat.icon}
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-800">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Recent Filings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                  Recent Filings
                </h2>
                <button
                  onClick={() => navigate("/new-filing")}
                  className="text-sm text-green-700 hover:underline"
                >
                  + New Filing
                </button>
              </div>
              {filings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📭</div>
                  <p className="text-gray-500 font-medium">No filings yet</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Start your first CAC filing to see it here
                  </p>
                  <button
                    onClick={() => navigate("/new-filing")}
                    className="mt-4 px-6 py-2 bg-green-800 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition"
                  >
                    Start Filing
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filings.slice(0, 5).map((filing) => (
                    <div
                      key={filing.id}
                      className="p-4 border border-gray-100 rounded-xl hover:bg-green-50 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {formatFilingType(filing.filingType)}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {filing.business?.businessName}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(filing.createdAt).toLocaleDateString(
                              "en-NG",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(filing.status)}`}
                          >
                            {filing.status.replace(/_/g, " ")}
                          </span>
                          {filing.amount && (
                            <span className="text-xs text-green-700 font-medium">
                              {formatCurrency(filing.amount)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Businesses */}
<div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-lg font-bold text-gray-800">My Businesses</h2>
    <button
      onClick={() => navigate("/business/setup")}
      className="text-sm text-green-700 hover:underline"
    >
      + Add New
    </button>
  </div>

  {loading ? (
    <div className="text-center py-8 text-gray-400">Loading...</div>
  ) : businesses.length === 0 ? (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">🏢</div>
      <p className="text-gray-500 font-medium">No businesses yet</p>
      <button
        onClick={() => navigate("/business/setup")}
        className="mt-4 px-6 py-2 bg-green-800 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition"
      >
        Add Business
      </button>
    </div>
  ) : (
    <div className="space-y-4">
      {businesses.map((business) => (
        <div key={business.id} className="border border-gray-100 rounded-2xl overflow-hidden">
          
          {/* Compliance Alert Banner */}
          {business.complianceInfo && business.complianceInfo.complianceStatus !== 'good' && (
            <div className={`px-4 py-2 flex items-center gap-2 text-sm font-medium ${
              business.complianceInfo.complianceColor === 'red'
                ? 'bg-red-50 text-red-700 border-b border-red-100'
                : 'bg-amber-50 text-amber-700 border-b border-amber-100'
            }`}>
              <span>
                {business.complianceInfo.complianceColor === 'red' ? '🔴' : '🟡'}
              </span>
              {business.complianceInfo.complianceMessage}
              <button
                onClick={() => navigate(`/new-filing?type=ANNUAL_RETURNS`)}
                className={`ml-auto text-xs px-2 py-1 rounded-lg font-medium ${
                  business.complianceInfo.complianceColor === 'red'
                    ? 'bg-red-700 text-white hover:bg-red-800'
                    : 'bg-amber-600 text-white hover:bg-amber-700'
                } transition`}
              >
                File Now →
              </button>
            </div>
          )}

          {/* Business Card Body */}
          <div className="p-4 hover:bg-green-50 transition cursor-pointer">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-800">{business.businessName}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    business.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {business.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {formatBusinessType(business.businessType)}
                </p>
                {business.rcNumber && (
                  <p className="text-xs text-green-700 mt-1 font-medium">
                    RC: {business.rcNumber}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400">
                  {business.filings.length} filing(s)
                </span>
              </div>
            </div>

            {/* Compliance Timeline */}
            {business.complianceInfo && business.registrationDate && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400">Date Registered</p>
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(business.registrationDate).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Next Filing Due</p>
                    <p className={`text-sm font-medium ${
                      business.complianceInfo.complianceColor === 'red'
                        ? 'text-red-600'
                        : business.complianceInfo.complianceColor === 'amber'
                        ? 'text-amber-600'
                        : 'text-green-600'
                    }`}>
                      {new Date(business.complianceInfo.nextDueDate).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Compliance Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Compliance Status</span>
                    <span className={`font-medium ${
                      business.complianceInfo.complianceColor === 'red'
                        ? 'text-red-600'
                        : business.complianceInfo.complianceColor === 'amber'
                        ? 'text-amber-600'
                        : 'text-green-600'
                    }`}>
                      {business.complianceInfo.complianceStatus === 'good' && '✅ Good Standing'}
                      {business.complianceInfo.complianceStatus === 'warning' && '⚠️ Due Soon'}
                      {business.complianceInfo.complianceStatus === 'critical' && '🔴 Critical'}
                      {business.complianceInfo.complianceStatus === 'overdue' && '🔴 Overdue'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        business.complianceInfo.complianceColor === 'red'
                          ? 'bg-red-500'
                          : business.complianceInfo.complianceColor === 'amber'
                          ? 'bg-amber-400'
                          : 'bg-green-500'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(5,
                          business.complianceInfo.daysUntilDue > 365
                            ? 100
                            : (business.complianceInfo.daysUntilDue / 365) * 100
                        ))}%`
                      }}
                    />
                  </div>
                </div>

              </div>
            )}

            {/* No registration date message */}
            {!business.registrationDate && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-amber-600">
                  ⚠️ Add your registration date to track compliance deadlines
                </p>
                <button
                  onClick={() => navigate('/business/setup')}
                  className="text-xs text-green-700 underline mt-1"
                >
                  Update Business Profile →
                </button>
              </div>
            )}

          </div>
        </div>
      ))}
    </div>
  )}
          </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              {[
                {
                  icon: "📝",
                  label: "Annual Returns",
                  desc: "File your yearly returns",
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
                  desc: "Update business address",
                  type: "CHANGE_OF_ADDRESS",
                },
                {
                  icon: "✏️",
                  label: "Change Name",
                  desc: "Update business name",
                  type: "CHANGE_OF_NAME",
                },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => navigate(`/new-filing?type=${action.type}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition text-left border border-gray-100 cursor-pointer"
                >
                  <span className="text-xl">{action.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {action.label}
                    </p>
                    <p className="text-xs text-gray-400">{action.desc}</p>
                  </div>
                  <span className="ml-auto text-green-600">→</span>
                </button>
              ))}
            </div>

            {/* Compliance reminder */}
            {businesses.length === 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-xs font-semibold text-yellow-800">
                  ⚠️ Add Your Business
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Add a business to start filing
                </p>
                <button
                  onClick={() => navigate("/business/setup")}
                  className="mt-2 text-xs text-yellow-800 font-medium underline"
                >
                  Add Business →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
