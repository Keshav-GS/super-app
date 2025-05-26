import React, { useEffect, useState } from "react";

// Simple chart using a table for demonstration.
function ForecastChart({ data }: { data: { date: string; forecast: number }[] }) {
    if (!data.length) return <div className="text-gray-500">No forecast data.</div>;
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border mt-2">
                <thead>
                    <tr>
                        <th className="px-2 py-1 border">Date</th>
                        <th className="px-2 py-1 border">Forecast</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((d, i) => (
                        <tr key={i}>
                            <td className="px-2 py-1 border">{d.date}</td>
                            <td className="px-2 py-1 border">{d.forecast.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function AnomalyList({ anomalies }: { anomalies: { date: string; quantity: number }[] }) {
    if (!anomalies.length) return <div className="text-gray-500">No anomalies detected.</div>;
    return (
        <ul className="mt-2 bg-red-50 border-l-4 border-red-400 p-2 rounded">
            {anomalies.map((a, i) => (
                <li key={i}>
                    <span className="font-semibold">Date:</span> {a.date}
                    <span className="ml-4 font-semibold">Quantity:</span> {a.quantity}
                </li>
            ))}
        </ul>
    );
}

function NLQInsightsUI({ insight, loading, error }: { insight: string; loading: boolean; error: string }) {
    // Split on lines that start with "- " or "• "
    const bulletLines = insight
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('- ') || line.startsWith('• '));

    return (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
            {loading && <div className="text-gray-600">Analyzing data...</div>}
            {error && <div className="text-red-600">{error}</div>}
            {bulletLines.length > 0 && (
                <ul className="list-disc ml-6 text-gray-700">
                    {bulletLines.map((line, idx) => (
                        <li key={idx}>{line.replace(/^[-•]\s*/, '')}</li>
                    ))}
                </ul>
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
            })
            .catch(() => {
                setNlqError("Failed to generate insights");
                setNlqInsight("");
            })
            .finally(() => {
                setLoading(false);
                setNlqLoading(false);
            });
    }, [selectedProductId]);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">AI Analytics Dashboard</h1>

            <div className="mb-6">
                <label className="font-semibold mr-2">Select Product:</label>
                <select
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(Number(e.target.value) || "")}
                    className="border rounded p-2"
                >
                    <option value="">-- Select --</option>
                    {products.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.product_name} ({p.sku})
                        </option>
                    ))}
                </select>
            </div>

            {loading && <div className="text-blue-600">Loading AI analytics...</div>}

            {!loading && selectedProductId && (
                <>
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">AI Demand Forecast (Next 30 Days)</h2>
                        <ForecastChart data={forecast} />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Anomaly Detection</h2>
                        <AnomalyList anomalies={anomalies} />
                    </div>
                    <div>
                        {/* <h2 className="text-xl font-semibold mb-2">Natural Language Insights</h2> */}
                        <NLQInsightsUI insight={nlqInsight} loading={nlqLoading} error={nlqError} />
                    </div>
                </>
            )}

            {!loading && !selectedProductId && (
                <div className="text-gray-500">Select a product to view AI analytics.</div>
            )}
        </div>
    );
}
