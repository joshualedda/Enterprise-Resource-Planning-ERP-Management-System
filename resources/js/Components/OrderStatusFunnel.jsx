import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LabelList
} from 'recharts';
import { TrendingDown, Filter, AlertCircle } from 'lucide-react';

// --- MOCK DATA ---
const mockFunnelData = [
    { stage: "Placed", count: 320, fill: "#6366f1" },
    { stage: "Paid", count: 250, fill: "#6366f1" },
    { stage: "Packed", count: 220, fill: "#6366f1" },
    { stage: "Shipped", count: 190, fill: "#6366f1" },
    { stage: "Delivered", count: 175, fill: "#6366f1" },
    { stage: "Completed", count: 160, fill: "#6366f1" },
];

const dropOffData = [
    { stage: "Cancelled", count: 30 },
    { stage: "Failed Payment", count: 20 }
];

// --- COMPONENT ---
export default function OrderStatusFunnel({ data = mockFunnelData, dropOffs = dropOffData }) {

    // Stats Calculation
    const stats = useMemo(() => {
        if (!data || data.length === 0) return { total: 0, completed: 0, rate: 0 };
        const total = data[0].count; // Assuming first stage is total
        const completed = data[data.length - 1].count;
        const rate = total > 0 ? (completed / total) * 100 : 0;
        return { total, completed, rate };
    }, [data]);

    // Enhanced Data with Conversion Rates
    const chartData = useMemo(() => {
        return data.map((item, index) => {
            const prevCount = index > 0 ? data[index - 1].count : item.count;
            const dropOff = prevCount - item.count;
            const conversionRate = prevCount > 0 ? ((item.count / prevCount) * 100).toFixed(1) : 0;
            const totalRate = stats.total > 0 ? ((item.count / stats.total) * 100).toFixed(1) : 0;

            return {
                ...item,
                dropOff,
                conversionRate,
                totalRate
            };
        });
    }, [data, stats]);

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload;
            return (
                <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 min-w-[200px]">
                    <p className="font-black text-slate-800 mb-1">{label}</p>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-500 font-bold uppercase">Count</span>
                        <span className="text-lg font-black text-indigo-600">{d.count}</span>
                    </div>
                    {d.stage !== 'Placed' && (
                        <>
                            <div className="flex justify-between items-center text-xs mb-1">
                                <span className="text-slate-400">Step Conversion</span>
                                <span className="font-bold text-emerald-600">{d.conversionRate}%</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">Drop-off</span>
                                <span className="font-bold text-rose-500">-{d.dropOff} ({(100 - parseFloat(d.conversionRate)).toFixed(1)}%)</span>
                            </div>
                        </>
                    )}
                    <div className="mt-3 pt-2 border-t border-slate-50 text-[10px] text-slate-400 text-center">
                        {d.totalRate}% of total orders
                    </div>
                </div>
            );
        }
        return null;
    };

    if (!data || data.length === 0 || data.every(d => d.count === 0)) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Filter className="text-slate-300" size={32} />
                </div>
                <h3 className="text-slate-900 font-bold mb-1">No Funnel Data</h3>
                <p className="text-slate-500 text-xs mb-6">Not enough orders to generate a funnel.</p>
                <button className="px-5 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors">
                    View Orders
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <Filter className="text-indigo-500" size={18} />
                        Order Funnel
                    </h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Pipeline Performance</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-black text-emerald-500">{stats.rate.toFixed(1)}%</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Completion Rate</p>
                </div>
            </div>

            {/* Chart */}
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        barSize={32}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="stage"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fontWeight: 'bold', fill: '#64748b' }}
                            width={80}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                        <Bar dataKey="count" radius={[0, 8, 8, 0]} background={{ fill: '#f8fafc', radius: [0, 8, 8, 0] }}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                            <LabelList
                                dataKey="count"
                                position="right"
                                style={{ fontSize: '11px', fontWeight: 'bold', fill: '#94a3b8' }}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Drop-offs Legend */}
            <div className="mt-6 pt-4 border-t border-slate-50">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Significant Drop-offs</p>
                <div className="flex flex-wrap gap-3 items-center">
                    {dropOffs.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100">
                            <div className="w-5 h-5 rounded bg-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                                <TrendingDown size={12} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-700 leading-none">{d.count}</p>
                                <p className="text-[9px] text-slate-400 text-nowrap leading-none mt-0.5">{d.stage}</p>
                            </div>
                        </div>
                    ))}
                    <div className="flex items-center gap-2 ml-auto">
                        <AlertCircle size={14} className="text-slate-300 shrink-0" />
                        <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">3.2% Abandoned</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
