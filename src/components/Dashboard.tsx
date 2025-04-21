import React from 'react';
import DashboardCard from './DashboardCard';
import {
    CatalogIcon,
    OrdersIcon,
    InventoryIcon,
    AiIcon,
    LogisticsIcon,
    AnalyticsIcon
} from './icons';
import bolt1 from '../../assets/bolt1.png';
import nut1 from '../../assets/nut1.png';
import bolt2 from '../../assets/bolt2.png';
import screw from '../../assets/screw.png';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

export default function Dashboard() {
    // Chart config for Analytics & Reporting
    const chartOptions: ApexOptions = {
        chart: {
            type: 'area', // <-- Must be a literal type
            toolbar: { show: false },
            height: 140,
            sparkline: { enabled: true }
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.5,
                opacityTo: 0.1
            }
        },
        colors: ['#2563eb'],
        xaxis: {
            categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            labels: { show: false }
        },
        yaxis: { show: false },
        grid: { show: false },
        tooltip: { enabled: false }
    };
    const chartSeries = [{ name: 'Orders', data: [31, 40, 28, 51, 42, 109, 100] }];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Product & Catalog Management */}
            <DashboardCard
                icon={<CatalogIcon className="w-6 h-6 text-blue-600" />}
                title="Product & Catalog Management"
            >
                <div className="flex justify-between overflow-x-hidden mt-2">
                    <div className="flex-shrink-0 flex-grow-0 w-1/4 max-w-1/4 px-1">
                        <img src={bolt1} alt="Bolt" className="w-full object-contain aspect-square" />
                    </div>
                    <div className="flex-shrink-0 flex-grow-0 w-1/4 max-w-1/4 px-1">
                        <img src={nut1} alt="Nut" className="w-full object-contain aspect-square" />
                    </div>
                    <div className="flex-shrink-0 flex-grow-0 w-1/4 max-w-1/4 px-1">
                        <img src={bolt2} alt="Bolt" className="w-full object-contain aspect-square" />
                    </div>
                    <div className="flex-shrink-0 flex-grow-0 w-1/4 max-w-1/4 px-1">
                        <img src={screw} alt="Screw" className="w-full object-contain aspect-square" />
                    </div>
                </div>
            </DashboardCard>

            {/* Order & Procurement Management */}
            <DashboardCard
                icon={<OrdersIcon className="w-6 h-6 text-green-600" />}
                title="Order & Procurement Management"
            >
                <div className="flex items-center mt-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <OrdersIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">32</div>
                        <div className="text-sm text-gray-500">Pending Orders</div>
                    </div>
                </div>
            </DashboardCard>

            {/* Inventory Management */}
            <DashboardCard
                icon={<InventoryIcon className="w-6 h-6 text-yellow-600" />}
                title="Inventory Management"
            >
                <div className="flex items-center mt-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                        <InventoryIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">In Stock:</div>
                        <div className="text-xl font-bold">
                            50,234 <span className="text-sm font-normal">units</span>
                        </div>
                    </div>
                </div>
            </DashboardCard>

            {/* AI-powered Furitics */}
            <DashboardCard
                icon={<AiIcon className="w-6 h-6 text-purple-600" />}
                title="AI-powered Furiticsl"
            >
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm font-medium mb-2">Personalized Recommendations</div>
                        <div className="flex justify-between overflow-x-hidden">
                            <div className="w-1/2 pr-1">
                                <img src={bolt1} alt="Bolt" className="w-full object-contain aspect-square" />
                            </div>
                            <div className="w-1/2 pl-1">
                                <img src={bolt2} alt="Bolt" className="w-full object-contain aspect-square" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm font-medium mb-2">Demand Forecasting</div>
                        <div className="h-10 flex items-center">
                            <svg className="w-full h-8 text-blue-400" fill="none" viewBox="0 0 100 32">
                                <path d="M0 30 L20 10 Q25 5 30 10 T40 15 T50 10 T60 20 T70 15 T80 25 T100 5" stroke="#2563eb" strokeWidth="2" fill="none" />
                            </svg>
                        </div>
                    </div>
                </div>
            </DashboardCard>

            {/* Supply Chain & Logistics Optimization */}
            <DashboardCard
                icon={<LogisticsIcon className="w-6 h-6 text-orange-600" />}
                title="Supply Chain & Logistics Optimization"
            >
                <div className="flex items-center mt-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                        <LogisticsIcon className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="text-gray-700">Quality Control & Assurance</div>
                </div>
            </DashboardCard>

            {/* Analytics & Reporting */}
            <DashboardCard
                icon={<AnalyticsIcon className="w-6 h-6 text-blue-700" />}
                title="Analytics & Reporting"
            >
                <div className="mt-4">
                    <ReactApexChart
                        options={chartOptions}
                        series={chartSeries}
                        type="area"
                        height={140}
                    />
                    {/* <div className="flex justify-between mt-2">
                        <div>
                            <div className="text-2xl font-bold text-blue-700">12,456</div>
                            <div className="text-sm text-gray-500">Orders this week</div>
                        </div>
                        <div className="flex items-center text-green-600 font-semibold">
                            +12%
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 16 16">
                                <path d="M8 12V4M8 4L4 8M8 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div> */}
                </div>
            </DashboardCard>
        </div>
    );
}
