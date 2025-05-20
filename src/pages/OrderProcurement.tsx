import React, { useState } from "react";
import OrderList from "../components/OrderList";
import OrderForm from "../components/OrderForm";
import OrderDetails from "../components/OrderDetails";
import SupplierForm from "../components/SupplierForm";
import SaleForm from "../components/SaleForm";
// import SalesHistory from "../components/SalesHistory";

export default function OrderProcurement() {
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [showSupplierForm, setShowSupplierForm] = useState(false);
    const [refreshList, setRefreshList] = useState(false);

    const openNewOrderForm = () => {
        setEditingOrderId(null);
        setShowOrderForm(true);
    };

    const openEditOrderForm = (id: number) => {
        setEditingOrderId(id);
        setShowOrderForm(true);
    };

    const openOrderDetails = (id: number) => {
        setSelectedOrderId(id);
    };
    const handleDeleteOrder = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this order?")) return;
        try {
            await window.api.deleteOrder(id);
            refresh();
        } catch (err: any) {
            alert(err.message || "Failed to delete order");
        }
    }
    const closeModals = () => {
        setShowOrderForm(false);
        setShowSupplierForm(false);
        setSelectedOrderId(null);
    };

    const refresh = () => setRefreshList((prev) => !prev);

    return (
        <div className="max-w-7xl mx-auto p-6 bg-white rounded shadow space-y-8">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Order & Procurement</h1>
                <div className="space-x-2">
                    <button
                        onClick={openNewOrderForm}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        + New Order
                    </button>
                    <button
                        onClick={() => setShowSupplierForm(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                        + Add Supplier
                    </button>
                </div>
            </div>

            <OrderList
                key={refreshList.toString()}
                onView={openOrderDetails}
                onEdit={openEditOrderForm}
                // onDelete={handleDeleteOrder}
                refresh={refreshList}
            />

            {showOrderForm && (
                <OrderForm
                    orderId={editingOrderId}
                    onClose={() => {
                        setShowOrderForm(false);
                        refresh();
                    }}
                />
            )}

            {selectedOrderId !== null && (
                <OrderDetails orderId={selectedOrderId} onClose={() => { closeModals(); refresh(); }} />
            )}

            {showSupplierForm && (
                <SupplierForm
                    onClose={() => {
                        setShowSupplierForm(false);
                        refresh();
                    }}
                />
            )}

            {/* Sale form and sales history */}
            <SaleForm onSaleRecorded={refresh} />

        </div>
    );
}
