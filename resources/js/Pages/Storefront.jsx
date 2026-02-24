import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

/* ═══════════════════════════════════════════════════════════════════════════
   COLOR SYSTEM
   Primary    : Deep Navy  #0B1F3B
   Secondary  : Inst Green #3BAA35
   Accent     : Silk Gold  #C9A227
   Background : Off-white  #F7F9FB
   Text       : Dark slate #1F2937
   ═══════════════════════════════════════════════════════════════════════════ */

export default function Storefront({ auth, products }) {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTab, setModalTab] = useState('description');

    const openModal = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const renderStars = (rating = 0) => {
        const r = Number(rating) || 0;
        return (
            <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <svg key={i}
                        className={`w-3.5 h-3.5 ${i < Math.round(r) ? 'text-[#C9A227] fill-[#C9A227]' : 'text-slate-200 fill-slate-200'}`}
                        viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F7F9FB] flex flex-col font-sans text-[#1F2937] antialiased selection:bg-[#3BAA35]/20 selection:text-[#0B1F3B]">
            <Head title="D'SERICORE | Philippine Sericulture Hub" />

            {/* ═══ TOP BAR ═══ */}
            <div className="bg-[#0B1F3B] py-2.5 text-[10px] font-semibold text-white/60 tracking-[0.15em] uppercase">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#3BAA35] rounded-full" />
                        SRDI — Don Mariano Marcos Memorial State University
                    </span>
                    <div className="hidden md:flex gap-8">
                        <span className="hover:text-white cursor-pointer transition-colors">Research Access</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Market Reports</span>
                    </div>
                </div>
            </div>

            {/* ═══ NAVBAR ═══ */}
            <nav className="bg-white sticky top-0 z-[100] shadow-sm border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center gap-3">
                            <ApplicationLogo className="h-9 w-auto" />
                            <span className="text-xl font-extrabold tracking-tight text-[#0B1F3B]">
                                D'SERI<span className="text-[#3BAA35]">CORE</span>
                            </span>
                        </Link>
                        <div className="hidden lg:flex gap-8 text-sm font-semibold text-slate-500">
                            <a href="#products" className="hover:text-[#3BAA35] transition-colors py-1 border-b-2 border-transparent hover:border-[#3BAA35]">Products</a>
                            <a href="#process" className="hover:text-[#3BAA35] transition-colors py-1 border-b-2 border-transparent hover:border-[#3BAA35]">Process</a>
                            <a href="#about" className="hover:text-[#3BAA35] transition-colors py-1 border-b-2 border-transparent hover:border-[#3BAA35]">About</a>
                        </div>
                    </div>
                    <div className="flex items-center gap-5">
                        <Link href={route('login')} className="text-sm font-semibold text-slate-600 hover:text-[#0B1F3B] transition-colors">
                            Log In
                        </Link>
                        <Link href={route('login')} className="bg-[#3BAA35] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#329a2d] transition-all shadow-sm shadow-[#3BAA35]/20">
                            Enterprise Access
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ═══ HERO SECTION ═══ */}
            <header className="relative overflow-hidden">
                <Swiper modules={[Autoplay, Pagination, EffectFade]} effect="fade" autoplay={{ delay: 8000 }} pagination={{ clickable: true }} className="h-full w-full">
                    <SwiperSlide>
                        <div className="relative min-h-[85vh] flex items-center">
                            <img src="/img/6.jpg" className="absolute inset-0 w-full h-full object-cover" alt="Hero" />
                            {/* Soft navy gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3B]/90 via-[#0B1F3B]/70 to-[#0B1F3B]/30" />
                            <div className="max-w-7xl mx-auto px-6 py-28 relative z-10 w-full">
                                <div className="max-w-2xl space-y-6">
                                    <div className="flex items-center gap-3">
                                        <span className="w-10 h-px bg-[#C9A227]" />
                                        <span className="text-[#C9A227] text-xs font-bold uppercase tracking-[0.3em]">Premium Philippine Silk</span>
                                    </div>
                                    <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight">
                                        Research-Grade Silk,{' '}
                                        <span className="text-[#C9A227]">Sustainably Produced.</span>
                                    </h1>
                                    <p className="text-lg text-white/70 font-medium leading-relaxed max-w-xl">
                                        From DMMMSU's Sericulture Research and Development Institute — premium silk products backed by decades of Philippine agricultural research.
                                    </p>
                                    <div className="flex flex-wrap items-center gap-4 pt-2">
                                        <a href="#products" className="bg-[#3BAA35] text-white px-8 py-4 rounded-lg text-sm font-bold hover:bg-[#329a2d] transition-all shadow-lg shadow-[#3BAA35]/25">
                                            Explore Collection
                                        </a>
                                        <a href="#about" className="border-2 border-white/30 text-white px-8 py-4 rounded-lg text-sm font-bold hover:border-white/60 hover:bg-white/5 transition-all">
                                            Learn More
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                </Swiper>
            </header>

            {/* ═══ TRUST SECTION ═══ */}
            <section className="py-20 bg-white border-b border-slate-100" id="about">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <span className="text-[11px] font-bold text-[#3BAA35] uppercase tracking-[0.3em]">Why D'SERICORE</span>
                        <h2 className="text-3xl font-extrabold text-[#0B1F3B] mt-3 tracking-tight">Trusted. Traceable. Research-Backed.</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: (
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                ),
                                title: 'Official Institutional Production',
                                desc: "Products developed within DMMMSU's state-funded sericulture research facility.",
                            },
                            {
                                icon: (
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                ),
                                title: 'Research-Based Innovation',
                                desc: 'Every product is a result of scientific research and quality-controlled processing.',
                            },
                            {
                                icon: (
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ),
                                title: 'Sustainable Silk Farming',
                                desc: 'Eco-conscious mulberry cultivation and silkworm rearing practices from farm to fabric.',
                            },
                            {
                                icon: (
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                ),
                                title: 'Traceable Supply Chain',
                                desc: 'Full transparency from mulberry field to finished product — track every batch origin.',
                            },
                        ].map((item, i) => (
                            <div key={i} className="text-center p-8 rounded-2xl border border-slate-100 hover:border-[#3BAA35]/20 hover:shadow-lg hover:shadow-[#3BAA35]/5 transition-all duration-300 group">
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0B1F3B]/5 text-[#0B1F3B] mb-5 group-hover:bg-[#3BAA35]/10 group-hover:text-[#3BAA35] transition-colors">
                                    {item.icon}
                                </div>
                                <h3 className="text-base font-bold text-[#0B1F3B] mb-2">{item.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ PRODUCT COLLECTION ═══ */}
            <section className="py-20 bg-[#F7F9FB]" id="products">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-12">
                        <span className="text-[11px] font-bold text-[#3BAA35] uppercase tracking-[0.3em]">Official Inventory</span>
                        <h2 className="text-3xl font-extrabold text-[#0B1F3B] mt-2 tracking-tight">The Collection</h2>
                        <p className="text-sm text-slate-500 mt-2 max-w-lg">Authenticated silk products from SRDI's research facility — quality-tested and market-ready.</p>
                    </div>

                    {products && products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map(product => {
                                const isOutOfStock = product.stock_count <= 0;
                                const avgRating = product.ratings_avg_stars ? Number(product.ratings_avg_stars).toFixed(1) : "5.0";

                                return (
                                    <div
                                        key={product.id}
                                        className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 flex flex-col h-full relative transition-all duration-300 hover:-translate-y-1 ${!isOutOfStock ? 'cursor-pointer' : ''}`}
                                        onClick={() => !isOutOfStock && openModal(product)}
                                    >
                                        {/* Stock Badge */}
                                        <div className="absolute top-3 right-3 z-20">
                                            {isOutOfStock ? (
                                                <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">Sold Out</span>
                                            ) : (
                                                <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">In Stock</span>
                                            )}
                                        </div>

                                        {/* Image Area */}
                                        <div className="h-56 overflow-hidden bg-gray-50 relative flex items-center justify-center rounded-t-xl">
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                    className={`w-full h-full object-cover transition-transform duration-700 ${isOutOfStock ? 'grayscale opacity-50' : 'group-hover:scale-105'}`}
                                                    alt={product.product}
                                                />
                                            ) : null}
                                            {/* Placeholder — shown when no image or onError */}
                                            <div
                                                className="absolute inset-0 flex-col items-center justify-center gap-1 bg-[#F3F4F6]"
                                                style={{ display: product.image_url ? 'none' : 'flex' }}
                                            >
                                                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                                <span className="text-sm font-medium text-gray-400">Image Not Available</span>
                                                <span className="text-xs text-gray-400">Official SRDI Product</span>
                                            </div>
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-4 flex flex-col flex-grow">
                                            {/* Rating Row */}
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                                {renderStars(avgRating)}
                                                <span className="text-xs font-semibold text-slate-600">{avgRating}</span>
                                                <span className="text-[10px] text-slate-400">({product.ratings_count || 0})</span>
                                            </div>

                                            {/* Product Name */}
                                            <h4 className={`font-semibold text-sm leading-snug mb-1 line-clamp-2 ${isOutOfStock ? 'text-slate-400' : 'text-slate-800'}`}>
                                                {product.product}
                                            </h4>

                                            {/* Price */}
                                            <p className={`text-lg font-bold tracking-tight mt-auto ${isOutOfStock ? 'text-gray-300' : 'text-green-600'}`}>
                                                ₱{Number(product.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>

                                            {/* Action Button */}
                                            <button
                                                disabled={isOutOfStock}
                                                onClick={(e) => { e.stopPropagation(); openModal(product); }}
                                                className={`mt-3 w-full py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                                                    isOutOfStock
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-[#0B1F3B] text-white hover:bg-[#0f2c54]'
                                                }`}
                                            >
                                                {isOutOfStock ? 'Unavailable' : 'Quick View'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-slate-400 font-semibold border-2 border-dashed border-slate-200 rounded-2xl">
                            No products available at the moment.
                        </div>
                    )}
                </div>
            </section>

            {/* ═══ PROCESS SECTION ═══ */}
            <section className="py-20 bg-white border-t border-slate-100" id="process">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <span className="text-[11px] font-bold text-[#C9A227] uppercase tracking-[0.3em]">From Farm to Fabric</span>
                        <h2 className="text-3xl font-extrabold text-[#0B1F3B] mt-3 tracking-tight">The Silk Production Process</h2>
                    </div>
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        {[
                            { icon: '🌿', label: 'Mulberry', desc: 'Cultivated leaves for feeding' },
                            { icon: '🐛', label: 'Silkworm', desc: 'Bombyx mori rearing' },
                            { icon: '🥚', label: 'Cocoon', desc: 'Harvested & sorted' },
                            { icon: '🧵', label: 'Yarn', desc: 'Reeled & degummed' },
                            { icon: '🧣', label: 'Fabric', desc: 'Woven & finished' },
                        ].map((step, i, arr) => (
                            <React.Fragment key={i}>
                                <div className="flex flex-col items-center text-center group flex-1">
                                    <div className="w-20 h-20 rounded-2xl bg-[#0B1F3B]/5 flex items-center justify-center text-3xl mb-4 group-hover:bg-[#C9A227]/10 transition-colors">
                                        {step.icon}
                                    </div>
                                    <h3 className="text-sm font-bold text-[#0B1F3B] uppercase tracking-wide">{step.label}</h3>
                                    <p className="text-xs text-slate-400 mt-1">{step.desc}</p>
                                </div>
                                {i < arr.length - 1 && (
                                    <div className="hidden lg:flex items-center text-slate-200 flex-shrink-0">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ CTA SECTION ═══ */}
            <section className="py-20 bg-[#0B1F3B]">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <span className="text-[11px] font-bold text-[#C9A227] uppercase tracking-[0.3em]">Partner With Us</span>
                    <h2 className="text-3xl lg:text-4xl font-extrabold text-white mt-4 tracking-tight max-w-2xl mx-auto">
                        Interested in bulk orders or institutional partnerships?
                    </h2>
                    <p className="text-white/50 text-base mt-4 max-w-lg mx-auto">
                        Connect with SRDI for research collaborations, wholesale silk supply, and enterprise-grade procurement.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 mt-8">
                        <a href="#" className="bg-[#3BAA35] text-white px-8 py-4 rounded-lg text-sm font-bold hover:bg-[#329a2d] transition-all shadow-lg shadow-[#3BAA35]/25">
                            Contact Sales
                        </a>
                        <a href="#" className="border-2 border-white/20 text-white px-8 py-4 rounded-lg text-sm font-bold hover:border-white/40 hover:bg-white/5 transition-all">
                            Download Catalog
                        </a>
                    </div>
                </div>
            </section>

            {/* ═══ QUICK VIEW MODAL ═══ */}
            {isModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white max-w-5xl w-full rounded-2xl relative shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

                        {/* Close Button */}
                        <button onClick={() => setIsModalOpen(false)}
                            className="absolute top-5 right-5 z-10 bg-slate-100 hover:bg-slate-200 w-10 h-10 flex items-center justify-center rounded-full transition-colors">
                            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* 2-Column Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 overflow-y-auto">

                            {/* Left — Image */}
                            <div className="bg-gray-50 p-6 md:p-10 flex items-center justify-center relative group">
                                <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                                    {selectedProduct.image_url ? (
                                        <img
                                            src={selectedProduct.image_url}
                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                            className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                                            alt={selectedProduct.product}
                                        />
                                    ) : null}
                                    <div
                                        className="flex-col items-center justify-center gap-2 w-full h-full bg-[#F3F4F6] rounded-xl"
                                        style={{ display: selectedProduct.image_url ? 'none' : 'flex' }}
                                    >
                                        <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-400">Image Not Available</span>
                                        <span className="text-xs text-gray-400">Official SRDI Product</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right — Info */}
                            <div className="p-6 md:p-10 flex flex-col">

                                {/* Category */}
                                <span className="text-xs uppercase tracking-widest text-green-600 font-semibold">
                                    {selectedProduct.category?.category || 'Silk Product'}
                                </span>

                                {/* Product Name */}
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2 leading-tight">
                                    {selectedProduct.product}
                                </h2>

                                {/* Price + Badge */}
                                <div className="flex items-center gap-3 mt-3">
                                    <p className="text-2xl font-bold text-green-600">
                                        ₱{Number(selectedProduct.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                        selectedProduct.stock_count > 0
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                        {selectedProduct.stock_count > 0 ? 'In Stock' : 'Sold Out'}
                                    </span>
                                </div>

                                {/* Rating Summary */}
                                <div className="flex items-center gap-2 mt-3">
                                    {renderStars(selectedProduct.ratings_avg_stars || 5)}
                                    <span className="text-sm font-semibold text-slate-600">
                                        {selectedProduct.ratings_avg_stars ? Number(selectedProduct.ratings_avg_stars).toFixed(1) : '5.0'}
                                    </span>
                                    <span className="text-sm text-gray-400">
                                        ({selectedProduct.ratings_count || 0} reviews)
                                    </span>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-gray-100 mt-5 pt-5">
                                    {/* Quantity + Action */}
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            min="1"
                                            defaultValue={1}
                                            className="w-20 text-center border border-gray-200 rounded-lg py-2.5 text-sm font-semibold focus:border-[#0B1F3B] focus:ring-1 focus:ring-[#0B1F3B] outline-none"
                                        />
                                        <button
                                            disabled={selectedProduct.stock_count <= 0}
                                            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                                                selectedProduct.stock_count > 0
                                                    ? 'bg-[#0B1F3B] text-white hover:bg-[#0f2c54]'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            {selectedProduct.stock_count > 0 ? 'Add to Cart' : 'Unavailable'}
                                        </button>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="mt-6 border-t border-gray-100 pt-5 flex-grow flex flex-col min-h-0">
                                    <div className="flex gap-1 mb-4">
                                        {['description', 'reviews'].map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => setModalTab(tab)}
                                                className={`px-4 py-2 text-sm font-semibold rounded-lg capitalize transition-colors ${
                                                    modalTab === tab
                                                        ? 'bg-[#0B1F3B] text-white'
                                                        : 'text-slate-500 hover:bg-slate-100'
                                                }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Tab Content */}
                                    {modalTab === 'description' ? (
                                        <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                                            <p>
                                                {selectedProduct.description || 'A premium silk product produced at the Sericulture Research and Development Institute (SRDI) of DMMMSU. Made with research-grade mulberry silkworm cocoons, processed and quality-tested in-house.'}
                                            </p>
                                            <div className="grid grid-cols-2 gap-3 mt-4">
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Category</p>
                                                    <p className="text-sm font-semibold text-slate-700 mt-0.5">{selectedProduct.category?.category || '—'}</p>
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Stock</p>
                                                    <p className="text-sm font-semibold text-slate-700 mt-0.5">{selectedProduct.stock_count || 0} units</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="max-h-72 overflow-y-auto pr-1 space-y-3">
                                            {selectedProduct.ratings && selectedProduct.ratings.length > 0 ? (
                                                selectedProduct.ratings.map((rev) => (
                                                    <div key={rev.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-2">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-800">
                                                                    {rev.user?.first_name} {rev.user?.last_name || 'Verified Buyer'}
                                                                </p>
                                                                <div className="mt-1">{renderStars(rev.stars)}</div>
                                                            </div>
                                                            <span className="text-xs text-gray-400">
                                                                {new Date(rev.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 leading-relaxed">"{rev.comment}"</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-10">
                                                    <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                    <p className="text-sm text-gray-400 font-medium">No reviews yet for this product.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ FOOTER ═══ */}
            <footer className="bg-[#0B1F3B] text-white pt-20 pb-10 mt-auto">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-16 border-b border-white/10">
                        <div className="space-y-5">
                            <div className="flex items-center gap-3">
                                <ApplicationLogo className="h-8 w-auto" />
                                <span className="text-lg font-extrabold tracking-tight">
                                    D'SERI<span className="text-[#3BAA35]">CORE</span>
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                The official digital platform of the Philippine Sericulture Research and Development Institute.
                            </p>
                        </div>
                        {[
                            { title: 'Platform', links: ['Marketplace', 'Inventory System', 'Supply Chain'] },
                            { title: 'Institution', links: ['About SRDI', 'Research Papers', 'DMMMSU'] },
                            { title: 'Support', links: ['Contact Us', 'Enterprise Inquiry', 'FAQs'] },
                        ].map((col, i) => (
                            <div key={i} className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A227]">{col.title}</h4>
                                <ul className="space-y-3">
                                    {col.links.map(link => (
                                        <li key={link}>
                                            <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">{link}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-8 text-center font-medium">
                        © 2026 SRDI — Don Mariano Marcos Memorial State University. All rights reserved.
                    </p>
                </div>
            </footer>

            <style>{`
                .product-swiper { padding-bottom: 70px !important; }
                .product-swiper .swiper-button-next,
                .product-swiper .swiper-button-prev {
                    color: white !important;
                    background: #0B1F3B !important;
                    width: 44px !important;
                    height: 44px !important;
                    border-radius: 12px !important;
                    top: auto !important;
                    bottom: 0 !important;
                }
                .product-swiper .swiper-button-prev { right: 56px !important; left: auto !important; }
                .product-swiper .swiper-button-next { right: 0 !important; }
                .product-swiper .swiper-button-next:after,
                .product-swiper .swiper-button-prev:after { font-size: 14px !important; font-weight: 700 !important; }
                .product-swiper .swiper-button-next:hover,
                .product-swiper .swiper-button-prev:hover { background: #3BAA35 !important; }
                .swiper-pagination-bullet-active { background: #3BAA35 !important; }
                .swiper-pagination { bottom: 15px !important; text-align: left !important; padding-left: 20px; }
            `}</style>
        </div>
    );
}