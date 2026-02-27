import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import {
    ShoppingCart, ImageIcon, X, MapPin, CreditCard, Truck, Store, Loader2, Upload, CheckCircle2, AlertCircle, CheckCheck
} from 'lucide-react';

const fmt = (price) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price || 0);

function Toast({ toasts, removeToast }) {
    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
            {toasts.map(t => (
                <div key={t.id} className={`pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-semibold max-w-sm w-full animate-in slide-in-from-right-full duration-300 ${t.type === 'success' ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-rose-500 text-white shadow-rose-200'}`}>
                    {t.type === 'success' ? <CheckCheck size={20} className="shrink-0 mt-0.5" /> : <AlertCircle size={20} className="shrink-0 mt-0.5" />}
                    <span className="flex-1 leading-snug">{t.message}</span>
                    <button onClick={() => removeToast(t.id)} className="opacity-70 hover:opacity-100 transition-opacity ml-1"><X size={16} /></button>
                </div>
            ))}
        </div>
    );
}

function useToast() {
    const [toasts, setToasts] = useState([]);
    const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));
    const toast = (message, type = 'success', duration = 5000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), duration);
    };
    return { toasts, toast, removeToast };
}

export default function BrowseProducts({ auth, products = [], cart: initialCart = {}, regions: initialRegions = [], savedAddress = null }) {
    const { flash } = usePage().props;
    const { toasts, toast, removeToast } = useToast();

    const [cart, setCart] = useState(initialCart);
    const [cartOpen, setCartOpen] = useState(false);
    const [placing, setPlacing] = useState(false);

    const [method, setMethod] = useState('walk-in');
    const [payment, setPayment] = useState('Cash');
    const [receipt, setReceipt] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState(null);

    const [address, setAddress] = useState({
        phone_number:    savedAddress?.phone_number    || '',
        region_id:       savedAddress?.region_id       || '',
        province_id:     savedAddress?.province_id     || '',
        municipality_id: savedAddress?.municipality_id || '',
        barangay_id:     savedAddress?.barangay_id     || '',
        zipcode:         savedAddress?.zipcode         || '',
    });

    // Dropdown lists
    const [provinces, setProvinces]         = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [barangays, setBarangays]         = useState([]);

    // Track if the cascade is from saved address (skip resetting child fields)
    const isMountCascade = useRef(true);

    // ── On mount: pre-populate all cascading dropdowns from savedAddress ────
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

        // Done with mount cascade — allow normal cascading resets after this
        setTimeout(() => { isMountCascade.current = false; }, 100);
    }, []);

    // Flash → toast
    useEffect(() => {
        if (flash?.success) toast(flash.success, 'success');
        if (flash?.error)   toast(flash.error, 'error');
    }, [flash]);

    // Auto-switch payment on method change
    useEffect(() => {
        if (method === 'delivery') {
            setPayment('Bank');
        } else {
            setPayment('Cash');
            setReceipt(null);
            setReceiptPreview(null);
        }
    }, [method]);

    // Region change → reload provinces, reset children (skip on mount cascade)
    useEffect(() => {
        if (isMountCascade.current) return;
        if (address.region_id) {
            const region = initialRegions.find(r => String(r.id) === String(address.region_id));
            setProvinces(region?.provinces || []);
        } else {
            setProvinces([]);
        }
        setMunicipalities([]);
        setBarangays([]);
        setAddress(prev => ({ ...prev, province_id: '', municipality_id: '', barangay_id: '' }));
    }, [address.region_id]);

    // Province change → reload municipalities, reset children
    useEffect(() => {
        if (isMountCascade.current) return;
        if (address.province_id) {
            const prov = provinces.find(p => String(p.id) === String(address.province_id));
            setMunicipalities(prov?.municipalities || []);
        } else {
            setMunicipalities([]);
        }
        setBarangays([]);
        setAddress(prev => ({ ...prev, municipality_id: '', barangay_id: '' }));
    }, [address.province_id]);

    // Municipality change → reload barangays, reset child
    useEffect(() => {
        if (isMountCascade.current) return;
        if (address.municipality_id) {
            const mun = municipalities.find(m => String(m.id) === String(address.municipality_id));
            setBarangays(mun?.barangays || []);
        } else {
            setBarangays([]);
        }
        setAddress(prev => ({ ...prev, barangay_id: '' }));
    }, [address.municipality_id]);

    const handleReceipt = (e) => {
        const file = e.target.files[0];
        if (file) { setReceipt(file); setReceiptPreview(URL.createObjectURL(file)); }
    };

    const cartItems  = Object.values(cart);
    const totalPrice = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

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
            onFinish: () => setPlacing(false),
            onSuccess: () => { setCart({}); setCartOpen(false); },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast(firstError || 'Failed to place order. Please try again.', 'error');
            },
        });
    };

    return (
        <AuthenticatedLayout header="Marketplace">
            <Head title="Shop" />
            <Toast toasts={toasts} removeToast={removeToast} />

            <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-between mb-10 items-center">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900">Marketplace</h1>
                        <p className="text-slate-500 font-medium">Fresh products delivered to your door.</p>
                    </div>
                    <button onClick={() => setCartOpen(true)} className="bg-emerald-600 p-5 rounded-3xl text-white relative shadow-2xl shadow-emerald-200 active:scale-90 transition-all">
                        <ShoppingCart size={24} />
                        {cartItems.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-rose-500 w-7 h-7 rounded-full border-4 border-white text-[10px] flex items-center justify-center font-black">
                                {cartItems.length}
                            </span>
                        )}
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map(p => (
                        <div key={p.id} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                            <div className="aspect-square bg-slate-50 rounded-[2rem] mb-5 overflow-hidden border border-slate-50">
                                {p.image_url
                                    ? <img src={`/storage/${p.image_url}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.product} />
                                    : <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon size={64} /></div>
                                }
                            </div>
                            <h3 className="font-bold text-xl text-slate-800 px-1">{p.product}</h3>
                            <p className="text-emerald-600 font-black text-2xl mb-5 px-1">{fmt(p.price)}</p>
                            <button
                                onClick={() => {
                                    setCart(prev => ({ ...prev, [p.id]: { ...p, quantity: (prev[p.id]?.quantity || 0) + 1 } }));
                                    toast(`"${p.product}" added to cart!`, 'success', 2000);
                                }}
                                className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold text-sm hover:bg-emerald-600 transition-colors shadow-lg shadow-slate-200"
                            >
                                Add to Cart
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* CHECKOUT DRAWER */}
            {cartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !placing && setCartOpen(false)} />
                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

                        <div className="p-8 border-b flex justify-between items-center">
                            <h2 className="font-black text-2xl text-slate-800">Checkout</h2>
                            <button onClick={() => !placing && setCartOpen(false)} className="p-2 bg-slate-100 rounded-full hover:rotate-90 transition-transform"><X size={20} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">

                            {/* Order Summary */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Summary</p>
                                {cartItems.length === 0 && <p className="text-slate-400 text-sm text-center py-4">Your cart is empty.</p>}
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex gap-4 items-center">
                                        <div className="w-14 h-14 bg-slate-100 rounded-2xl overflow-hidden shrink-0">
                                            {item.image_url
                                                ? <img src={`/storage/${item.image_url}`} className="w-full h-full object-cover" alt={item.product} />
                                                : <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon size={24} /></div>
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-800 text-sm truncate">{item.product}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <button
                                                    onClick={() => setCart(prev => {
                                                        const updated = { ...prev };
                                                        if (updated[item.id].quantity <= 1) delete updated[item.id];
                                                        else updated[item.id] = { ...updated[item.id], quantity: updated[item.id].quantity - 1 };
                                                        return updated;
                                                    })}
                                                    className="w-6 h-6 bg-slate-200 rounded-full text-xs font-black flex items-center justify-center hover:bg-rose-200 transition-colors"
                                                >−</button>
                                                <span className="text-[10px] text-slate-500 font-bold">{item.quantity}</span>
                                                <button
                                                    onClick={() => setCart(prev => ({ ...prev, [item.id]: { ...item, quantity: prev[item.id].quantity + 1 } }))}
                                                    className="w-6 h-6 bg-slate-200 rounded-full text-xs font-black flex items-center justify-center hover:bg-emerald-200 transition-colors"
                                                >+</button>
                                            </div>
                                        </div>
                                        <p className="font-black text-slate-900 text-sm">{fmt(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Method Toggle */}
                            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
                                <button onClick={() => setMethod('walk-in')} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-all ${method === 'walk-in' ? 'bg-white shadow-md text-emerald-600' : 'text-slate-500'}`}><Store size={16} /> Walk-in</button>
                                <button onClick={() => setMethod('delivery')} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-all ${method === 'delivery' ? 'bg-white shadow-md text-emerald-600' : 'text-slate-500'}`}><Truck size={16} /> Delivery</button>
                            </div>

                            {/* Address Form */}
                            {method === 'delivery' && (
                                <div className="space-y-4 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 animate-in fade-in duration-500">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <MapPin size={16} />
                                            <span className="text-[10px] font-black uppercase">Shipping Address</span>
                                        </div>
                                        {savedAddress && (
                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
                                                ✓ Auto-filled
                                            </span>
                                        )}
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Active Phone Number"
                                        className="w-full border-slate-200 rounded-2xl text-sm focus:ring-emerald-500 focus:border-emerald-500"
                                        value={address.phone_number}
                                        onChange={e => setAddress({ ...address, phone_number: e.target.value })}
                                    />

                                    <select
                                        className="w-full border-slate-200 rounded-2xl text-sm"
                                        value={address.region_id}
                                        onChange={e => setAddress({ ...address, region_id: e.target.value })}
                                    >
                                        <option value="">Select Region</option>
                                        {initialRegions.map(r => (
                                            <option key={r.id} value={String(r.id)}>{r.region_description} ({r.region_name})</option>
                                        ))}
                                    </select>

                                    <select
                                        disabled={!address.region_id}
                                        className="w-full border-slate-200 rounded-2xl text-sm disabled:opacity-50"
                                        value={address.province_id}
                                        onChange={e => setAddress({ ...address, province_id: e.target.value })}
                                    >
                                        <option value="">Select Province</option>
                                        {provinces.map(p => (
                                            <option key={p.id} value={String(p.id)}>{p.province_name}</option>
                                        ))}
                                    </select>

                                    <div className="grid grid-cols-2 gap-3">
                                        <select
                                            disabled={!address.province_id}
                                            className="w-full border-slate-200 rounded-2xl text-sm disabled:opacity-50"
                                            value={address.municipality_id}
                                            onChange={e => setAddress({ ...address, municipality_id: e.target.value })}
                                        >
                                            <option value="">City / Town</option>
                                            {municipalities.map(m => (
                                                <option key={m.id} value={String(m.id)}>{m.municipality_name}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="ZIP Code"
                                            className="w-full border-slate-200 rounded-2xl text-sm"
                                            value={address.zipcode}
                                            onChange={e => setAddress({ ...address, zipcode: e.target.value })}
                                        />
                                    </div>

                                    <select
                                        disabled={!address.municipality_id}
                                        className="w-full border-slate-200 rounded-2xl text-sm disabled:opacity-50"
                                        value={address.barangay_id}
                                        onChange={e => setAddress({ ...address, barangay_id: e.target.value })}
                                    >
                                        <option value="">Select Barangay</option>
                                        {barangays.map(b => (
                                            <option key={b.id} value={String(b.id)}>{b.name || b.barangay_name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Payment */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method</p>
                                {method === 'walk-in' ? (
                                    <div className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50 text-emerald-600 font-black text-xs text-center">
                                        Cash / Over-the-counter
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-2xl border-2 border-blue-500 bg-blue-50 text-blue-600 font-black text-xs flex items-center justify-center gap-2">
                                        <CreditCard size={16} /> Bank Transfer / GCash (Required for Delivery)
                                    </div>
                                )}

                                {payment === 'Bank' && (
                                    <div className="p-6 bg-blue-50 rounded-[2.5rem] border border-blue-100 space-y-4 animate-in zoom-in-95 duration-300">
                                        <div className="text-center">
                                            <div className="bg-white p-3 inline-block rounded-3xl shadow-sm mb-3">
                                                <img src="/images/gcash-qr.png" className="w-32 h-32 object-contain" alt="GCash QR" />
                                            </div>
                                            <p className="text-xs font-black text-blue-900">Juan Dela Cruz</p>
                                            <p className="text-[10px] text-blue-500 font-bold tracking-widest">0912 345 6789</p>
                                        </div>
                                        <label className="block border-2 border-dashed border-blue-200 rounded-2xl p-6 text-center cursor-pointer hover:bg-blue-100 transition-all relative overflow-hidden" style={{ minHeight: '120px' }}>
                                            {receiptPreview ? (
                                                <div className="absolute inset-0 group">
                                                    <img src={receiptPreview} className="w-full h-full object-cover" alt="Receipt" />
                                                    <div className="absolute inset-0 bg-emerald-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <CheckCircle2 className="text-white" size={32} />
                                                        <span className="text-white font-black ml-2 text-sm">Change Photo</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    <Upload className="mx-auto text-blue-400 mb-2" size={24} />
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
                        <div className="p-8 bg-slate-50 border-t space-y-6">
                            <div className="flex justify-between items-center px-2">
                                <span className="text-slate-400 text-xs font-black uppercase">Total Amount</span>
                                <span className="text-3xl font-black text-slate-900 tracking-tighter">{fmt(totalPrice)}</span>
                            </div>
                            <button
                                onClick={submitOrder}
                                disabled={placing || cartItems.length === 0}
                                className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-emerald-200 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                            >
                                {placing ? <Loader2 className="mx-auto animate-spin" /> : 'Confirm & Place Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}