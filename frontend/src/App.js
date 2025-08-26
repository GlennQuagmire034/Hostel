import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import ProtectedRoute from "./components/ProtectedRoute"
import HostelDashboard from "./pages/HostelDashboard"
import Allotments from "./pages/Allotments"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Trainees from "./pages/Trainees"
import Rooms from "./pages/Rooms"
import Amenities from "./pages/Amenities"
import Reports from "./pages/Reports"
import NotFound from "./pages/NotFound"
import { DataProvider } from "./context/DataContext"

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DataProvider>
                    <HostelDashboard />
                  </DataProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/allotments"
              element={
                <ProtectedRoute>
                  <DataProvider>
                    <Allotments />
                  </DataProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainees"
              element={
                <ProtectedRoute>
                  <DataProvider>
                    <Trainees />
                  </DataProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/rooms"
              element={
                <ProtectedRoute>
                  <DataProvider>
                    <Rooms />
                  </DataProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/amenities"
              element={
                <ProtectedRoute>
                  <DataProvider>
                    <Amenities />
                  </DataProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <DataProvider>
                    <Reports />
                  </DataProvider>
                </ProtectedRoute>
              }
            />

            {/* Fallback routes */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
