import React from "react";
import { useAuth } from "../contexts/AuthContext";

export default function UserDetails() {
    const { currentUser } = useAuth();

    if (!currentUser) return <div className="p-6">No user found.</div>;

    return (
        <div className="p-8 max-w-md mx-auto bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">User Details</h2>
            <div className="mb-2"><strong>Name:</strong> {currentUser.name}</div>
            <div className="mb-2"><strong>Email:</strong> {currentUser.email}</div>
            <div className="mb-2"><strong>Role:</strong> {currentUser.role}</div>
        </div>
    );
}
