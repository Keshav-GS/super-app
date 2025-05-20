import React from "react";

interface ReorderItem {
    id: number;
    product_name: string;
    quantity_on_hand: number;
    reorder_qty: number;
}

interface ReorderSuggestionsProps {
    reorderList: ReorderItem[];
}

export default function ReorderSuggestions({ reorderList }: ReorderSuggestionsProps) {
    return (
        <div className="border rounded shadow p-4 bg-yellow-50">
            <h2 className="text-lg font-semibold mb-3">Reorder Suggestions</h2>
            {reorderList.length === 0 ? (
                <p className="text-gray-600">No reorder suggestions at this time.</p>
            ) : (
                <ul className="space-y-2 max-h-96 overflow-y-auto">
                    {reorderList.map((item) => (
                        <li key={item.id} className="flex justify-between items-center bg-yellow-100 p-2 rounded">
                            <div>
                                <p className="font-semibold">{item.product_name}</p>
                                <p className="text-sm text-gray-700">
                                    Stock: {item.quantity_on_hand} | Suggested Qty: {item.reorder_qty}
                                </p>
                            </div>
                            <button
                                className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition"
                                onClick={() => alert(`Create reorder for ${item.product_name}, qty: ${item.reorder_qty}`)}
                            >
                                Reorder
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
