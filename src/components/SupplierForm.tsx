import React, { useState } from "react";

interface Props {
    onClose: () => void;
}

export default function SupplierForm({ onClose }: Props) {
    const [name, setName] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            alert("Supplier name is required");
            return;
        }
        setSaving(true);
        try {
            await window.api.addSupplier({ name, contact_email: contactEmail, phone, address });
            onClose();
        } catch (err) {
            alert("Failed to add supplier: " + err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                <h2 className="text-xl font-bold mb-4">Add Supplier</h2>

                <div className="mb-3">
                    <label className="block font-semibold mb-1">Name</label>
                    <input
                        type="text"
                        className="w-full border rounded px-3 py-2"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="block font-semibold mb-1">Contact Email</label>
                    <input
                        type="email"
                        className="w-full border rounded px-3 py-2"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label className="block font-semibold mb-1">Phone</label>
                    <input
                        type="tel"
                        className="w-full border rounded px-3 py-2"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label className="block font-semibold mb-1">Address</label>
                    <textarea
                        className="w-full border rounded px-3 py-2"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={3}
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                        type="button"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                        type="button"
                    >
                        {saving ? "Saving..." : "Save Supplier"}
                    </button>
                </div>
            </div>
        </div>
    );
}
