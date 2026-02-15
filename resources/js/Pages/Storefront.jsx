import React, { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade, Navigation } from 'swiper/modules';

// Swiper Styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

export default function Storefront({ auth, products }) {
    // States
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null); // 'ecommerce', 'supply', 'traceability'

    const openModal = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const renderStars = (rating = 5) => {
        return (
            <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans text-slate-950 antialiased selection:bg-lime-400 selection:text-slate-900">
            <Head title="D'SERICORE | Philippine Sericulture Hub" />

            {/* TOP BAR */}
            <div className="bg-slate-950 py-2 text-[10px] font-bold text-white/60 border-b border-white/10 uppercase tracking-[0.2em]">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-lime-400 rounded-full animate-pulse"></span>
                        SRDI - DON MARIANO MARCOS MEMORIAL STATE UNIVERSITY
                    </span>
                    <div className="hidden md:flex gap-8">
                        <span className="hover:text-lime-400 cursor-pointer transition">Research Access</span>
                        <span className="hover:text-lime-400 cursor-pointer transition">Market Reports</span>
                    </div>
                </div>
            </div>

            {/* NAVIGATION WITH TRIPLE MEGA MENU */}
            <nav 
                className="bg-white/80 backdrop-blur-md sticky top-0 z-[100] border-b border-slate-200"
                onMouseLeave={() => setActiveMenu(null)}
            >
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <Link href="/" className="flex items-center gap-3">
                            <ApplicationLogo className="h-8 w-auto text-lime-600" />
                            <span className="text-2xl font-black tracking-tighter text-slate-950 uppercase italic">
                                D'SERI<span className="text-lime-500">CORE</span>
                            </span>
                        </Link>

                        <div className="hidden lg:flex gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                            {/* E-Commerce Trigger */}
                            <div className={`relative py-8 cursor-pointer transition-colors ${activeMenu === 'ecommerce' ? 'text-slate-950' : ''}`} onMouseEnter={() => setActiveMenu('ecommerce')}>
                                E-Commerce
                                {activeMenu === 'ecommerce' && <div className="absolute bottom-0 left-0 w-full h-1 bg-lime-500 animate-in fade-in duration-300" />}
                            </div>

                            {/* Supply Chain Trigger */}
                            <div className={`relative py-8 cursor-pointer transition-colors ${activeMenu === 'supply' ? 'text-slate-950' : ''}`} onMouseEnter={() => setActiveMenu('supply')}>
                                Supply Chain
                                {activeMenu === 'supply' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 animate-in fade-in duration-300" />}
                            </div>

                            {/* Traceability Trigger */}
                            <div className={`relative py-8 cursor-pointer transition-colors ${activeMenu === 'traceability' ? 'text-slate-950' : ''}`} onMouseEnter={() => setActiveMenu('traceability')}>
                                Traceability
                                {activeMenu === 'traceability' && <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 animate-in fade-in duration-300" />}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link href={route('login')} className="text-[10px] font-black uppercase tracking-widest hover:text-lime-600 transition">Log In</Link>
                        <Link href="#" className="bg-slate-950 text-white px-6 py-3 text-[10px] font-black uppercase tracking-[0.15em] hover:bg-lime-500 hover:text-slate-950 transition-all duration-300">
                            Enterprise Access
                        </Link>
                    </div>
                </div>

                {/* MEGA MENU PANELS */}
                <div className="absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-2xl z-50">
                    
                    {/* E-COMMERCE PANEL */}
                    {activeMenu === 'ecommerce' && (
                        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-4 gap-12 animate-in slide-in-from-top-2 duration-300">
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-lime-600 uppercase tracking-[0.3em]">Marketplace</h4>
                                <ul className="space-y-3 text-sm font-bold text-slate-900 uppercase italic">
                                    <li className="hover:text-lime-600 cursor-pointer transition">Raw Silk Fiber</li>
                                    <li className="hover:text-lime-600 cursor-pointer transition">Artisan Textiles</li>
                                    <li className="hover:text-lime-600 cursor-pointer transition">Cocoon Inventory</li>
                                </ul>
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Buyer Tools</h4>
                                <ul className="space-y-3 text-xs font-bold text-slate-600 uppercase tracking-widest">
                                    <li className="hover:text-slate-950 cursor-pointer transition">Bulk Inquiry</li>
                                    <li className="hover:text-slate-950 cursor-pointer transition">Sample Requests</li>
                                </ul>
                            </div>
                            <div className="col-span-2 bg-slate-100 rounded-2xl overflow-hidden relative group">
                                <img src="/img/6.jpg" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt="Ecommerce" />
                                <div className="relative p-8 h-full flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
                                    <h5 className="text-2xl font-black text-white italic uppercase leading-none">Global Silk Export</h5>
                                    <p className="text-white/60 text-[10px] mt-2 font-bold uppercase tracking-[0.2em]">Standardized Philippine Quality</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SUPPLY CHAIN PANEL */}
                    {activeMenu === 'supply' && (
                        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-4 gap-12 animate-in slide-in-from-top-2 duration-300">
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Logistics</h4>
                                <ul className="space-y-3 text-sm font-bold text-slate-900 uppercase italic">
                                    <li className="hover:text-blue-600 cursor-pointer transition">Farmer to Hub</li>
                                    <li className="hover:text-blue-600 cursor-pointer transition">Processing Status</li>
                                    <li className="hover:text-blue-600 cursor-pointer transition">Warehouse Management</li>
                                </ul>
                            </div>
                            <div className="space-y-6 text-sm">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Partner Portals</h4>
                                <div className="space-y-4">
                                    <p className="font-black text-slate-900 leading-none">FARMER ACCESS <br/><span className="text-[10px] text-slate-400 font-medium lowercase">Manage your harvest yields</span></p>
                                    <p className="font-black text-slate-900 leading-none">REELER ACCESS <br/><span className="text-[10px] text-slate-400 font-medium lowercase">Monitor production batches</span></p>
                                </div>
                            </div>
                            <div className="col-span-2 grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                    <span className="text-2xl">🚚</span>
                                    <p className="mt-4 font-black text-blue-900 text-xs uppercase tracking-widest">Fleet Tracking</p>
                                    <p className="text-[10px] text-blue-700 mt-1 uppercase font-bold tracking-tighter italic">Real-time GPS Monitoring</p>
                                </div>
                                <div className="bg-slate-900 p-6 rounded-2xl">
                                    <span className="text-2xl">📊</span>
                                    <p className="mt-4 font-black text-white text-xs uppercase tracking-widest">Analytics</p>
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter italic">Supply vs Demand Forecast</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TRACEABILITY PANEL */}
                    {activeMenu === 'traceability' && (
                        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-4 gap-12 animate-in slide-in-from-top-2 duration-300">
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Verification</h4>
                                <ul className="space-y-3 text-sm font-bold text-slate-900 uppercase italic">
                                    <li className="hover:text-emerald-600 cursor-pointer transition">Origin Verification</li>
                                    <li className="hover:text-emerald-600 cursor-pointer transition">Fiber Fingerprinting</li>
                                    <li className="hover:text-emerald-600 cursor-pointer transition">Quality Certification</li>
                                </ul>
                            </div>
                            <div className="col-span-3 bg-emerald-50 rounded-[2rem] p-8 border border-emerald-100 flex items-center justify-between">
                                <div className="max-w-md space-y-4">
                                    <h5 className="text-3xl font-black text-emerald-900 tracking-tighter uppercase italic leading-none">SilkDNA™ Technology</h5>
                                    <p className="text-emerald-700 text-xs font-bold leading-relaxed uppercase tracking-widest">Every thread tells a story. Use our blockchain-backed system to verify the farm, reeler, and weaver of your silk product.</p>
                                    <button className="bg-emerald-950 text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-emerald-500 transition-colors">Scan Batch Code</button>
                                </div>
                                <div className="hidden md:block opacity-20 text-8xl grayscale">🧬</div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* HERO SECTION */}
            <header className="relative h-[85vh] bg-slate-950 overflow-hidden">
                <Swiper modules={[Autoplay, Pagination, EffectFade]} effect="fade" autoplay={{ delay: 7000 }} pagination={{ clickable: true }} className="h-full w-full">
                    <SwiperSlide>
                        <div className="relative h-full w-full flex items-center">
                            <img src="/img/6.jpg" className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105 animate-[subtle-zoom_20s_infinite]" alt="Hero" />
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
                            <div className="max-w-7xl mx-auto px-6 relative z-10">
                                <div className="space-y-4">
                                    <span className="inline-block text-lime-400 text-xs font-black uppercase tracking-[0.5em] border-l-4 border-lime-400 pl-4">Premium Fiber Sourcing</span>
                                    <h1 className="text-7xl lg:text-9xl font-black text-white leading-[0.85] tracking-tighter uppercase italic">
                                        PURE <br /> PHILIPPINE <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-400">SILK.</span>
                                    </h1>
                                    <button className="group relative bg-lime-400 text-slate-950 mt-8 px-12 py-5 font-black uppercase tracking-widest overflow-hidden transition-all">
                                        <span className="relative z-10">Explore Catalog</span>
                                        <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                </Swiper>
            </header>

{/* PRODUCT COLLECTION */}
<section className="py-16 bg-[#FAFAFA]">
    <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8">
            <div className="space-y-1">
                <h2 className="text-xs font-black text-lime-600 uppercase tracking-[0.4em]">Official Inventory</h2>
                <h3 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase">The Collection</h3>
            </div>
        </div>

        {products && products.length > 0 ? (
            <Swiper
                modules={[Autoplay, Pagination, Navigation]}
                spaceBetween={30}
                slidesPerView={1}
                navigation={true}
                loop={products.length > 4}
                autoplay={{ delay: 2500, disableOnInteraction: false }}
                breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }}
                className="product-swiper"
            >
                {products.map(product => {
                    const isOutOfStock = product.stock_count <= 0;
                    
                    return (
                        <SwiperSlide key={product.id}>
                            <div className={`group bg-white border ${isOutOfStock ? 'border-slate-100' : 'border-slate-200'} p-4 hover:border-lime-400 transition-all duration-500 flex flex-col h-full relative`}>
                                
                                {/* AVAILABILITY BADGE */}
                                <div className="absolute top-6 right-6 z-20">
                                    {isOutOfStock ? (
                                        <div className="flex flex-col items-end">
                                            <span className="bg-rose-600 text-white text-[9px] font-black px-3 py-1.5 uppercase shadow-xl tracking-widest">
                                                Sold Out
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="bg-lime-500 text-white text-[9px] font-black px-3 py-1.5 uppercase shadow-xl tracking-widest">
                                            In Stock
                                        </span>
                                    )}
                                </div>

                                <div className="aspect-[4/5] mb-4 overflow-hidden bg-slate-50 relative cursor-pointer" onClick={() => openModal(product)}>
                                    <img 
                                        src={product.image_url || '/img/placeholder.jpg'} 
                                        className={`w-full h-full object-cover mix-blend-multiply transition-transform duration-700 ${isOutOfStock ? 'grayscale opacity-40' : 'group-hover:scale-110'}`} 
                                        alt={product.product} 
                                    />
                                    
                                    {/* MAS HALATANG RESTOCK BANNER KAPAG SOLD OUT */}
                                    {isOutOfStock && (
                                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                                            {/* CENTER ROTATED BADGE */}
                                            <span className="text-slate-900 font-black text-[12px] uppercase tracking-[0.3em] bg-white px-6 py-3 border-4 border-slate-900 -rotate-12 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] mb-4">
                                                Out of Stock
                                            </span>

                                            {/* HIGH VISIBILITY RESTOCK DATE */}
                                            {product.restock_date && (
                                                <div className="bg-lime-400 text-slate-900 px-4 py-2 flex flex-col items-center shadow-lg border-2 border-slate-900">
                                                    <span className="text-[8px] font-black uppercase tracking-widest leading-none">Restocking On</span>
                                                    <span className="text-sm font-black uppercase italic tracking-tighter leading-none">
                                                        {new Date(product.restock_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="absolute bottom-4 left-4">
                                        <span className="bg-slate-950 text-white text-[9px] font-black px-3 py-1 uppercase">
                                            {product.category?.category || 'Sericulture'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1 flex-grow text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                        {renderStars(5)}
                                        <span className="text-[11px] font-black text-slate-900">5.0</span>
                                    </div>
                                    <h4 className={`font-black text-lg leading-tight line-clamp-2 uppercase italic tracking-tight ${isOutOfStock ? 'text-slate-400' : 'text-slate-900'}`}>
                                        {product.product}
                                    </h4>
                                    
                                    <div className="flex flex-col md:flex-row md:items-baseline gap-2">
                                        <p className={`text-2xl font-black tracking-tighter ${isOutOfStock ? 'text-slate-300' : 'text-lime-600'}`}>
                                            ₱{Number(product.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                        
                                        {!isOutOfStock && (
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                ({product.stock_count} units left)
                                            </span>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 mt-4">
                                        {/* MAS HALATANG BUTTON DESIGN PARA SA RESTOCK */}
                                        <button 
                                            disabled={isOutOfStock}
                                            onClick={() => openModal(product)} 
                                            className={`w-full py-3 font-black text-[11px] uppercase tracking-widest italic transition-all duration-300 border-2 ${
                                                isOutOfStock 
                                                ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed' 
                                                : 'bg-white border-slate-900 text-slate-900 hover:bg-lime-400 hover:border-lime-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                            }`}
                                        >
                                            {isOutOfStock 
                                                ? (product.restock_date 
                                                    ? `Available: ${new Date(product.restock_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` 
                                                    : 'Currently Unavailable') 
                                                : 'Quick View'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        ) : (
            <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest border-2 border-dashed rounded-[3rem]">
                No products available.
            </div>
        )}
    </div>
</section>

            {/* QUICK VIEW MODAL */}
            {isModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white max-w-4xl w-full grid md:grid-cols-2 relative shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 z-10 bg-slate-950 text-white w-10 h-10 flex items-center justify-center font-black hover:bg-lime-500 hover:text-slate-950 transition-all">✕</button>
                        <div className="bg-slate-100 p-8 flex items-center justify-center">
                            <img src={selectedProduct.image_url} className="w-full h-auto max-h-[400px] object-contain mix-blend-multiply" alt={selectedProduct.product} />
                        </div>
                        <div className="p-8 md:p-12 space-y-4 flex flex-col justify-center">
                            <span className="text-lime-600 font-black text-xs tracking-widest uppercase">{selectedProduct.category?.category || 'Premium'}</span>
                            <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-[0.9]">{selectedProduct.product}</h2>
                            <div className="text-3xl font-black text-slate-900 italic border-l-4 border-lime-500 pl-4 tracking-tighter">
                                ₱{Number(selectedProduct.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                            <p className="text-slate-500 text-xs font-bold uppercase leading-relaxed tracking-wider">{selectedProduct.description || 'Verified Philippine Silk product under SRDI supervision.'}</p>
                            <button onClick={() => setIsModalOpen(false)} className="block w-full bg-slate-950 text-white py-4 font-black uppercase tracking-widest hover:bg-lime-500 hover:text-slate-950 transition-all mt-4 italic">Continue Browsing</button>
                        </div>
                    </div>
                </div>
            )}

            {/* FOOTER */}
            <footer className="bg-slate-950 text-white pt-24 pb-12 mt-auto">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-16 pb-20 border-b border-white/10">
                        <div className="col-span-1 md:col-span-1 space-y-6 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <ApplicationLogo className="h-8 w-auto text-lime-400" />
                                <span className="text-xl font-black tracking-tighter italic uppercase">D'SERI<span className="text-lime-400">CORE</span></span>
                            </div>
                            <p className="text-slate-400 text-[10px] font-bold leading-relaxed uppercase tracking-widest">The official digital backbone of the Philippine Sericulture Industry.</p>
                        </div>
                        {['Systems', 'Community', 'Institutional'].map((title, i) => (
                            <div key={i} className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-400">{title}</h4>
                                <ul className="space-y-4 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] cursor-pointer">
                                    <li className="hover:text-white transition">Inventory Control</li>
                                    <li className="hover:text-white transition">Farmer Registry</li>
                                    <li className="hover:text-white transition">Research Hub</li>
                                </ul>
                            </div>
                        ))}
                    </div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em] mt-12 text-center">© 2026 SRDI - DMMMSU. ADVANCED SERICULTURE INFRASTRUCTURE.</p>
                </div>
            </footer>

            <style jsx global>{`
                @keyframes subtle-zoom { 0% { transform: scale(1); } 100% { transform: scale(1.1); } }
                .product-swiper { padding-bottom: 80px !important; }
                .product-swiper .swiper-button-next, .product-swiper .swiper-button-prev {
                    color: white !important; background: #0f172a !important; width: 50px !important; height: 50px !important;
                    top: auto !important; bottom: 0 !important; border-radius: 0;
                }
                .product-swiper .swiper-button-prev { right: 60px !important; left: auto !important; }
                .product-swiper .swiper-button-next { right: 0 !important; }
                .product-swiper .swiper-button-next:after, .product-swiper .swiper-button-prev:after { font-size: 14px !important; font-weight: 900 !important; }
                .swiper-pagination-bullet-active { background: #a3e635 !important; }
                .swiper-pagination { bottom: 15px !important; text-align: left !important; padding-left: 20px; }
            `}</style>
        </div>
    );
}