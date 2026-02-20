import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Calendar, Package, Tag, CheckCircle, XCircle, ImageIcon } from 'lucide-react';

export default function Show({ auth, product }) {
    const formatPrice = (price) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price);
    const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Product: ${product.name}`} />

            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">

                {/* Back Button */}
                <Link href={route('admin.products.index')} className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm mb-6 transition-colors">
                    <ArrowLeft size={18} />
                    Back to Inventory
                </Link>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Image Section */}
                        <div className="bg-slate-50 relative min-h-[400px] md:h-auto border-r border-slate-100 p-5 flex items-center justify-center">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300" style={{ display: product.image_url ? 'none' : 'flex' }}>
                                <ImageIcon size={64} className="opacity-50" />
                                <span className="font-bold mt-4">No Image Available</span>
                            </div>

                            {/* Stock Badge Overlay */}
                            <div className="absolute top-6 left-6">
                                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm border ${product.stock_quantity > 10
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    : product.stock_quantity > 0
                                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                                        : 'bg-rose-50 text-rose-600 border-rose-100'
                                    }`}>
                                    {product.stock_quantity > 0 ? `${product.stock_quantity} In Stock` : 'Out of Stock'}
                                </span>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="p-5 md:p-8 flex flex-col">
                            <div className="mb-auto">
                                <div className="flex items-start justify-between mb-4">
                                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider">
                                        {product.category?.category || 'Uncategorized'}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {product.status === 1 ? (
                                            <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1 rounded-full">
                                                <CheckCircle size={14} /> Active
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-slate-500 text-xs font-bold bg-slate-100 px-3 py-1 rounded-full">
                                                <XCircle size={14} /> Inactive
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 leading-tight">
                                    {product.name}
                                </h1>

                                <p className="text-3xl font-bold text-indigo-600 mb-8">
                                    {formatPrice(product.price)}
                                </p>

                                <div className="prose prose-slate prose-sm max-w-none text-slate-500 mb-8 border-t border-b border-slate-50 py-6">
                                    <h3 className="text-slate-900 font-bold uppercase text-xs tracking-wider mb-2">Description</h3>
                                    <p className="whitespace-pre-line leading-relaxed">
                                        {product.description || 'No description provided for this product.'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-6 text-sm">
                                    <div>
                                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-1">Created At</p>
                                        <p className="text-slate-700 font-semibold flex items-center gap-2">
                                            <Calendar size={14} className="text-indigo-400" />
                                            {formatDate(product.created_at)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-1">Last Updated</p>
                                        <p className="text-slate-700 font-semibold flex items-center gap-2">
                                            <Calendar size={14} className="text-indigo-400" />
                                            {formatDate(product.updated_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
