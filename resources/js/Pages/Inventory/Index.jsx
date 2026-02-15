import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function InventoryIndex({ auth, inventory = [] }) {
    // 1. States
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({
        quantity: 1,
        type: 'in',
        batch_code: '',
        remarks: '',
        restock_date: ''
    });

    // 2. Flash Message Listener
    const { flash } = usePage().props;
    useEffect(() => {
        if (flash?.message) {
            toast.success(flash.message);
        }
    }, [flash]);

    // 3. Search Logic
    const filteredInventory = inventory.filter(item => 
        item.product.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 4. Modal Handlers
    const openModal = (product, type) => {
        setSelectedProduct(product);
        setFormData({ 
            quantity: 1, 
            type: type, 
            batch_code: '', 
            remarks: '',
            // Fetch the existing restock_date from the database product
            restock_date: product.restock_date || '' 
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post(route('inventory.adjust'), {
            product_id: selectedProduct.id,
            ...formData
        }, {
            onSuccess: () => {
                setIsModalOpen(false);
                toast.success(`Inventory updated for ${selectedProduct.product}`);
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(firstError || 'Update failed.');
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Silk Stock Control">
            <Head title="Inventory Management" />
            <Toaster position="top-right" reverseOrder={false} />
            
            <div className="space-y-6 max-w-7xl mx-auto p-4 lg:p-8">
                
                {/* SEARCH BAR SECTION */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 flex flex-wrap gap-4 items-center justify-between shadow-sm">
                    <div className="flex gap-2">
                        <div className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">
                            Live Inventory
                        </div>
                    </div>
                    <div className="relative w-full md:w-80">
                        <input 
                            type="text" 
                            placeholder="Search product name..." 
                            className="bg-slate-50 border-none rounded-2xl text-sm w-full focus:ring-2 focus:ring-indigo-500 pl-5 py-3.5 shadow-inner"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* MAIN TABLE */}
                <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Product Item</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Current Stock</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Restock Schedule</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                               {filteredInventory.map((item) => {
                                // Kunin ang stock mula sa relationship, default to 0 kung wala pang record
                                const stockLevel = item.inventory?.quantity ?? 0; 
                                const isOutOfStock = stockLevel <= 0;

                                    return (
                                        <tr key={item.id} className={`transition group ${isOutOfStock ? 'bg-rose-50/20' : 'hover:bg-slate-50/50'}`}>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${isOutOfStock ? 'bg-rose-100 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                                        {item.product.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 text-md uppercase italic leading-none">{item.product}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest italic">Batch tracking enabled</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                {isOutOfStock ? (
                                                    <span className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[9px] font-black uppercase tracking-widest">Sold Out</span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-widest">Active</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className={`text-2xl font-black tracking-tighter ${isOutOfStock ? 'text-rose-600' : 'text-slate-900'}`}>
                                                        {stockLevel}
                                                    </span>
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Units</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                {/* 1. Access via item.inventory relationship */}
                                                {item.inventory?.restock_date ? (
                                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl">
                                                        <span className="text-[10px] font-black uppercase italic">
                                                            {new Date(item.inventory.restock_date).toLocaleDateString('en-US', { 
                                                                month: 'short', 
                                                                day: 'numeric', 
                                                                year: 'numeric' 
                                                            })}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-300 text-[9px] font-black italic uppercase tracking-widest">
                                                        No Schedule
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex justify-end items-center gap-2">
                                                    <button 
                                                        onClick={() => openModal(item, 'out')}
                                                        className="h-10 w-10 flex items-center justify-center rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-all font-black text-xl active:scale-90"
                                                    >
                                                        −
                                                    </button>
                                                    <button 
                                                        onClick={() => openModal(item, 'in')}
                                                        className="h-10 w-10 flex items-center justify-center rounded-xl border border-emerald-100 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all font-black text-xl active:scale-90"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ADJUSTMENT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] p-10 w-full max-w-lg shadow-2xl border border-slate-100">
                        <div className="mb-8 text-center">
                            <h2 className={`text-3xl font-black italic uppercase tracking-tighter ${formData.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                Stock {formData.type === 'in' ? 'Incoming' : 'Outgoing'}
                            </h2>
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Item: {selectedProduct?.product}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4 mb-1 block">Quantity</label>
                                    <input 
                                        type="number" required min="0"
                                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-black text-lg focus:ring-2 focus:ring-indigo-500"
                                        value={formData.quantity}
                                        onChange={e => setFormData({...formData, quantity: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4 mb-1 block">Batch No.</label>
                                    <input 
                                        type="text" placeholder="Optional"
                                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold focus:ring-2 focus:ring-indigo-500"
                                        value={formData.batch_code}
                                        onChange={e => setFormData({...formData, batch_code: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] font-black uppercase text-slate-400 ml-4 mb-1 block">Update Restock Date</label>
                                <input 
                                    type="date"
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold focus:ring-2 focus:ring-indigo-500"
                                    value={formData.restock_date}
                                    onChange={e => setFormData({...formData, restock_date: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="text-[9px] font-black uppercase text-slate-400 ml-4 mb-1 block">Adjustment Remarks</label>
                                <textarea 
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 h-24 resize-none font-medium focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Add reason for adjustment..."
                                    value={formData.remarks}
                                    onChange={e => setFormData({...formData, remarks: e.target.value})}
                                />
                            </div>

                            <div className="flex flex-col gap-2 pt-4">
                                <button 
                                    type="submit" 
                                    className={`w-full py-4 font-black text-white rounded-2xl shadow-lg transition active:scale-95 uppercase italic tracking-widest ${formData.type === 'in' ? 'bg-emerald-500 shadow-emerald-100' : 'bg-rose-500 shadow-rose-100'}`}
                                >
                                    Confirm Adjustment
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)} 
                                    className="w-full py-3 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-slate-600 transition"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}