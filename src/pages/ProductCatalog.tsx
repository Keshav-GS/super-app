import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Papa from "papaparse";

type Product = {
    id: number;
    product_name: string;
    sku: string;
    category: string;
    material: string;
    size: string;
    thread_pitch?: string;
    unit_price: number;
};

const initialForm: Omit<Product, "id"> = {
    product_name: "",
    sku: "",
    category: "",
    material: "",
    size: "",
    thread_pitch: "",
    unit_price: 0,
};

export default function ProductCatalog() {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [form, setForm] = useState<Omit<Product, "id">>(initialForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Fetch products with search filter
    useEffect(() => {
        window.api.getProducts(search).then(setProducts).catch(console.error);
    }, [search]);

    // Create or update product
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            if (editingId !== null) {
                await window.api.updateProduct(editingId, form);
            } else {
                await window.api.addProduct(form);
            }
            setForm(initialForm);
            setEditingId(null);
            setShowModal(false);
            await window.api.getProducts(search).then(setProducts);
        } catch (err) {
            alert("Error saving product: " + err);
        }
    };

    // Open edit modal
    const handleEdit = (product: Product) => {
        setForm({
            product_name: product.product_name,
            sku: product.sku,
            category: product.category,
            material: product.material,
            size: product.size,
            thread_pitch: product.thread_pitch || "",
            unit_price: product.unit_price,
        });
        setEditingId(product.id);
        setShowModal(true);
    };

    // Delete product with confirmation
    const confirmDelete = async () => {
        if (deleteId !== null) {
            try {
                await window.api.deleteProduct(deleteId);
                setDeleteId(null);
                await window.api.getProducts(search).then(setProducts);
            } catch (err) {
                alert("Error deleting product: " + err);
            }
        }
    };

    // CSV upload handler
    const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];
        setUploading(true);

        try {
            // Read file as ArrayBuffer in the renderer
            const arrayBuffer = await file.arrayBuffer();
            // Send buffer, name, and type to main process
            await window.api.uploadProductsCsv({
                buffer: Array.from(new Uint8Array(arrayBuffer)), // Convert to array for IPC
                name: file.name,
                type: file.type
            });
            await window.api.getProducts(search).then(setProducts);
            console.log("CSV uploaded successfully");
        } catch (err) {
            alert('CSV upload error: ' + err);
        } finally {
            setUploading(false);
        }
    };



    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Product Catalog</h2>

            {/* Search and CSV Upload */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <input
                    type="text"
                    placeholder="Search products..."
                    className="border rounded px-4 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="flex items-center gap-3">
                    <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                        {uploading ? "Uploading..." : "Upload CSV"}
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleCsvUpload}
                            className="hidden"
                            disabled={uploading}
                        />
                    </label>
                    <button
                        onClick={() => {
                            setForm(initialForm);
                            setEditingId(null);
                            setShowModal(true);
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                        + Add Product
                    </button>
                </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {[
                                "Product Name",
                                "SKU / Part No.",
                                "Category",
                                "Material",
                                "Size / Dimension",
                                "Thread Pitch",
                                "Unit Price (₹)",
                                "Actions",
                            ].map((header) => (
                                <th
                                    key={header}
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={8} className="text-center py-6 text-gray-500">
                                    No products found.
                                </td>
                            </tr>
                        )}
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-blue-50">
                                <td className="px-6 py-4 whitespace-nowrap">{product.product_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{product.sku}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{product.material}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{product.size}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{product.thread_pitch || "-"}</td>
                                <td className="px-6 py-4 whitespace-nowrap">₹{product.unit_price.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                        aria-label={`Edit ${product.product_name}`}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setDeleteId(product.id)}
                                        className="text-red-600 hover:text-red-900"
                                        aria-label={`Delete ${product.product_name}`}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit/Add Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
                        <h3 className="text-xl font-semibold mb-4">
                            {editingId ? "Edit Product" : "Add New Product"}
                        </h3>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                className="input-field"
                                placeholder="Product Name"
                                name="product_name"
                                value={form.product_name}
                                onChange={(e) => setForm(f => ({ ...f, product_name: e.target.value }))}
                                required
                            />
                            <input
                                className="input-field"
                                placeholder="SKU / Part No."
                                name="sku"
                                value={form.sku}
                                onChange={(e) => setForm(f => ({ ...f, sku: e.target.value }))}
                                required
                            />
                            <input
                                className="input-field"
                                placeholder="Category"
                                name="category"
                                value={form.category}
                                onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                                required
                            />
                            <input
                                className="input-field"
                                placeholder="Material"
                                name="material"
                                value={form.material}
                                onChange={(e) => setForm(f => ({ ...f, material: e.target.value }))}
                                required
                            />
                            <input
                                className="input-field"
                                placeholder="Size / Dimension"
                                name="size"
                                value={form.size}
                                onChange={(e) => setForm(f => ({ ...f, size: e.target.value }))}
                                required
                            />
                            <input
                                className="input-field"
                                placeholder="Thread Pitch"
                                name="thread_pitch"
                                value={form.thread_pitch}
                                onChange={(e) => setForm(f => ({ ...f, thread_pitch: e.target.value }))}
                            />
                            <input
                                className="input-field"
                                placeholder="Unit Price (₹)"
                                type="number"
                                min="0"
                                step="0.01"
                                name="unit_price"
                                value={form.unit_price}
                                onChange={(e) => setForm(f => ({ ...f, unit_price: Number(e.target.value) }))}
                                required
                            />
                            <div className="flex items-center space-x-4 md:col-span-2 justify-end mt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingId(null);
                                        setForm(initialForm);
                                    }}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingId ? "Update" : "Add"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteId !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                        <p>Are you sure you want to delete this product?</p>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="btn-danger"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
