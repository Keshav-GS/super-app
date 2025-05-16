// src/components/MainLayout.tsx
import React, { useState, useEffect } from "react";
import Sidebar from "../pages/Sidebar";
import Topbar from "../pages/Topbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    // Track sidebar state - we'll sync this with the actual sidebar
    const [sidebarExpanded, setSidebarExpanded] = useState(false);

    // Listen for sidebar expansion state changes
    useEffect(() => {
        const handleSidebarChange = (e: CustomEvent) => {
            setSidebarExpanded(e.detail.expanded);
        };

        // Add event listener for sidebar state changes
        window.addEventListener('sidebarStateChange' as any, handleSidebarChange);

        return () => {
            window.removeEventListener('sidebarStateChange' as any, handleSidebarChange);
        };
    }, []);

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            {/* Add margin-left based on sidebar width */}
            <div className={`flex-1 flex flex-col min-w-0 ${sidebarExpanded ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
                <Topbar />
                <main className="flex-1 overflow-auto p-6 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
}
