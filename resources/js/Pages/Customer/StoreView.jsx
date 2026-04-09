import React, { useState, useEffect } from 'react';
import { router, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function StoreView({ products }) {
    const [cart, setCart] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedCart = localStorage.getItem('srdi_cart');
            return savedCart ? JSON.parse(savedCart) : [];
        }
        return [];
    });

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '' });

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 4000);
    };

    useEffect(() => {
        localStorage.setItem('srdi_cart', JSON.stringify(cart));
    }, [cart]);

    const getStock = (product) => product.stock_count ?? product.inventory?.quantity ?? 0;
    const getRestockDate = (product) => product.restock_date ?? product.inventory?.restock_date;

    const addToCart = (productItem) => {
        const currentStock = getStock(productItem);
        if (currentStock <= 0) return;
        setCart(prev => {
            const exists = prev.find(item => item.id === productItem.id);
            if (exists) {
                if (exists.quantity >= currentStock) return prev;
                return prev.map(item =>
                    item.id === productItem.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...productItem, quantity: 1 }];
        });
        showToast(`${productItem.product} added to basket!`);
    };

    const updateQuantity = (id, amount, maxStock) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + amount;
                if (newQty > maxStock || newQty <= 0) return item;
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));

    const cartTotal  = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleCheckout = () => {
        if (cart.length === 0) return;
        setIsProcessing(true);
        router.post(route('customer.checkout.place'), {
            items: cart,
            total: cartTotal,
        }, {
            onSuccess: () => {
                setCart([]);
                localStorage.removeItem('srdi_cart');
                setIsCartOpen(false);
                setIsProcessing(false);
                showToast('Order Placed Successfully! 🎉');
            },
            onError: () => {
                setIsProcessing(false);
                showToast('Checkout failed. Please try again.');
            },
        });
    };

    return (
        <AuthenticatedLayout header="Marketplace">
            <Head title="Marketplace" />

            {/* Toast — low z-index so it doesn't interfere with navbar */}
            {toast.show && (
                <div className="fixed bottom-10 right-10 z-40 animate-in slide-in-from-right duration-500">
                    <div className="bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-emerald-400/50">
                        <div className="bg-white/20 p-2 rounded-full">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Success</span>
                            <span className="text-sm font-bold">{toast.message}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Main content — NO sticky, NO high z-index so navbar dropdown shows above */}
            <div className="min-h-screen bg-[#F8FAFC] px-6 py-8 relative z-0">
                <div className="max-w-7xl mx-auto">

                    {/* Title + Cart — plain div, not sticky/fixed */}
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-950">Marketplace</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="h-[2px] w-8 bg-indigo-600"></span>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Premium Selection</p>
                            </div>
                        </div>

                        {/* Cart button — no z-index, just relative positioning */}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="group relative bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-95"
                        >
                            <svg className="w-6 h-6 text-slate-900 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[11px] font-black w-6 h-6 flex items-center justify-center rounded-full border-4 border-white shadow-lg">
                                    {totalItems}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {products.map((item) => {
                            const currentStock = getStock(item);
                            const isOutOfStock = currentStock <= 0;
                            const restockDate  = getRestockDate(item);

                            return (
                                <div key={item.id} className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100/50 transition-all duration-500 hover:-translate-y-1 flex flex-col">
                                    {/* Image Container */}
                                    <div className={`relative aspect-[4/3] w-full bg-slate-50 overflow-hidden ${isOutOfStock ? 'grayscale' : ''}`}>
                                        <img
                                            src={item.image_url || 'https://placehold.co/400x300?text=No+Image'}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                            alt={item.product}
                                            onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
                                        />

                                        {/* Status Badges Overlay */}
                                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                                            {isOutOfStock ? (
                                                <span className="bg-red-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg">Sold Out</span>
                                            ) : currentStock < 5 ? (
                                                <span className="bg-orange-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg">Only {currentStock} left</span>
                                            ) : (
                                                <span className="bg-white/80 backdrop-blur-md text-indigo-700 font-black text-[10px] px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">{currentStock} in stock</span>
                                            )}
                                        </div>

                                        {/* Sold Out Overlay Text */}
                                        {isOutOfStock && restockDate && (
                                            <div className="absolute inset-0 z-10 bg-slate-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                                                <p className="text-[10px] text-white/80 uppercase font-black tracking-widest">Restocking On</p>
                                                <p className="text-sm font-black text-white italic drop-shadow-md">
                                                    {new Date(restockDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Info */}
                                    <div className="p-5 flex flex-col flex-grow">
                                        <h3 className={`font-black text-lg line-clamp-1 leading-tight mb-1 ${isOutOfStock ? 'text-slate-400' : 'text-slate-800'}`}>
                                            {item.product}
                                        </h3>
                                        
                                        <p className="text-slate-500 text-xs font-medium line-clamp-2 leading-relaxed mb-4 flex-grow">
                                            {item.description || 'No description available for this premium product.'}
                                        </p>

                                        {/* Footer Row */}
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-auto">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Price</span>
                                                <span className="text-xl font-black text-slate-900 italic tracking-tight leading-none bg-clip-text">
                                                    ₱{Number(item.price).toLocaleString()}
                                                </span>
                                            </div>

                                            {!isOutOfStock ? (
                                                <button
                                                    onClick={() => addToCart(item)}
                                                    className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all duration-300"
                                                    title="Add to Cart"
                                                >
                                                    <svg className="w-5 h-5 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                </button>
                                            ) : (
                                                <div className="h-12 px-4 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 cursor-not-allowed">
                                                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Unavailable</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Cart Modal — z-index 50 so it's above content but navbar is higher */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-end sm:p-6 bg-slate-900/40 backdrop-blur-md">
                    <div className="bg-white w-full max-w-md h-full sm:h-[90vh] sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-slate-100 animate-in slide-in-from-right duration-500">
                        <div className="p-8 flex justify-between items-center border-b border-slate-50">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-950">My Basket</h2>
                            <button onClick={() => setIsCartOpen(false)} className="bg-slate-100 p-3 rounded-2xl text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-8 space-y-6">
                            {cart.length === 0 ? (
                                <p className="text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-20">Your basket is empty</p>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="flex items-center gap-5">
                                        <img
                                            src={item.image_url || 'https://placehold.co/64x64?text=?'}
                                            className="h-16 w-16 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                                            onError={(e) => { e.target.src = 'https://placehold.co/64x64?text=?'; }}
                                        />
                                        <div className="flex-grow min-w-0">
                                            <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{item.product}</h4>
                                            <p className="text-indigo-600 font-black text-xs">₱{Number(item.price).toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center bg-slate-100 rounded-lg p-1 shrink-0">
                                            <button onClick={() => updateQuantity(item.id, -1, getStock(item))} className="w-6 h-6 flex items-center justify-center font-bold text-slate-400 hover:text-rose-500 transition-colors">−</button>
                                            <span className="w-6 text-center font-black text-xs text-slate-900">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1, getStock(item))} className="w-6 h-6 flex items-center justify-center font-bold text-indigo-600 hover:text-indigo-800 transition-colors">+</button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-rose-400 transition-colors shrink-0">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-8 bg-white border-t border-slate-100">
                                <div className="mb-6">
                                    <span className="text-[10px] font-bold uppercase text-indigo-600">Grand Total</span>
                                    <p className="text-4xl font-black italic text-slate-950">₱{cartTotal.toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    disabled={isProcessing}
                                    className={`w-full py-6 rounded-3xl font-black uppercase tracking-widest text-xs transition-all shadow-xl ${isProcessing ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-slate-950 text-white hover:bg-emerald-600'}`}
                                >
                                    {isProcessing ? 'Processing...' : 'Secure Checkout'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}