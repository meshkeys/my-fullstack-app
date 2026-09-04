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
import ProtectedRoute from "./components/ProtectedRoute";

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
      </Routes>
    </Router>
  );
}

export default App;
