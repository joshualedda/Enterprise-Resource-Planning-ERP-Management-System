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
    const [activeMenu, setActiveMenu] = useState(null);

    const openModal = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    // Pinaganda ang Star Logic para suportahan ang fractional ratings (e.g. 4.3)
const renderStars = (rating = 0) => {
        const numericRating = Number(rating) || 0;
        return (
            <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => {
                    const starLevel = i + 1;
                    return (
                        <svg key={i} 
                            className={`w-3.5 h-3.5 ${starLevel <= Math.round(numericRating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}`} 
                            viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    );
                })}
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

            {/* NAVIGATION */}
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
                            <div className={`relative py-8 cursor-pointer transition-colors ${activeMenu === 'ecommerce' ? 'text-slate-950' : ''}`} onMouseEnter={() => setActiveMenu('ecommerce')}>
                                E-Commerce
                                {activeMenu === 'ecommerce' && <div className="absolute bottom-0 left-0 w-full h-1 bg-lime-500 animate-in fade-in duration-300" />}
                            </div>
                            <div className={`relative py-8 cursor-pointer transition-colors ${activeMenu === 'supply' ? 'text-slate-950' : ''}`} onMouseEnter={() => setActiveMenu('supply')}>
                                Supply Chain
                                {activeMenu === 'supply' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 animate-in fade-in duration-300" />}
                            </div>
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

                {/* MEGA MENU PANELS (Same as yours) */}
                <div className="absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-2xl z-50">
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
                    {/* ... other panels remain the same ... */}
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

{/* PRODUCT COLLECTION SECTION */}
            <section className="py-16 bg-[#FAFAFA]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-8">
                        <h2 className="text-xs font-black text-lime-600 uppercase tracking-[0.4em]">Official Inventory</h2>
                        <h3 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase">The Collection</h3>
                    </div>

                    {products && products.length > 0 ? (
                        <Swiper
                            modules={[Autoplay, Pagination, Navigation]}
                            spaceBetween={30}
                            slidesPerView={1}
                            navigation={true}
                            breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }}
                            className="product-swiper !pb-12"
                        >
                            {products.map(product => {
                                const isOutOfStock = product.stock_count <= 0;
                                const avgRating = product.ratings_avg_stars ? Number(product.ratings_avg_stars).toFixed(1) : "5.0";
                                
                                return (
                                    <SwiperSlide key={product.id}>
                                        <div className={`group bg-white border ${isOutOfStock ? 'border-slate-100' : 'border-slate-200'} p-4 hover:border-lime-400 transition-all duration-500 flex flex-col h-full relative`}>
                                            <div className="absolute top-6 right-6 z-20">
                                                {isOutOfStock ? (
                                                    <span className="bg-rose-600 text-white text-[9px] font-black px-3 py-1.5 uppercase tracking-widest shadow-xl">Sold Out</span>
                                                ) : (
                                                    <span className="bg-lime-500 text-white text-[9px] font-black px-3 py-1.5 uppercase tracking-widest shadow-xl">In Stock</span>
                                                )}
                                            </div>

                                            <div className="aspect-[4/5] mb-4 overflow-hidden bg-slate-50 relative cursor-pointer" onClick={() => !isOutOfStock && openModal(product)}>
                                                <img 
                                                    src={product.image_url || '/img/placeholder.jpg'} 
                                                    className={`w-full h-full object-cover mix-blend-multiply transition-transform duration-700 ${isOutOfStock ? 'grayscale opacity-40' : 'group-hover:scale-110'}`} 
                                                    alt={product.product} 
                                                />
                                                {isOutOfStock && (
                                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                                                        <span className="text-slate-900 font-black text-[12px] uppercase tracking-[0.3em] bg-white px-6 py-3 border-4 border-slate-900 -rotate-12 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">Out of Stock</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-1 flex-grow">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {renderStars(avgRating)}
                                                    <span className="text-[11px] font-black text-slate-900">{avgRating}</span>
                                                    <span className="text-[10px] font-bold text-slate-400">({product.ratings_count || 0})</span>
                                                </div>
                                                <h4 className={`font-black text-lg leading-tight uppercase italic tracking-tight ${isOutOfStock ? 'text-slate-400' : 'text-slate-900'}`}>{product.product}</h4>
                                                <p className={`text-2xl font-black tracking-tighter ${isOutOfStock ? 'text-slate-300' : 'text-lime-600'}`}>
                                                    ₱{Number(product.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>

                                            <div className="pt-4 mt-4">
                                                <button 
                                                    disabled={isOutOfStock}
                                                    onClick={() => openModal(product)} 
                                                    className={`w-full py-3 font-black text-[11px] uppercase tracking-widest italic transition-all duration-300 border-2 ${
                                                        isOutOfStock 
                                                        ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed' 
                                                        : 'bg-white border-slate-900 text-slate-900 hover:bg-lime-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none'
                                                    }`}
                                                >
                                                    {isOutOfStock ? 'Unavailable' : 'Quick View'}
                                                </button>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                );
                            })}
                        </Swiper>
                    ) : (
                        <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest border-2 border-dashed rounded-[3rem]">No products available.</div>
                    )}
                </div>
            </section>

            {/* QUICK VIEW MODAL WITH COMMENTS */}
            {isModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white max-w-5xl w-full grid md:grid-cols-2 relative shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500 h-full max-h-[90vh]">
                        {/* Close Button */}
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 z-10 bg-slate-950 text-white w-10 h-10 flex items-center justify-center font-black hover:bg-lime-500 transition-all">✕</button>
                        
                        {/* Left Side: Product Image */}
                        <div className="bg-slate-100 p-8 flex items-center justify-center border-r border-slate-100">
                            <img src={selectedProduct.image_url} className="w-full h-auto max-h-[450px] object-contain mix-blend-multiply" alt={selectedProduct.product} />
                        </div>

                        {/* Right Side: Details & Comments */}
                        <div className="p-8 md:p-12 flex flex-col overflow-hidden bg-white">
                            <div className="mb-6">
                                <span className="text-lime-600 font-black text-xs tracking-widest uppercase">{selectedProduct.category?.category}</span>
                                <h2 className="text-4xl font-black text-slate-900 uppercase italic leading-none mt-2">{selectedProduct.product}</h2>
                                <p className="text-3xl font-black text-slate-900 mt-4 italic border-l-4 border-lime-500 pl-4">₱{Number(selectedProduct.price).toLocaleString()}</p>
                            </div>

                            {/* FEEDBACK SECTION */}
                            <div className="flex-grow flex flex-col min-h-0">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 border-b pb-2 mb-4 flex justify-between">
                                    Product Feedback <span>{selectedProduct.ratings_count || 0} REVIEWS</span>
                                </h4>
                                
                                <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-4">
                                    {selectedProduct.ratings && selectedProduct.ratings.length > 0 ? (
                                        selectedProduct.ratings.map((rev) => (
                                            <div key={rev.id} className="bg-slate-50 p-4 border border-slate-100 rounded-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-slate-900 leading-none mb-1">
                                                            {rev.user?.first_name} {rev.user?.last_name || 'Verified Buyer'}
                                                        </p>
                                                        {renderStars(rev.stars)}
                                                    </div>
                                                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">
                                                        {new Date(rev.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-600 font-medium italic leading-relaxed">
                                                    "{rev.comment}"
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">No feedback yet for this product.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button onClick={() => setIsModalOpen(false)} className="mt-8 w-full bg-slate-950 text-white py-4 font-black uppercase tracking-widest hover:bg-lime-500 hover:text-slate-950 transition-all italic">
                                Continue Browsing
                            </button>
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