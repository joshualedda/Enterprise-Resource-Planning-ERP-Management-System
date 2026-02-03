import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import toast, { Toaster } from 'react-hot-toast';

export default function Index({ products }) { // Note: Receiving products as a prop from Laravel
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        category: 'Biological',
        price: '',
        stock: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('products.store'), {
            onSuccess: () => {
                setIsOpen(false);
                reset();
                toast.success('Product added to inventory!');
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-bold text-xl text-slate-800 leading-tight">Product Inventory</h2>}
        >
            <Head title="Products Management" />
            <Toaster position="top-right" />

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
                
                {/* --- HEADER ACTIONS --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto">
                        <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md">All Products</button>
                        <button className="px-6 py-2 text-slate-500 hover:text-indigo-600 rounded-xl text-sm font-bold transition">Categories</button>
                    </div>
                    
                    <button 
                        onClick={() => setIsOpen(true)}
                        className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        New Product
                    </button>
                </div>

                {/* --- PRODUCT GRID --- */}
                {products && products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                                <div className="relative h-48 overflow-hidden">
                                    <img 
                                        src={product.image || 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=400'} 
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm">
                                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{product.category}</span>
                                    </div>
                                </div>
                                
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">{product.name}</h3>
                                    <p className="text-indigo-600 font-black text-xl mb-4">₱{parseFloat(product.price).toLocaleString()}</p>
                                    
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Stock Level</span>
                                            <span className={`text-sm font-bold ${product.stock < 10 ? 'text-rose-500' : 'text-slate-700'}`}>
                                                {product.stock} units
                                            </span>
                                        </div>
                                        <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No products found</h3>
                        <p className="text-slate-500 mt-2">Get started by adding your first product to the inventory.</p>
                    </div>
                )}

                {/* --- NEW PRODUCT MODAL --- */}
                <Transition show={isOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[2.5rem] bg-white p-8 text-left shadow-2xl transition-all border border-slate-100">
                                        <div className="flex justify-between items-center mb-6">
                                            <Dialog.Title className="text-xl font-black text-slate-900">Add New Product</Dialog.Title>
                                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>

                                        <form onSubmit={submit} className="space-y-4">
                                            <div>
                                                <InputLabel htmlFor="name" value="Product Name" className="font-bold" />
                                                <TextInput
                                                    id="name"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    className="mt-1 block w-full bg-slate-50 border-slate-200"
                                                    placeholder="e.g. Bivoltine Eggs"
                                                    required
                                                />
                                                <InputError message={errors.name} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="category" value="Category" className="font-bold" />
                                                <select 
                                                    id="category"
                                                    value={data.category}
                                                    onChange={(e) => setData('category', e.target.value)}
                                                    className="mt-1 block w-full border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm text-sm"
                                                >
                                                    <option>Biological</option>
                                                    <option>Planting</option>
                                                    <option>Equipment</option>
                                                    <option>Finished Goods</option>
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <InputLabel htmlFor="price" value="Price (₱)" className="font-bold" />
                                                    <TextInput
                                                        id="price"
                                                        type="number"
                                                        value={data.price}
                                                        onChange={(e) => setData('price', e.target.value)}
                                                        className="mt-1 block w-full bg-slate-50 border-slate-200"
                                                        placeholder="0.00"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <InputLabel htmlFor="stock" value="Initial Stock" className="font-bold" />
                                                    <TextInput
                                                        id="stock"
                                                        type="number"
                                                        value={data.stock}
                                                        onChange={(e) => setData('stock', e.target.value)}
                                                        className="mt-1 block w-full bg-slate-50 border-slate-200"
                                                        placeholder="0"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-4">
                                                <PrimaryButton className="w-full justify-center py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-100" disabled={processing}>
                                                    {processing ? 'Saving...' : 'Add to Inventory'}
                                                </PrimaryButton>
                                            </div>
                                        </form>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </div>
        </AuthenticatedLayout>
    );
}