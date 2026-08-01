import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

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
          <button
            onClick={() => navigate("/new-filing")}
            className="mt-4 px-6 py-2 bg-white text-green-800 font-semibold rounded-xl hover:bg-green-50 transition text-sm"
          >
            + Start New Filing
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Filings",
              value: "0",
              icon: "📋",
              color: "bg-blue-50 text-blue-700",
            },
            {
              label: "Pending",
              value: "0",
              icon: "⏳",
              color: "bg-yellow-50 text-yellow-700",
            },
            {
              label: "Completed",
              value: "0",
              icon: "✅",
              color: "bg-green-50 text-green-700",
            },
            {
              label: "Due Soon",
              value: "0",
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
          {/* Recent Filings */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                Recent Filings
              </h2>
              <button className="text-sm text-green-700 hover:underline">
                View All
              </button>
            </div>
            {/* Empty State */}
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
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-yellow-800">
              Add Your Business Profile
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              Complete your business profile to get personalized compliance
              reminders and filing deadlines.
            </p>
            <button className="mt-2 text-sm text-yellow-800 font-medium underline">
              Complete Profile →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
