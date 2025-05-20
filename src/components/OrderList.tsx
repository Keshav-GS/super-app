import React, { useEffect, useState } from "react";

interface Order {
    id: number;
    supplier_name: string;
    order_date: string;
    status: string;
    total_amount: number;
}

interface Props {
    onView: (id: number) => void;
    onEdit: (id: number) => void;
    //  onDelete: (id: number) => void;
    refresh: boolean;
}

export default function OrderList({ onView, onEdit, refresh }: Props) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        setLoading(true);
        window.api
            .getOrders({ search, status: statusFilter })
            .then((data: Order[]) => {
                setOrders(data);
            })
            .finally(() => setLoading(false));
    }, [search, statusFilter, refresh]);

    return (
        <div>
            <div className="flex gap-3 mb-4">
                <input
                    type="text"
                    placeholder="Search orders..."
                    className="border rounded px-3 py-2 flex-grow"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    className="border rounded px-3 py-2"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="received">Received</option>
                </select>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-500">Loading...</div>
            ) : orders.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No orders found.</div>
            ) : (
                <table className="w-full border-collapse border border-gray-200">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="border px-4 py-2 text-left">Order ID</th>
                            <th className="border px-4 py-2 text-left">Supplier</th>
                            <th className="border px-4 py-2 text-left">Order Date</th>
                            <th className="border px-4 py-2 text-left">Status</th>
                            <th className="border px-4 py-2 text-right">Total (₹)</th>
                            <th className="border px-4 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr
                                key={order.id}
                                className="hover:bg-gray-100 cursor-pointer"
                                onClick={() => onView(order.id)}
                            >
                                <td className="border px-4 py-2">{order.id}</td>
                                <td className="border px-4 py-2">{order.supplier_name}</td>
                                <td className="border px-4 py-2">{order.order_date}</td>
                                <td className="border px-4 py-2 capitalize">{order.status}</td>
                                <td className="border px-4 py-2 text-right">
                                    ₹{order.total_amount.toFixed(2)}
                                </td>
                                <td
                                    className="border px-4 py-2 text-center space-x-2"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        onClick={() => order.status !== "received" && onEdit(order.id)}
                                        className={`text-blue-600 hover:underline ${order.status === "received" ? "opacity-50 cursor-not-allowed" : ""}`}
                                        disabled={order.status === "received"}
                                    >
                                        Edit
                                    </button>
                                    {/* {order.status !== "received" && (
                                        <button
                                            onClick={() => onDelete(order.id)}
                                            className="text-red-600 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    )} */}

                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
