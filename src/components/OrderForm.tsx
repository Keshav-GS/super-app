import React, { useEffect, useState } from "react";

interface Product {
    id: number;
    product_name: string;
    sku: string;
    category?: string | null;
    material?: string | null;
    size?: string | null;
    thread_pitch?: string | null;
    unit_price?: number | null;
}

interface Supplier {
    id: number;
    name: string;
}

interface OrderItem {
    id?: number;
    product_id: number;
    quantity: number;
    unit_price: number;
}

interface Props {
    orderId: number | null;
    onClose: () => void;
}

export default function OrderForm({ orderId, onClose }: Props) {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingSuppliers, setLoadingSuppliers] = useState(true);
    const [supplierId, setSupplierId] = useState<number | "">("");
    const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<string>("pending");
    const [savedStatus, setSavedStatus] = useState<string>("pending");
    const isReceived = savedStatus === "received";
    // Fetch suppliers and products on mount
    useEffect(() => {
        setLoadingSuppliers(true);
        window.api.getSuppliers()
            .then((data: Supplier[]) => setSuppliers(data))
            .catch((err: any) => {
                setSuppliers([]);
                console.error("Failed to fetch suppliers:", err);
            })
            .finally(() => setLoadingSuppliers(false));

        setLoadingProducts(true);
        window.api.getProducts("")
            .then((data: Product[]) => setProducts(data))
            .catch((err: any) => {
                setProducts([]);
                console.error("Failed to fetch products:", err);
            })
            .finally(() => setLoadingProducts(false));
    }, []);

    // Load order details if editing
    useEffect(() => {
        if (orderId) {
            setLoading(true);
            window.api.getOrderDetails(orderId).then((order: any) => {
                setSupplierId(order.supplier_id);
                setOrderDate(order.order_date);
                setStatus(order.status || "pending");
                setSavedStatus(order.status || "pending");
                setItems(Array.isArray(order.items) ? order.items : []);
            }).finally(() => setLoading(false));
        } else {
            setItems([]);
            setSupplierId("");
            setOrderDate(new Date().toISOString().slice(0, 10));
            setStatus("pending");
            setSavedStatus("pending");
        }
    }, [orderId]);
    // console.log("Products", products);
    const updateItem = (index: number, newItem: Partial<OrderItem>) => {
        setItems(items.map((item, idx) => (idx === index ? { ...item, ...newItem } : item)));
    };

    const addItem = () => {
        setItems([...items, { product_id: 0, quantity: 1, unit_price: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, idx) => idx !== index));
    };

    const handleSave = async () => {
        if (!supplierId) {
            alert("Please select a supplier");
            return;
        }
        if (items.length === 0) {
            alert("Add at least one product");
            return;
        }
        for (const item of items) {
            if (!item.product_id || item.quantity <= 0) {
                alert("All items must have valid product and quantity");
                return;
            }
        }

        setSaving(true);
        try {
            const payload: {
                supplier_id: number;
                order_date: string;
                items: OrderItem[];
                status?: string;
                id?: number;
            } = {
                supplier_id: Number(supplierId),
                order_date: orderDate,
                items,
                status,
            };
            if (orderId) payload.id = orderId;
            await window.api.saveOrder(payload);
            setSavedStatus(status);
            console.log("Order saved successfully");
            onClose();
        } catch (err) {
            alert("Failed to save order: " + err);
        } finally {
            setSaving(false);
        }
    };

    if (loading || loadingProducts || loadingSuppliers) {
        return <div>Loading order form...</div>;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6 overflow-auto max-h-[90vh]">
                <h2 className="text-xl font-bold mb-4">{orderId ? "Edit Order" : "New Order"}</h2>

                <div className="mb-4">
                    <label className="block font-semibold mb-1">Supplier</label>
                    <select
                        className="w-full border rounded px-3 py-2"
                        value={supplierId}
                        onChange={(e) => setSupplierId(Number(e.target.value) || "")}
                        disabled={loadingSuppliers || isReceived}
                    >
                        <option value="">Select Supplier</option>
                        {suppliers.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                    {!loadingSuppliers && suppliers.length === 0 && (
                        <div className="text-red-600 text-sm">No suppliers found.</div>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block font-semibold mb-1">Order Date</label>
                    <input
                        type="date"
                        className="w-full border rounded px-3 py-2"
                        value={orderDate}
                        onChange={(e) => setOrderDate(e.target.value)}
                        disabled={isReceived}
                    />
                </div>
                <div className="mb-4">
                    <label className="block font-semibold mb-1">Status</label>
                    <select
                        className="w-full border rounded px-3 py-2"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        disabled={isReceived}
                    >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="received">Received</option>
                    </select>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Order Items</h3>
                    {items.map((item, idx) => (
                        <div key={idx} className="flex gap-2 mb-2 items-center">
                            {loadingProducts ? (
                                <div>Loading products...</div>
                            ) : (
                                <select
                                    className="flex-grow border rounded px-2 py-1"
                                    value={item.product_id || ""}
                                    onChange={(e) =>
                                        updateItem(idx, { product_id: Number(e.target.value) || 0 })
                                    }
                                    required
                                    disabled={loadingProducts || isReceived}
                                >
                                    <option value="">Select Product</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.product_name} ({p.sku})
                                        </option>
                                    ))}
                                </select>
                            )}
                            <input
                                type="number"
                                className="w-20 border rounded px-2 py-1"
                                min={1}
                                value={item.quantity}
                                onChange={(e) =>
                                    updateItem(idx, { quantity: Number(e.target.value) || 1 })
                                }
                                disabled={isReceived}
                            />
                            <input
                                type="number"
                                className="w-28 border rounded px-2 py-1"
                                min={0}
                                step={0.01}
                                value={item.unit_price}
                                onChange={(e) =>
                                    updateItem(idx, { unit_price: Number(e.target.value) || 0 })
                                }
                                disabled={isReceived}
                            />
                            <button
                                type="button"
                                className="text-red-600 hover:underline"
                                onClick={() => removeItem(idx)}
                                disabled={isReceived}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addItem}
                        className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        disabled={isReceived}
                    >
                        + Add Item
                    </button>
                    {!loadingProducts && products.length === 0 && (
                        <div className="text-red-600 text-sm mt-2">No products found in catalog.</div>
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-6">
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
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                        type="button"
                    >
                        {saving ? "Saving..." : "Save Order"}
                    </button>
                </div>
            </div>
        </div>
    );
}
