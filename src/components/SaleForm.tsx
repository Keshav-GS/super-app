import React, { useEffect, useState } from "react";

interface Product {
    id: number;
    product_name: string;
    sku: string;
    quantity_on_hand: number;
}

interface Props {
    onSaleRecorded?: () => void;
    inventoryRefresh?: number;
}

export default function SaleForm({ onSaleRecorded, inventoryRefresh }: Props) {
    const [products, setProducts] = useState<Product[]>([]);
    const [productId, setProductId] = useState<number | "">("");
    const [quantity, setQuantity] = useState<number>(0);
    const [customerName, setCustomerName] = useState<string>("");
    const [orderNote, setOrderNote] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");


    useEffect(() => {
        window.api.getInventory().then(setProducts);
    }, [inventoryRefresh]);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!productId) {
            setError("Please select a product");
            return;
        }
        if (quantity <= 0) {
            setError("Quantity must be greater than zero");
            return;
        }
        const selectedProduct = products.find(p => p.id === productId);
        if (!selectedProduct || selectedProduct.quantity_on_hand < quantity) {
            setError("Insufficient stock");
            return;
        }

        try {
            await window.api.recordSale({
                product_id: productId,
                quantity,
                customer_name: customerName,
                order_note: orderNote,
            });
            setSuccess("Sale recorded successfully");
            setQuantity(0);
            setCustomerName("");
            setOrderNote("");
            if (onSaleRecorded) onSaleRecorded();
        } catch (err: any) {
            setError(err.message || "Failed to record sale");
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 border rounded shadow bg-white mt-8">
            <h2 className="text-xl font-semibold mb-4">Record Sale</h2>
            {error && <p className="text-red-600 mb-2">{error}</p>}
            {success && <p className="text-green-600 mb-2">{success}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-medium mb-1">Product</label>
                    <select
                        value={productId}
                        onChange={e => setProductId(Number(e.target.value) || "")}
                        className="w-full border border-gray-300 rounded p-2"
                        required
                    >
                        <option value="">-- Select Product --</option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.product_name} ({p.sku}) - Stock: {p.quantity_on_hand}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block font-medium mb-1">Quantity</label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={e => setQuantity(Number(e.target.value))}
                        className="w-full border border-gray-300 rounded p-2"
                        required
                        min={1}
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1">Customer Name (optional)</label>
                    <input
                        type="text"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        className="w-full border border-gray-300 rounded p-2"
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1">Order Note (optional)</label>
                    <input
                        type="text"
                        value={orderNote}
                        onChange={e => setOrderNote(e.target.value)}
                        className="w-full border border-gray-300 rounded p-2"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                    Record Sale
                </button>
            </form>
        </div>
    );
}
