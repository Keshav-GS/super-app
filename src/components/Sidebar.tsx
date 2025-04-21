import React, { createContext, useContext, useState } from "react";
import {
    CatalogIcon,
    OrdersIcon,
    InventoryIcon,
    AiIcon,
    LogisticsIcon,
    AnalyticsIcon,
} from "./icons";

// Context to share expanded state with sidebar items
const SidebarContext = createContext({ expanded: true });

export default function Sidebar({ children }: { children: React.ReactNode }) {
    const [expanded, setExpanded] = useState(true);

    return (
        <SidebarContext.Provider value={{ expanded }}>
            <aside
                className={`
          fixed left-0 top-0 h-screen z-40 bg-white shadow-lg
          flex flex-col transition-all duration-300
          border-r-4
          ${expanded ? "w-64 border-blue-400" : "w-20 border-blue-200 overflow-x-hidden"}
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
                        onClick={() => setExpanded((prev) => !prev)}
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
                        <SidebarItem icon={<CatalogIcon />} text="Product & Catalog" />
                        <SidebarItem icon={<OrdersIcon />} text="Orders" />
                        <SidebarItem icon={<InventoryIcon />} text="Inventory" />
                        <SidebarItem icon={<AiIcon />} text="AI Features" />
                        <SidebarItem icon={<LogisticsIcon />} text="Logistics" />
                        <SidebarItem icon={<AnalyticsIcon />} text="Analytics" />
                    </ul>
                </nav>
                {/* User section */}
                <div className="p-4 border-t border-gray-200 flex items-center gap-3">
                    <img
                        src="https://ui-avatars.com/api/?name=Super+User"
                        alt="User"
                        className="w-10 h-10 rounded-full"
                    />
                    <div
                        className={`transition-all duration-300 overflow-hidden ${expanded ? "w-32 opacity-100 ml-2" : "w-0 opacity-0 ml-0"
                            }`}
                    >
                        <div className="font-medium">Super User</div>
                        <div className="text-xs text-gray-500">admin@superapp.com</div>
                    </div>
                </div>
            </aside>
            {/* Spacer for main content */}
            <div className={`${expanded ? "w-64" : "w-20"} transition-all duration-300`} />
            <main className="flex-1">{children}</main>
        </SidebarContext.Provider>
    );
}

// Sidebar item with tooltip when collapsed
function SidebarItem({
    icon,
    text,
}: {
    icon: React.ReactNode;
    text: string;
}) {
    const { expanded } = useContext(SidebarContext);
    return (
        <li className="relative group flex items-center px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-all duration-200">
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
        </li>
    );
}
