import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
    DashboardIcon,
    CatalogIcon,
    OrdersIcon,
    InventoryIcon,
    AnalyticsIcon,
} from "../components/icons";

// Context to share expanded state with sidebar items
export const SidebarContext = createContext({ expanded: true });

export default function Sidebar() {
    const [expanded, setExpanded] = useState(false); // Start collapsed
    const { currentUser, isAdmin, isManager, logout } = useAuth();
    const navigate = useNavigate();

    if (!currentUser) return null;

    const handleLogout = () => {
        logout().then(() => navigate("/login"));
    };

    // Toggle sidebar expanded state and dispatch event
    const toggleSidebar = () => {
        const newState = !expanded;
        setExpanded(newState);
        window.dispatchEvent(
            new CustomEvent('sidebarStateChange', {
                detail: { expanded: newState }
            })
        );
    };

    // Dispatch initial state on mount
    useEffect(() => {
        window.dispatchEvent(
            new CustomEvent('sidebarStateChange', {
                detail: { expanded: expanded }
            })
        );
    }, []);

    return (
        <SidebarContext.Provider value={{ expanded }}>
            <aside
                className={`
                  fixed left-0 top-0 h-screen z-40 bg-white shadow-lg
                  flex flex-col transition-all duration-300
                  border-r-4 overflow-x-hidden
                  ${expanded ? "w-64 border-blue-400" : "w-20 border-blue-200"}
                  hover:border-blue-600
                `}
            >
                {/* Top branding and toggle button */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <span className={`font-bold text-xl text-blue-700 transition-all duration-300 ${expanded ? "opacity-100" : "opacity-0 w-0"}`}>
                        Super App
                    </span>
                    <span className={`font-bold text-xl text-blue-700 transition-all duration-300 ${expanded ? "hidden" : "block"}`}>
                        SA
                    </span>
                    <button
                        onClick={toggleSidebar}
                        className="p-2 ml-2 rounded hover:bg-blue-50 transition"
                        aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
                    >
                        <svg
                            className={`w-6 h-6 transition-transform duration-300 ${expanded ? "" : "rotate-180"}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>
                </div>
                {/* Navigation */}
                <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
                    <ul className="space-y-2">
                        {/* All roles */}
                        <SidebarItem
                            icon={<DashboardIcon />}
                            text="Dashboard"
                            onClick={() => navigate('/dashboard')}
                        />
                        <SidebarItem
                            icon={<CatalogIcon />}
                            text="Product Catalog"
                            onClick={() => navigate('/products')}
                        />
                        <SidebarItem
                            icon={<InventoryIcon />}
                            text="Inventory"
                            onClick={() => navigate('/inventory')}
                        />

                        {/* Manager & Admin: Order & Procurement */}
                        {(isManager() || isAdmin()) && (
                            <SidebarItem
                                icon={<OrdersIcon />}
                                text="Order & Procurement"
                                onClick={() => navigate('/orders')}
                            />
                        )}

                        {/* Admin only: Analytics */}
                        {isAdmin() && (
                            <SidebarItem
                                icon={<AnalyticsIcon />}
                                text="Analytics & Dashboard"
                                onClick={() => navigate('/analytics')}
                            />
                        )}
                    </ul>
                </nav>
                {/* User section */}
                <div className="p-4 border-t border-gray-200">
                    <div className={`flex items-center justify-between ${!expanded && 'flex-col'}`}>
                        <div className={`transition-all duration-300 ${!expanded && 'text-center mb-2'}`}>
                            <div className="font-medium text-sm">{currentUser.name}</div>
                            <div className="text-xs text-gray-500">{currentUser.role}</div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-red-600 hover:text-red-800 text-sm"
                        >
                            {expanded ? "Logout" : "Exit"}
                        </button>
                    </div>
                </div>
            </aside>
        </SidebarContext.Provider>
    );
}

// Sidebar item with tooltip when collapsed
function SidebarItem({
    icon,
    text,
    onClick,
}: {
    icon: React.ReactNode;
    text: string;
    onClick?: () => void;
}) {
    const { expanded } = useContext(SidebarContext);
    return (
        <li className="relative group">
            <button
                onClick={onClick}
                className="w-full flex items-center px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-all duration-200"
            >
                <span className="w-6 h-6">{icon}</span>
                <span
                    className={`
                      transition-all duration-300
                      ${expanded ? "opacity-100 ml-3" : "opacity-0 ml-0 w-0"}
                      whitespace-nowrap overflow-hidden
                    `}
                >
                    {text}
                </span>
                {/* Tooltip on hover when collapsed */}
                {!expanded && (
                    <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded bg-blue-700 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-lg z-50">
                        {text}
                    </span>
                )}
            </button>
        </li>
    );
}
