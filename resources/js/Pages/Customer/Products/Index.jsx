import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import {
    ShoppingCart, X, Plus, Minus, Package, Tag, Info, ShoppingBag,
    Leaf, MapPin, CreditCard, Truck, Store, Loader2, Upload,
    CheckCircle2, AlertCircle, CheckCheck
} from 'lucide-react';

const fmt = (price) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price || 0);

const CART_KEY = 'srdi_cart_v2';

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toasts, removeToast }) {
    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
            {toasts.map(t => (
                <div key={t.id} className={`pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-semibold max-w-sm w-full
                    ${t.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white'}`}>
                    {t.type === 'success'
                        ? <CheckCheck size={18} className="shrink-0 mt-0.5" />
                        : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                    <span className="flex-1 leading-snug">{t.message}</span>
                    <button onClick={() => removeToast(t.id)} className="opacity-70 hover:opacity-100 transition-opacity ml-1">
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
}

function useToast() {
    const [toasts, setToasts] = useState([]);
    const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));
    const toast = (message, type = 'success', duration = 3000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), duration);
    };
    return { toasts, toast, removeToast };
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Index({ products = [], regions: initialRegions = [], savedAddress = null }) {
    const { flash } = usePage().props;
    const { toasts, toast, removeToast } = useToast();

    // Cart — load from localStorage so it persists across page reloads
    const [cart, setCart] = useState(() => {
        try { return JSON.parse(localStorage.getItem(CART_KEY) || 'null') || {}; }
        catch { return {}; }
    });

    const [cartOpen, setCartOpen]               = useState(false);
    const [placing, setPlacing]                 = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [method, setMethod]                   = useState('walk-in');
    const [payment, setPayment]                 = useState('Cash');
    const [receipt, setReceipt]                 = useState(null);
    const [receiptPreview, setReceiptPreview]   = useState(null);

    const [address, setAddress] = useState({
        phone_number:    savedAddress?.phone_number    || '',
        region_id:       savedAddress?.region_id       || '',
        province_id:     savedAddress?.province_id     || '',
        municipality_id: savedAddress?.municipality_id || '',
        barangay_id:     savedAddress?.barangay_id     || '',
        zipcode:         savedAddress?.zipcode         || '',
    });

    const [provinces, setProvinces]             = useState([]);
    const [municipalities, setMunicipalities]   = useState([]);
    const [barangays, setBarangays]             = useState([]);
    const isMountCascade                        = useRef(true);

    // Pre-populate cascading dropdowns from savedAddress on mount
    useEffect(() => {
        if (!savedAddress?.region_id) { isMountCascade.current = false; return; }
        const region = initialRegions.find(r => String(r.id) === String(savedAddress.region_id));
        if (!region) { isMountCascade.current = false; return; }
        setProvinces(region.provinces || []);
        if (savedAddress.province_id) {
            const prov = (region.provinces || []).find(p => String(p.id) === String(savedAddress.province_id));
            if (prov) {
                setMunicipalities(prov.municipalities || []);
                if (savedAddress.municipality_id) {
                    const mun = (prov.municipalities || []).find(m => String(m.id) === String(savedAddress.municipality_id));
                    if (mun) setBarangays(mun.barangays || []);
                }
            }
        }
        setTimeout(() => { isMountCascade.current = false; }, 100);
    }, []);

    // Flash → toast
    useEffect(() => {
        if (flash?.success) toast(flash.success, 'success');
        if (flash?.error)   toast(flash.error,   'error');
    }, [flash]);

    // Auto-switch payment when method changes
    useEffect(() => {
        if (method === 'delivery') { setPayment('Bank'); }
        else { setPayment('Cash'); setReceipt(null); setReceiptPreview(null); }
    }, [method]);

    // Cascading dropdowns
    useEffect(() => {
        if (isMountCascade.current) return;
        const region = initialRegions.find(r => String(r.id) === String(address.region_id));
        setProvinces(region?.provinces || []);
        setMunicipalities([]); setBarangays([]);
        setAddress(prev => ({ ...prev, province_id: '', municipality_id: '', barangay_id: '' }));
    }, [address.region_id]);

    useEffect(() => {
        if (isMountCascade.current) return;
        const prov = provinces.find(p => String(p.id) === String(address.province_id));
        setMunicipalities(prov?.municipalities || []);
        setBarangays([]);
        setAddress(prev => ({ ...prev, municipality_id: '', barangay_id: '' }));
    }, [address.province_id]);

    useEffect(() => {
        if (isMountCascade.current) return;
        const mun = municipalities.find(m => String(m.id) === String(address.municipality_id));
        setBarangays(mun?.barangays || []);
        setAddress(prev => ({ ...prev, barangay_id: '' }));
    }, [address.municipality_id]);

    // Persist cart to localStorage on every change
    useEffect(() => {
        try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* noop */ }
    }, [cart]);

    const cartItems = Object.values(cart);
    const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
    const cartTotal = cartItems.reduce((s, i) => s + Number(i.price) * i.quantity, 0);

    const addToCart = (product) => {
        setCart(prev => ({
            ...prev,
            [product.id]: { ...product, quantity: (prev[product.id]?.quantity || 0) + 1 },
        }));
        toast(`"${product.product}" added to cart!`, 'success', 2000);
    };

    const updateQty = (id, delta) => {
        setCart(prev => {
            const current = prev[id];
            if (!current) return prev;
            const newQty = current.quantity + delta;
            if (newQty <= 0) { const u = { ...prev }; delete u[id]; return u; }
            return { ...prev, [id]: { ...current, quantity: newQty } };
        });
    };

    const removeFromCart = (id) => {
        setCart(prev => { const u = { ...prev }; delete u[id]; return u; });
    };

    const clearCart = () => {
        setCart({});
        try { localStorage.removeItem(CART_KEY); } catch { /* noop */ }
    };

    const handleReceipt = (e) => {
        const file = e.target.files[0];
        if (file) { setReceipt(file); setReceiptPreview(URL.createObjectURL(file)); }
    };

    const submitOrder = () => {
        if (cartItems.length === 0) return toast('Your cart is empty.', 'error');
        if (payment === 'Bank' && !receipt) return toast('Please upload your GCash or bank transfer receipt.', 'error');
        if (method === 'delivery') {
            if (!address.phone_number)    return toast('Please enter your phone number.', 'error');
            if (!address.region_id)       return toast('Please select your region.', 'error');
            if (!address.province_id)     return toast('Please select your province.', 'error');
            if (!address.municipality_id) return toast('Please select your city or municipality.', 'error');
            if (!address.barangay_id)     return toast('Please select your barangay.', 'error');
        }
        setPlacing(true);
        const formData = new FormData();
        formData.append('method',  method);
        formData.append('payment', payment);
        formData.append('items',   JSON.stringify(cart));
        formData.append('address', JSON.stringify(address));
        if (receipt) formData.append('receipt', receipt);
        router.post(route('customer.checkout.place'), formData, {
            forceFormData: true,
            onFinish:  () => setPlacing(false),
            onSuccess: () => { clearCart(); setCartOpen(false); },
            onError:   (errors) => toast(Object.values(errors)[0] || 'Failed to place order.', 'error'),
        });
    };

    return (
        <AuthenticatedLayout header="Marketplace">
            <Head title="Marketplace" />
            <Toast toasts={toasts} removeToast={removeToast} />

            <div className="min-h-screen bg-slate-50">

                {/* ── Page Header ── */}
                <div className="bg-white border-b border-slate-100 px-8 py-5 flex justify-between items-center sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-500 p-2 rounded-xl">
                            <Leaf size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 leading-tight">Marketplace</h1>
                            <p className="text-xs text-slate-400 font-medium">{products.length} products available</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setCartOpen(true)}
                        className="relative flex items-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105 shadow-md"
                    >
                        <ShoppingCart size={16} />
                        <span>Cart</span>
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-black">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* ── Product Grid ── */}
                <div className="p-8 max-w-7xl mx-auto">
                    {products.length === 0 ? (
                        <div className="text-center py-24">
                            <Package size={48} className="text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold">No products available.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {products.map((p) => {
                                const stock  = p.stock_count ?? 0;
                                const inCart = cart[p.id];
                                const isLow  = stock > 0 && stock <= 5;
                                const isOut  = stock <= 0;

                                return (
                                    <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col overflow-hidden group">

                                        {/* Image */}
                                        <div className="relative aspect-square bg-slate-50 overflow-hidden">
                                            {p.image_url ? (
                                                <img
                                                    src={p.image_url}
                                                    alt={p.product}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => { e.target.src = 'https://placehold.co/400x400?text=No+Image'; }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-200 gap-2">
                                                    <Package size={36} />
                                                    <span className="text-xs font-bold">No Image</span>
                                                </div>
                                            )}

                                            {/* Stock badge */}
                                            <div className="absolute top-3 left-3">
                                                {isOut ? (
                                                    <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase">Out of Stock</span>
                                                ) : isLow ? (
                                                    <span className="bg-amber-400 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase">Only {stock} left</span>
                                                ) : (
                                                    <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase">{stock} in stock</span>
                                                )}
                                            </div>

                                            {/* Info button */}
                                            {p.description && (
                                                <button
                                                    onClick={() => setSelectedProduct(p)}
                                                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md hover:bg-white transition-colors"
                                                >
                                                    <Info size={14} className="text-slate-500" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="p-4 flex flex-col flex-1">
                                            <h3 className="font-black text-slate-800 text-sm leading-tight line-clamp-2 mb-1">{p.product}</h3>
                                            {p.category && (
                                                <div className="flex items-center gap-1 mb-2">
                                                    <Tag size={10} className="text-slate-300" />
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{p.category.category}</span>
                                                </div>
                                            )}
                                            {p.description && (
                                                <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">{p.description}</p>
                                            )}
                                            <div className="mt-auto">
                                                <p className="text-emerald-600 text-lg font-black mb-3">{fmt(p.price)}</p>
                                                {isOut ? (
                                                    <button disabled className="w-full bg-slate-100 text-slate-400 py-2.5 rounded-xl font-bold text-sm cursor-not-allowed">
                                                        Out of Stock
                                                    </button>
                                                ) : inCart ? (
                                                    <div className="flex items-center justify-between bg-slate-50 rounded-xl p-1 border border-slate-100">
                                                        <button onClick={() => updateQty(p.id, -1)} className="p-2 hover:bg-white rounded-lg transition-colors">
                                                            <Minus size={14} className="text-slate-600" />
                                                        </button>
                                                        <span className="font-black text-sm text-slate-800">{inCart.quantity}</span>
                                                        <button onClick={() => updateQty(p.id, 1)} className="p-2 hover:bg-white rounded-lg transition-colors">
                                                            <Plus size={14} className="text-slate-600" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => addToCart(p)}
                                                        className="w-full bg-slate-900 hover:bg-emerald-600 text-white py-2.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2"
                                                    >
                                                        <ShoppingCart size={14} />
                                                        Add to Cart
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Product Description Modal ── */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="aspect-video bg-slate-100 overflow-hidden">
                            {selectedProduct.image_url
                                ? <img src={selectedProduct.image_url} alt={selectedProduct.product} className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center text-slate-200"><Package size={48} /></div>
                            }
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h2 className="font-black text-xl text-slate-900">{selectedProduct.product}</h2>
                                    {selectedProduct.category && (
                                        <span className="text-xs text-slate-400 font-bold uppercase">{selectedProduct.category.category}</span>
                                    )}
                                </div>
                                <button onClick={() => setSelectedProduct(null)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                                    <X size={18} className="text-slate-500" />
                                </button>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed mb-4">{selectedProduct.description}</p>
                            <div className="flex items-center justify-between">
                                <p className="text-2xl font-black text-emerald-600">{fmt(selectedProduct.price)}</p>
                                <button
                                    onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); setCartOpen(true); }}
                                    disabled={selectedProduct.stock_count <= 0}
                                    className="bg-slate-900 hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-400 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                                >
                                    <ShoppingCart size={14} /> Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Checkout Drawer ── */}
            {cartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !placing && setCartOpen(false)} />
                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">

                        {/* Header */}
                        <div className="p-6 border-b flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <ShoppingBag size={20} className="text-slate-700" />
                                <h2 className="font-black text-xl text-slate-800">Your Cart</h2>
                                {cartCount > 0 && (
                                    <span className="bg-emerald-500 text-white text-xs font-black px-2 py-0.5 rounded-full">{cartCount}</span>
                                )}
                            </div>
                            <button onClick={() => !placing && setCartOpen(false)} className="p-2 bg-slate-100 rounded-full hover:rotate-90 transition-transform">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">

                            {/* Order Summary */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Summary</p>
                                {cartItems.length === 0 && (
                                    <div className="text-center py-10">
                                        <ShoppingCart size={36} className="text-slate-200 mx-auto mb-2" />
                                        <p className="text-slate-400 text-sm font-bold">Your cart is empty</p>
                                    </div>
                                )}
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100 items-center">
                                        <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                                            {item.image_url
                                                ? <img src={item.image_url} className="w-full h-full object-cover" alt={item.product}
                                                    onError={(e) => { e.target.src = 'https://placehold.co/64x64?text=?'; }} />
                                                : <div className="w-full h-full flex items-center justify-center text-slate-200"><Package size={20} /></div>
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-800 text-sm truncate">{item.product}</p>
                                            <p className="text-emerald-600 text-xs font-black">{fmt(item.price)}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <button onClick={() => updateQty(item.id, -1)} className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center hover:bg-rose-200 transition-colors">
                                                    <Minus size={9} />
                                                </button>
                                                <span className="text-xs font-black text-slate-700 w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQty(item.id, 1)} className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center hover:bg-emerald-200 transition-colors">
                                                    <Plus size={9} />
                                                </button>
                                                <button onClick={() => removeFromCart(item.id)} className="ml-auto text-slate-300 hover:text-red-400 transition-colors">
                                                    <X size={13} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="font-black text-slate-900 text-sm shrink-0">{fmt(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Method Toggle */}
                            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
                                <button onClick={() => setMethod('walk-in')} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-all ${method === 'walk-in' ? 'bg-white shadow-md text-emerald-600' : 'text-slate-500'}`}>
                                    <Store size={15} /> Walk-in
                                </button>
                                <button onClick={() => setMethod('delivery')} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-all ${method === 'delivery' ? 'bg-white shadow-md text-emerald-600' : 'text-slate-500'}`}>
                                    <Truck size={15} /> Delivery
                                </button>
                            </div>

                            {/* Address Form */}
                            {method === 'delivery' && (
                                <div className="space-y-3 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <MapPin size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Shipping Address</span>
                                        </div>
                                        {savedAddress && (
                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">✓ Auto-filled</span>
                                        )}
                                    </div>
                                    <input type="text" placeholder="Active Phone Number"
                                        className="w-full border-slate-200 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500"
                                        value={address.phone_number}
                                        onChange={e => setAddress({ ...address, phone_number: e.target.value })} />
                                    <select className="w-full border-slate-200 rounded-xl text-sm" value={address.region_id}
                                        onChange={e => setAddress({ ...address, region_id: e.target.value })}>
                                        <option value="">Select Region</option>
                                        {initialRegions.map(r => <option key={r.id} value={String(r.id)}>{r.region_description} ({r.region_name})</option>)}
                                    </select>
                                    <select disabled={!address.region_id} className="w-full border-slate-200 rounded-xl text-sm disabled:opacity-50"
                                        value={address.province_id} onChange={e => setAddress({ ...address, province_id: e.target.value })}>
                                        <option value="">Select Province</option>
                                        {provinces.map(p => <option key={p.id} value={String(p.id)}>{p.province_name}</option>)}
                                    </select>
                                    <div className="grid grid-cols-2 gap-3">
                                        <select disabled={!address.province_id} className="w-full border-slate-200 rounded-xl text-sm disabled:opacity-50"
                                            value={address.municipality_id} onChange={e => setAddress({ ...address, municipality_id: e.target.value })}>
                                            <option value="">City / Town</option>
                                            {municipalities.map(m => <option key={m.id} value={String(m.id)}>{m.municipality_name}</option>)}
                                        </select>
                                        <input type="text" placeholder="ZIP Code"
                                            className="w-full border-slate-200 rounded-xl text-sm"
                                            value={address.zipcode}
                                            onChange={e => setAddress({ ...address, zipcode: e.target.value })} />
                                    </div>
                                    <select disabled={!address.municipality_id} className="w-full border-slate-200 rounded-xl text-sm disabled:opacity-50"
                                        value={address.barangay_id} onChange={e => setAddress({ ...address, barangay_id: e.target.value })}>
                                        <option value="">Select Barangay</option>
                                        {barangays.map(b => <option key={b.id} value={String(b.id)}>{b.name || b.barangay_name}</option>)}
                                    </select>
                                </div>
                            )}

                            {/* Payment */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method</p>
                                {method === 'walk-in' ? (
                                    <div className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50 text-emerald-600 font-black text-xs text-center">
                                        Cash / Over-the-counter
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-2xl border-2 border-blue-500 bg-blue-50 text-blue-600 font-black text-xs flex items-center justify-center gap-2">
                                        <CreditCard size={14} /> Bank Transfer / GCash (Required for Delivery)
                                    </div>
                                )}
                                {payment === 'Bank' && (
                                    <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 space-y-4">
                                        <div className="text-center">
                                            <div className="bg-white p-3 inline-block rounded-2xl shadow-sm mb-2">
                                                <img src="/images/gcash-qr.png" className="w-28 h-28 object-contain" alt="GCash QR" />
                                            </div>
                                            <p className="text-xs font-black text-blue-900">Juan Dela Cruz</p>
                                            <p className="text-[10px] text-blue-500 font-bold tracking-widest">0912 345 6789</p>
                                        </div>
                                        <label className="block border-2 border-dashed border-blue-200 rounded-xl p-5 text-center cursor-pointer hover:bg-blue-100 transition-all relative overflow-hidden" style={{ minHeight: '100px' }}>
                                            {receiptPreview ? (
                                                <div className="absolute inset-0 group">
                                                    <img src={receiptPreview} className="w-full h-full object-cover" alt="Receipt" />
                                                    <div className="absolute inset-0 bg-emerald-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <CheckCircle2 className="text-white" size={28} />
                                                        <span className="text-white font-black ml-2 text-sm">Change Photo</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    <Upload className="mx-auto text-blue-400 mb-1" size={22} />
                                                    <p className="text-[10px] font-black text-blue-600 uppercase">Upload Payment Receipt</p>
                                                    <p className="text-[10px] text-blue-400">GCash screenshot or bank transfer slip</p>
                                                </div>
                                            )}
                                            <input type="file" className="hidden" onChange={handleReceipt} accept="image/*" />
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-slate-50 border-t space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-xs font-black uppercase">Total Amount</span>
                                <span className="text-2xl font-black text-slate-900">{fmt(cartTotal)}</span>
                            </div>
                            <button
                                onClick={submitOrder}
                                disabled={placing || cartItems.length === 0}
                                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-sm shadow-lg shadow-emerald-200 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
                            >
                                {placing
                                    ? <><Loader2 size={16} className="animate-spin" /> Placing Order...</>
                                    : <><ShoppingBag size={16} /> Confirm & Place Order</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}