import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';
import { 
    ChevronRight, 
    CreditCard, 
    Truck, 
    User as UserIcon, 
    MapPin, 
    Phone, 
    Package, 
    ShieldCheck, 
    ArrowRight, 
    Image as ImageIcon,
    CheckCircle2,
    Wallet,
    Info
} from 'lucide-react';

export default function Checkout({ auth, checkoutItems, customer, regions: allRegions = [] }) {
    const { savedAddress = null } = customer;
    
    const { data, setData, post, processing, errors } = useForm({
        items: checkoutItems,
        customer_name: customer.name || '',
        contact: customer.phone || '',
        address: '', // This will be "Street Name, Building, House No"
        region_id: savedAddress?.region_id || '',
        province_id: savedAddress?.province_id || '',
        municipality_id: savedAddress?.municipality_id || '',
        barangay_id: savedAddress?.barangay_id || '',
        zip_code: savedAddress?.zipcode || '',
        payment_method: 'cash',
        reference_no: '',
        receipt: null
    });

    const [provinces, setProvinces] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const isMountCascade = useRef(true);

    const getProvinces = (region) => region?.provinces || [];
    const getMunicipalities = (prov) => prov?.municipalities || [];
    const getBarangays = (mun) => mun?.barangays || [];
    const getBarangayName = (b) => b?.brgyDesc || b?.name || '';
    
    const rId = r => r?.region_id || r?.id;
    const pId = p => p?.province_id || p?.id;
    const mId = m => m?.municipality_id || m?.id;
    const bId = b => b?.barangay_id || b?.id;

    // Prefill cascading dropdowns on mount
    useEffect(() => {
        if (!savedAddress?.region_id) {
            isMountCascade.current = false;
            return;
        }

        const region = allRegions.find(r => String(rId(r)) === String(savedAddress.region_id));
        if (!region) { isMountCascade.current = false; return; }

        const provList = getProvinces(region);
        setProvinces(provList);

        if (savedAddress.province_id) {
            const prov = provList.find(p => String(pId(p)) === String(savedAddress.province_id));
            if (prov) {
                const munList = getMunicipalities(prov);
                setMunicipalities(munList);

                if (savedAddress.municipality_id) {
                    const mun = munList.find(m => String(mId(m)) === String(savedAddress.municipality_id));
                    if (mun) setBarangays(getBarangays(mun));
                }
            }
        }

        setTimeout(() => { isMountCascade.current = false; }, 200);
    }, []);

    // Cascade: Region -> Province
    useEffect(() => {
        if (isMountCascade.current) return;
        const region = allRegions.find(r => String(rId(r)) === String(data.region_id));
        setProvinces(getProvinces(region));
        setMunicipalities([]);
        setBarangays([]);
        setData(prev => ({ ...prev, province_id: '', municipality_id: '', barangay_id: '' }));
    }, [data.region_id]);

    // Cascade: Province -> Municipality
    useEffect(() => {
        if (isMountCascade.current) return;
        const prov = provinces.find(p => String(pId(p)) === String(data.province_id));
        setMunicipalities(getMunicipalities(prov));
        setBarangays([]);
        setData(prev => ({ ...prev, municipality_id: '', barangay_id: '' }));
    }, [data.province_id]);

    // Cascade: Municipality -> Barangay
    useEffect(() => {
        if (isMountCascade.current) return;
        const mun = municipalities.find(m => String(mId(m)) === String(data.municipality_id));
        setBarangays(getBarangays(mun));
        setData(prev => ({ ...prev, barangay_id: '' }));
    }, [data.municipality_id]);

    const totalAmount = checkoutItems.reduce((acc, item) => acc + item.subtotal, 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('customer.checkout.store'));
    };

    const labelClass = "text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2";
    const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-semibold focus:ring-2 focus:ring-[#3BAA35]/20 focus:border-[#3BAA35] transition-all";
    const selectClass = "w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-semibold focus:ring-2 focus:ring-[#3BAA35]/20 focus:border-[#3BAA35] transition-all appearance-none cursor-pointer disabled:opacity-40";

    return (
        <UserLayout activeTab="cart">
            <Head title="Checkout Protocol | D'SERICORE" />

            <div className="bg-white border-b border-slate-100 py-12 lg:py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="w-10 h-px bg-[#C9A227]" />
                                <span className="text-[#3BAA35] text-[11px] font-bold uppercase tracking-[0.3em]">Final Acquisition Protocol</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-[#0B1F3B] tracking-tight uppercase">
                                Secure <span className="text-[#3BAA35]">Checkout</span>
                            </h1>
                            <p className="max-w-xl text-slate-500 font-medium text-sm leading-relaxed">
                                Please review your acquisition summary and provide the necessary settlement details to finalize the transaction.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12 w-full">
                <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-12">
                    
                    <div className="flex-1 space-y-12">
                        
                        {/* 1. Recipient Information */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#0B1F3B] text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-[#0B1F3B]/20">1</div>
                                <h2 className="text-xl font-bold text-[#0B1F3B] uppercase tracking-tight">Recipient Details</h2>
                            </div>
                            
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[#0B1F3B]">
                                    <div className="space-y-2">
                                        <label className={labelClass}><UserIcon size={12} className="text-[#3BAA35]" /> Full Name</label>
                                        <input type="text" value={data.customer_name} onChange={e => setData('customer_name', e.target.value)} className={inputClass} placeholder="Full Name" />
                                        {errors.customer_name && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.customer_name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className={labelClass}><Phone size={12} className="text-[#3BAA35]" /> Contact Number</label>
                                        <input type="text" value={data.contact} onChange={e => setData('contact', e.target.value)} className={inputClass} placeholder="Contact Number" />
                                        {errors.contact && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.contact}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className={labelClass}><MapPin size={12} className="text-[#3BAA35]" /> Region</label>
                                        <select value={data.region_id} onChange={e => setData('region_id', e.target.value)} className={selectClass}>
                                            <option value="">Select Region</option>
                                            {allRegions.map(r => (
                                                <option key={rId(r)} value={String(rId(r))}>{r.regDesc || r.region_description}</option>
                                            ))}
                                        </select>
                                        {errors.region_id && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.region_id}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className={labelClass}><MapPin size={12} className="text-[#3BAA35]" /> Province</label>
                                        <select value={data.province_id} onChange={e => setData('province_id', e.target.value)} className={selectClass} disabled={provinces.length === 0}>
                                            <option value="">Select Province</option>
                                            {provinces.map(p => (
                                                <option key={pId(p)} value={String(pId(p))}>{p.provDesc || p.province_name}</option>
                                            ))}
                                        </select>
                                        {errors.province_id && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.province_id}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className={labelClass}><MapPin size={12} className="text-[#3BAA35]" /> City / Municipality</label>
                                        <select value={data.municipality_id} onChange={e => setData('municipality_id', e.target.value)} className={selectClass} disabled={municipalities.length === 0}>
                                            <option value="">Select Municipality</option>
                                            {municipalities.map(m => (
                                                <option key={mId(m)} value={String(mId(m))}>{m.citymunDesc || m.municipality_name}</option>
                                            ))}
                                        </select>
                                        {errors.municipality_id && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.municipality_id}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className={labelClass}><MapPin size={12} className="text-[#3BAA35]" /> Barangay</label>
                                        <select value={data.barangay_id} onChange={e => setData('barangay_id', e.target.value)} className={selectClass} disabled={barangays.length === 0}>
                                            <option value="">Select Barangay</option>
                                            {barangays.map(b => (
                                                <option key={bId(b)} value={String(bId(b))}>{getBarangayName(b)}</option>
                                            ))}
                                        </select>
                                        {errors.barangay_id && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.barangay_id}</p>}
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className={labelClass}><MapPin size={12} className="text-[#3BAA35]" /> Street Name, Building, House No.</label>
                                        <textarea 
                                            rows="3"
                                            value={data.address} 
                                            onChange={e => setData('address', e.target.value)} 
                                            className={`${inputClass} resize-none`} 
                                            placeholder="e.g. 123 Silk St., Seri Bldg." 
                                        />
                                        {errors.address && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.address}</p>}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Settlement Method */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#0B1F3B] text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-[#0B1F3B]/20">2</div>
                                <h2 className="text-xl font-bold text-[#0B1F3B] uppercase tracking-tight">Settlement Method</h2>
                            </div>

                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { id: 'cash', label: 'Cash on Delivery', icon: Wallet, desc: 'Settle upon receipt' },
                                        { id: 'gcash', label: 'GCash e-Wallet', icon: CreditCard, desc: 'Digital transfer' },
                                        { id: 'bank', label: 'Bank Transfer', icon: Truck, desc: 'Direct deposit' },
                                    ].map((method) => (
                                        <button key={method.id} type="button" onClick={() => setData('payment_method', method.id)} className={`p-5 rounded-2xl border-2 text-left transition-all ${data.payment_method === method.id ? 'border-[#3BAA35] bg-[#3BAA35]/5 shadow-sm' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}>
                                            <method.icon size={24} className={data.payment_method === method.id ? 'text-[#3BAA35]' : 'text-slate-400'} />
                                            <p className={`text-sm font-bold mt-3 uppercase tracking-tight ${data.payment_method === method.id ? 'text-[#0B1F3B]' : 'text-slate-600'}`}>{method.label}</p>
                                            <p className="text-[10px] text-slate-400 font-medium mt-1">{method.desc}</p>
                                        </button>
                                    ))}
                                </div>

                                {data.payment_method !== 'cash' && (
                                    <div className="p-6 bg-white border border-slate-100 rounded-2xl text-[#0B1F3B] space-y-6 h-full animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <h4 className="text-xs font-bold uppercase tracking-widest text-[#3BAA35]">Payment Instructions</h4>
                                                <p className="text-sm font-bold">SRDI Institutional Account</p>
                                            </div>
                                            <ShieldCheck className="text-[#3BAA35]" size={24} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#C9A227]">Account Name</p>
                                                    <p className="text-xs font-black">SRDI - SERICULTURE ERP</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#C9A227]">Account / Mobile No.</p>
                                                    <p className="text-xs font-black">{data.payment_method === 'gcash' ? '0912-345-6789' : '9876-5432-10 (LandBank)'}</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-end">
                                                <div className="w-24 h-24 bg-slate-50 rounded-xl p-2 flex items-center justify-center border-4 border-[#3BAA35]/20">
                                                    <span className="text-[8px] text-slate-300 font-bold uppercase text-center leading-tight">Official QR Code</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 space-y-4">
                                            <div className="space-y-2">
                                                <label className={labelClass}>Transaction Reference No.</label>
                                                <input 
                                                    type="text"
                                                    value={data.reference_no}
                                                    onChange={e => setData('reference_no', e.target.value)}
                                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#3BAA35]/20 focus:border-[#3BAA35] transition-all"
                                                    placeholder="Reference Number from payment app"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className={labelClass}>Proof of Remittance (Receipt)</label>
                                                <div className="relative h-20 w-full border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center hover:border-[#3BAA35]/30 transition-all cursor-pointer bg-slate-50/50">
                                                    <input 
                                                        type="file"
                                                        onChange={e => setData('receipt', e.target.files[0])}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                    />
                                                    {data.receipt ? (
                                                        <span className="text-xs font-bold flex items-center gap-2 text-[#3BAA35]"><CheckCircle2 size={16} /> {data.receipt.name.substring(0, 15)}...</span>
                                                    ) : (
                                                        <>
                                                            <ImageIcon size={20} className="text-slate-400 mb-1" />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Capture or Upload Receipt</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:w-96 shrink-0 space-y-6">
                        <div className="bg-white rounded-3xl p-8 text-[#0B1F3B] border border-slate-100 shadow-xl shadow-slate-200/50 sticky top-24">
                            <h3 className="text-lg font-bold uppercase tracking-tight mb-8 flex items-center gap-3">
                                <Package className="text-[#3BAA35]" size={20} /> Order Summary
                            </h3>
                            
                            <div className="space-y-6 mb-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {checkoutItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-center group">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.product} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center opacity-20"><Package size={16} /></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-bold text-[#0B1F3B] uppercase truncate leading-tight">{item.product}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.quantity} units × ₱{Number(item.price).toLocaleString()}</p>
                                        </div>
                                        <p className="text-xs font-black text-[#3BAA35]">₱{Number(item.subtotal).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-100">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-400 font-bold uppercase tracking-widest">Selected Assets</span>
                                    <span className="font-bold">{checkoutItems.length} categories</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-400 font-bold uppercase tracking-widest">Logistics Unit</span>
                                    <span className="font-bold text-[#3BAA35]">Standard Shipping</span>
                                </div>
                                <div className="pt-6 mt-6 border-t border-slate-50 flex flex-col gap-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Acquisition Value</p>
                                    <p className="text-4xl font-black text-[#0B1F3B] text-right tracking-tighter">
                                        ₱{Number(totalAmount).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={processing}
                                className="w-full mt-10 flex items-center justify-center gap-4 py-5 px-6 bg-[#3BAA35] text-white rounded-2xl hover:bg-[#2e8b2a] shadow-lg shadow-[#3BAA35]/20 transition-all font-black text-xs uppercase tracking-[0.2em] active:scale-95 disabled:opacity-50"
                            >
                                {processing ? 'Processing...' : 'Authorize Acquisition'}
                                <ArrowRight size={20} />
                            </button>

                            <p className="mt-8 text-[9px] text-center text-slate-400 font-medium leading-relaxed uppercase tracking-[0.05em]">
                                By authorizing, you agree to the <span className="text-[#3BAA35] font-bold">SRDI Acquisition Protocols</span> and formal research-grade asset handovers.
                            </p>
                        </div>

                        <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100 flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm text-[#3BAA35]">
                                <ShieldCheck size={32} />
                            </div>
                            <div>
                                <h5 className="text-[11px] font-black text-[#0B1F3B] uppercase tracking-wider mb-0.5">Global Integrity</h5>
                                <p className="text-[10px] text-slate-500 font-medium leading-tight">Institutional grade encryption & research asset insurance.</p>
                            </div>
                        </div>
                    </div>

                </form>
            </main>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </UserLayout>
    );
}
