import React, { use, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
interface InventoryControl {
    min_stock_level: number;
    safety_stock: number;
    lead_time_days: number;
}

interface Product {
    id: number;
    product_name: string;
    sku: string;
}

interface Props {
    productId: number;
    onClose: () => void;
}

export default function InventoryControlsForm({ productId, onClose }: Props) {
    const [product, setProduct] = useState<Product | null>(null);
    const [controls, setControls] = useState<InventoryControl>({
        min_stock_level: 0,
        safety_stock: 0,
        lead_time_days: 0,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const { currentUser, isAdmin } = useAuth();

    // Fetch user and product info
    useEffect(() => {
        setLoading(true);
        Promise.all([
            window.api.getProducts("").then((products: Product[]) =>
                products.find((p) => p.id === productId)
            ),
            window.api.getInventoryControls(productId),
        ])
            .then(([prod, controls]) => {

                setProduct(prod || null);
                if (controls)
                    setControls(controls);
                else
                    setControls({ min_stock_level: 0, safety_stock: 0, lead_time_days: 0 });
            })
            .catch((err) => {
                setError("Failed to load data");
            })
            .finally(() => setLoading(false));
    }, [productId]);

    const handleChange = (field: keyof InventoryControl, value: number) => {
        setControls((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setSaving(true);
        try {
            await window.api.saveInventoryControl({
                product_id: productId,
                ...controls,
            });
            setSuccess("Inventory controls updated!");
            setTimeout(() => {
                onClose();
            }, 800);
        } catch (err: any) {
            setError(err.message || "Failed to update controls");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="bg-white p-6 rounded shadow">Loading...</div>;
    if (!currentUser || !isAdmin())
        return (
            <div className="bg-white p-6 rounded shadow text-red-600">
                Only admins can edit inventory controls.
                <button className="ml-4 text-blue-600 underline" onClick={onClose}>Close</button>
            </div>
        );
    if (!product)
        return (
            <div className="bg-white p-6 rounded shadow text-red-600">
                Product not found.
                <button className="ml-4 text-blue-600 underline" onClick={onClose}>Close</button>
            </div>
        );

    return (
        <div className="bg-white p-6 rounded shadow max-w-md w-full">
            <h2 className="text-xl font-semibold mb-2">
                Edit Inventory Controls
            </h2>
            <div className="mb-4 text-gray-700">
                <strong>{product.product_name}</strong> ({product.sku})
            </div>
            {error && <p className="text-red-600 mb-2">{error}</p>}
            {success && <p className="text-green-600 mb-2">{success}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-medium mb-1">Min Stock Level</label>
                    <input
                        type="number"
                        value={controls.min_stock_level}
                        onChange={e => handleChange("min_stock_level", Number(e.target.value))}
                        className="w-full border rounded p-2"
                        min={0}
                        required
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1">Safety Stock</label>
                    <input
                        type="number"
                        value={controls.safety_stock}
                        onChange={e => handleChange("safety_stock", Number(e.target.value))}
                        className="w-full border rounded p-2"
                        min={0}
                        required
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1">Lead Time (days)</label>
                    <input
                        type="number"
                        value={controls.lead_time_days}
                        onChange={e => handleChange("lead_time_days", Number(e.target.value))}
                        className="w-full border rounded p-2"
                        min={0}
                        required
                    />
                </div>
                <div className="flex justify-between mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                    >
                        Close
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Controls"}
                    </button>
                </div>
            </form>
        </div>
    );
}
