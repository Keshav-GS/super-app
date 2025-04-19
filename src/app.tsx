import './index.css'; // import css
import * as React from "react";
import { createRoot } from "react-dom/client";

const DashboardCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-white rounded-xl shadow-md p-4 space-y-2">
        <h2 className="text-sm font-semibold text-gray-600">{title}</h2>
        {children}
    </div>
);
const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <div className="flex h-screen w-screen font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-border p-6 flex flex-col space-y-6">
                <div className="text-2xl font-bold text-accent">Super App</div>
                <nav className="flex flex-col space-y-4 text-gray-700 font-medium">
                    <a href="#" className="hover:text-accent">📊 Dashboard</a>
                    <a href="#" className="hover:text-accent">📦 Catalog</a>
                    <a href="#" className="hover:text-accent">🧾 Orders</a>
                    <a href="#" className="hover:text-accent">📋 Inventory</a>
                    <a href="#" className="hover:text-accent">📈 Analytics</a>
                    <a href="#" className="hover:text-accent">✅ Quality Control</a>
                    <a href="#" className="hover:text-accent">⚙️ Admin</a>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                {/* Top bar */}
                <div className="flex justify-between items-center mb-6">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-1/3 p-2 rounded-md border border-gray-300"
                    />
                    <div className="flex space-x-4 items-center">
                        <span>🔔</span>
                        <span>👤</span>
                    </div>
                </div>

                {/* Dashboard grid */}
                <div className="grid grid-cols-3 gap-6">
                    <DashboardCard title="Product & Catalog Management">
                        <div className="flex space-x-3">
                            <span>🔩</span><span>🔧</span><span>🪛</span><span>🧰</span>
                        </div>
                    </DashboardCard>

                    <DashboardCard title="Order & Procurement Management">
                        <p className="text-lg font-bold">32 Pending Orders</p>
                    </DashboardCard>

                    <DashboardCard title="Inventory Management">
                        <p>In Stock: <span className="text-xl font-bold">50,234</span> units</p>
                    </DashboardCard>

                    <DashboardCard title="Supply Chain & Logistics Optimization">
                        <p>Quality Control & Assurance</p>
                    </DashboardCard>

                    <DashboardCard title="AI-powered Furuticsl">
                        <p>🧠 Personalized Recommendations</p>
                        <p>📊 Demand Forecasting</p>
                    </DashboardCard>

                    <DashboardCard title="Analytics & Reporting">
                        <div className="w-full h-20 bg-blue-100 rounded"></div>
                        <p className="text-xs text-gray-400">Analytics & Reptracoging</p>
                    </DashboardCard>
                </div>
            </main>
        </div>
    </React.StrictMode>
);
