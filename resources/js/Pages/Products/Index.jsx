import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import toast, { Toaster } from 'react-hot-toast';

export default function Index({ auth, products, categories }) {
    const [isOpen, setIsOpen] = useState(false);
    const [preview, setPreview] = useState(null);
    const [activeTab, setActiveTab] = useState('products');
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        product: '',
        category_id: '',
        status: 'active',
        price: '',
        image: null,
        description: null,
    });

    const categoryForm = useForm({
        category: '',
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

    const submit = (e) => {
        e.preventDefault();
        post(route('products.store'), {
            forceFormData: true,
            onSuccess: () => {
                setIsOpen(false);
                reset();
                setPreview(null);
                toast.success('Product successfully added!');
            },
            onError: () => {
                toast.error('Failed to add product. Please check the form.');
            }
        });
    };

    const handleAddCategory = () => {
        setEditingCategory(null);
        categoryForm.reset();
        setIsCategoryModalOpen(true);
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        categoryForm.setData('category', category.category);
        setIsCategoryModalOpen(true);
    };

    const submitCategory = (e) => {
        e.preventDefault();
        if (editingCategory) {
            categoryForm.put(route('categories.update', editingCategory.id), {
                onSuccess: () => {
                    setIsCategoryModalOpen(false);
                    categoryForm.reset();
                    setEditingCategory(null);
                    toast.success('Category updated successfully!');
                },
                onError: () => {
                    toast.error('Failed to update category.');
                }
            });
        } else {
            categoryForm.post(route('categories.store'), {
                onSuccess: () => {
                    setIsCategoryModalOpen(false);
                    categoryForm.reset();
                    toast.success('Category added successfully!');
                },
                onError: () => {
                    toast.error('Failed to add category.');
                }
            });
        }
    };

    const handleDeleteCategory = (categoryId) => {
        if (confirm('Are you sure you want to delete this category?')) {
            categoryForm.delete(route('categories.destroy', categoryId), {
                onSuccess: () => {
                    toast.success('Category deleted successfully!');
                },
                onError: () => {
                    toast.error('Failed to delete category.');
                }
            });
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(price);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-xl text-slate-800 leading-tight">Product Inventory</h2>}
        >
            <Head title="Products Management" />
            <Toaster position="top-right" />

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto">
                        <button 
                            onClick={() => setActiveTab('products')}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition ${
                                activeTab === 'products' 
                                    ? 'bg-indigo-600 text-white shadow-md' 
                                    : 'text-slate-500 hover:text-indigo-600'
                            }`}
                        >
                            All Products
                        </button>
                        <button 
                            onClick={() => setActiveTab('categories')}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition ${
                                activeTab === 'categories' 
                                    ? 'bg-indigo-600 text-white shadow-md' 
                                    : 'text-slate-500 hover:text-indigo-600'
                            }`}
                        >
                            Categories
                        </button>
                    </div>

                    {activeTab === 'products' ? (
                        <button
                            onClick={() => setIsOpen(true)}
                            className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                            New Product
                        </button>
                    ) : (
                        <button
                            onClick={handleAddCategory}
                            className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                            New Category
                        </button>
                    )}
                </div>

                {activeTab === 'products' ? (
                    products && products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <Link
                                    href={route('products.show', product.id)}
                                    key={product.id}
                                    className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden block"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={product.image_url || 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=400'}
                                            alt={product.product}
                                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                        />
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm border border-white/50">
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{product.category?.category || 'No Category'}</span>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">{product.product}</h3>
                                        {product.price && (
                                            <p className="text-2xl font-black text-indigo-600 mb-2">{formatPrice(product.price)}</p>
                                        )}
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Status</span>
                                                <span className={`text-sm font-bold capitalize ${product.status === 'active' ? 'text-emerald-600' : 'text-slate-500'}`}>{product.status}</span>
                                            </div>
                                            <div className="p-2 bg-slate-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
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
                            <p className="text-slate-400 mt-2">Your inventory is currently empty.</p>
                        </div>
                    )
                ) : (
                    categories && categories.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 p-6"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-slate-900 truncate">{category.category}</h3>
                                            <p className="text-sm text-slate-500 mt-1">
                                                {category.products_count || 0} product{category.products_count !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditCategory(category)}
                                                className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(category.id)}
                                                className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-slate-100">
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                            <span className="uppercase tracking-wider font-bold">Category</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200">
                            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">No categories found</h3>
                            <p className="text-slate-400 mt-2">Start by creating your first category.</p>
                        </div>
                    )
                )}

                <Transition show={isOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
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
                                        enter="transform transition ease-in-out duration-500 sm:duration-700"
                                        enterFrom="translate-x-full"
                                        enterTo="translate-x-0"
                                        leave="transform transition ease-in-out duration-500 sm:duration-700"
                                        leaveFrom="translate-x-0"
                                        leaveTo="translate-x-full"
                                    >
                                        <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                            <div className="flex h-full flex-col bg-white shadow-2xl rounded-l-[3rem] overflow-hidden">
                                                
                                                <div className="px-8 py-10 bg-indigo-600 text-white">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <Dialog.Title className="text-2xl font-black tracking-tight">Add Product</Dialog.Title>
                                                            <p className="mt-2 text-indigo-100 text-sm">Update your on-site collection.</p>
                                                        </div>
                                                        <button onClick={() => setIsOpen(false)} className="bg-indigo-500/50 p-2 rounded-xl text-white hover:bg-indigo-700 transition">
                                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                </div>

                                                <form onSubmit={submit} className="relative flex-1 px-8 py-8 overflow-y-auto space-y-6">
                                                    
                                                    <div className="space-y-2">
                                                        <InputLabel value="Product Showcase" className="text-[10px] font-black uppercase text-slate-400 tracking-widest" />
                                                        <div className={`mt-2 flex justify-center rounded-[2rem] border-2 border-dashed transition-all overflow-hidden relative ${preview ? 'border-indigo-400 h-56' : 'border-slate-300 py-10'}`}>
                                                            {preview ? (
                                                                <>
                                                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                                                    <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <label htmlFor="file-upload" className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-xl font-bold text-sm shadow-xl">Change Image</label>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="text-center">
                                                                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                                        <svg className="h-8 w-8 text-slate-300" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                                    </div>
                                                                    <label htmlFor="file-upload" className="cursor-pointer text-sm font-black text-indigo-600 hover:text-indigo-500">
                                                                        <span>Click to upload</span>
                                                                        <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                                                                    </label>
                                                                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">PNG, JPG up to 2MB</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <InputError message={errors.image} />
                                                    </div>

                                                    <div>
                                                        <InputLabel htmlFor="product" value="Item Name" className="text-[10px] font-black uppercase text-slate-400 tracking-widest" />
                                                        <TextInput
                                                            id="product"
                                                            value={data.product}
                                                            onChange={(e) => setData('product', e.target.value)}
                                                            className="mt-2 block w-full bg-slate-50 border-slate-200 focus:ring-indigo-600 rounded-2xl"
                                                            placeholder="e.g. Silk Scarf Premium"
                                                            required
                                                        />
                                                        <InputError message={errors.product} />
                                                    </div>

                                                    <div>
                                                        <InputLabel htmlFor="price" value="Price (₱)" className="text-[10px] font-black uppercase text-slate-400 tracking-widest" />
                                                        <TextInput
                                                            id="price"
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={data.price}
                                                            onChange={(e) => setData('price', e.target.value)}
                                                            className="mt-2 block w-full bg-slate-50 border-slate-200 focus:ring-indigo-600 rounded-2xl"
                                                            placeholder="0.00"
                                                            required
                                                        />
                                                        <InputError message={errors.price} />
                                                    </div>

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
                                                            <InputLabel value="Status" className="text-[10px] font-black uppercase text-slate-400 tracking-widest" />
                                                            <select
                                                                value={data.status}
                                                                onChange={(e) => setData('status', e.target.value)}
                                                                className="mt-2 block w-full border-slate-200 bg-slate-50 rounded-2xl text-sm focus:ring-indigo-600 focus:border-indigo-600 transition"
                                                                required
                                                            >
                                                                <option value="active">Active</option>
                                                                <option value="inactive">Inactive</option>
                                                            </select>
                                                            <InputError message={errors.status} />
                                                        </div>
                                                    </div>

                                                 <div>
                                                    <InputLabel htmlFor="description" value="Description" className="text-[10px] font-black uppercase text-slate-400 tracking-widest" />
                                                    
                                                    {/* Gumamit ng textarea para sa multi-line support */}
                                                    <textarea
                                                        id="description"
                                                        value={data.description}
                                                        onChange={(e) => setData('description', e.target.value)}
                                                        className="mt-2 block w-full bg-slate-50 border-slate-200 focus:border-indigo-600 focus:ring-indigo-600 rounded-2xl min-h-[120px] py-3 px-4 text-sm transition-all"
                                                        placeholder="Enter product details, material info, or care instructions..."
                                                        required
                                                    />
                                                    
                                                    <InputError message={errors.description} />
                                                </div>

                                                    <div className="pt-10 flex gap-3">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setIsOpen(false)}
                                                            className="flex-1 px-6 py-4 border-2 border-slate-100 text-slate-400 font-bold rounded-2xl hover:bg-slate-50 transition uppercase text-xs tracking-widest"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <PrimaryButton 
                                                            className="flex-[2] justify-center py-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100 uppercase text-xs tracking-widest font-black" 
                                                            disabled={processing}
                                                        >
                                                            {processing ? 'Uploading...' : 'Confirm & Save'}
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

                <Transition show={isCategoryModalOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={() => setIsCategoryModalOpen(false)}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[2rem] bg-white p-8 shadow-2xl transition-all">
                                        <Dialog.Title className="text-2xl font-black text-slate-900 mb-6">
                                            {editingCategory ? 'Edit Category' : 'Add Category'}
                                        </Dialog.Title>
                                        
                                        <form onSubmit={submitCategory} className="space-y-6">
                                            <div>
                                                <InputLabel htmlFor="category" value="Category Name" className="text-[10px] font-black uppercase text-slate-400 tracking-widest" />
                                                <TextInput
                                                    id="category"
                                                    value={categoryForm.data.category}
                                                    onChange={(e) => categoryForm.setData('category', e.target.value)}
                                                    className="mt-2 block w-full bg-slate-50 border-slate-200 focus:ring-indigo-600 rounded-2xl"
                                                    placeholder="e.g. Electronics, Clothing"
                                                    required
                                                />
                                                <InputError message={categoryForm.errors.category} />
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCategoryModalOpen(false)}
                                                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition"
                                                >
                                                    Cancel
                                                </button>
                                                <PrimaryButton
                                                    className="flex-1 justify-center py-3 bg-indigo-600 rounded-xl"
                                                    disabled={categoryForm.processing}
                                                >
                                                    {categoryForm.processing ? 'Saving...' : editingCategory ? 'Update' : 'Add'}
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