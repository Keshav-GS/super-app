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
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Super App Login</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex justify-between items-center transition-opacity duration-300 ease-in-out animate-fade-in">
                        <span>"Enter Correct Password"</span>
                        <button
                            onClick={dismissError}
                            className="text-red-700 hover:text-red-900 focus:outline-none"
                            aria-label="Dismiss error"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="admin@example.com for admin access"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200 disabled:bg-blue-400"
                    >
                        {isLoading ? "Logging in..." : "Log In"}
                    </button>
                </form>

                <div className="mt-4 text-sm text-gray-600">
                    <p>* For testing:</p>
                    <ul className="list-disc pl-5 mt-1">
                        <li>Use <strong>admin@example.com</strong> for admin access</li>
                        <li>Use <strong>manager@example.com</strong> for manager access</li>
                        <li>Use any other email for employee access</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
