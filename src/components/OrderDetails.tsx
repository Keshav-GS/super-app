import React, { useEffect, useState } from "react";

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
}

interface OrderDetailsProps {
    orderId: number;
    onClose: () => void;
}

interface Order {
    id: number;
    supplier_name: string;
    order_date: string;
    status: string;
    total_amount: number;
    items: OrderItem[];
}

export default function OrderDetails({ orderId, onClose }: OrderDetailsProps) {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [markingReceived, setMarkingReceived] = useState(false);

    useEffect(() => {
        setLoading(true);
        window.api.getOrderDetails(orderId).then((data: Order) => {
            setOrder(data);
        }).finally(() => setLoading(false));
    }, [orderId]);
    console.log("order details: ", order);
    const markAsReceived = async () => {
        if (!order) return;
        setMarkingReceived(true);
        try {
            await window.api.receiveOrder(order.id);
            onClose();
        } catch (err) {
            alert("Failed to mark order as received: " + err);
        } finally {
            setMarkingReceived(false);
        }
    };

    if (loading) return <div>Loading order details...</div>;
    if (!order) return <div>Order not found.</div>;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-full overflow-auto p-6 relative">
                <h2 className="text-xl font-bold mb-4">Order #{order.id}</h2>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl"
                    aria-label="Close"
                >
                    &times;
                </button>

                <div className="mb-4">
                    <strong>Supplier:</strong> {order.supplier_name}
                </div>
                <div className="mb-4">
                    <strong>Order Date:</strong> {order.order_date}
                </div>
                <div className="mb-4 capitalize">
                    <strong>Status:</strong> {order.status}
                </div>

                <table className="w-full border-collapse border border-gray-200">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="border px-4 py-2 text-left">Product</th>
                            <th className="border px-4 py-2 text-right">Quantity</th>
                            <th className="border px-4 py-2 text-right">Unit Price (₹)</th>
                            <th className="border px-4 py-2 text-right">Total (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="border px-4 py-2">{item.product_name}</td>
                                <td className="border px-4 py-2 text-right">{item.quantity}</td>
                                <td className="border px-4 py-2 text-right">
                                    ₹{item.unit_price.toFixed(2)}
                                </td>
                                <td className="border px-4 py-2 text-right">
                                    ₹{(item.quantity * item.unit_price).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-4 text-right font-semibold text-lg">
                    Total Amount: ₹{order.total_amount.toFixed(2)}
                </div>

                {order.status !== "received" && (
                    <button
                        onClick={markAsReceived}
                        disabled={markingReceived}
                        className="mt-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                        {markingReceived ? "Processing..." : "Mark as Received"}
                    </button>
                )}
            </div>
        </div>
    );
}
