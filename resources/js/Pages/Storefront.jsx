import React, { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export default function Storefront({ auth }) {
    const [products, setProducts] = useState([]);

    const dummyProducts = [
        { id: 1, name: 'Premium Hybrid Silkworm Eggs', category: 'Biologicals', price: '500', image_urls: ['https://images.unsplash.com/photo-1626078436897-095208993457?q=80&w=500'] },
        { id: 2, name: 'Certified Mulberry Saplings', category: 'Planting Material', price: '25', image_urls: ['https://images.unsplash.com/photo-1592150621344-82454a99d7b4?q=80&w=500'] },
        { id: 3, name: 'Grade-A Raw Silk Cocoons', category: 'Raw Materials', price: '1,200', image_urls: ['https://images.unsplash.com/photo-1615485244910-14920b080562?q=80&w=500'] },
        { id: 4, name: 'Silk Extract (Sericin)', category: 'Cosmetic Grade', price: '3,500', image_urls: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=500'] },
    ];

    useEffect(() => {
        setProducts(dummyProducts);
    }, []);

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans text-slate-950 antialiased">
            <Head title="D'SERICORE | Philippine Sericulture ERP" />

            {/* --- TOP UTILITY BAR --- */}
            <div className="bg-slate-950 py-2.5 text-[10px] sm:text-xs font-bold text-lime-400 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center tracking-widest uppercase">
                    <span>National Sericulture Research and Development Institute</span>
                    <div className="flex gap-6">
                        <span className="cursor-pointer hover:text-white transition">Partner Program</span>
                        <span className="hidden md:block cursor-pointer hover:text-white transition">Wholesale Support</span>
                    </div>
                </div>
            </div>

            {/* --- MAIN NAVIGATION --- */}
            <nav className="bg-white/90 backdrop-blur-xl sticky top-0 z-[100] border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center gap-2.5">
                            <ApplicationLogo className="h-9 w-auto text-lime-500" />
                            <span className="text-xl font-black tracking-tighter text-slate-950">D'SERI<span className="bg-lime-400 px-1 ml-0.5">CORE</span></span>
                        </Link>
                        <div className="hidden lg:flex gap-8 text-[13px] font-black uppercase tracking-tight text-slate-600">
                            {['Shop', 'Supply Chain', 'R&D Hub', 'Sustainability'].map((item) => (
                                <Link key={item} href="#" className="hover:text-slate-950 transition-colors relative group">
                                    {item}
                                    <span className="absolute -bottom-1 left-0 w-0 h-1 bg-lime-400 transition-all group-hover:w-full" />
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-5">
                        <Link href={route('login')} className="hidden sm:block text-[13px] font-black text-slate-600 hover:text-slate-950 uppercase tracking-widest">Login</Link>
                        <Link href="#" className="bg-lime-400 hover:bg-lime-500 text-slate-950 px-6 py-2.5 rounded-sm text-[12px] font-black uppercase tracking-widest transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none">
                            Join Network
                        </Link>
                    </div>
                </div>
            </nav>

            {/* --- HERO SLIDER --- */}
            <header className="relative h-[600px] lg:h-[750px] bg-slate-950">
                <Swiper
                    modules={[Autoplay, Pagination, EffectFade]}
                    effect="fade"
                    autoplay={{ delay: 6000 }}
                    pagination={{ clickable: true }}
                    className="h-full w-full custom-swiper"
                >
                    <SwiperSlide>
                        <div className="relative h-full w-full flex items-center">
                            <img src="https://images.unsplash.com/photo-1528460033278-a6ba57020470?q=80&w=1920" className="absolute inset-0 w-full h-full object-cover opacity-70" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent lg:bg-gradient-to-r lg:from-slate-950 lg:via-slate-950/40 lg:to-transparent" />
                            <div className="max-w-7xl mx-auto px-6 relative z-10 text-white">
                                <span className="inline-block px-4 py-1 bg-lime-400 text-slate-950 text-[10px] font-black uppercase tracking-[0.3em] mb-6">SRDI Certified Materials</span>
                                <h1 className="text-6xl lg:text-8xl font-black mb-6 leading-[0.9] tracking-tighter">THE GOLD <br/><span className="text-lime-400">STANDARD.</span></h1>
                                <p className="text-xl text-slate-200 mb-10 max-w-xl leading-relaxed font-medium border-l-2 border-lime-400 pl-6">
                                    Powering the Philippine silk industry with lab-tested silkworm eggs and high-grade mulberry saplings.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <button className="bg-lime-400 hover:bg-white text-slate-950 px-10 py-4 font-black uppercase tracking-widest transition-colors">Start Sourcing</button>
                                    <button className="bg-transparent border-2 border-white hover:bg-white hover:text-slate-950 text-white px-10 py-4 font-black uppercase tracking-widest transition-all">Research Hub</button>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                </Swiper>
            </header>

            {/* --- PRODUCT SHOWCASE --- */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
                        <div className="max-w-xl">
                            <h2 className="text-5xl font-black text-slate-950 mb-4 tracking-tighter uppercase italic">Inventory</h2>
                            <p className="text-slate-600 font-bold text-lg">Direct supply from the Institute. Quality guaranteed for commercial scaling.</p>
                        </div>
                        <div className="flex gap-4">
                             <button className="px-6 py-3 border-2 border-slate-950 font-black text-[11px] uppercase tracking-widest hover:bg-lime-400 transition-colors">Filters</button>
                             <Link href="#" className="px-6 py-3 bg-slate-950 text-white font-black text-[11px] uppercase tracking-widest hover:bg-lime-400 hover:text-slate-950 transition-colors">Full Catalog</Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                        {products.map(product => (
                            <div key={product.id} className="group cursor-pointer">
                                <div className="aspect-square mb-6 overflow-hidden bg-slate-100 relative shadow-[8px_8px_0px_0px_rgba(163,230,53,0.3)] group-hover:shadow-[8px_8px_0px_0px_rgba(163,230,53,1)] transition-all">
                                    <img src={product.image_urls[0]} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                    <div className="absolute top-4 right-4 bg-white px-2 py-1 text-[10px] font-black uppercase tracking-tighter border border-slate-950">In Stock</div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">{product.category}</span>
                                    <h3 className="font-black text-xl text-slate-950 group-hover:underline decoration-lime-400 decoration-4 leading-tight">{product.name}</h3>
                                    <p className="font-black text-2xl text-slate-950 pt-2 italic">₱{product.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- UNIQUE FOOTER --- */}
            <footer className="bg-slate-950 text-white pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-8">
                            <ApplicationLogo className="h-8 w-auto text-lime-400" />
                            <span className="text-2xl font-black tracking-tighter">D'SERI<span className="text-lime-400">CORE</span></span>
                        </div>
                        <p className="text-slate-400 text-sm font-bold leading-relaxed">
                            Driving the silk industrialization of the Philippines through data-driven ERP solutions.
                        </p>
                    </div>
                    
                    {/* Unique Links Start Here */}
                    <div>
                        <h4 className="font-black text-lime-400 text-xs mb-8 uppercase tracking-[0.3em]">Marketplace</h4>
                        <ul className="space-y-4 text-sm font-bold text-slate-300">
                            <li><a href="#" className="hover:text-white transition">Product Catalog</a></li>
                            <li><a href="#" className="hover:text-white transition">Wholesale Pricing</a></li>
                            {/* <li><a href="#" className="hover:text-white transition">Shipping Policy</a></li> */}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black text-lime-400 text-xs mb-8 uppercase tracking-[0.3em]">Institution</h4>
                        <ul className="space-y-4 text-sm font-bold text-slate-300">
                            <li><a href="https://www.dmmmsu.edu.ph/sericulture-research-and-development-institute/" target="_blank" className="hover:text-white transition">About SRDI</a></li>
                            <li><a href="https://www.dmmmsu.edu.ph/" target="_blank" className="hover:text-white transition">DMMMSU Main</a></li>
                            {/* <li><a href="#" className="hover:text-white transition">Research Portal</a></li> */}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black text-lime-400 text-xs mb-8 uppercase tracking-[0.3em]">Contact Us</h4>
                        <ul className="space-y-4 text-sm font-bold text-slate-300">
                            <li><a href="#" className="hover:text-white transition">Email</a></li>
                            <li><a href="#" className="hover:text-white transition">Facebook</a></li>
                            {/* <li><a href="#" className="hover:text-white transition">Privacy Terms</a></li> */}
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-900 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">© 2026 SRDI - DMMMSU. Designed for Industry.</p>
                </div>
            </footer>
        </div>
    );
}