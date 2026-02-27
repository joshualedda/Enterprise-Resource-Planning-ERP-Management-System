import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    ShoppingCart, ImageIcon, X, ShoppingBag, MapPin, CreditCard, Truck, Store, Loader2, Upload, CheckCircle2
} from 'lucide-react';

const fmt = (price) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price || 0);

export default function BrowseProducts({ auth, products = [], cart: initialCart = {}, regions: initialRegions = [] }) {
    const [cart, setCart] = useState(initialCart);
    const [cartOpen, setCartOpen] = useState(false);
    const [placing, setPlacing] = useState(false);

    // Order Info States
    const [method, setMethod] = useState('walk-in'); 
    const [payment, setPayment] = useState('Cash');
    const [receipt, setReceipt] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState(null);

    const [address, setAddress] = useState({
        phone_number: '', region_id: '', province_id: '', municipality_id: '', barangay_id: '', zipcode: '' 
    });

    // Dropdown Data & Loading states
    const [regions, setRegions] = useState(initialRegions);
    const [provinces, setProvinces] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const [loadState, setLoadState] = useState({ p: false, m: false, b: false });

    // --- LOGIC CHANGE START ---
    // Automatically switch payment method based on delivery selection
    useEffect(() => {
        if (method === 'delivery') {
            setPayment('Bank');
        } else {
            setPayment('Cash');
            setReceipt(null);
            setReceiptPreview(null);
        }
    }, [method]);
    // --- LOGIC CHANGE END ---

    useEffect(() => {
        if (address.region_id) {
            setLoadState(s => ({...s, p: true}));
            const region = regions.find(r => String(r.id) === String(address.region_id));
            const provs = region?.provinces || [];
            setProvinces(provs);
            setLoadState(s => ({...s, p: false}));
            setAddress(prev => ({ ...prev, province_id: '', municipality_id: '', barangay_id: '' }));
        } else {
            setProvinces([]);
            setMunicipalities([]);
            setBarangays([]);
        }
    }, [address.region_id, regions]);

    useEffect(() => {
        if (address.province_id) {
            setLoadState(s => ({...s, m: true}));
            const prov = provinces.find(p => String(p.id) === String(address.province_id));
            const mun = prov?.municipalities || [];
            setMunicipalities(mun);
            setLoadState(s => ({...s, m: false}));
            setAddress(prev => ({ ...prev, municipality_id: '', barangay_id: '' }));
        } else {
            setMunicipalities([]);
            setBarangays([]);
        }
    }, [address.province_id, provinces]);

    useEffect(() => {
        if (address.municipality_id) {
            setLoadState(s => ({...s, b: true}));
            const mun = municipalities.find(m => String(m.id) === String(address.municipality_id));
            const bars = mun?.barangays || [];
            setBarangays(bars);
            setLoadState(s => ({...s, b: false}));
            setAddress(prev => ({ ...prev, barangay_id: '' }));
        } else {
            setBarangays([]);
        }
    }, [address.municipality_id, municipalities]);

    const handleReceipt = (e) => {
        const file = e.target.files[0];
        if (file) {
            setReceipt(file);
            setReceiptPreview(URL.createObjectURL(file));
        }
    };

    const cartItems = Object.values(cart);
    const totalPrice = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

    const submitOrder = () => {
        if (payment === 'Bank' && !receipt) return alert("Pakipasa po ang picture ng receipt/gcash screenshot.");
        setPlacing(true);
        router.post('/orders', {
            items: cart,
            address,
            method,
            payment,
            receipt 
        }, {
            onFinish: () => setPlacing(false),
            onSuccess: () => {
                setCart({});
                setCartOpen(false);
                alert("Order placed! Hintayin ang tawag ng aming staff.");
            }
        });
    };

    return (
        <AuthenticatedLayout header="Marketplace">
            <Head title="Shop" />
            
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
                            <div className="aspect-square bg-slate-50 rounded-[2rem] mb-5 overflow-hidden border border-slate-50 relative">
                                {p.image_url ? (
                                    <img src={`/storage/${p.image_url}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon size={64}/></div>
                                )}
                            </div>
                            <h3 className="font-bold text-xl text-slate-800 px-1">{p.product}</h3>
                            <p className="text-emerald-600 font-black text-2xl mb-5 px-1">{fmt(p.price)}</p>
                            <button 
                                onClick={() => setCart(prev => ({...prev, [p.id]: {...p, quantity: (prev[p.id]?.quantity || 0) + 1}}))}
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
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => !placing && setCartOpen(false)} />
                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        
                        <div className="p-8 border-b flex justify-between items-center">
                            <h2 className="font-black text-2xl flex items-center gap-2 text-slate-800">Checkout</h2>
                            <button onClick={() => setCartOpen(false)} className="p-2 bg-slate-100 rounded-full hover:rotate-90 transition-transform"><X size={20}/></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* 1. Item Summary */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Summary</p>
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex gap-4 items-center">
                                        <div className="w-14 h-14 bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-50">
                                            <img src={`/storage/${item.image_url}`} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-800 text-sm truncate">{item.product}</p>
                                            <p className="text-[10px] text-slate-400 font-bold">{item.quantity} units</p>
                                        </div>
                                        <p className="font-black text-slate-900 text-sm">{fmt(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>

                            {/* 2. Method Toggle */}
                            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
                                <button onClick={() => setMethod('walk-in')} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-all ${method === 'walk-in' ? 'bg-white shadow-md text-emerald-600' : 'text-slate-500'}`}><Store size={16}/> Walk-in</button>
                                <button onClick={() => setMethod('delivery')} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-all ${method === 'delivery' ? 'bg-white shadow-md text-emerald-600' : 'text-slate-500'}`}><Truck size={16}/> Delivery</button>
                            </div>

                            {/* 3. Dynamic Address Form */}
                            {method === 'delivery' && (
                                <div className="space-y-4 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 animate-in fade-in duration-500">
                                    <div className="flex items-center gap-2 text-slate-400 mb-2"><MapPin size={16}/><span className="text-[10px] font-black uppercase">Shipping Address</span></div>
                                    
                                    <input type="text" placeholder="Active Phone Number" className="w-full border-slate-200 rounded-2xl text-sm focus:ring-emerald-500 focus:border-emerald-500" value={address.phone_number} onChange={e => setAddress({...address, phone_number: e.target.value})} />
                                    
                                    <select className="w-full border-slate-200 rounded-2xl text-sm" value={address.region_id} onChange={e => setAddress({...address, region_id: e.target.value})}>
                                        <option value="">Select Region</option>
                                        {regions.map(r => <option key={r.id} value={r.id}>{r.region_description} ({r.region_name})</option>)}
                                    </select>

                                    <div className="relative">
                                        <select disabled={!address.region_id || loadState.p} className="w-full border-slate-200 rounded-2xl text-sm disabled:opacity-50" value={address.province_id} onChange={e => setAddress({...address, province_id: e.target.value})}>
                                            <option value="">{loadState.p ? 'Loading Provinces...' : 'Select Province'}</option>
                                            {provinces.map(p => <option key={p.id} value={p.id}>{p.province_name}</option>)}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <select disabled={!address.province_id || loadState.m} className="w-full border-slate-200 rounded-2xl text-sm disabled:opacity-50" value={address.municipality_id} onChange={e => setAddress({...address, municipality_id: e.target.value})}>
                                            <option value="">{loadState.m ? 'Wait...' : 'City/Town'}</option>
                                            {municipalities.map(m => <option key={m.id} value={m.id}>{m.municipality_name}</option>)}
                                        </select>
                                        <input type="text" placeholder="ZIP" className="w-full border-slate-200 rounded-2xl text-sm" value={address.zipcode} onChange={e => setAddress({...address, zipcode: e.target.value})} />
                                    </div>

                                    <select disabled={!address.municipality_id || loadState.b} className="w-full border-slate-200 rounded-2xl text-sm disabled:opacity-50" value={address.barangay_id} onChange={e => setAddress({...address, barangay_id: e.target.value})}>
                                        <option value="">{loadState.b ? 'Loading Barangays...' : 'Barangay'}</option>
                                        {barangays.map(b => <option key={b.id} value={b.id}>{b.name || b.barangay_name}</option>)}
                                    </select>
                                </div>
                            )}

                            {/* 4. Payment Options */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method</p>
                                
                                {method === 'walk-in' ? (
                                    <div className="grid grid-cols-1">
                                        <button onClick={() => setPayment('Cash')} className={`p-4 rounded-2xl border-2 font-black text-xs transition-all border-emerald-500 bg-emerald-50 text-emerald-600`}>Cash / Over-the-counter</button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1">
                                        <button disabled className={`p-4 rounded-2xl border-2 font-black text-xs transition-all border-blue-500 bg-blue-50 text-blue-600 flex items-center justify-center gap-2`}>
                                            <CreditCard size={16}/> Bank / GCash Required for Delivery
                                        </button>
                                    </div>
                                )}

                                {payment === 'Bank' && (
                                    <div className="p-6 bg-blue-50 rounded-[2.5rem] border border-blue-100 space-y-4 animate-in zoom-in-95 duration-300">
                                        <div className="text-center">
                                            <div className="bg-white p-3 inline-block rounded-3xl shadow-sm mb-3">
                                                <img src="/images/gcash-qr.png" className="w-32 h-32 object-contain" alt="QR" />
                                            </div>
                                            <p className="text-xs font-black text-blue-900">Juan Dela Cruz</p>
                                            <p className="text-[10px] text-blue-500 font-bold tracking-widest">0912 345 6789</p>
                                        </div>
                                        
                                        <label className="block border-2 border-dashed border-blue-200 rounded-2xl p-6 text-center cursor-pointer hover:bg-blue-100 transition-all relative overflow-hidden">
                                            {receiptPreview ? (
                                                <div className="absolute inset-0 group">
                                                    <img src={receiptPreview} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-emerald-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <CheckCircle2 className="text-white" size={32} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    <Upload className="mx-auto text-blue-400 mb-2" size={24}/>
                                                    <p className="text-[10px] font-black text-blue-600 uppercase">Upload Receipt</p>
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