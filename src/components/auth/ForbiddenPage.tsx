import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function ForbiddenPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                <p className="text-gray-600 mb-6">
                    You don't have permission to access this page.
                    {currentUser && (
                        <span> Your current role is <strong>{currentUser.role}</strong>.</span>
                    )}
                </p>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
                >
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
}
