import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import HomePage from "./pages/HomePage"
import RegistrationPage from "./pages/RegistrationPage"
import AdminLoginPage from "./pages/AdminLoginPage"
import AdminDashboard from "./pages/AdminDashboard"
import AdminSessions from "./pages/AdminSessions"
import ProtectedRoute from "./components/ProtectedRoute"
import Layout from "./components/Layout"

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/inscription" element={<RegistrationPage />} />
          <Route path="/admin" element={<AdminLoginPage />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sessions"
            element={
              <ProtectedRoute>
                <AdminSessions />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}

export default App
