// resources/js/Pages/StoreView.jsx
import React, { useState } from 'react';

export default function StoreView({ products }) {
    // Add to Cart Logic (Local state for demo)
    const [cartCount, setCartCount] = useState(0);

    const handleAddToCart = (product) => {
        // Dito mo ilalagay yung actual logic (Inertia post o context update)
        setCartCount(prev => prev + 1);
        console.log(`Added ${product.name} to cart`);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">Marketplace</h1>
                    <p className="text-slate-500 font-medium">Browse our premium selection of products.</p>
                </div>
                {/* Cart Indicator */}
                <div className="bg-slate-950 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    🛒 Cart: {cartCount}
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products?.length > 0 ? (
                    products.map((product) => (
                        <div key={product.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full">
                            
                            {/* IMAGE DISPLAY */}
                            <div className="h-64 bg-slate-50 flex items-center justify-center relative overflow-hidden">
                                {product.image_url ? (
                                    <img 
                                        src={product.image_url} 
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
                                    />
                                ) : (
                                    <span className="text-5xl group-hover:scale-110 transition-transform">📦</span>
                                )}
                                
                                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase text-indigo-600">
                                    {product.category?.name || 'In Stock'}
                                </div>
                            </div>

                            {/* CONTENT */}
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="font-black text-slate-900 truncate uppercase tracking-tight italic text-lg">
                                    {product.name}
                                </h3>
                                <p className="text-slate-500 text-xs mt-1 line-clamp-2 h-8 leading-relaxed">
                                    {product.description || 'Premium quality sericulture product.'}
                                </p>
                                
                                <div className="mt-auto pt-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 leading-none tracking-tighter">Price</p>
                                        <p className="text-xl font-black text-slate-900 italic">
                                            ₱{Number(product.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>

                                    {/* ADD TO CART BUTTON */}
                                    <button 
                                        onClick={() => handleAddToCart(product)}
                                        className="bg-indigo-600 hover:bg-lime-500 hover:text-slate-950 text-white p-4 rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-lime-200 transition-all duration-300 group/btn active:scale-95"
                                        title="Add to Cart"
                                    >
                                        <svg className="w-5 h-5 group-hover/btn:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Products coming soon</p>
                    </div>
                )}
            </div>
        </div>
    );
}