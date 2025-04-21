import React from 'react';
import { NotificationIcon, UserIcon } from './icons';

export default function Topbar() {
    return (
        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200">
            <div className="relative w-1/3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search"
                    className="pl-10 pr-4 py-2 w-full bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="flex items-center space-x-4">
                <button className="text-gray-600 hover:text-gray-900">
                    <NotificationIcon />
                </button>
                <button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserIcon />
                </button>
            </div>
        </div>
    );
}
