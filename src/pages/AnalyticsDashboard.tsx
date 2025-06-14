import React, { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';
type Metrics = {
    current_stock: number;
    unit_price: number;
    min_stock: number;
    safety_stock: number;
    sales_history: string[];
    procurement_history: string[];
    sales_total: number;
    procurement_total: number;
};
interface NLQInsightsUIProps {
    insight: string;
    loading: boolean;
    error: string;
    metrics: Metrics | null;
}
// Updated ForecastChart with Line Chart
function ForecastChart({ data }: { data: { date: string; forecast: number }[] }) {
    if (!data.length) return <div className="text-gray-500 p-4">No forecast data available</div>;

    return (
        <div className="bg-white p-4 rounded-lg shadow-md h-80">
            <h3 className="text-lg font-semibold mb-4">Demand Forecast</h3>
            <ResponsiveContainer width="100%" height="90%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="forecast"
                        stroke="#6366f1"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

// Enhanced Anomaly Visualization
function AnomalyVisualization({ anomalies }: { anomalies: { date: string; quantity: number }[] }) {
    if (!anomalies.length) return <div className="text-gray-500 p-4">No anomalies detected</div>;

    return (
        <div className="bg-white p-4 rounded-lg shadow-md h-80">
            <h3 className="text-lg font-semibold mb-4">Inventory Anomalies</h3>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={anomalies}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantity" fill="#ef4444">
                        {anomalies.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.quantity > 0 ? '#ef4444' : '#3b82f6'}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

// Enhanced NLQ Insights with Visual Summary
function NLQInsightsUI({ insight, loading, error, metrics }: NLQInsightsUIProps) {
    const bulletLines = insight
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('- ') || line.startsWith('• ') || line.startsWith('* '));
    const COLORS = ['#4f46e5', '#f59e0b', '#10b981', '#ef4444'];
    // Prepare pie chart data for stock levels
    const stockData = metrics
        ? [
            { name: 'Current Stock', value: metrics.current_stock },
            { name: 'Safety Stock', value: metrics.safety_stock },
            { name: 'Min Stock Level', value: metrics.min_stock },
        ]
        : [];

    // Prepare bar chart data for sales vs procurement totals
    const barData = metrics
        ? [
            { name: 'Sales Total', value: metrics.sales_total },
            { name: 'Procurement Total', value: metrics.procurement_total },
        ]
        : [];

    return (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4">AI Insights</h3>
            {loading && <div className="text-gray-600">Analyzing data...</div>}
            {error && <div className="text-red-600 mb-4">{error}</div>}

            {bulletLines.length > 0 ? (
                <ul className="list-disc ml-6 mb-6 text-gray-700">
                    {bulletLines.map((line, idx) => (
                        <li key={idx}>{line.replace(/^[-*•]\s*/, '')}</li>
                    ))}
                </ul>
            ) : (
                !loading && <div className="text-gray-500">No insights generated yet.</div>
            )}

            {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Stock Levels Pie Chart */}
                    <div className="bg-white p-4 rounded shadow">
                        <h4 className="font-semibold mb-2">Stock Levels</h4>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={stockData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={70}
                                    label
                                >
                                    {stockData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Sales vs Procurement Bar Chart */}
                    <div className="bg-white p-4 rounded shadow">
                        <h4 className="font-semibold mb-2">Sales vs Procurement</h4>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={barData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#4f46e5" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}



interface Product {
    id: number;
    product_name: string;
    sku: string;
}

export default function AnalyticsDashboard() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<number | "">("");
    const [forecast, setForecast] = useState<{ date: string; forecast: number }[]>([]);
    const [anomalies, setAnomalies] = useState<{ date: string; quantity: number }[]>([]);
    const [nlqInsight, setNlqInsight] = useState<string>("");
    const [nlqLoading, setNlqLoading] = useState(false);
    const [nlqError, setNlqError] = useState("");
    const [loading, setLoading] = useState(false);
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    // Fetch products on mount
    useEffect(() => {
        window.api.getProducts("").then(setProducts);
    }, []);

    // Fetch AI forecast, anomaly, and NLQ data when product changes
    useEffect(() => {
        if (!selectedProductId) {
            setForecast([]);
            setAnomalies([]);
            setNlqInsight("");
            setNlqError("");
            setMetrics(null);
            return;
        }
        setLoading(true);
        setNlqLoading(true);
        setNlqError("");
        Promise.all([
            window.api.getAIForecast(selectedProductId),
            window.api.getAIAnomaly(selectedProductId),
            window.api.getNLQInsights(selectedProductId),
        ])
            .then(([forecastData, anomalyData, nlqData]) => {
                // console.log("NLQ Insights Response in frontend:", nlqData);
                setForecast(Array.isArray(forecastData) ? forecastData : []);
                setAnomalies(Array.isArray(anomalyData) ? anomalyData : []);
                setNlqInsight(nlqData?.insight || "");
                setMetrics(nlqData?.metrics || null);
            })
            .catch(() => {
                setNlqError("Failed to generate insights");
                setNlqInsight("");
                setMetrics(null);
            })
            .finally(() => {
                setLoading(false);
                setNlqLoading(false);
            });
    }, [selectedProductId]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">AI Analytics Dashboard</h1>

                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
                    <select
                        value={selectedProductId}
                        onChange={e => setSelectedProductId(Number(e.target.value) || "")}
                        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">-- Select Product --</option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.product_name} ({p.sku})
                            </option>
                        ))}
                    </select>
                </div>

                {loading && (
                    <div className="space-y-8 animate-pulse">
                        Loading Advanced Analytics...
                        <div className="h-80 bg-gray-100 rounded-lg"></div>
                        <div className="h-80 bg-gray-100 rounded-lg"></div>
                    </div>
                )}

                {!loading && selectedProductId && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <ForecastChart data={forecast} />
                            <AnomalyVisualization anomalies={anomalies} />
                        </div>

                        <NLQInsightsUI
                            insight={nlqInsight}
                            loading={nlqLoading}
                            error={nlqError}
                            metrics={metrics}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
