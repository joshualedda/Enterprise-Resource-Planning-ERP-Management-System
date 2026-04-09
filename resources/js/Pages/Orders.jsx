import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import UserLayout from '@/Layouts/UserLayout';
import { Search, Package, ChevronRight, Clock, CheckCircle, Truck, XCircle, ClipboardList, ShoppingBag, Eye } from 'lucide-react';

export default function Orders({ auth, orders = { data: [] } }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTransactions = orders.data.filter(t => 
        t.reference_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.order_items.some(item => item.product?.product.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Pending':
                return { 
                    bg: 'bg-amber-50 text-amber-600 border-amber-100', 
                    icon: Clock, 
                    label: 'Pending Approval' 
                };
            case 'Ready to Pickup':
                return { 
                    bg: 'bg-blue-50 text-blue-600 border-blue-100', 
                    icon: Package, 
                    label: 'Ready for Collection' 
                };
            case 'Delivery in Progress':
                return { 
                    bg: 'bg-indigo-50 text-indigo-600 border-indigo-100', 
                    icon: Truck, 
                    label: 'In Transit' 
                };
            case 'Product Received':
                return { 
                    bg: 'bg-green-50 text-green-700 border-green-100', 
                    icon: CheckCircle, 
                    label: 'Transaction Completed' 
                };
            case 'Cancelled':
                return { 
                    bg: 'bg-red-50 text-red-600 border-red-100', 
                    icon: XCircle, 
                    label: 'Voided / Cancelled' 
                };
            default:
                return { 
                    bg: 'bg-slate-50 text-slate-600 border-slate-100', 
                    icon: Clock, 
                    label: status 
                };
        }
    };

    return (
        <UserLayout activeTab="orders">
            <Head title="My Orders | D'SERICORE" />

            {/* Header Section (Matching Marketplace Style) */}
            <div className="bg-white border-b border-slate-100 py-12 lg:py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="w-10 h-px bg-[#C9A227]" />
                                <span className="text-[#3BAA35] text-[11px] font-bold uppercase tracking-[0.3em]">Acquisition History</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-[#0B1F3B] tracking-tight uppercase">
                                Order <span className="text-[#3BAA35]">Records</span>
                            </h1>
                            <p className="max-w-xl text-slate-500 font-medium text-sm leading-relaxed">
                                Precise tracking of your premium silk acquisitions. Monitor the status of your research-grade assets from processing to successful collection.
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full md:max-w-md group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#3BAA35] transition-colors" size={20} />
                            <input 
                                type="text"
                                placeholder="Search reference # or product..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-16 pr-8 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white focus:border-[#3BAA35] focus:ring-4 focus:ring-[#3BAA35]/5 transition-all outline-none uppercase tracking-wide"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-6 py-12 w-full">
                {filteredTransactions.length > 0 ? (
                    <div className="space-y-6">
                        {filteredTransactions.map((transaction) => {
                            const status = getStatusStyles(transaction.status);
                            return (
                                <div key={transaction.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col lg:flex-row overflow-hidden group">
                                        
                                    {/* Transaction Header Info */}
                                    <div className="p-6 lg:p-8 lg:w-72 border-b lg:border-b-0 lg:border-r border-gray-100 shrink-0 bg-gray-50 flex flex-col justify-between">
                                        <div className="space-y-5">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Order Reference</span>
                                                <p className="text-base font-bold text-slate-800 tracking-tight truncate uppercase">{transaction.reference_no}</p>
                                            </div>

                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${status.bg} w-fit`}>
                                                <status.icon size={14} />
                                                <span className="text-[10px] font-semibold uppercase tracking-widest">{status.label}</span>
                                            </div>
                                        </div>

                                        <div className="mt-8 space-y-3 pt-6 border-t border-gray-200/60">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500 font-medium">Date</span>
                                                <span className="font-semibold text-slate-800">{new Date(transaction.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500 font-medium">Total</span>
                                                <span className="font-bold text-green-600">₱{Number(transaction.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="flex-1 p-6 lg:p-8">
                                        <div className="space-y-5">
                                            {transaction.order_items.map((item, idx) => (
                                                <div key={item.id} className={`flex items-center gap-5 ${idx !== 0 ? 'pt-5 border-t border-gray-100' : ''}`}>
                                                    {/* Item Image */}
                                                    <div className="w-16 h-16 rounded-xl bg-[#F3F4F6] border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center relative">
                                                        {item.product?.image_url ? (
                                                            <img 
                                                                src={item.product?.image_url} 
                                                                alt={item.product?.product || 'Product Image'} 
                                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                                className="w-full h-full object-cover" 
                                                            />
                                                        ) : null}
                                                        <div 
                                                            className="absolute inset-0 flex-col items-center justify-center bg-[#F3F4F6]"
                                                            style={{ display: item.product?.image_url ? 'none' : 'flex' }}
                                                            title="Image Not Available"
                                                        >
                                                            <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                            </svg>
                                                        </div>
                                                    </div>

                                                    {/* Item Info */}
                                                    <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div className="space-y-1 w-full md:w-auto overflow-hidden">
                                                            <h4 className="text-sm font-semibold text-slate-800 truncate">{item.product?.product || `Product #${item.product_id}`}</h4>
                                                            <p className="text-[10px] uppercase tracking-widest text-[#3BAA35] font-semibold">{item.product?.category?.category || 'Silk Product'}</p>
                                                        </div>
                                                        <div className="flex items-center gap-6 md:gap-10 shrink-0">
                                                            <div className="text-right">
                                                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">Price</span>
                                                                <p className="text-sm font-semibold text-slate-600">₱{Number(item.price_at_sale).toLocaleString()}</p>
                                                            </div>
                                                            <div className="text-center">
                                                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">Qty</span>
                                                                <p className="text-sm font-semibold text-slate-600">x{item.quantity}</p>
                                                            </div>
                                                            <div className="text-right w-24">
                                                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">Subtotal</span>
                                                                <p className="text-sm font-bold text-slate-800">₱{Number(item.price_at_sale * item.quantity).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-24 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                            <ClipboardList size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">No Order Records</h3>
                        <p className="text-slate-500 text-sm mt-2 font-medium max-w-sm mx-auto leading-relaxed">
                            You haven't placed any orders yet. Visit our marketplace to view available products.
                        </p>
                        <Link 
                            href={route('products.all')}
                            className="mt-8 inline-flex items-center gap-2 px-8 py-3 bg-[#0B1F3B] text-white text-sm font-bold rounded-lg hover:bg-[#0f2c54] transition-all shadow-sm active:scale-95"
                        >
                            <ShoppingBag size={16} />
                            Visit Marketplace
                        </Link>
                    </div>
                )}
            </main>

            {/* Footer Section */}
            <footer className="bg-white border-t border-slate-100 py-12 px-12 mt-auto">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="space-y-1 text-center md:text-left">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">DMMMSU — Sericulture Research and Development Institute</p>
                        <p className="text-[9px] text-[#3BAA35] font-black uppercase tracking-[0.25em] italic">Pioneering Excellence in Philippine Silk Research</p>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-60">© 2026 SRDI. ALL RIGHTS RESERVED.</p>
                </div>
            </footer>
        </UserLayout>
    );
}
