// src/components/DashboardCard.tsx
import React, { ReactNode } from 'react';

interface DashboardCardProps {
    title: string;
    icon: ReactNode;
    children: ReactNode;
}

export default function DashboardCard({ title, icon, children }: DashboardCardProps) {
    return (
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
                {icon}
                <h2 className="font-semibold text-lg">{title}</h2>
            </div>
            {children}
        </div>
    );
}
