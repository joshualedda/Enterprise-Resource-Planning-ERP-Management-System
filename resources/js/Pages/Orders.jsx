import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';
import { 
    Search, 
    Package, 
    Clock, 
    CheckCircle, 
    Truck, 
    XCircle, 
    ClipboardList, 
    ShoppingBag, 
    Eye,
    MessageSquare,
    ChevronRight,
    ArrowRight,
    MapPin,
    Calendar,
    Wallet,
    Info,
    RotateCcw,
    Star,
    X
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast'; // Assuming toast is available or I'll use simple alert

export default function Orders({ auth, orders = { data: [] } }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showTrack, setShowTrack] = useState(false);

    const filteredTransactions = orders.data.filter(t => 
        t.reference_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.order_items.some(item => item.product?.product.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Pending':
                return { 
                    bg: 'bg-amber-50 text-amber-600 border-amber-100', 
                    icon: Clock, 
                    label: 'Pending Approval',
                    step: 1
                };
            case 'Ready to Pickup':
            case 'Delivery in Progress':
                return { 
                    bg: 'bg-indigo-50 text-indigo-600 border-indigo-100', 
                    icon: Truck, 
                    label: 'In Process',
                    step: 3
                };
            case 'Product Received':
                return { 
                    bg: 'bg-green-50 text-green-700 border-green-100', 
                    icon: CheckCircle, 
                    label: 'Completed',
                    step: 4
                };
            case 'Cancelled':
                return { 
                    bg: 'bg-red-50 text-red-600 border-red-100', 
                    icon: XCircle, 
                    label: 'Cancelled',
                    step: 0
                };
            default:
                return { 
                    bg: 'bg-slate-50 text-slate-600 border-slate-100', 
                    icon: Clock, 
                    label: status,
                    step: 1
                };
        }
    };

    const handleCancel = async (id) => {
        if (!confirm('Are you sure you want to cancel this order?')) return;
        try {
            await axios.patch(route('customer.orders.cancel', id));
            router.reload();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to cancel order.');
        }
    };

    const handleMarkReceived = async (id) => {
        if (!confirm('Have you received your order?')) return;
        try {
            await axios.patch(route('customer.orders.received', id));
            router.reload();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to mark as received.');
        }
    };

    // Progress Bar Steps Component
    const ProgressBar = ({ currentStatus }) => {
        const config = getStatusConfig(currentStatus);
        const steps = [
            { id: 1, label: 'Pending', icon: Clock },
            { id: 2, label: 'Processing', icon: ClipboardList },
            { id: 3, label: 'Ready', icon: Truck },
            { id: 4, label: 'Completed', icon: CheckCircle },
        ];

        return (
            <div className="relative flex justify-between w-full max-w-lg mx-auto py-8">
                {/* Connector Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2" />
                <div 
                    className="absolute top-1/2 left-0 h-0.5 bg-[#3BAA35] -translate-y-1/2 transition-all duration-500" 
                    style={{ width: `${Math.max(0, (config.step - 1) / (steps.length - 1) * 100)}%` }}
                />

                {steps.map((step) => {
                    const isCompleted = config.step >= step.id;
                    const isActive = config.step === step.id;
                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted ? 'bg-[#3BAA35] border-[#3BAA35] text-white' : 'bg-white border-slate-200 text-slate-300'}`}>
                                <step.icon size={18} />
                            </div>
                            <span className={`mt-2 text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-[#0B1F3B]' : 'text-slate-400'}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <UserLayout activeTab="orders">
            <Head title="Order Management | D'SERICORE" />

            {/* Header Section */}
            <div className="bg-white border-b border-slate-100 py-12 lg:py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="w-10 h-px bg-[#C9A227]" />
                                <span className="text-[#3BAA35] text-[11px] font-bold uppercase tracking-[0.3em]">Acquisition Protocols</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-[#0B1F3B] tracking-tight uppercase">
                                My <span className="text-[#3BAA35]">Orders</span>
                            </h1>
                            <p className="max-w-xl text-slate-500 font-medium text-sm leading-relaxed">
                                Review your research asset acquisitions. Monitor real-time progress and manage your scientific investments.
                            </p>
                        </div>

                        <div className="relative w-full md:max-w-md group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#3BAA35] transition-colors" size={20} />
                            <input 
                                type="text"
                                placeholder="Ref # or Product name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-16 pr-8 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white focus:border-[#3BAA35] focus:ring-4 focus:ring-[#3BAA35]/5 transition-all outline-none uppercase tracking-wide"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12 w-full">
                {filteredTransactions.length > 0 ? (
                    <div className="grid grid-cols-1 gap-8">
                        {filteredTransactions.map((order) => {
                            const config = getStatusConfig(order.status);
                            return (
                                <div key={order.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden group hover:border-[#3BAA35]/20 transition-all duration-300">
                                    
                                    {/* Order Card Header */}
                                    <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div className="flex items-center gap-6">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Reference Protocol</p>
                                                <p className="text-sm font-black text-[#0B1F3B] tracking-tight truncate uppercase">{order.reference_no}</p>
                                            </div>
                                            <div className="h-8 w-px bg-slate-200 hidden md:block" />
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Initiated On</p>
                                                <p className="text-sm font-bold text-[#0B1F3B]">{new Date(order.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className={`px-5 py-2 rounded-full border-2 ${config.bg} flex items-center gap-3`}>
                                            <config.icon size={16} />
                                            <span className="text-[11px] font-black uppercase tracking-widest">{config.label}</span>
                                        </div>
                                    </div>

                                    <div className="p-8">
                                        <div className="flex flex-col lg:flex-row gap-12">
                                            {/* Left side: Items & Summary */}
                                            <div className="flex-1 space-y-8">
                                                <div className="space-y-6">
                                                    {order.order_items.map((item) => (
                                                        <div key={item.id} className="flex gap-6 items-center">
                                                            <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden shrink-0 border border-slate-100 p-1">
                                                                {item.product?.image_url ? (
                                                                    <img src={item.product?.image_url} alt={item.product?.product} className="w-full h-full object-cover rounded-xl" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-xl"><Package size={24} className="text-slate-300" /></div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-start gap-4">
                                                                    <div>
                                                                        <h4 className="text-sm font-black text-[#0B1F3B] uppercase mb-1">{item.product?.product}</h4>
                                                                        <span className="text-[9px] font-bold text-[#3BAA35] bg-[#3BAA35]/10 px-2 py-0.5 rounded-full uppercase tracking-widest">{item.product?.category?.category || 'Scientific Asset'}</span>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-xs font-black text-[#0B1F3B]">₱{Number(item.price_at_sale * item.quantity).toLocaleString()}</p>
                                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">₱{Number(item.price_at_sale).toLocaleString()} × {item.quantity}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-end gap-6 text-[#0B1F3B]">
                                                    <div className="space-y-4 w-full md:w-auto">
                                                        <div className="flex items-center gap-4 text-slate-400">
                                                            <Wallet size={16} />
                                                            <div className="space-y-0.5">
                                                                <p className="text-[10px] font-bold uppercase tracking-widest leading-none">Settlement Method</p>
                                                                <p className="text-xs font-bold text-[#0B1F3B]">{order.payment_method}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-[#C9A227] uppercase tracking-[0.2em] mb-1">Total Valuation</p>
                                                        <p className="text-3xl font-black text-[#0B1F3B] tracking-tighter">₱{Number(order.total_amount).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right side: Progress & Actions */}
                                            <div className="lg:w-80 shrink-0 space-y-8 bg-slate-50/30 p-8 rounded-[2rem] border border-slate-100/50">
                                                <div className="space-y-4">
                                                    <h5 className="text-[10px] font-black text-[#0B1F3B] uppercase tracking-[0.2em] flex items-center gap-2">
                                                        <Info size={14} className="text-[#3BAA35]" /> Asset Progress
                                                    </h5>
                                                    
                                                    {order.status !== 'Cancelled' ? (
                                                        <div className="space-y-6 pt-4">
                                                            <div className="relative pl-8 space-y-6 border-l-2 border-slate-100">
                                                                {[
                                                                    { label: 'Pending Approval', step: 1, date: order.created_at },
                                                                    { label: 'Asset Processing', step: 2, date: order.status !== 'Pending' ? order.updated_at : null },
                                                                    { label: 'Ready for Collection', step: 3, date: (order.status === 'Ready to Pickup' || order.status === 'Product Received') ? order.updated_at : null },
                                                                    { label: 'Acquisition Finalized', step: 4, date: order.status === 'Product Received' ? order.updated_at : null },
                                                                ].map((s, idx) => {
                                                                    const isDone = config.step >= s.step;
                                                                    return (
                                                                        <div key={idx} className="relative">
                                                                            <div className={`absolute -left-[41px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm transition-colors duration-500 ${isDone ? 'bg-[#3BAA35]' : 'bg-slate-200'}`} />
                                                                            <div className="space-y-0.5">
                                                                                <p className={`text-[10px] font-bold uppercase tracking-widest ${isDone ? 'text-[#0B1F3B]' : 'text-slate-400'}`}>{s.label}</p>
                                                                                {s.date && <p className="text-[9px] text-[#3BAA35] font-bold uppercase opacity-80">{new Date(s.date).toLocaleDateString([], {month:'short', day:'numeric'})}</p>}
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
                                                            <XCircle className="text-red-400" size={32} />
                                                            <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Protocol Nullified</p>
                                                            <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed">This order has been officially cancelled and inventory restored.</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="pt-6 border-t border-slate-200 grid grid-cols-1 gap-3">
                                                    <button 
                                                        onClick={() => { setSelectedOrder(order); setShowDetails(true); }}
                                                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#0B1F3B] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1a3a66] transition-all active:scale-95"
                                                    >
                                                        <Eye size={14} /> View Details
                                                    </button>
                                                    
                                                    {order.status !== 'Cancelled' && order.status !== 'Product Received' && (
                                                        <button 
                                                            onClick={() => handleCancel(order.id)}
                                                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-red-100 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95"
                                                        >
                                                            <XCircle size={14} /> Cancel Order
                                                        </button>
                                                    )}

                                                    {(order.status === 'Ready to Pickup' || order.status === 'Delivery in Progress') && (
                                                        <button 
                                                            onClick={() => handleMarkReceived(order.id)}
                                                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#3BAA35] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2e8b2a] shadow-lg shadow-[#3BAA35]/20 transition-all active:scale-95 animate-pulse"
                                                        >
                                                            <CheckCircle size={14} /> Mark as Received
                                                        </button>
                                                    )}

                                                    {order.status === 'Product Received' && (
                                                        <button 
                                                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-[#C9A227]/20 text-[#C9A227] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#C9A227]/5 transition-all active:scale-95"
                                                        >
                                                            <Star size={14} /> Rate Product
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-24 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 shadow-inner">
                        <div className="bg-slate-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-slate-300">
                            <ClipboardList size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-[#0B1F3B] mb-3 tracking-tighter uppercase">No Protocol Records</h3>
                        <p className="text-slate-500 text-sm font-medium max-w-sm mx-auto leading-relaxed uppercase tracking-wider">
                            You haven't initiated any acquisition protocols yet. Explore our elite catalog to begin.
                        </p>
                        <Link 
                            href={route('products.all')}
                            className="mt-10 inline-flex items-center gap-4 px-10 py-4 bg-[#3BAA35] text-white text-xs font-black rounded-2xl hover:bg-[#2e8b2a] shadow-xl shadow-[#3BAA35]/20 transition-all active:scale-95 uppercase tracking-widest"
                        >
                            <ShoppingBag size={18} />
                            Visit Catalog
                        </Link>
                    </div>
                )}
            </main>

            {/* View Details Modal */}
            {showDetails && selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0B1F3B]/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                        <div className="px-10 py-8 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center shrink-0">
                            <div className="space-y-1">
                                <h2 className="text-xl font-black text-[#0B1F3B] uppercase tracking-tight">Acquisition Overview</h2>
                                <p className="text-[10px] font-black text-[#3BAA35] uppercase tracking-[0.2em]">{selectedOrder.reference_no}</p>
                            </div>
                            <button onClick={() => setShowDetails(false)} className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-500 transition-all active:scale-90">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <h5 className="text-[10px] font-black text-[#C9A227] uppercase tracking-[0.2em] flex items-center gap-2">
                                        <ArrowRight size={14} /> Items Breakdown
                                    </h5>
                                    <div className="space-y-6">
                                        {selectedOrder.order_items.map((item) => (
                                            <div key={item.id} className="flex gap-4 items-center p-4 rounded-2xl border border-slate-50 bg-slate-50/30">
                                                <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center border border-slate-100 shrink-0">
                                                    {item.product?.image_url ? 
                                                        <img src={item.product.image_url} alt="" className="w-full h-full object-cover rounded-lg" /> : 
                                                        <Package size={20} className="text-slate-200" />
                                                    }
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-black text-[#0B1F3B] uppercase truncate leading-tight">{item.product?.product}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{item.quantity} units × ₱{Number(item.price_at_sale).toLocaleString()}</p>
                                                </div>
                                                <p className="text-xs font-black text-[#0B1F3B]">₱{Number(item.price_at_sale * item.quantity).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-6">
                                        <h5 className="text-[10px] font-black text-[#C9A227] uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Truck size={14} /> Logistics Protocol
                                        </h5>
                                        <div className="p-6 rounded-[2rem] border border-[#3BAA35]/10 bg-[#3BAA35]/5 space-y-4">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Selected Mode</p>
                                                <p className="text-xs font-black text-[#0B1F3B] uppercase">{selectedOrder.order_type || 'Standard Acquisition'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Delivery Destination</p>
                                                <p className="text-[11px] font-bold text-[#0B1F3B] leading-relaxed">
                                                    Institutional Research Laboratory <br/>
                                                    Bacnotan, La Union, Philippines
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 rounded-[2rem] bg-[#0B1F3B] text-white space-y-6 shadow-xl shadow-[#0B1F3B]/20">
                                        <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase opacity-60">
                                            <span>Subtotal</span>
                                            <span>₱{Number(selectedOrder.total_amount).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase opacity-60">
                                            <span>Research Gov. Tax</span>
                                            <span>₱0.00</span>
                                        </div>
                                        <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#3BAA35]">Global Total</p>
                                            <p className="text-3xl font-black tracking-tighter">₱{Number(selectedOrder.total_amount).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100 flex justify-end shrink-0">
                            <button onClick={() => setShowDetails(false)} className="px-10 py-4 bg-[#0B1F3B] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#1a3a66] transition-all active:scale-95 shadow-lg shadow-slate-200">
                                Close Protocols
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </UserLayout>
    );
}
