
interface Product {
    id: number;
    product_name: string;
    sku: string;
    category?: string | null;
    material?: string | null;
    size?: string | null;
    thread_pitch?: string | null;
    unit_price?: number | null;
    quantity_on_hand: number;
    min_stock_level: number;
    low_stock: number;
}
interface InventoryListProps {
    products: Product[];
    onSelect: (id: number) => void;
}

export default function InventoryList({ products, onSelect }: InventoryListProps) {
    return (
        <div className="overflow-x-auto border rounded shadow">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">SKU</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Category</th>
                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Qty</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Unit Price</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {products.map((p) => (
                        <tr
                            key={p.id}
                            className={`cursor-pointer hover:bg-gray-100 ${p.low_stock ? "bg-red-50" : ""}`}
                            onClick={() => onSelect(p.id)}
                            title={p.low_stock ? "Low Stock" : "In Stock"}
                        >
                            <td className="px-4 py-2 text-sm">{p.sku}</td>
                            <td className="px-4 py-2 text-sm">{p.product_name}</td>
                            <td className="px-4 py-2 text-sm">{p.category}</td>
                            <td className="px-4 py-2 text-sm text-right">{p.quantity_on_hand}</td>
                            <td className="px-4 py-2 text-sm">₹{p.unit_price?.toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm font-semibold">
                                {p.low_stock ? (
                                    <span className="text-red-600">Low Stock</span>
                                ) : (
                                    <span className="text-green-600">OK</span>
                                )}
                            </td>
                        </tr>
                    ))}
                    {products.length === 0 && (
                        <tr>
                            <td colSpan={6} className="text-center p-4 text-gray-500">
                                No products found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
