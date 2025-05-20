import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await login(email, password);
            navigate("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to log in");
        } finally {
            setIsLoading(false);
        }
    };

    const dismissError = () => {
        setError("");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 via-white to-gray-100 px-4">
            <div className="bg-white shadow-xl rounded-2xl max-w-md w-full p-10 sm:p-12">
                <h2 className="text-3xl font-extrabold text-center text-blue-700 mb-8 tracking-tight">
                    <span className="text-indigo-600">Super App</span>
                </h2>

                {error && (
                    <div
                        role="alert"
                        className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 text-red-700 rounded-md flex justify-between items-center shadow-sm animate-fade-in"
                    >
                        <p className="font-medium">Enter Correct Password!</p>
                        <button
                            onClick={dismissError}
                            aria-label="Dismiss error"
                            className="text-red-700 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-600 rounded"
                        >
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-semibold text-gray-700 mb-1"
                        >
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-semibold text-gray-700 mb-1"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isLoading && (
                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"
                                ></path>
                            </svg>
                        )}
                        <span>{isLoading ? "Logging in..." : "Log In"}</span>
                    </button>
                </form>

                <div className="mt-8 text-center text-gray-600 text-sm space-y-2">
                    <p className="font-semibold">* For testing purposes:</p>
                    <ul className="list-disc list-inside max-w-xs mx-auto space-y-1">
                        <li>
                            Use <span className="font-mono text-indigo-600">admin@example.com</span>{" "}
                            for admin access
                        </li>
                        <li>
                            Use <span className="font-mono text-indigo-600">manager@example.com</span>{" "}
                            for manager access
                        </li>
                        <li>
                            Use any other email for employee access
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
