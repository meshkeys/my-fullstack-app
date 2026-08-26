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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log("Fetching stats...");
        console.log("Token in localStorage:", localStorage.getItem("token"));
        const response = await api.get("/api/business/stats");
        console.log("Stats response:", response.data);
        setStats(response.data.stats);
        setBusinesses(response.data.businesses);
      } catch (error) {
        console.error("Error fetching stats:", error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    console.log("User in dashboard:", user);

    if (user) {
      fetchStats();
    } else {
      setLoading(false);
    }
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

  if (!user) return null;

  // 👇 ADD THIS HERE — before the main return
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

  if (!user) return null;

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
                {loading ? "..." : stat.value}
              </p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* My Businesses */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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
                <p className="text-gray-400 text-sm mt-1">
                  Add your business to get started
                </p>
                <button
                  onClick={() => navigate("/business/setup")}
                  className="mt-4 px-6 py-2 bg-green-800 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition"
                >
                  Add Business
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {businesses.map((business) => (
                  <div
                    key={business.id}
                    className="p-4 border border-gray-100 rounded-xl hover:bg-green-50 transition cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {business.businessName}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatBusinessType(business.businessType)}
                        </p>
                        {business.rcNumber && (
                          <p className="text-xs text-green-700 mt-1">
                            RC: {business.rcNumber}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            business.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {business.status}
                        </span>
                        <span className="text-xs text-gray-400">
                          {business.filings.length} filing(s)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              {[
                {
                  icon: "📝",
                  label: "Annual Returns",
                  desc: "File your yearly returns",
                },
                {
                  icon: "👥",
                  label: "Change Directors",
                  desc: "Update director info",
                },
                {
                  icon: "📍",
                  label: "Change Address",
                  desc: "Update business address",
                },
                {
                  icon: "✏️",
                  label: "Change Name",
                  desc: "Update business name",
                },
              ].map((action, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition text-left border border-gray-100"
                >
                  <span className="text-xl">{action.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {action.label}
                    </p>
                    <p className="text-xs text-gray-400">{action.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Compliance Reminder Banner */}
        {businesses.length === 0 && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-yellow-800">
                Add Your Business Profile
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Complete your business profile to get personalized compliance
                reminders.
              </p>
              <button
                onClick={() => navigate("/business/setup")}
                className="mt-2 text-sm text-yellow-800 font-medium underline"
              >
                Complete Profile →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
