import React, { useState, useMemo, Fragment, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { Dialog, Transition } from '@headlessui/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import toast, { Toaster } from 'react-hot-toast';
import {
    Search, Filter, Plus, X, Package, AlertTriangle,
    CheckCircle2, XCircle, Edit3, Trash2, Eye,
    ChevronDown, List, ImageIcon, ChevronRight
} from 'lucide-react';

// --- COMPONENTS ---
const StatCard = ({ label, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-10 flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            {trend && (
                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {trend.value}
                </span>
            )}
        </div>
        <div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</h3>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>
    </div>
);

export default function Index({ auth, products = [], categories = [] }) {
    const [activeTab, setActiveTab]         = useState('products');
    const [search, setSearch]               = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [stockFilter, setStockFilter]     = useState('All');
    const [sortBy, setSortBy]               = useState('Newest');
    const [currentPage, setCurrentPage]     = useState(1);
    const itemsPerPage = 8;

    const [isProductModalOpen, setIsProductModalOpen]   = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingProduct, setEditingProduct]   = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [preview, setPreview] = useState(null);

    const productForm = useForm({
        product: '', category_id: '', status: 'active', price: '', image: null, description: '',
    });

    const categoryForm = useForm({ category: '' });

    const stats = useMemo(() => {
        const total      = products.length;
        const inStock    = products.filter(p => (p.stock_count || 0) > 10).length;
        const lowStock   = products.filter(p => (p.stock_count || 0) > 0 && (p.stock_count || 0) <= 10).length;
        const outOfStock = products.filter(p => (p.stock_count || 0) <= 0).length;
        return { total, inStock, lowStock, outOfStock };
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products
            .filter(product => {
                const matchesSearch    = product.product?.toLowerCase().includes(search.toLowerCase());
                const matchesCategory  = categoryFilter === 'All' || product.category?.id == categoryFilter;
                const qty = product.stock_count || 0;
                const matchesStock =
                    stockFilter === 'All' ? true :
                    stockFilter === 'In Stock'     ? qty > 10 :
                    stockFilter === 'Low Stock'    ? qty > 0 && qty <= 10 :
                    stockFilter === 'Out of Stock' ? qty <= 0 : true;
                return matchesSearch && matchesCategory && matchesStock;
            })
            .sort((a, b) => {
                if (sortBy === 'Newest')     return new Date(b.created_at) - new Date(a.created_at);
                if (sortBy === 'Price High') return b.price - a.price;
                if (sortBy === 'Price Low')  return a.price - b.price;
                if (sortBy === 'Stock')      return (b.stock_count || 0) - (a.stock_count || 0);
                return 0;
            });
    }, [products, search, categoryFilter, stockFilter, sortBy]);

    useEffect(() => { setCurrentPage(1); }, [search, categoryFilter, stockFilter, sortBy]);

    const totalPages       = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= 3) {
            [1,2,3,4,'...',totalPages].forEach(p => pages.push(p));
        } else if (currentPage >= totalPages - 2) {
            [1,'...',totalPages-3,totalPages-2,totalPages-1,totalPages].forEach(p => pages.push(p));
        } else {
            [1,'...',currentPage-1,currentPage,currentPage+1,'...',totalPages].forEach(p => pages.push(p));
        }
        return pages;
    };

    // Product handlers
    const openProductModal = (product = null) => {
        setEditingProduct(product);
        setPreview(product?.image_url || null);
        productForm.clearErrors();
        if (product) {
            productForm.setData({
                product: product.product || '', category_id: product.category_id || '',
                status: product.status || 'active', price: product.price || '',
                image: null, description: product.description || '',
            });
        } else {
            productForm.reset();
            productForm.setData({ product: '', category_id: '', status: 'active', price: '', image: null, description: '' });
        }
        setIsProductModalOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            productForm.setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const submitProduct = (e) => {
        e.preventDefault();
        const url = editingProduct ? route('admin.products.update', editingProduct.id) : route('admin.products.store');
        const options = {
            forceFormData: true,
            onSuccess: () => {
                setIsProductModalOpen(false);
                productForm.reset();
                setEditingProduct(null);
                toast.success(`Product ${editingProduct ? 'updated' : 'added'} successfully!`);
            },
            onError: () => toast.error('Failed to save product. Check errors.'),
        };
        if (editingProduct) {
            productForm.transform(data => ({ ...data, _method: 'put' }));
            productForm.post(url, options);
        } else {
            productForm.transform(data => data);
            productForm.post(url, options);
        }
    };

    const deleteProduct = (product) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        router.delete(route('admin.products.destroy', product.id), {
            onSuccess: () => toast.success('Product deleted.'),
            onError:   () => toast.error('Failed to delete.'),
        });
    };

    // Category handlers
    const openCategoryModal = (category = null) => {
        setEditingCategory(category);
        categoryForm.clearErrors();
        categoryForm.setData('category', category ? category.category : '');
        setIsCategoryModalOpen(true);
    };

    const submitCategory = (e) => {
        e.preventDefault();
        const opts = {
            onSuccess: () => { setIsCategoryModalOpen(false); categoryForm.reset(); toast.success(editingCategory ? 'Category updated!' : 'Category added!'); }
        };
        editingCategory
            ? categoryForm.put(route('categories.update', editingCategory.id), opts)
            : categoryForm.post(route('categories.store'), opts);
    };

    const deleteCategory = (id) => {
        if (!confirm('Delete this category?')) return;
        router.delete(route('categories.destroy', id), { onSuccess: () => toast.success('Category deleted.') });
    };

    const formatPrice = (price) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Product Inventory" />
            <Toaster position="top-right" />

            <div className="mx-auto px-6 py-6 animate-in fade-in duration-500">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-800">Product Inventory</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage your products and stock levels</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => activeTab === 'products' ? openProductModal() : openCategoryModal()}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm shadow-emerald-100 transition-all active:scale-95"
                        >
                            <Plus size={18} />
                            {activeTab === 'products' ? 'New Product' : 'New Category'}
                        </button>
                    </div>
                </div>

                <hr className="border-slate-100 mb-6" />

                {/* Stat Cards */}
                {activeTab === 'products' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard label="Total Products"  value={stats.total}      icon={Package}     color="bg-indigo-500" />
                        <StatCard label="In Stock"        value={stats.inStock}    icon={CheckCircle2} color="bg-emerald-500" />
                        <StatCard label="Low Stock"       value={stats.lowStock}   icon={AlertTriangle} color="bg-amber-500" />
                        <StatCard label="Out of Stock"    value={stats.outOfStock} icon={XCircle}     color="bg-rose-500" />
                    </div>
                )}

                {/* Tabs */}
                <div className="bg-slate-100 p-1 rounded-xl inline-flex mb-6 w-full md:w-auto">
                    {['products', 'categories'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all capitalize ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            {tab === 'products' ? 'All Products' : 'Categories'}
                        </button>
                    ))}
                </div>

                {/* Search & Filter */}
                {activeTab === 'products' && (
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col xl:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full xl:w-96 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="text" placeholder="Search products..." value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm transition-all" />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                                className="pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 focus:ring-indigo-500 cursor-pointer">
                                <option value="All">All Categories</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.category}</option>)}
                            </select>
                            <select value={stockFilter} onChange={e => setStockFilter(e.target.value)}
                                className="pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 focus:ring-indigo-500 cursor-pointer">
                                <option value="All">All Status</option>
                                <option value="In Stock">In Stock</option>
                                <option value="Low Stock">Low Stock</option>
                                <option value="Out of Stock">Out of Stock</option>
                            </select>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                className="pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 focus:ring-indigo-500 cursor-pointer">
                                <option value="Newest">Newest First</option>
                                <option value="Stock">Stock Level</option>
                                <option value="Price High">Price: High to Low</option>
                                <option value="Price Low">Price: Low to High</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Content */}
                {activeTab === 'products' ? (
                    filteredProducts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                                {paginatedProducts.map(product => {
                                    const qty   = product.stock_count || 0;
                                    const isOut = qty <= 0;
                                    const isLow = qty > 0 && qty <= 10;
                                    return (
                                        <div key={product.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-all group relative">
                                            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="flex bg-white/90 backdrop-blur rounded-lg shadow-sm border border-slate-100 overflow-hidden">
                                                    <Link href={route('admin.products.show', product.id)} className="p-2 hover:bg-slate-50 text-indigo-600 border-r border-slate-100">
                                                        <Eye size={14} />
                                                    </Link>
                                                    <button onClick={() => openProductModal(product)} className="p-2 hover:bg-slate-50 text-emerald-600 border-r border-slate-100"><Edit3 size={14} /></button>
                                                    <button onClick={() => deleteProduct(product)} className="p-2 hover:bg-slate-50 text-rose-600"><Trash2 size={14} /></button>
                                                </div>
                                            </div>

                                            {/* ✅ FIXED: removed includes('img/') check — just use image_url directly */}
                                            <div className="aspect-[4/3] bg-slate-100 rounded-xl overflow-hidden mb-4 relative flex items-center justify-center">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.product}
                                                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isOut ? 'grayscale opacity-70' : ''}`}
                                                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                    />
                                                ) : null}
                                                <div className={`absolute inset-0 items-center justify-center bg-slate-50 text-slate-300 ${product.image_url ? 'hidden' : 'flex'}`}>
                                                    <ImageIcon className="w-12 h-12 opacity-50" />
                                                </div>
                                                {isOut && <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md z-10">Sold Out</span>}
                                                {isLow && !isOut && <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md z-10">Low Stock</span>}
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-semibold text-slate-800 truncate pr-2">{product.product}</h3>
                                                    <p className="font-black text-slate-900 whitespace-nowrap">{formatPrice(product.price)}</p>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{product.category?.category || 'General'}</span>
                                                    <span className={`font-bold ${isOut ? 'text-rose-500' : isLow ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                        {isOut ? '0 stock' : `${qty} in stock`}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-8">
                                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
                                        <ChevronDown className="rotate-90 w-5 h-5" />
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {getPageNumbers().map((page, idx) =>
                                            typeof page === 'number' ? (
                                                <button key={idx} onClick={() => setCurrentPage(page)}
                                                    className={`w-10 h-10 rounded-lg text-sm font-bold transition ${currentPage === page ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'}`}>
                                                    {page}
                                                </button>
                                            ) : <span key={idx} className="px-2 text-slate-400 font-bold">...</span>
                                        )}
                                    </div>
                                    <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
                                        <ChevronDown className="-rotate-90 w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
                            <div className="bg-slate-50 p-4 rounded-full mb-4"><Package className="w-8 h-8 text-slate-300" /></div>
                            <h3 className="text-lg font-bold text-slate-900">No products found</h3>
                            <p className="text-slate-500 text-sm mb-6 max-w-xs">Try adjusting your filters or add your first product.</p>
                            <button onClick={() => openProductModal()} className="text-indigo-600 font-bold text-sm hover:underline">+ Add Product</button>
                        </div>
                    )
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {categories.map(cat => (
                            <div key={cat.id} 
                                onClick={() => {
                                    setCategoryFilter(cat.id);
                                    setActiveTab('products');
                                }}
                                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden">
                                
                                {/* Background Decorative Element */}
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 blur-2xl" />

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                            <List size={20} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); openCategoryModal(cat); }} 
                                                className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition"
                                                title="Edit Category"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }} 
                                                className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition"
                                                title="Delete Category"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors leading-tight">{cat.category}</h3>
                                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{cat.products_count || 0} Products</p>
                                </div>

                                <div className="mt-6 flex items-center justify-between relative z-10">
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">View Products</span>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))}
                        {categories.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
                                <List className="w-8 h-8 text-slate-300 mb-4" />
                                <h3 className="text-lg font-bold text-slate-900">No categories</h3>
                                <button onClick={() => openCategoryModal()} className="text-indigo-600 font-bold text-sm hover:underline mt-2">+ Add Category</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Product Modal */}
            <Transition show={isProductModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsProductModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 md:p-8 shadow-xl transition-all">
                                    <div className="flex justify-between items-center mb-6">
                                        <Dialog.Title className="text-xl font-black text-slate-900">
                                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                                        </Dialog.Title>
                                        <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                                    </div>
                                    <form onSubmit={submitProduct} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Image Upload */}
                                            <div className="col-span-full md:col-span-1">
                                                <InputLabel value="Product Image" className="mb-2 !text-xs !uppercase !tracking-wider !font-bold !text-slate-400" />
                                                <div className="relative rounded-xl overflow-hidden h-64 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-colors">
                                                    {preview ? (
                                                        <>
                                                            {/* Preview image */}
                                                            <img
                                                                key={preview}
                                                                src={preview}
                                                                alt="Preview"
                                                                className="w-full h-full object-contain"
                                                                onError={e => {
                                                                    e.target.style.display = 'none';
                                                                    document.getElementById('img-fallback-modal').style.display = 'flex';
                                                                }}
                                                            />
                                                            {/* Fallback if image broken */}
                                                            <div id="img-fallback-modal" className="absolute inset-0 items-center justify-center bg-slate-50" style={{ display: 'none' }}>
                                                                <ImageIcon className="w-10 h-10 text-slate-300" />
                                                            </div>
                                                            {/* Hover overlay with Change Image button */}
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 z-10">
                                                                <label className="cursor-pointer bg-white text-slate-900 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-slate-50 transition flex items-center gap-2">
                                                                    <ImageIcon size={14} />
                                                                    Change Image
                                                                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                                                </label>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => { setPreview(null); productForm.setData('image', null); }}
                                                                    className="text-white/80 hover:text-white text-xs font-bold underline"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full gap-2">
                                                            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                                                                <ImageIcon className="w-7 h-7 text-slate-400" />
                                                            </div>
                                                            <span className="text-sm font-bold text-indigo-600">Upload Image</span>
                                                            <span className="text-[10px] text-slate-400">PNG, JPG, WEBP up to 10MB</span>
                                                            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                                        </label>
                                                    )}
                                                </div>
                                                <InputError message={productForm.errors.image} className="mt-1" />
                                            </div>
                                            {/* Basic Info */}
                                            <div className="space-y-4">
                                                <div>
                                                    <InputLabel value="Product Name" className="mb-1.5 !text-xs !uppercase !tracking-wider !font-bold !text-slate-400" />
                                                    <TextInput value={productForm.data.product}
                                                        onChange={e => productForm.setData('product', e.target.value)}
                                                        className="w-full !rounded-xl !border-slate-200" placeholder="e.g. Silk Scarf" />
                                                    <InputError message={productForm.errors.product} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <InputLabel value="Price (₱)" className="mb-1.5 !text-xs !uppercase !tracking-wider !font-bold !text-slate-400" />
                                                        <TextInput type="number" step="0.01"
                                                            value={productForm.data.price}
                                                            onChange={e => productForm.setData('price', e.target.value)}
                                                            className="w-full !rounded-xl !border-slate-200" placeholder="0.00" />
                                                        <InputError message={productForm.errors.price} />
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Status" className="mb-1.5 !text-xs !uppercase !tracking-wider !font-bold !text-slate-400" />
                                                        <select value={productForm.data.status}
                                                            onChange={e => productForm.setData('status', e.target.value)}
                                                            className="w-full border-slate-200 bg-slate-50 rounded-xl text-sm focus:ring-indigo-500">
                                                            <option value="active">Active</option>
                                                            <option value="inactive">Inactive</option>
                                                        </select>
                                                        <InputError message={productForm.errors.status} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <InputLabel value="Category" className="mb-1.5 !text-xs !uppercase !tracking-wider !font-bold !text-slate-400" />
                                                    <select value={productForm.data.category_id}
                                                        onChange={e => productForm.setData('category_id', e.target.value)}
                                                        className="w-full border-slate-200 bg-slate-50 rounded-xl text-sm focus:ring-indigo-500">
                                                        <option value="">Select...</option>
                                                        {categories.map(c => <option key={c.id} value={c.id}>{c.category}</option>)}
                                                    </select>
                                                    <InputError message={productForm.errors.category_id} />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <InputLabel value="Description" className="mb-1.5 !text-xs !uppercase !tracking-wider !font-bold !text-slate-400" />
                                            <textarea value={productForm.data.description}
                                                onChange={e => productForm.setData('description', e.target.value)}
                                                className="w-full border-slate-200 bg-slate-50 rounded-xl text-sm focus:ring-indigo-500 min-h-[100px]"
                                                placeholder="Product details..." />
                                            <InputError message={productForm.errors.description} />
                                        </div>
                                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                            <button type="button" onClick={() => setIsProductModalOpen(false)}
                                                className="px-6 py-2.5 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition">Cancel</button>
                                            <PrimaryButton className="!rounded-xl !px-6 !py-2.5 !bg-emerald-600 hover:!bg-emerald-700" disabled={productForm.processing}>
                                                {productForm.processing ? 'Saving...' : 'Save Product'}
                                            </PrimaryButton>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Category Modal */}
            <Transition show={isCategoryModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsCategoryModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                                    <h3 className="text-xl font-black text-slate-900 mb-4">{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
                                    <form onSubmit={submitCategory} className="space-y-4">
                                        <div>
                                            <InputLabel value="Category Name" className="mb-1 !text-xs" />
                                            <TextInput value={categoryForm.data.category}
                                                onChange={e => categoryForm.setData('category', e.target.value)}
                                                className="w-full !rounded-xl" required />
                                            <InputError message={categoryForm.errors.category} />
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2">
                                            <button type="button" onClick={() => setIsCategoryModalOpen(false)}
                                                className="px-4 py-2 text-slate-500 font-bold text-sm">Cancel</button>
                                            <PrimaryButton className="!rounded-xl" disabled={categoryForm.processing}>Save</PrimaryButton>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </AuthenticatedLayout>
    );
}