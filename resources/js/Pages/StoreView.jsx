// resources/js/Pages/StoreView.jsx
import React from 'react';

export default function StoreView({ products }) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <header>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Marketplace</h1>
                <p className="text-slate-500 font-medium">Browse our premium selection of products.</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products?.length > 0 ? (
                    products.map((product) => (
                        <div key={product.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                            <div className="h-48 bg-slate-100 flex items-center justify-center relative">
                                <span className="text-5xl group-hover:scale-110 transition-transform">📦</span>
                                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase text-indigo-600">
                                    {product.category?.name || 'In Stock'}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-black text-slate-900 truncate">{product.name}</h3>
                                <p className="text-slate-500 text-xs mt-1 line-clamp-2 h-8">{product.description || 'No description provided.'}</p>
                                
                                <div className="mt-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 leading-none">Price</p>
                                        <p className="text-xl font-black text-slate-900">₱{product.price}</p>
                                    </div>
                                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-2xl shadow-lg shadow-indigo-200 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
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