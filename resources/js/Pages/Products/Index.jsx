import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import toast, { Toaster } from 'react-hot-toast';

export default function Index({ products, categories }) {
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        product: '',
        category_id: '',
        status: 'active',
        image_path: '',
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
                            <Link
                                href={route('products.show', product.id)}
                                key={product.id}
                                className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden block"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={product.image_path || 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=400'}
                                        alt={product.product}
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm">
                                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{product.category?.category || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">{product.product}</h3>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Status</span>
                                            <span className={`text-sm font-bold capitalize ${product.status === 'active' ? 'text-emerald-600' : 'text-slate-500'
                                                }`}>
                                                {product.status}
                                            </span>
                                        </div>
                                        <div className="p-2 bg-slate-50 rounded-xl text-indigo-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
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
                                                <InputLabel htmlFor="product" value="Product Name" className="font-bold" />
                                                <TextInput
                                                    id="product"
                                                    value={data.product}
                                                    onChange={(e) => setData('product', e.target.value)}
                                                    className="mt-1 block w-full bg-slate-50 border-slate-200"
                                                    placeholder="e.g. Bivoltine Eggs"
                                                    required
                                                />
                                                <InputError message={errors.product} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="category_id" value="Category" className="font-bold" />
                                                <select
                                                    id="category_id"
                                                    value={data.category_id}
                                                    onChange={(e) => setData('category_id', e.target.value)}
                                                    className="mt-1 block w-full border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm text-sm"
                                                    required
                                                >
                                                    <option value="">Select a Category</option>
                                                    {categories && categories.map(cat => (
                                                        <option key={cat.id} value={cat.id}>{cat.category}</option>
                                                    ))}
                                                </select>
                                                <InputError message={errors.category_id} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="status" value="Status" className="font-bold" />
                                                <select
                                                    id="status"
                                                    value={data.status}
                                                    onChange={(e) => setData('status', e.target.value)}
                                                    className="mt-1 block w-full border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm text-sm"
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                    <option value="archived">Archived</option>
                                                </select>
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