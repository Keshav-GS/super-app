import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../contexts/AuthContext";
import { LockClosedIcon, EnvelopeIcon, UserCircleIcon, PencilSquareIcon, ArrowLeftStartOnRectangleIcon } from "../components/icons";
import { formatDistanceToNow } from 'date-fns';
export default function UserDetails() {
    const { currentUser, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(currentUser?.name || "");

    if (!currentUser) return <div className="p-6">No user found.</div>;

    const roleColors: Record<UserRole, string> = {
        admin: "bg-red-100 text-red-800",
        manager: "bg-blue-100 text-blue-800",
        employee: "bg-green-100 text-green-800"
    };

    const handleSave = () => {
        // Add your update logic here
        setIsEditing(false);
        // You would typically call an API to update user details
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg space-y-4 transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center space-x-4">
                <div className="shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {currentUser.name.charAt(0)}
                    </div>
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-800">{currentUser.name}</h2>
                    <p className="text-sm text-gray-500">{currentUser.email}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[currentUser.role]}`}>
                    {currentUser.role}
                </span>
            </div>

            <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <UserCircleIcon className="h-5 w-5 text-gray-400" />
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="flex-1 bg-transparent focus:outline-none"
                        />
                    ) : (
                        <span className="flex-1">{currentUser.name}</span>
                    )}
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <span className="flex-1">{currentUser.email}</span>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    {currentUser?.lastLogin && (
                        <div className="mb-2">
                            <strong>Last Login:</strong>
                            {formatDistanceToNow(new Date(currentUser.lastLogin))} ago
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                {isEditing ? (
                    <>
                        <button
                            onClick={handleSave}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center"
                        >
                            Save Changes
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex-1 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center justify-center"
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                        >
                            <PencilSquareIcon className="h-5 w-5 mr-2" />
                            Edit Profile
                        </button>
                        <button
                            onClick={logout}
                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center"
                        >
                            <ArrowLeftStartOnRectangleIcon className="h-5 w-5 mr-2" />
                            Logout
                        </button>
                    </>
                )}
            </div>

            {!isEditing && (
                <div className="text-sm text-gray-500 text-center">
                    Member since {new Date().toLocaleDateString()}
                </div>
            )}
        </div>
    );
}
