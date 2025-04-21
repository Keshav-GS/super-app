// src/app.tsx
import React from "react";
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';

export default function App() {
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar>
                <div className="flex-1 flex flex-col">
                    <Topbar />
                    <main className="flex-1 p-6">
                        <Dashboard />
                    </main>
                </div>
            </Sidebar>
        </div>
    );
}
