import React from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface ForecastPoint {
    date: string;
    forecast: number;
}

interface ForecastChartProps {
    data: ForecastPoint[];
}

export default function ForecastChart({ data }: ForecastChartProps) {
    const chartData = {
        labels: data.map((d) => d.date),
        datasets: [
            {
                label: "Forecasted Demand",
                data: data.map((d) => d.forecast),
                fill: false,
                borderColor: "rgba(59, 130, 246, 1)",
                backgroundColor: "rgba(59, 130, 246, 0.5)",
                tension: 0.3,
            },
        ],
    };

    const options = {
        responsive: true,
        scales: {
            y: { beginAtZero: true },
        },
    };

    return <Line data={chartData} options={options} />;
}
