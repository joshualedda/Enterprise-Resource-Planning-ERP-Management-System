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
        { id: 1, name: 'Premium Hybrid Silkworm Eggs', category: 'Biologicals', price: '500', rating: 5.0, reviews: 124, image_urls: ['/img/barong.jpg'] },
        { id: 2, name: 'Certified Mulberry Saplings', category: 'Planting Material', price: '25', rating: 4.8, reviews: 89, image_urls: ['/img/3.jpg'] },
        { id: 3, name: 'Grade-A Raw Silk Cocoons', category: 'Raw Materials', price: '1,200', rating: 4.9, reviews: 56, image_urls: ['/img/4.jpg'] },
        { id: 4, name: 'Silk Extract (Sericin)', category: 'Cosmetic Grade', price: '3,500', rating: 4.7, reviews: 34, image_urls: ['/img/5.jpg'] },
        { id: 5, name: 'Traditional Pina-Silk Barong', category: 'Textiles', price: '8,500', rating: 5.0, reviews: 12, image_urls: ['/img/2.jpg'] },
    ];

    useEffect(() => {
        setProducts(dummyProducts);
    }, []);

    const renderStars = (rating) => {
        return (
            <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <svg 
                        key={i} 
                        className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}`} 
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans text-slate-950 antialiased selection:bg-lime-400 selection:text-slate-900">
            <Head title="D'SERICORE | Philippine Sericulture Hub" />

            {/* --- TOP UTILITY BAR --- */}
            <div className="bg-slate-950 py-2 text-[10px] font-bold text-white/60 border-b border-white/10 uppercase tracking-[0.2em]">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-lime-400 rounded-full animate-pulse"></span>
                        SERICULTURE RESEARCH AND DEVELOPMENT INSTITUTE - DMMMSU
                    </span>
                    <div className="hidden md:flex gap-8">
                        <span className="hover:text-lime-400 cursor-pointer transition">Research Access</span>
                        <span className="hover:text-lime-400 cursor-pointer transition">Market Reports</span>
                    </div>
                </div>
            </div>

            {/* --- MAIN NAVIGATION --- */}
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-[100] border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <Link href="/" className="flex items-center gap-3">
                            <ApplicationLogo className="h-8 w-auto text-lime-600" />
                            <span className="text-2xl font-black tracking-tighter text-slate-950">
                                D'SERI<span className="text-lime-500">CORE</span>
                            </span>
                        </Link>
                        
                        <div className="hidden lg:flex gap-8 text-[11px] font-black uppercase tracking-widest text-slate-500">
                            
                            {/* MENU ITEM: E-COMMERCE */}
                            <div className="group/mega static">
                                <Link href="#" className="hover:text-slate-950 transition-colors relative py-8 block">
                                    E-Commerce
                                    <span className="absolute bottom-6 left-0 w-0 h-0.5 bg-lime-500 transition-all group-hover/mega:w-full" />
                                </Link>
                                <div className="absolute left-0 top-20 w-full bg-white border-b border-slate-200 shadow-2xl opacity-0 invisible group-hover/mega:opacity-100 group-hover/mega:visible transition-all duration-300 transform translate-y-2 group-hover/mega:translate-y-0">
                                    <div className="max-w-7xl mx-auto grid grid-cols-4 gap-12 p-12">
                                        <div className="space-y-6">
                                            <h4 className="text-lime-600 font-black text-[10px] tracking-[0.3em]">BIOLOGICALS</h4>
                                            <ul className="space-y-4 text-slate-950 text-sm italic font-bold">
                                                <li className="hover:translate-x-2 transition-transform cursor-pointer">Hybrid Silkworm Eggs</li>
                                                <li className="hover:translate-x-2 transition-transform cursor-pointer">Parent Stock</li>
                                                <li className="hover:translate-x-2 transition-transform cursor-pointer">Mulberry Saplings</li>
                                            </ul>
                                        </div>
                                        <div className="space-y-6">
                                            <h4 className="text-lime-600 font-black text-[10px] tracking-[0.3em]">RAW MATERIALS</h4>
                                            <ul className="space-y-4 text-slate-950 text-sm italic font-bold">
                                                <li className="hover:translate-x-2 transition-transform cursor-pointer">Grade-A Cocoons</li>
                                                <li className="hover:translate-x-2 transition-transform cursor-pointer">Raw Silk Yarn</li>
                                                <li className="hover:translate-x-2 transition-transform cursor-pointer">Silk Waste</li>
                                            </ul>
                                        </div>
                                        <div className="space-y-6">
                                            <h4 className="text-lime-600 font-black text-[10px] tracking-[0.3em]">TEXTILES</h4>
                                            <ul className="space-y-4 text-slate-950 text-sm italic font-bold">
                                                <li className="hover:translate-x-2 transition-transform cursor-pointer">Pina-Silk Blends</li>
                                                <li className="hover:translate-x-2 transition-transform cursor-pointer">Handwoven Fabrics</li>
                                                <li className="hover:translate-x-2 transition-transform cursor-pointer">Apparel Collection</li>
                                            </ul>
                                        </div>
                                        <div className="bg-slate-50 p-8 border border-slate-100">
                                            <span className="text-lime-600 font-black text-[9px] tracking-widest block mb-2">PROMOTION</span>
                                            <p className="text-slate-900 font-bold italic mb-4">Wholesale bulk pricing available for verified weaving cooperatives.</p>
                                            <button className="text-[10px] font-black uppercase tracking-widest bg-slate-950 text-white px-4 py-2 hover:bg-lime-500 hover:text-slate-950 transition">Apply Now</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* MENU ITEM: SUPPLY CHAIN */}
                            <div className="group/mega static">
                                <Link href="#" className="hover:text-slate-950 transition-colors relative py-8 block">
                                    Supply Chain
                                    <span className="absolute bottom-6 left-0 w-0 h-0.5 bg-lime-500 transition-all group-hover/mega:w-full" />
                                </Link>
                                <div className="absolute left-0 top-20 w-full bg-white border-b border-slate-200 shadow-2xl opacity-0 invisible group-hover/mega:opacity-100 group-hover/mega:visible transition-all duration-300 transform translate-y-2 group-hover/mega:translate-y-0">
                                    <div className="max-w-7xl mx-auto grid grid-cols-3 gap-12 p-12">
                                        <div className="space-y-6">
                                            <h4 className="text-lime-600 font-black text-[10px] tracking-[0.3em]">LOGISTICS</h4>
                                            <ul className="space-y-4 text-slate-950 text-sm italic font-bold">
                                                <li className="hover:translate-x-2 transition-transform cursor-pointer">Cold-Chain Distribution</li>
                                                <li className="hover:translate-x-2 transition-transform cursor-pointer">Inventory Monitoring</li>
                                                <li className="hover:translate-x-2 transition-transform cursor-pointer">Regional Hubs</li>
                                            </ul>
                                        </div>
                                        <div className="space-y-6">
                                            <h4 className="text-lime-600 font-black text-[10px] tracking-[0.3em]">PRODUCTION</h4>
                                            <ul className="space-y-4 text-slate-950 text-sm italic font-bold">
                                                <li className="hover:translate-x-2 transition-transform cursor-pointer">Rearing Schedules</li>
                                                <li className="hover:translate-x-2 transition-transform cursor-pointer">Quality Control Protocols</li>
                                                <li className="hover:translate-x-2 transition-transform cursor-pointer">Farmer Integration</li>
                                            </ul>
                                        </div>
                                        <div className="bg-lime-50 p-8 border border-lime-100">
                                            <h5 className="text-slate-950 font-black text-xl italic leading-tight mb-2">REAL-TIME MONITORING</h5>
                                            <p className="text-slate-600 text-xs font-medium mb-4">Track biological assets from egg to fiber across all 17 regions.</p>
                                            <div className="flex gap-2">
                                                <span className="w-2 h-2 bg-lime-500 rounded-full animate-pulse"></span>
                                                <span className="text-[10px] font-black uppercase">Live System Status</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* MENU ITEM: TRACEABILITY */}
                            <div className="group/mega static">
                                <Link href="#" className="hover:text-slate-950 transition-colors relative py-8 block">
                                    Traceability
                                    <span className="absolute bottom-6 left-0 w-0 h-0.5 bg-lime-500 transition-all group-hover/mega:w-full" />
                                </Link>
                                <div className="absolute left-0 top-20 w-full bg-white border-b border-slate-200 shadow-2xl opacity-0 invisible group-hover/mega:opacity-100 group-hover/mega:visible transition-all duration-300 transform translate-y-2 group-hover/mega:translate-y-0">
                                    <div className="max-w-7xl mx-auto grid grid-cols-4 gap-12 p-12">
                                        <div className="col-span-2 space-y-6 border-r border-slate-100 pr-12">
                                            <h4 className="text-lime-600 font-black text-[10px] tracking-[0.3em]">BLOCKCHAIN VERIFICATION</h4>
                                            <p className="text-slate-500 text-sm font-medium">Verify the authenticity of your silk products through our decentralized ledger system.</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-slate-50 border border-slate-200 hover:border-lime-400 cursor-pointer transition">
                                                    <span className="text-[10px] font-black">SCAN QR CODE</span>
                                                </div>
                                                <div className="p-4 bg-slate-50 border border-slate-200 hover:border-lime-400 cursor-pointer transition">
                                                    <span className="text-[10px] font-black">ORIGIN SEARCH</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <h4 className="text-lime-600 font-black text-[10px] tracking-[0.3em]">CERTIFICATIONS</h4>
                                            <ul className="space-y-4 text-slate-950 text-sm italic font-bold">
                                                <li className="hover:text-lime-600 transition cursor-pointer">SRDI Certified</li>
                                                <li className="hover:text-lime-600 transition cursor-pointer">Organic Fiber Label</li>
                                                <li className="hover:text-lime-600 transition cursor-pointer">Fair Trade PH</li>
                                            </ul>
                                        </div>
                                        <div className="space-y-6">
                                            <h4 className="text-lime-600 font-black text-[10px] tracking-[0.3em]">IMPACT</h4>
                                            <ul className="space-y-4 text-slate-950 text-sm italic font-bold">
                                                <li className="hover:text-lime-600 transition cursor-pointer">Farmer Earnings</li>
                                                <li className="hover:text-lime-600 transition cursor-pointer">Carbon Footprint</li>
                                                <li className="hover:text-lime-600 transition cursor-pointer">Community Data</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* MENU ITEM: RESOURCES */}
                            <div className="group/mega static">
                                <Link href="#" className="hover:text-slate-950 transition-colors relative py-8 block">
                                    Resources
                                    <span className="absolute bottom-6 left-0 w-0 h-0.5 bg-lime-500 transition-all group-hover/mega:w-full" />
                                </Link>
                                <div className="absolute left-0 top-20 w-full bg-white border-b border-slate-200 shadow-2xl opacity-0 invisible group-hover/mega:opacity-100 group-hover/mega:visible transition-all duration-300 transform translate-y-2 group-hover/mega:translate-y-0">
                                    <div className="max-w-7xl mx-auto grid grid-cols-4 gap-12 p-12">
                                        <div className="space-y-6">
                                            <h4 className="text-lime-600 font-black text-[10px] tracking-[0.3em]">KNOWLEDGE BASE</h4>
                                            <ul className="space-y-4 text-slate-950 text-sm italic font-bold">
                                                <li className="cursor-pointer">Silkworm Pathology</li>
                                                <li className="cursor-pointer">Reeling Techniques</li>
                                                <li className="cursor-pointer">Mulberry Cultivation</li>
                                            </ul>
                                        </div>
                                        <div className="space-y-6">
                                            <h4 className="text-lime-600 font-black text-[10px] tracking-[0.3em]">MARKET DATA</h4>
                                            <ul className="space-y-4 text-slate-950 text-sm italic font-bold">
                                                <li className="cursor-pointer">Price Indices</li>
                                                <li className="cursor-pointer">Export Statistics</li>
                                                <li className="cursor-pointer">Industry Whitepapers</li>
                                            </ul>
                                        </div>
                                        <div className="col-span-2 relative h-48 overflow-hidden bg-slate-900 group/img">
                                            <img src="/img/3.jpg" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/img:scale-110 transition-transform duration-700" />
                                            <div className="absolute inset-0 flex flex-col justify-end p-6">
                                                <h5 className="text-white text-xl font-black italic uppercase">Training Seminars 2026</h5>
                                                <p className="text-lime-400 text-[10px] font-black tracking-widest uppercase">Register for SRDI workshops</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <Link href={route('login')} className="text-xs font-bold uppercase tracking-widest hover:text-lime-600 transition">Log In</Link>
                        <Link href="#" className="bg-slate-950 text-white px-6 py-3 text-[11px] font-black uppercase tracking-[0.15em] hover:bg-lime-500 hover:text-slate-950 transition-all duration-300">
                            Enterprise Access
                        </Link>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <header className="relative h-[85vh] bg-slate-950 overflow-hidden">
                <Swiper
                    modules={[Autoplay, Pagination, EffectFade]}
                    effect="fade"
                    autoplay={{ delay: 7000 }}
                    pagination={{ clickable: true }}
                    className="h-full w-full"
                >
                    <SwiperSlide>
                        <div className="relative h-full w-full flex items-center">
                            <img src="/img/6.jpg" className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105 animate-[subtle-zoom_20s_infinite]" />
                            <div className="absolute inset-0 from-slate-950 via-slate-950/60 to-transparent" />
                            <div className="max-w-7xl mx-auto px-6 relative z-10">
                                <div className="space-y-4">
                                    <span className="inline-block text-lime-400 text-xs font-black uppercase tracking-[0.5em] border-l-4 border-lime-400 pl-4">Premium Fiber Sourcing</span>
                                    <h1 className="text-7xl lg:text-9xl font-black text-white leading-[0.85] tracking-tighter">
                                        PURE <br/> PHILIPPINE <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-400">SILK.</span>
                                    </h1>
                                    <p className="text-lg text-slate-300 max-w-lg font-medium leading-relaxed pb-8">
                                        Empowering the local textile ecosystem through scientific excellence and integrated supply chain logistics.
                                    </p>
                                    <button className="group relative bg-lime-400 text-slate-950 px-12 py-5 font-black uppercase tracking-widest overflow-hidden transition-all">
                                        <span className="relative z-10">Explore Catalog</span>
                                        <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                </Swiper>
            </header>

{/* --- PRODUCT SHOWCASE --- */}
            <section className="py-32 bg-[#FAFAFA]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16">
                        <div className="space-y-2">
                            <h2 className="text-xs font-black text-lime-600 uppercase tracking-[0.4em]">Official Inventory</h2>
                            <h3 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase">The Collection</h3>
                        </div>
                        <Link href="#" className="text-xs font-black uppercase tracking-widest border-b-2 border-slate-950 pb-1 hover:text-lime-600 hover:border-lime-600 transition-all">View All Products</Link>
                    </div>

                    <Swiper
                        modules={[Autoplay, Pagination, Navigation]}
                        spaceBetween={30}
                        slidesPerView={1}
                        navigation={true}
                        loop={true} 
                        autoplay={{
                            delay: 2500,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        speed={1000}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            1024: { slidesPerView: 4 },
                        }}
                        className="product-swiper"
                    >
                        {products.map(product => (
                            <SwiperSlide key={product.id}>
                                <div className="group bg-white border border-slate-200 p-4 hover:border-lime-400 transition-all duration-500 relative h-full">
                                    <div className="aspect-[4/5] mb-6 overflow-hidden bg-slate-50 relative">
                                        <img 
                                            src={product.image_urls[0]} 
                                            className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-700" 
                                            onError={(e) => { e.target.src = 'https://placehold.co/600x800/f8fafc/0f172a?text=Silk+Asset'; }}
                                        />

                                        <div className="absolute bottom-4 left-4">
                                            <span className="bg-slate-950 text-white text-[9px] font-black px-3 py-1 uppercase tracking-widest">
                                                {product.category}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            {renderStars(product.rating)}
                                            <span className="text-[11px] font-black text-slate-900">{product.rating}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                | {product.reviews} Verified Reviews
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-start">
                                            <h4 className="font-black text-lg text-slate-900 leading-tight h-14 line-clamp-2 w-full uppercase tracking-tight italic">
                                                {product.name}
                                            </h4>
                                        </div>
                                        
                                        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                            <p className="font-black text-xl text-slate-950 tracking-tighter italic">₱{product.price}</p>
                                            <button className="w-10 h-10 bg-slate-950 text-white flex items-center justify-center hover:bg-lime-500 hover:text-slate-950 transition-all duration-300">
                                                <span className="text-lg font-bold">+</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </section>

            {/* --- FOOTER --- (Rest of your footer code stays the same) */}
            <footer className="bg-slate-950 text-white pt-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 pb-20 border-b border-white/10">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <ApplicationLogo className="h-8 w-auto text-lime-400" />
                                <span className="text-xl font-black tracking-tighter">D'SERI<span className="text-lime-400">CORE</span></span>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                The official digital infrastructure for the Philippine Sericulture industry. Connecting farmers, researchers, and global markets.
                            </p>
                        </div>
                        
                        {['Solutions', 'Ecosystem', 'Support'].map((title, idx) => (
                            <div key={idx} className="space-y-6">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-lime-400">{title}</h4>
                                <ul className="space-y-4 text-sm text-slate-400 font-medium">
                                    <li className="hover:text-white transition cursor-pointer">Sourcing Engine</li>
                                    <li className="hover:text-white transition cursor-pointer">Logistics Tracking</li>
                                    <li className="hover:text-white transition cursor-pointer">Farmer Portal</li>
                                    <li className="hover:text-white transition cursor-pointer">Contact Desk</li>
                                </ul>
                            </div>
                        ))}
                    </div>
                    
                    <div className="py-12 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            © 2026 SRDI - DMMMSU. Sericulture Research and Development Institute.
                        </p>
                        <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <span className="hover:text-white cursor-pointer transition">Privacy Policy</span>
                            <span className="hover:text-white cursor-pointer transition">Terms of Trade</span>
                        </div>
                    </div>
                </div>
            </footer>

            <style jsx global>{`
                @keyframes subtle-zoom {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.1); }
                }
                .product-swiper {
                    padding-bottom: 80px !important;
                }
                .product-swiper .swiper-button-next, 
                .product-swiper .swiper-button-prev {
                    color: white !important;
                    background: #0f172a !important;
                    width: 50px !important;
                    height: 50px !important;
                    top: auto !important;
                    bottom: 0 !important;
                }
                .product-swiper .swiper-button-prev { right: 60px !important; left: auto !important; }
                .product-swiper .swiper-button-next { right: 0 !important; }
                .product-swiper .swiper-button-next:after, 
                .product-swiper .swiper-button-prev:after {
                    font-size: 14px !important;
                    font-weight: 900 !important;
                }
                .swiper-pagination-bullet-active {
                    background: #a3e635 !important;
                }
            `}</style>
        </div>
    );
}