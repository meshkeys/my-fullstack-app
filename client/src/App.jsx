import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BusinessSetup from "./pages/BusinessSetup";
import NewFiling from "./pages/NewFiling";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import FilingDetail from "./pages/FilingDetail";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFilingDetail from "./pages/admin/AdminFilingDetail";
import AdminPricing from "./pages/admin/AdminPricing";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminAgents from "./pages/admin/AdminAgents";
import AdminSLA from "./pages/admin/AdminSLA";
import AgentPerformance from "./pages/admin/AgentPerformance";
import AgentDashboard from "./pages/agent/AgentDashboard";

// Inside Routes:
<Route path="/admin/pricing" element={<AdminPricing />} />;

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/agents" element={<AdminAgents />} />
        <Route path="/admin/sla" element={<AdminSLA />} />
        <Route
          path="/admin/agent/:id/performance"
          element={<AgentPerformance />}
        />
        <Route path="/agent/dashboard" element={<AgentDashboard />} />

        {/* Protected client routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/setup"
          element={
            <ProtectedRoute>
              <BusinessSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new-filing"
          element={
            <ProtectedRoute>
              <NewFiling />
            </ProtectedRoute>
          }
        />
        <Route
          path="/filing/:id"
          element={
            <ProtectedRoute>
              <FilingDetail />
            </ProtectedRoute>
          }
        />

        {/* Admin routes — no ProtectedRoute, admin handles its own auth */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/filing/:id" element={<AdminFilingDetail />} />
        <Route path="/admin/pricing" element={<AdminPricing />} />
      </Routes>
    </Router>
  );
}

export default App;
