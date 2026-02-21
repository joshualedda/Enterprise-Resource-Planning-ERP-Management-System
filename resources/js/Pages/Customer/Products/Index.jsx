import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import Pagination from '@/Components/Pagination';
import {
    Search,
    Filter,
    ShoppingCart,
    Package,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    ImageIcon,
    Plus,
    Minus,
    Trash2,
    X,
    ShoppingBag,
    Tag,
    Star,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
const fmt = (price) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price || 0);

const stockLabel = (qty) => {
    if (qty <= 0) return { text: 'Out of Stock', classes: 'bg-rose-100 text-rose-600', dot: 'bg-rose-500' };
    if (qty <= 10) return { text: 'Low Stock', classes: 'bg-amber-100 text-amber-600', dot: 'bg-amber-500' };
    return { text: 'In Stock', classes: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' };
};

// ---------------------------------------------------------------------------
// SUB-COMPONENTS
// ---------------------------------------------------------------------------
const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
        <div className={`inline-flex p-2.5 rounded-xl ${color} bg-opacity-10 mb-3`}>
            <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">{value}</p>
    </div>
);

// ---------------------------------------------------------------------------
// PRODUCT CARD
// ---------------------------------------------------------------------------
const ProductCard = ({ product, onAddToCart }) => {
    const [qty, setQty] = useState(1);
    const stock = product.stock_count || 0;
    const isOut = stock <= 0;
    const isLow = stock > 0 && stock <= 10;
    const sl = stockLabel(stock);

    return (
        <div className={`bg-white rounded-2xl border shadow-sm p-4 hover:shadow-md transition-all group relative flex flex-col ${isOut ? 'opacity-60' : 'border-slate-100'}`}>
            {/* Image */}
            <div className="aspect-[4/3] bg-slate-100 rounded-xl overflow-hidden mb-4 relative flex items-center justify-center">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.product}
                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isOut ? 'grayscale' : ''}`}
                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                ) : null}
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-slate-300"
                    style={{ display: product.image_url ? 'none' : 'flex' }}>
                    <ImageIcon className="w-10 h-10 opacity-40" />
                </div>

                {/* Stock Badge */}
                {isOut && <span className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md z-10">Sold Out</span>}
                {isLow && !isOut && <span className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md z-10">Low Stock</span>}
            </div>

            {/* Info */}
            <div className="flex-1">
                <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">{product.product}</h3>
                    <p className="font-black text-indigo-600 text-sm whitespace-nowrap">{fmt(product.price)}</p>
                </div>
                <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {product.category?.category || 'General'}
                    </span>
                    <span className={`flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full ${sl.classes}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sl.dot}`} />
                        {sl.text}
                    </span>
                </div>
            </div>

            {/* Add to Cart Controls */}
            {!isOut && (
                <div className="flex items-center gap-2 mt-auto">
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setQty(q => Math.max(1, q - 1))}
                            className="px-2.5 py-1.5 hover:bg-slate-50 transition text-slate-600"
                        >
                            <Minus size={12} />
                        </button>
                        <span className="px-3 text-sm font-black text-slate-800 min-w-[2rem] text-center">{qty}</span>
                        <button
                            onClick={() => setQty(q => Math.min(stock, q + 1))}
                            className="px-2.5 py-1.5 hover:bg-slate-50 transition text-slate-600"
                        >
                            <Plus size={12} />
                        </button>
                    </div>
                    <button
                        onClick={() => { onAddToCart(product, qty); setQty(1); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all active:scale-95 shadow-sm"
                    >
                        <ShoppingCart size={13} />
                        Add to Cart
                    </button>
                </div>
            )}
            {isOut && (
                <div className="mt-auto py-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider border border-dashed border-slate-200 rounded-xl">
                    Unavailable
                </div>
            )}
        </div>
    );
};

// ---------------------------------------------------------------------------
// CART DRAWER
// ---------------------------------------------------------------------------
const CartDrawer = ({ cart, onUpdateQty, onRemove, onClear, onCheckout, isOpen, onClose }) => {
    const items = Object.values(cart);
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const count = items.reduce((s, i) => s + i.quantity, 0);

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-xl">
                            <ShoppingCart size={20} className="text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="font-black text-slate-900 text-lg">My Cart</h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{count} item{count !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center pb-16">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <ShoppingBag size={32} className="text-slate-300" />
                            </div>
                            <h3 className="font-black text-slate-800 mb-1">Your cart is empty</h3>
                            <p className="text-slate-400 text-sm font-medium">Browse products and add items to your cart.</p>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-100 flex-shrink-0">
                                    <img
                                        src={item.image_url}
                                        alt={item.product}
                                        className="w-full h-full object-cover"
                                        onError={e => { e.target.src = '/images/default-product.png'; }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-slate-800 truncate">{item.product}</p>
                                    <p className="text-xs font-bold text-indigo-600">{fmt(item.price)}</p>
                                    {/* Qty Controls */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                                            <button
                                                onClick={() => onUpdateQty(item.id, Math.max(1, item.quantity - 1))}
                                                className="px-2 py-1 hover:bg-slate-50 text-slate-500 transition"
                                            >
                                                <Minus size={11} />
                                            </button>
                                            <span className="px-2 text-xs font-black text-slate-800 min-w-[1.5rem] text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                                                className="px-2 py-1 hover:bg-slate-50 text-slate-500 transition"
                                            >
                                                <Plus size={11} />
                                            </button>
                                        </div>
                                        <span className="text-xs font-black text-slate-600 ml-1">{fmt(item.price * item.quantity)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onRemove(item.id)}
                                    className="p-1.5 hover:bg-rose-50 hover:text-rose-500 text-slate-300 rounded-lg transition-colors"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-slate-100 space-y-4 bg-slate-50/50">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Order Total</span>
                            <span className="text-2xl font-black text-indigo-600">{fmt(total)}</span>
                        </div>
                        <button
                            onClick={onCheckout}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                        >
                            Place Order
                        </button>
                        <button
                            onClick={onClear}
                            className="w-full py-2.5 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
                        >
                            Clear Cart
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

// ---------------------------------------------------------------------------
// MAIN PAGE
// ---------------------------------------------------------------------------
export default function BrowseProducts({ auth, products = [], categories = [], cart: initialCart = {} }) {
    const { flash } = usePage().props;

    // ── Cart State (session mirror) ──
    const [cart, setCart] = useState(initialCart);
    const [cartOpen, setCartOpen] = useState(false);
    const [placing, setPlacing] = useState(false);
    const [toast, setToast] = useState(null);

    // ── Filter / Search ──
    const [search, setSearch] = useState('');
    const [categoryFilter, setCat] = useState('All');
    const [stockFilter, setStock] = useState('All');
    const [sortBy, setSortBy] = useState('Newest');
    const [currentPage, setPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    useEffect(() => { setPage(1); }, [search, categoryFilter, stockFilter, sortBy]);

    // Flash toasts
    useEffect(() => {
        if (flash?.success) showToast(flash.success, 'success');
        if (flash?.error) showToast(flash.error, 'error');
    }, [flash]);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── Stats ──
    const stats = useMemo(() => ({
        total: products.length,
        inStock: products.filter(p => (p.stock_count || 0) > 10).length,
        lowStock: products.filter(p => (p.stock_count || 0) > 0 && (p.stock_count || 0) <= 10).length,
        outOf: products.filter(p => (p.stock_count || 0) <= 0).length,
    }), [products]);

    // ── Filtered Data ──
    const filtered = useMemo(() => {
        return products
            .filter(p => {
                const q = search.toLowerCase();
                const matchSearch = !q || p.product?.toLowerCase().includes(q);
                const matchCat = categoryFilter === 'All' || p.category?.id == categoryFilter;
                const qty = p.stock_count || 0;
                const matchStock = stockFilter === 'All'
                    || (stockFilter === 'In Stock' && qty > 10)
                    || (stockFilter === 'Low Stock' && qty > 0 && qty <= 10)
                    || (stockFilter === 'Out of Stock' && qty <= 0);
                return matchSearch && matchCat && matchStock;
            })
            .sort((a, b) => {
                if (sortBy === 'Newest') return new Date(b.created_at) - new Date(a.created_at);
                if (sortBy === 'Price High') return b.price - a.price;
                if (sortBy === 'Price Low') return a.price - b.price;
                if (sortBy === 'Stock') return (b.stock_count || 0) - (a.stock_count || 0);
                return 0;
            });
    }, [products, search, categoryFilter, stockFilter, sortBy]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const cartCount = Object.values(cart).reduce((s, i) => s + i.quantity, 0);

    // ── Cart Handlers (optimistic UI + server sync) ──
    const handleAddToCart = (product, qty) => {
        // Optimistic update
        setCart(prev => {
            const id = String(product.id);
            if (prev[id]) {
                return { ...prev, [id]: { ...prev[id], quantity: prev[id].quantity + qty } };
            }
            return { ...prev, [id]: { id: product.id, product: product.product, price: parseFloat(product.price), image_url: product.image_url, quantity: qty } };
        });

        // Sync to server
        router.post(route('cart.add'), { product_id: product.id, quantity: qty }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => showToast(`"${product.product}" added to cart!`),
            onError: () => showToast('Could not add to cart.', 'error'),
        });
    };

    const handleUpdateQty = (productId, qty) => {
        setCart(prev => ({ ...prev, [String(productId)]: { ...prev[String(productId)], quantity: qty } }));
        router.patch(route('cart.update', productId), { quantity: qty }, { preserveScroll: true, preserveState: true });
    };

    const handleRemove = (productId) => {
        setCart(prev => { const n = { ...prev }; delete n[String(productId)]; return n; });
        router.delete(route('cart.remove', productId), { preserveScroll: true, preserveState: true });
    };

    const handleClear = () => {
        setCart({});
        router.post(route('cart.clear'), {}, { preserveScroll: true, preserveState: true });
    };

    const handleCheckout = () => {
        const items = Object.values(cart);
        if (!items.length) return;
        setPlacing(true);
        const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

        router.post(route('checkout.place'), { items, total }, {
            onSuccess: () => {
                setCart({});
                setCartOpen(false);
                showToast('Order placed successfully!');
            },
            onError: (errors) => {
                const msg = Object.values(errors)[0] || 'Order failed.';
                showToast(msg, 'error');
            },
            onFinish: () => setPlacing(false),
        });
    };

    // ---------------------------------------------------------------------------
    return (
        <AuthenticatedLayout header="Browse Products">
            <Head title="Browse Products" />

            <div className="space-y-6 animate-in fade-in duration-500">

                {/* ── 1. Header + Cart Button ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Browse Products</h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Explore our sericulture products and add them to your cart.</p>
                    </div>
                    <button
                        onClick={() => setCartOpen(true)}
                        className="relative flex items-center gap-2.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                    >
                        <ShoppingCart size={18} />
                        My Cart
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* ── 2. Stat Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Products" value={stats.total} icon={Package} color="bg-indigo-500" />
                    <StatCard label="In Stock" value={stats.inStock} icon={CheckCircle2} color="bg-emerald-500" />
                    <StatCard label="Low Stock" value={stats.lowStock} icon={AlertTriangle} color="bg-amber-500" />
                    <StatCard label="Out of Stock" value={stats.outOf} icon={XCircle} color="bg-rose-500" />
                </div>

                {/* ── 3. Search & Filter Bar ── */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full xl:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm font-medium transition-all"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                        <select
                            value={categoryFilter}
                            onChange={e => setCat(e.target.value)}
                            className="pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer hover:border-indigo-300 transition-colors"
                        >
                            <option value="All">All Categories</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.category}</option>)}
                        </select>

                        <select
                            value={stockFilter}
                            onChange={e => setStock(e.target.value)}
                            className="pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer hover:border-indigo-300 transition-colors"
                        >
                            <option value="All">All Availability</option>
                            <option value="In Stock">In Stock</option>
                            <option value="Low Stock">Low Stock</option>
                            <option value="Out of Stock">Out of Stock</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer hover:border-indigo-300 transition-colors"
                        >
                            <option value="Newest">Newest First</option>
                            <option value="Price High">Price: High to Low</option>
                            <option value="Price Low">Price: Low to High</option>
                            <option value="Stock">Stock Level</option>
                        </select>
                    </div>
                </div>

                {/* ── 4. Results count ── */}
                <div className="flex items-center justify-between px-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {filtered.length} Product{filtered.length !== 1 ? 's' : ''} Found
                    </p>
                </div>

                {/* ── 5. Products Grid ── */}
                {filtered.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {paginated.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={handleAddToCart}
                                />
                            ))}
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Package size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-slate-900 font-bold mb-1">No products found</h3>
                        <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">Try adjusting your search or filters.</p>
                        <button
                            onClick={() => { setSearch(''); setCat('All'); setStock('All'); }}
                            className="px-5 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* ── Cart Drawer ── */}
            <CartDrawer
                cart={cart}
                isOpen={cartOpen}
                onClose={() => setCartOpen(false)}
                onUpdateQty={handleUpdateQty}
                onRemove={handleRemove}
                onClear={handleClear}
                onCheckout={handleCheckout}
            />

            {/* ── Toast Notification ── */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-bold animate-in slide-in-from-right duration-300 ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
                    {toast.type === 'error' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                    {toast.msg}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
