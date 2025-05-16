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
import UserDetails from "./components/UserDetails";
import ProductCatalog from "./components/ProductCatalog";
import OrderTracking from "./components/OrderProcurement";
import InventoryManagement from "./components/InventoryManagement";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import QualityControl from "./components/QualityControl";

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


                    {/* Admin-only route example */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute requiredRole="admin">
                                <MainLayout>
                                    <h1 className="text-2xl font-bold">Admin Panel</h1>
                                    <p>Only admins can see this page</p>
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Manager-level route example */}
                    <Route
                        path="/inventory"
                        element={
                            <ProtectedRoute requiredRole="manager">
                                <MainLayout>
                                    <h1 className="text-2xl font-bold">Inventory Management</h1>
                                    <p>Managers and admins can see this page</p>
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/user" element={<ProtectedRoute><MainLayout><UserDetails /></MainLayout></ProtectedRoute>} />
                    <Route path="/products" element={<ProtectedRoute><MainLayout><ProductCatalog /></MainLayout></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute><MainLayout><OrderTracking /></MainLayout></ProtectedRoute>} />
                    <Route path="/inventory" element={<ProtectedRoute><MainLayout><InventoryManagement /></MainLayout></ProtectedRoute>} />
                    <Route path="/qc" element={<ProtectedRoute><MainLayout><QualityControl /></MainLayout></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute><MainLayout><AnalyticsDashboard /></MainLayout></ProtectedRoute>} />

                    {/* Redirect to login by default */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}
