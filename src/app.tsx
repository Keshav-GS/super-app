import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./components/auth/Login";
import ForbiddenPage from "./components/auth/ForbiddenPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./components/MainLayout";
import UserDetails from "./pages/UserDetails";
import ProductCatalog from "./pages/ProductCatalog";
import OrderTracking from "./pages/OrderProcurement";
import InventoryManagement from "./pages/InventoryManagement";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/forbidden" element={<ForbiddenPage />} />

                    {/* Protected routes with main layout */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <Dashboard />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/user" element={<ProtectedRoute><MainLayout><UserDetails /></MainLayout></ProtectedRoute>} />
                    <Route path="/products" element={<ProtectedRoute><MainLayout><ProductCatalog /></MainLayout></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute><MainLayout><OrderTracking /></MainLayout></ProtectedRoute>} />
                    <Route path="/inventory" element={<ProtectedRoute requiredRole="manager"><MainLayout><InventoryManagement /></MainLayout></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute><MainLayout><AnalyticsDashboard /></MainLayout></ProtectedRoute>} />

                    {/* Redirect to login by default */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}
