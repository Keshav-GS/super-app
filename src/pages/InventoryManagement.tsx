import React, { useEffect, useState } from "react";
import InventoryList from "../components/InventoryList";
import ReorderSuggestions from "../components/ReorderSuggestions";
import ForecastChart from "../components/ForecastChart";
import InventoryControl from "../components/InventoryControl";
export default function InventoryManagement() {
    const [products, setProducts] = useState([]);
    const [reorderList, setReorderList] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [forecastData, setForecastData] = useState([]);
    const [editControlsProductId, setEditControlsProductId] = useState<number | null>(null);

    useEffect(() => {
        window.api.getInventory().then(setProducts);
        window.api.getReorderSuggestions().then(setReorderList);
    }, []);

    useEffect(() => {
        if (selectedProductId !== null) {
            window.api.getForecast(selectedProductId).then(setForecastData);
        }
    }, [selectedProductId]);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Inventory Dashboard</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <InventoryList products={products} onSelect={setSelectedProductId} onEditControls={setEditControlsProductId} />
                </div>

                <div>
                    <ReorderSuggestions reorderList={reorderList} />
                </div>
            </div>

            {selectedProductId !== null && (
                <div className="mt-10">
                    <h2 className="text-xl font-semibold mb-4">Demand Forecast</h2>
                    <ForecastChart data={forecastData} />
                </div>
            )}
            {editControlsProductId !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <InventoryControl
                        productId={editControlsProductId}
                        onClose={() => setEditControlsProductId(null)}
                    />
                </div>
            )}
        </div>
    );
}
