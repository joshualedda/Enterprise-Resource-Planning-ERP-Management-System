import React, { useState, useMemo } from 'react';
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

// --- HELPERS ---
const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
};

// --- MOCK DATA ---
const generateData = (range) => {
    const today = new Date();
    const data = [];
    let labels = [];
    let count = 7;

    if (range === 'Today') {
        labels = ['12 AM', '4 AM', '8 AM', '12 PM', '4 PM', '8 PM'];
        count = 6;
    } else if (range === 'Week') {
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        count = 7;
    } else if (range === 'Month') {
        labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
        count = 30;
    } else {
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        count = 12;
    }

    for (let i = 0; i < count; i++) {
        const revenue = Math.floor(Math.random() * 50000) + 5000;
        const orders = Math.floor(Math.random() * 80) + 5;
        const revenuePrev = Math.floor(revenue * (0.8 + Math.random() * 0.4)); // +/- 20% variance

        data.push({
            label: labels[i] || `Item ${i}`,
            revenue,
            orders,
            revenuePrev
        });
    }
    return data;
};

export default function SalesAnalytics() {
    const [timeRange, setTimeRange] = useState('Week');
    const [showComparison, setShowComparison] = useState(false);

    // Generate data based on time range
    const data = useMemo(() => generateData(timeRange), [timeRange]);

    // Calculate totals
    const stats = useMemo(() => {
        const totalRevenue = data.reduce((acc, curr) => acc + curr.revenue, 0);
        const totalOrders = data.reduce((acc, curr) => acc + curr.orders, 0);
        const totalRevenuePrev = data.reduce((acc, curr) => acc + curr.revenuePrev, 0);

        const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const growth = totalRevenuePrev > 0 ? ((totalRevenue - totalRevenuePrev) / totalRevenuePrev) * 100 : 0;

        return { totalRevenue, totalOrders, aov, growth };
    }, [data]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 w-full">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <TrendingUp className="text-indigo-600" size={20} />
                        Sales Analytics
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Revenue vs Order Volume Overview</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Time Range Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {['Today', 'Week', 'Month', 'Year'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === range
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>

                    {/* Compare Toggle */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Compare</span>
                        <button
                            onClick={() => setShowComparison(!showComparison)}
                            className={`w-9 h-5 rounded-full p-1 transition-colors duration-200 ease-in-out ${showComparison ? 'bg-indigo-600' : 'bg-slate-200'}`}
                        >
                            <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${showComparison ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Total Revenue</p>
                    <p className="text-2xl font-black text-slate-900">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <div className="p-4 bg-sky-50 rounded-xl border border-sky-100">
                    <p className="text-xs font-bold text-sky-500 uppercase tracking-wider mb-1">Total Orders</p>
                    <p className="text-2xl font-black text-slate-900">{formatNumber(stats.totalOrders)}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">AOV</p>
                    <p className="text-2xl font-black text-slate-900">{formatCurrency(stats.aov)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Growth</p>
                    <div className={`flex items-center gap-1 text-2xl font-black ${stats.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {Math.abs(stats.growth).toFixed(1)}%
                        {stats.growth >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="h-[400px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }}
                            dy={10}
                        />

                        <YAxis
                            yAxisId="left"
                            orientation="left"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }}
                            tickFormatter={(val) => `₱${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                        />

                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fontWeight: 'bold', fill: '#cbd5e1' }}
                        />

                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            labelStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px' }}
                            formatter={(value, name) => [
                                name === 'revenue' ? formatCurrency(value) :
                                    name === 'revenuePrev' ? formatCurrency(value) : value,
                                name === 'revenue' ? 'Revenue' :
                                    name === 'revenuePrev' ? 'Previous Revenue' : 'Orders'
                            ]}
                        />

                        <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />

                        <Bar
                            yAxisId="right"
                            dataKey="orders"
                            name="Orders"
                            fill="#bae6fd"
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                        />

                        {showComparison && (
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="revenuePrev"
                                name="Previous Revenue"
                                stroke="#cbd5e1"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                        )}

                        <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue"
                            stroke="#6366f1"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
