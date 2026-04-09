import React, { useState, useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Search, Filter, ChevronDown, X, ShoppingCart, Eye } from 'lucide-react';

export default function AllProduct({ auth, products = [], categories = [] }) {
    // --- State ---
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('latest');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTab, setModalTab] = useState('description');

    // --- Cart Logic ---
    const { post, processing } = useForm({
        product_id: '',
        quantity: 1,
    });

    const openModal = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
        setModalTab('description');
    };

    const addToCart = (product, qty = 1) => {
        if (!auth.user) {
            window.location.href = route('login') + '?redirect=' + window.location.pathname;
            return;
        }

        post(route('customer.cart.add', {
            product_id: product.id,
            quantity: qty
        }), {
            preserveScroll: true,
            onSuccess: () => {
                setIsModalOpen(false);
            },
        });
    };

    // --- Filtering & Sorting Logic (Client-side) ---
    const filteredAndSortedProducts = useMemo(() => {
        let result = [...products];

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p => 
                p.product.toLowerCase().includes(q) || 
                p.description?.toLowerCase().includes(q)
            );
        }

        // Category
        if (selectedCategory !== 'all') {
            result = result.filter(p => p.category_id.toString() === selectedCategory.toString());
        }

        // Price Range
        if (minPrice) {
            result = result.filter(p => Number(p.price) >= Number(minPrice));
        }
        if (maxPrice) {
            result = result.filter(p => Number(p.price) <= Number(maxPrice));
        }

        // Sorting
        switch (sortBy) {
            case 'price_asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'top_sales':
                result.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
                break;
            case 'latest':
            default:
                result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
        }

        return result;
    }, [products, searchQuery, selectedCategory, sortBy, minPrice, maxPrice]);

    // --- Helpers ---
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

    const getDashboardRoute = () => {
        if (!auth.user) return route('login');
        const role_id = auth.user.role_id;
        const access_id = auth.user.access_id;
        
        if (role_id === 1) return route('admin.dashboard');
        if (role_id === 3) return route('customer.dashboard');
        
        if (role_id === 2) {
            if (access_id === 1) return route('staff.inventory.dashboard');
            if (access_id === 2) return route('staff.production.dashboard');
            if (access_id === 3) return route('staff.accounting.dashboard');
            if (access_id === 4) return route('staff.cashier.dashboard');
            if (access_id === 5) return route('staff.marketing-sales.dashboard');
            return route('staff.production.dashboard');
        }
        
        return route('login');
    };

    return (
        <div className="min-h-screen bg-[#F7F9FB] flex flex-col font-sans text-[#1F2937] antialiased">
            <Head title="Marketplace | D'SERICORE" />

            {/* --- TOP BAR --- */}
            <div className="bg-[#0B1F3B] py-2.5 text-[10px] font-semibold text-white/60 tracking-[0.15em] uppercase text-center md:text-left">
                <div className="max-w-7xl mx-auto px-6">
                    SRDI — SERICULTURE RESEARCH AND DEVELOPMENT INSTITUTE, DMMMSU
                </div>
            </div>

            {/* --- NAVBAR --- */}
            <nav className="bg-white sticky top-0 z-[100] shadow-sm border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center gap-3">
                            <ApplicationLogo className="h-9 w-auto" />
                            <span className="text-xl font-extrabold tracking-tight text-[#0B1F3B]">
                                D'SERI<span className="text-[#3BAA35]">CORE</span>
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-5">
                        {auth.user ? (
                            <Link href={getDashboardRoute()} className="bg-[#3BAA35] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-[#329a2d] transition-all">
                                Go to Dashboard
                            </Link>
                        ) : (
                            <Link href={route('login')} className="text-sm font-semibold text-slate-600 hover:text-[#0B1F3B] transition-colors">
                                Log In
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* --- SEARCH & CONTROL BAR --- */}
            <div className="bg-white border-b border-slate-100 sticky top-[72px] z-[90]">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative w-full md:max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input 
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-[#3BAA35] focus:ring-0 transition-all"
                            />
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="flex-1 md:flex-none relative">
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full md:w-48 pl-4 pr-10 py-3 bg-slate-50 border-transparent rounded-xl text-sm font-bold appearance-none cursor-pointer focus:ring-0"
                                >
                                    <option value="latest">Recently Added</option>
                                    <option value="top_sales">Best Sellers</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-[50%] -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>

                            <button 
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${isFilterOpen ? 'bg-[#0B1F3B] text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                            >
                                <Filter size={16} /> Categories
                            </button>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    {isFilterOpen && (
                        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
                            {/* Categories */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">By Category</h4>
                                <div className="flex flex-wrap gap-2">
                                    <button 
                                        onClick={() => setSelectedCategory('all')}
                                        className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${selectedCategory === 'all' ? 'bg-[#3BAA35] text-white shadow-lg shadow-[#3BAA35]/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                    >
                                        All Products
                                    </button>
                                    {categories.map(cat => (
                                        <button 
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${selectedCategory === cat.id ? 'bg-[#3BAA35] text-white shadow-lg shadow-[#3BAA35]/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                        >
                                            {cat.category}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range & Reset */}
                            <div className="flex flex-col md:flex-row items-end gap-6">
                                <div className="flex-1 w-full">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Price Range (₱)</h4>
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-1">
                                            <input 
                                                type="number" 
                                                placeholder="Min"
                                                value={minPrice}
                                                onChange={(e) => setMinPrice(e.target.value)}
                                                className="w-full pl-4 pr-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-[#3BAA35] focus:ring-0 transition-all shadow-inner"
                                            />
                                        </div>
                                        <span className="text-slate-300 font-bold">—</span>
                                        <div className="relative flex-1">
                                            <input 
                                                type="number" 
                                                placeholder="Max"
                                                value={maxPrice}
                                                onChange={(e) => setMaxPrice(e.target.value)}
                                                className="w-full pl-4 pr-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-[#3BAA35] focus:ring-0 transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        setSelectedCategory('all');
                                        setMinPrice('');
                                        setMaxPrice('');
                                        setSearchQuery('');
                                    }}
                                    className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center gap-2"
                                >
                                    <X size={14} /> Reset Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- PRODUCTS GRID --- */}
            <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full">
                {filteredAndSortedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredAndSortedProducts.map(product => {
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
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                            {renderStars(avgRating)}
                                            <span className="text-xs font-semibold text-slate-600">{avgRating}</span>
                                            <span className="text-[10px] text-slate-400">({product.ratings_count || 0})</span>
                                        </div>

                                        <h4 className={`font-semibold text-sm leading-snug mb-1 line-clamp-2 ${isOutOfStock ? 'text-slate-400' : 'text-slate-800'}`}>
                                            {product.product}
                                        </h4>

                                        <p className={`text-lg font-bold tracking-tight mt-auto ${isOutOfStock ? 'text-gray-300' : 'text-green-600'}`}>
                                            ₱{Number(product.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>

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
                    <div className="text-center py-32 bg-white rounded-2xl border border-dashed border-slate-200">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Search size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">No products found</h3>
                        <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search terms.</p>
                        <button 
                            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                            className="mt-6 text-[#3BAA35] font-bold text-sm hover:underline"
                        >
                            Reset all filters
                        </button>
                    </div>
                )}
            </main>

            {/* --- QUICK VIEW MODAL --- */}
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
                                            id="qty-input"
                                            min="1"
                                            defaultValue={1}
                                            className="w-20 text-center border border-gray-200 rounded-lg py-2.5 text-sm font-semibold focus:border-[#0B1F3B] focus:ring-1 focus:ring-[#0B1F3B] outline-none"
                                        />
                                        <button
                                            disabled={selectedProduct.stock_count <= 0 || processing}
                                            onClick={() => {
                                                const val = parseInt(document.getElementById('qty-input')?.value || 1);
                                                addToCart(selectedProduct, val);
                                            }}
                                            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                                                selectedProduct.stock_count > 0
                                                    ? 'bg-[#0B1F3B] text-white hover:bg-[#0f2c54] active:scale-95'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            {selectedProduct.stock_count > 0 ? (processing ? 'Adding...' : 'Add to Cart') : 'Unavailable'}
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

            {/* --- FOOTER --- */}
            <footer className="bg-[#0B1F3B] text-white pt-16 pb-8 mt-auto">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-sm text-slate-400">© 2026 SRDI — Don Mariano Marcos Memorial State University. All reserved.</p>
                </div>
            </footer>
        </div>
    );
}
