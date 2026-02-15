import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import toast, { Toaster } from 'react-hot-toast';

export default function Show({ auth, product, categories }) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [preview, setPreview] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        product: product.product || '',
        category_id: product.category_id || '',
        status: product.status || 'active',
        price: product.price || '', // Added Price
        image: null,
        description: product.description || '', // Added Description
        _method: 'PUT'
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        post(route('products.update', product.id), {
            forceFormData: true,
            onSuccess: () => {
                setIsEditOpen(false);
                setPreview(null);
                toast.success('Product updated successfully!');
            },
            onError: () => {
                toast.error('Failed to update product.');
            }
        });
    };

    const handleDelete = () => {
        router.delete(route('products.destroy', product.id), {
            onSuccess: () => {
                toast.success('Product deleted successfully!');
            },
            onError: () => {
                toast.error('Failed to delete product.');
            }
        });
    };

    if (!product) return <div>Loading...</div>;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-xl text-slate-800 leading-tight">Product Details</h2>}
        >
            <Head title={product.product} />
            <Toaster position="top-right" />

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="mb-6">
                    <Link
                        href={route('products.index')}
                        className="flex items-center text-indigo-600 hover:text-indigo-800 font-bold transition"
                    >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Inventory
                    </Link>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100 flex flex-col md:flex-row">
                    {/* Image Section */}
                    <div className="md:w-1/2 h-96 md:h-auto relative bg-slate-50">
                        <img 
                            src={product.image_url || 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=800'} 
                            alt={product.product}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-6 left-6">
                            <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-sm font-bold text-indigo-600 shadow-sm uppercase tracking-wider">
                                {product.category?.category || 'Uncategorized'}
                            </span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                        <div className="mb-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">{product.product}</h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ₱   {
                                    product.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                                    product.status === 'inactive' ? 'bg-amber-100 text-amber-700' : 
                                    'bg-slate-100 text-slate-600'
                                }`}>
                                    {product.status}
                                </span>
                            </div>

                            {/* Price Display */}
                            <div className="mb-8">
                                <span className="text-4xl font-black text-indigo-600">
                                    ₱   {Number(product.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                    <h3 className="text-sm uppercase tracking-widest text-slate-400 font-bold mb-2">Category Information</h3>
                                    <p className="font-medium text-slate-700">{product.category ? product.category.category : 'No category assigned'}</p>
                                </div>
                                
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                    <h3 className="text-sm uppercase tracking-widest text-slate-400 font-bold mb-2">Description</h3>
                                    <p className="font-mono text-slate-600">{product.description}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100 flex gap-4">
                            <button 
                                onClick={() => setIsEditOpen(true)}
                                className="flex-1 bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                            >
                                Edit Product
                            </button>
                            <button 
                                onClick={() => setIsDeleteOpen(true)}
                                className="px-6 py-4 bg-rose-50 text-rose-600 font-bold rounded-2xl hover:bg-rose-100 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* Edit Modal */}
                <Transition show={isEditOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={() => setIsEditOpen(false)}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-in-out duration-500"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in-out duration-500"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-hidden">
                            <div className="absolute inset-0 overflow-hidden">
                                <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                                    <Transition.Child
                                        as={Fragment}
                                        enter="transform transition ease-in-out duration-500"
                                        enterFrom="translate-x-full"
                                        enterTo="translate-x-0"
                                        leave="transform transition ease-in-out duration-500"
                                        leaveFrom="translate-x-0"
                                        leaveTo="translate-x-full"
                                    >
                                        <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                            <div className="flex h-full flex-col bg-white shadow-2xl rounded-l-[3rem] overflow-hidden">
                                                
                                                <div className="px-8 py-10 bg-indigo-600 text-white">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <Dialog.Title className="text-2xl font-black tracking-tight">
                                                                Edit Product
                                                            </Dialog.Title>
                                                            <p className="mt-2 text-indigo-100 text-sm">
                                                                Update product information
                                                            </p>
                                                        </div>
                                                        <button onClick={() => setIsEditOpen(false)} className="bg-indigo-500/50 p-2 rounded-xl text-white hover:bg-indigo-700 transition">
                                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>

                                                <form onSubmit={handleUpdate} className="relative flex-1 px-8 py-8 overflow-y-auto space-y-6">
                                                    
                                                    {/* Image Upload Area */}
                                                    <div className="space-y-2">
                                                        <InputLabel value="Product Showcase" className="text-[10px] font-black uppercase text-slate-400 tracking-widest" />
                                                        <div className={`mt-2 flex justify-center rounded-[2rem] border-2 border-dashed transition-all overflow-hidden relative ₱   {preview || product.image_url ? 'border-indigo-400 h-56' : 'border-slate-300 py-10'}`}>
                                                            {(preview || product.image_url) ? (
                                                                <>
                                                                    <img src={preview || product.image_url} alt="Preview" className="w-full h-full object-cover" />
                                                                    <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <label htmlFor="file-upload-edit" className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-xl font-bold text-sm shadow-xl">
                                                                            Change Image
                                                                        </label>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="text-center">
                                                                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                                        <svg className="h-8 w-8 text-slate-300" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                        </svg>
                                                                    </div>
                                                                    <label htmlFor="file-upload-edit" className="cursor-pointer text-sm font-black text-indigo-600 hover:text-indigo-500">
                                                                        <span>Click to upload</span>
                                                                    </label>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <input id="file-upload-edit" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                                                        <InputError message={errors.image} />
                                                    </div>

                                                    {/* Product Name */}
                                                    <div>
                                                        <InputLabel htmlFor="product" value="Item Name" className="text-[10px] font-black uppercase text-slate-400 tracking-widest" />
                                                        <TextInput
                                                            id="product"
                                                            value={data.product}
                                                            onChange={(e) => setData('product', e.target.value)}
                                                            className="mt-2 block w-full bg-slate-50 border-slate-200 focus:ring-indigo-600 rounded-2xl"
                                                            required
                                                        />
                                                        <InputError message={errors.product} />
                                                    </div>

                                                    {/* Price Field */}
                                                    <div>
                                                        <InputLabel htmlFor="price" value="Price (₱ )" className="text-[10px] font-black uppercase text-slate-400 tracking-widest" />
                                                        <TextInput
                                                            id="price"
                                                            type="number"
                                                            step="0.01"
                                                            value={data.price}
                                                            onChange={(e) => setData('price', e.target.value)}
                                                            className="mt-2 block w-full bg-slate-50 border-slate-200 focus:ring-indigo-600 rounded-2xl"
                                                            placeholder="0.00"
                                                            required
                                                        />
                                                        <InputError message={errors.price} />
                                                    </div>

                                                    {/* Category & Status */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <InputLabel value="Category" className="text-[10px] font-black uppercase text-slate-400 tracking-widest" />
                                                            <select
                                                                value={data.category_id}
                                                                onChange={(e) => setData('category_id', e.target.value)}
                                                                className="mt-2 block w-full border-slate-200 bg-slate-50 rounded-2xl text-sm focus:ring-indigo-600 focus:border-indigo-600 transition"
                                                                required
                                                            >
                                                                <option value="">Choose...</option>
                                                                {categories?.map(cat => (
                                                                    <option key={cat.id} value={cat.id}>{cat.category}</option>
                                                                ))}
                                                            </select>
                                                            <InputError message={errors.category_id} />
                                                        </div>
                                                        <div>
                                                            <InputLabel value="Availability" className="text-[10px] font-black uppercase text-slate-400 tracking-widest" />
                                                            <select
                                                                value={data.status}
                                                                onChange={(e) => setData('status', e.target.value)}
                                                                className="mt-2 block w-full border-slate-200 bg-slate-50 rounded-2xl text-sm focus:ring-indigo-600 focus:border-indigo-600 transition"
                                                            >
                                                                <option value="active">Active</option>
                                                                <option value="inactive">Inactive</option>
                                                            </select>
                                                            <InputError message={errors.status} />
                                                        </div>
                                                    </div>

                                                    <div className="pt-10 flex gap-3">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setIsEditOpen(false)}
                                                            className="flex-1 px-6 py-4 border-2 border-slate-100 text-slate-400 font-bold rounded-2xl hover:bg-slate-50 transition uppercase text-xs tracking-widest"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <PrimaryButton className="flex-[2] justify-center py-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100 uppercase text-xs tracking-widest font-black" disabled={processing}>
                                                            {processing ? 'Updating...' : 'Save Changes'}
                                                        </PrimaryButton>
                                                    </div>
                                                </form>
                                            </div>
                                        </Dialog.Panel>
                                    </Transition.Child>
                                </div>
                            </div>
                        </div>
                    </Dialog>
                </Transition>

                {/* Delete Confirmation Modal (Same as before) */}
                <Transition show={isDeleteOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={() => setIsDeleteOpen(false)}>
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        </Transition.Child>
                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4">
                                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[2rem] bg-white p-8 shadow-2xl transition-all">
                                        <div className="text-center">
                                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
                                                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                            </div>
                                            <Dialog.Title className="text-2xl font-black text-slate-900 mb-2">Delete Product?</Dialog.Title>
                                            <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete "{product.product}"? This action cannot be undone.</p>
                                            <div className="flex gap-3">
                                                <button onClick={() => setIsDeleteOpen(false)} className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition">Cancel</button>
                                                <button onClick={handleDelete} className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition">Delete</button>
                                            </div>
                                        </div>
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