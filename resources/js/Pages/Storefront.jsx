import React, { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

export default function Storefront({ auth }) {
    const [products, setProducts] = useState([]);

    const dummyProducts = [
        { id: 1, name: 'Premium Hybrid Silkworm Eggs', category: 'High-Yield Biologicals', price: '500', image_urls: ['https://images.unsplash.com/photo-1626078436897-095208993457?q=80&w=500'] },
        { id: 2, name: 'Certified Mulberry Saplings', category: 'Superior Planting Material', price: '25', image_urls: ['https://images.unsplash.com/photo-1592150621344-82454a99d7b4?q=80&w=500'] },
        { id: 3, name: 'Grade-A Raw Silk Cocoons', category: 'Raw Materials', price: '1,200', image_urls: ['https://images.unsplash.com/photo-1615485244910-14920b080562?q=80&w=500'] },
        { id: 4, name: 'Silk Extract (Sericin)', category: 'Cosmetic Grade', price: '3,500', image_urls: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=500'] },
    ];

    useEffect(() => {
        setProducts(dummyProducts);
    }, []);

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-slate-800">
            <Head title="D'SERICORE | Premium Sericulture Marketplace & ERP" />

            {/* --- TOP UTILITY BAR --- */}
            <div className="bg-slate-900 py-2 text-[11px] font-bold text-slate-300">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <span>Elevating the Philippine Silk Industry 🇵🇭</span>
                    <div className="flex gap-6 uppercase tracking-wider">
                        <span className="cursor-pointer hover:text-white">Partner Program</span>
                        <span className="cursor-pointer hover:text-white">Wholesale Inquiry</span>
                    </div>
                </div>
            </div>

            {/* --- MAIN NAVIGATION --- */}
            <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-[100] border-b border-slate-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <Link href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                            <ApplicationLogo className="h-10 w-auto text-indigo-700" />
                            <span className="text-2xl font-black tracking-tighter text-slate-900 underline decoration-indigo-500/30">D'SERICORE</span>
                        </Link>
                        <div className="hidden lg:flex gap-8 text-[14px] font-bold text-slate-600">
                            <Link href="#" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition">Shop Products</Link>
                            <Link href="#" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition">Supply Chain</Link>
                            <Link href="#" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition">R&D Hub</Link>
                            <Link href="#" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition">Sustainability</Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href={route('login')} target="_blank" rel="noopener noreferrer" className="hidden sm:block text-sm font-bold text-slate-600 hover:text-indigo-600">Merchant Login</Link>
                        <Link href="#" target="_blank" rel="noopener noreferrer" className="bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200 transition-all active:scale-95">
                            Collaborate With Us
                        </Link>
                    </div>
                </div>
            </nav>

            {/* --- HERO SLIDER (Marketing Focus) --- */}
            <header className="relative h-[600px] lg:h-[750px] bg-slate-900">
                <Swiper
                    modules={[Autoplay, Pagination, EffectFade]}
                    effect="fade"
                    autoplay={{ delay: 5000 }}
                    pagination={{ clickable: true }}
                    className="h-full w-full"
                >
                    <SwiperSlide>
                        <div className="relative h-full w-full flex items-center">
                            <img src="https://images.unsplash.com/photo-1528460033278-a6ba57020470?q=80&w=1920" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                            <div className="max-w-7xl mx-auto px-6 relative z-10 text-white">
                                <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-none">The Gold Standard <br/><span className="text-indigo-400">of Philippine Silk.</span></h1>
                                <p className="text-xl text-slate-200 mb-10 max-w-2xl leading-relaxed">From lab-certified silkworm eggs to luxury-grade cocoons—access the most reliable sericulture supply chain in Southeast Asia.</p>
                                <div className="flex gap-4">
                                    <button className="bg-[#ff6b00] hover:bg-[#e66000] text-white px-10 py-5 rounded-sm font-black text-lg transition shadow-2xl">Browse the Catalog</button>
                                    <button className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white px-10 py-5 rounded-sm font-black text-lg transition">Become a Supplier</button>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                </Swiper>
            </header>

            {/* --- CLIENT/PARTNER LOGOS (Builds Trust) --- */}
            <div className="py-12 bg-slate-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Trusted by Leading Textile Producers & Research Institutions</p>
                    <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale">
                        <span className="text-xl font-bold">DMMMSU</span>
                        <span className="text-xl font-bold">DOST-PTRI</span>
                        <span className="text-xl font-bold">DA-PHILIPPINES</span>
                        <span className="text-xl font-bold">SILK-TECH CO.</span>
                    </div>
                </div>
            </div>

            {/* --- FEATURED PRODUCT SHOWCASE --- */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div className="max-w-xl">
                            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Direct from the Institute.</h2>
                            <p className="text-slate-500 text-lg">Every purchase supports local farmers and funds silkworm research. Get guaranteed quality directly from the SRDI facility.</p>
                        </div>
                        <div className="flex gap-2">
                             <button className="px-6 py-2 border-2 border-slate-900 font-bold text-sm hover:bg-slate-900 hover:text-white transition">Filter by Category</button>
                             <Link href="#" target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-slate-100 font-bold text-sm text-slate-600 hover:bg-indigo-600 hover:text-white transition">View All 50+ Items</Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {dummyProducts.map(product => (
                            <div key={product.id} className="group relative">
                                <div className="aspect-[4/5] mb-6 overflow-hidden bg-slate-100 rounded-2xl relative">
                                    <img src={product.image_urls[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button className="bg-white text-slate-900 p-3 rounded-full font-bold text-xs transform translate-y-4 group-hover:translate-y-0 transition-transform">Quick View</button>
                                        <button className="bg-indigo-600 text-white p-3 rounded-full font-bold text-xs transform translate-y-4 group-hover:translate-y-0 transition-transform delay-75">Order Now</button>
                                    </div>
                                </div>
                                <span className="text-indigo-600 font-black text-[10px] uppercase tracking-widest">{product.category}</span>
                                <h3 className="font-bold text-xl text-slate-900 mt-1 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                                <div className="flex items-baseline gap-2 mt-2">
                                    <span className="text-sm text-slate-400">Starting at</span>
                                    <span className="font-black text-2xl text-slate-900">₱{product.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- COLLABORATION CTA --- */}
            <section className="py-24 bg-indigo-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-500/20 blur-3xl rounded-full translate-x-1/2" />
                <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="text-white">
                        <h2 className="text-4xl lg:text-5xl font-black mb-8 leading-tight">Scale Your Silk Production <br/>With Our Technology.</h2>
                        <ul className="space-y-4 mb-10">
                            {['Bulk Pricing for Industrial Clients', 'Dedicated R&D Support', 'Traceable Supply Chain Data', 'Logistics & Onsite Pickup'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 font-bold text-indigo-200">
                                    <span className="bg-indigo-500 text-white rounded-full p-1 text-[10px]">✓</span> {item}
                                </li>
                            ))}
                        </ul>
                        <button className="bg-[#ff6b00] text-white px-12 py-5 rounded-full font-black text-lg shadow-xl hover:scale-105 transition">
                            Inquire for Partnership
                        </button>
                    </div>
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-lg">
                        <h4 className="text-2xl font-bold text-white mb-6">Contact a Consultant</h4>
                        <form className="space-y-4">
                            <input type="text" placeholder="Full Name" className="w-full bg-white/10 border-white/20 rounded-lg p-4 text-white placeholder:text-slate-400" />
                            <input type="email" placeholder="Business Email" className="w-full bg-white/10 border-white/20 rounded-lg p-4 text-white placeholder:text-slate-400" />
                            <textarea placeholder="How can we collaborate?" className="w-full bg-white/10 border-white/20 rounded-lg p-4 text-white h-32"></textarea>
                            <button className="w-full bg-white text-indigo-900 py-4 rounded-lg font-black uppercase tracking-widest text-sm">Send Inquiry</button>
                        </form>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-white border-t border-slate-100 py-20">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-5 gap-12">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <ApplicationLogo className="h-8 w-auto text-indigo-700" />
                            <span className="text-xl font-black tracking-tighter">D'SERICORE</span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-sm">
                            The premier integrated platform for the Philippine Sericulture Industry. Bridging the gap between scientific research and commercial silk production.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-black text-xs uppercase tracking-widest mb-6">Marketplace</h4>
                        <ul className="text-sm space-y-3 text-slate-500 font-medium">
                            <li><a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">All Products</a></li>
                            <li><a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">Wholesale</a></li>
                            <li><a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">Ordering Guide</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black text-xs uppercase tracking-widest mb-6">Institution</h4>
                        <ul className="text-sm space-y-3 text-slate-500 font-medium">
                            <li><a href="https://www.dmmmsu.edu.ph/sericulture-research-and-development-institute/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">About SRDI</a></li>
                            <li><a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">DMMMSU</a></li>
                            <li><a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">Research Portal</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black text-xs uppercase tracking-widest mb-6">Legal</h4>
                        <ul className="text-sm space-y-3 text-slate-500 font-medium">
                            <li><a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">Trade Terms</a></li>
                            <li><a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
}