import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, CheckCircle, XCircle, ImageIcon, Star } from 'lucide-react';

export default function Show({ auth, product }) {
    const fmt     = (price) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price);
    const fmtDate = (date)  => new Date(date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    const stock    = product.stock_count ?? 0;
    const isOut    = stock <= 0;
    const isLow    = stock > 0 && stock <= 10;
    const isActive = product.status === 'active';

    const totalIn  = product.inventories?.filter(i => i.type === 'in').reduce((s, i)  => s + i.quantity, 0) ?? 0;
    const totalOut = product.inventories?.filter(i => i.type === 'out').reduce((s, i) => s + i.quantity, 0) ?? 0;

    const avgRating = product.ratings?.length
        ? (product.ratings.reduce((s, r) => s + r.stars, 0) / product.ratings.length).toFixed(1)
        : null;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Product: ${product.product}`} />

            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500 space-y-6">

                {/* Back */}
                <Link href={route('admin.products.index')}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors">
                    <ArrowLeft size={16} />
                    Back to Inventory
                </Link>

                {/* ── Main Card ── */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-5">

                        {/* Image */}
                        <div className="md:col-span-2 bg-slate-50 relative min-h-[380px] border-b md:border-b-0 md:border-r border-slate-100 flex items-center justify-center p-8">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.product}
                                    className="max-h-72 w-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
                                    onError={e => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div className={`absolute inset-0 flex-col items-center justify-center text-slate-300 ${product.image_url ? 'hidden' : 'flex'}`}>
                                <ImageIcon size={64} className="opacity-40" />
                                <span className="font-bold mt-4 text-slate-400 text-sm">No Image Available</span>
                            </div>

                            {/* Stock Badge */}
                            <div className="absolute top-5 left-5">
                                <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm border ${
                                    isOut ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                    isLow ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                                }`}>
                                    {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                                </span>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="md:col-span-3 p-6 md:p-10 flex flex-col gap-6">

                            {/* Category + Status */}
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider">
                                    {product.category?.category || 'Uncategorized'}
                                </span>
                                {isActive ? (
                                    <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1 rounded-full">
                                        <CheckCircle size={13} /> Active
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-slate-500 text-xs font-bold bg-slate-100 px-3 py-1 rounded-full">
                                        <XCircle size={13} /> Inactive
                                    </span>
                                )}
                            </div>

                            {/* Name + Price */}
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-2">
                                    {product.product}
                                </h1>
                                <p className="text-3xl font-bold text-indigo-600">{fmt(product.price)}</p>
                            </div>

                            {/* Stock KPIs */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Current Stock', value: stock,    color: isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-emerald-600', bg: isOut ? 'bg-rose-50' : isLow ? 'bg-amber-50' : 'bg-emerald-50' },
                                    { label: 'Total In',      value: totalIn,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                    { label: 'Total Out',     value: totalOut, color: 'text-rose-600',    bg: 'bg-rose-50' },
                                ].map(({ label, value, color, bg }) => (
                                    <div key={label} className={`${bg} rounded-2xl p-4 text-center`}>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                                        <p className={`text-2xl font-black ${color}`}>{value}</p>
                                        <p className="text-[10px] text-slate-400 font-bold">units</p>
                                    </div>
                                ))}
                            </div>

                            {/* Description */}
                            <div className="border-t border-slate-100 pt-5">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Description</p>
                                <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">
                                    {product.description || 'No description provided for this product.'}
                                </p>
                            </div>

                            {/* Rating + Dates */}
                            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 text-sm">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Rating</p>
                                    <div className="flex items-center gap-2">
                                        <Star size={14} className="text-amber-400 fill-amber-400" />
                                        <span className="font-black text-slate-800">{avgRating ?? '—'}</span>
                                        <span className="text-slate-400 text-xs">({product.ratings?.length ?? 0} reviews)</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Created</p>
                                    <p className="text-slate-600 font-semibold flex items-center gap-1.5 text-xs">
                                        <Calendar size={13} className="text-indigo-400" />
                                        {fmtDate(product.created_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Ratings Section ── */}
                {product.ratings?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                            <Star size={16} className="text-amber-400 fill-amber-400" />
                            <h2 className="font-black text-slate-800 text-sm uppercase tracking-widest">Customer Reviews</h2>
                            <span className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-full ml-auto">
                                {product.ratings.length} reviews
                            </span>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {product.ratings.map(rev => (
                                <div key={rev.id} className="px-6 py-4 flex gap-4">
                                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm flex-shrink-0">
                                        {rev.user?.first_name?.[0] ?? '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <p className="font-bold text-slate-800 text-sm">
                                                {rev.user?.first_name} {rev.user?.last_name}
                                            </p>
                                            <span className="text-[10px] text-slate-400">{new Date(rev.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex gap-0.5 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={11}
                                                    className={i < rev.stars ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
                                            ))}
                                        </div>
                                        <p className="text-sm text-slate-500 leading-relaxed">{rev.comment}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}