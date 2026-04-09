import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';
import Modal from '@/Components/Modal';
import { Search, Package, ChevronRight, ShoppingCart, Trash2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Cart({ auth, cart = {} }) {
    // Determine type of cart prop and ensure it's iterable as an array.
    const cartItems = Array.isArray(cart) ? cart : Object.values(cart || {});
    const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const [itemToDelete, setItemToDelete] = useState(null);

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;
        router.patch(route('customer.cart.update', { productId: id }), { quantity: newQuantity }, { preserveScroll: true });
    };

    const removeItem = (id) => {
        router.delete(route('customer.cart.remove', { productId: id }), { preserveScroll: true });
    };

    const checkout = () => {
        // Standard placeholder navigation
        router.get(route('checkout.index') || '#'); 
    };

    return (
        <UserLayout activeTab="cart">
            <Head title="My Cart | D'SERICORE" />

            {/* Header Section (Matching Marketplace Style) */}
            <div className="bg-white border-b border-slate-100 py-12 lg:py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="w-10 h-px bg-[#C9A227]" />
                                <span className="text-[#3BAA35] text-[11px] font-bold uppercase tracking-[0.3em]">Pending Acquisitions</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-[#0B1F3B] tracking-tight uppercase">
                                My <span className="text-[#3BAA35]">Cart</span>
                            </h1>
                            <p className="max-w-xl text-slate-500 font-medium text-sm leading-relaxed">
                                Review your selected premium silk assets before initiating the formal acquisition protocol.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-6 py-12 w-full">
                {cartItems.length > 0 ? (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Cart Items List */}
                        <div className="flex-1 space-y-6">
                            {cartItems.map((item) => (
                                <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row overflow-hidden group">
                                    {/* Item Image */}
                                    <div className="p-6 md:p-8 shrink-0 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50">
                                        <div className="w-24 h-24 rounded-xl bg-[#F3F4F6] border border-gray-100 overflow-hidden flex items-center justify-center relative shadow-inner">
                                            {item.image_url ? (
                                                <img 
                                                    src={item.image_url} 
                                                    alt={item.product || 'Product Image'} 
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                    className="w-full h-full object-cover" 
                                                />
                                            ) : null}
                                            <div 
                                                className="absolute inset-0 flex-col items-center justify-center bg-[#F3F4F6]"
                                                style={{ display: item.image_url ? 'none' : 'flex' }}
                                                title="Image Not Available"
                                            >
                                                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Item Info & Actions */}
                                    <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="space-y-1">
                                                <h4 className="text-base font-bold text-slate-800 uppercase tracking-tight">{item.product || `Product #${item.id}`}</h4>
                                                <p className="text-[10px] font-semibold text-[#3BAA35] uppercase tracking-widest">{item.category?.category || 'Silk Product'}</p>
                                            </div>

                                            <div className="flex items-center gap-6 md:gap-10">
                                                <div className="text-center hidden md:block">
                                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">Unit Value</span>
                                                    <p className="text-sm font-semibold text-slate-600">₱{Number(item.price).toLocaleString()}</p>
                                                </div>

                                                {/* Quantity Selector */}
                                                <div>
                                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1 text-center">Quantity</span>
                                                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1 bg-white shadow-sm">
                                                        <button 
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-50 text-slate-600 hover:bg-slate-200 transition-colors font-black"
                                                        >-</button>
                                                        <input 
                                                            type="number" 
                                                            value={item.quantity} 
                                                            readOnly 
                                                            className="w-10 text-center font-bold text-sm bg-transparent border-none p-0 focus:ring-0 text-[#0B1F3B]" 
                                                        />
                                                        <button 
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-md bg-[#0B1F3B] text-white hover:bg-[#0f2c54] transition-colors font-black shadow-sm"
                                                        >+</button>
                                                    </div>
                                                </div>

                                                <div className="text-right min-w-[80px]">
                                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">Subtotal</span>
                                                    <p className="text-base font-bold text-[#0B1F3B]">₱{Number(item.price * item.quantity).toLocaleString()}</p>
                                                </div>

                                                <button 
                                                    onClick={() => setItemToDelete(item.id)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors ml-2"
                                                    title="Remove Asset"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:w-96 shrink-0">
                            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 sticky top-24">
                                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-6">Protocol Summary</h3>
                                
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Subtotal ({cartItems.length} assets)</span>
                                        <span className="font-semibold text-slate-800">₱{Number(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Logistics & Handling</span>
                                        <span className="font-semibold text-slate-800">To be calculated</span>
                                    </div>
                                    <div className="pt-4 border-t border-gray-200 mt-4 flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Estimated Total</p>
                                            <p className="flex items-center gap-1 text-[#3BAA35] font-semibold text-[11px] uppercase tracking-wider">
                                                <ShieldCheck size={14} /> SRDI Traceable
                                            </p>
                                        </div>
                                        <p className="text-2xl font-bold text-[#0B1F3B]">₱{Number(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={checkout}
                                    className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[#0B1F3B] text-white rounded-xl hover:bg-[#3BAA35] shadow-lg shadow-[#0B1F3B]/10 hover:shadow-[#3BAA35]/20 transition-all font-bold text-xs uppercase tracking-widest active:scale-95"
                                >
                                    Proceed to Checkout
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-24 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400 shadow-inner">
                            <ShoppingCart size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight uppercase">Your Cart is Empty</h3>
                        <p className="text-slate-500 text-sm mt-2 font-medium max-w-sm mx-auto leading-relaxed">
                            No premium silk assets have been queued for acquisition. Visit our marketplace to begin.
                        </p>
                        <Link 
                            href={route('products.all')}
                            className="mt-8 inline-flex items-center gap-3 px-8 py-4 bg-[#0B1F3B] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#0f2c54] transition-all shadow-lg active:scale-95"
                        >
                            <ShoppingCart size={18} />
                            Return to Marketplace
                        </Link>
                    </div>
                )}
            </main>

            {/* Footer Section (Consistent) */}
            <footer className="bg-white border-t border-gray-100 py-12 lg:px-12 mt-auto">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="space-y-1 text-center md:text-left">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">DMMMSU — Sericulture Research and Development Institute</p>
                        <p className="text-[9px] text-[#3BAA35] font-black uppercase tracking-[0.25em]">Pioneering Excellence in Philippine Silk Research</p>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-60">© 2026 SRDI. ALL RIGHTS RESERVED.</p>
                </div>
            </footer>
            {/* Delete Confirmation Modal */}
            <Modal show={itemToDelete !== null} onClose={() => setItemToDelete(null)} maxWidth="md">
                <div className="p-8">
                    <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight mb-4">Confirm Removal</h2>
                    <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
                        Are you sure you want to remove this asset from your cart? You can always add it back later from the marketplace.
                    </p>
                    <div className="flex justify-end gap-4 border-t border-slate-100 pt-6">
                        <button
                            onClick={() => setItemToDelete(null)}
                            className="px-6 py-3 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                removeItem(itemToDelete);
                                setItemToDelete(null);
                            }}
                            className="px-6 py-3 rounded-xl bg-red-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 active:scale-95"
                        >
                            Remove Asset
                        </button>
                    </div>
                </div>
            </Modal>
        </UserLayout>
    );
}
