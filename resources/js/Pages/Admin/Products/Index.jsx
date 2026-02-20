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
    Search,
    Filter,
    Plus,
    X,
    Package,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    MoreHorizontal,
    Edit3,
    Trash2,
    Eye,
    ChevronDown,
    LayoutGrid,
    List,
    ImageIcon
} from 'lucide-react';

// --- COMPONENTS ---

// 1. Stat Card
const StatCard = ({ label, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-10 flex items-center justify-center text-opacity-100`}>
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
    // --- STATE ---
    const [activeTab, setActiveTab] = useState('products'); // 'products' | 'categories'
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [stockFilter, setStockFilter] = useState('All'); // 'All' | 'In Stock' | 'Low Stock' | 'Out of Stock'
    const [sortBy, setSortBy] = useState('Newest');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // 8 items per page (2 rows of 4)

    // Modals
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [preview, setPreview] = useState(null);

    // Forms
    const productForm = useForm({
        product: '',
        category_id: '',
        status: 'active', // Default Active (String)
        price: '',
        image: null,
        description: '',
    });

    const categoryForm = useForm({
        category: '',
    });

    // --- COMPUTED DATA ---
    const stats = useMemo(() => {
        const total = products.length;
        const inStock = products.filter(p => (p.stock_count || 0) > 10).length;
        const lowStock = products.filter(p => (p.stock_count || 0) > 0 && (p.stock_count || 0) <= 10).length;
        const outOfStock = products.filter(p => (p.stock_count || 0) <= 0).length;

        return { total, inStock, lowStock, outOfStock };
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products
            .filter(product => {
                const matchesSearch = product.product?.toLowerCase().includes(search.toLowerCase());
                const matchesCategory = categoryFilter === 'All' || product.category?.id == categoryFilter;

                let matchesStock = true;
                const qty = product.stock_count || 0;
                if (stockFilter === 'In Stock') matchesStock = qty > 10;
                if (stockFilter === 'Low Stock') matchesStock = qty > 0 && qty <= 10;
                if (stockFilter === 'Out of Stock') matchesStock = qty <= 0;

                return matchesSearch && matchesCategory && matchesStock;
            })
            .sort((a, b) => {
                if (sortBy === 'Newest') return new Date(b.created_at) - new Date(a.created_at);
                if (sortBy === 'Price High') return b.price - a.price;
                if (sortBy === 'Price Low') return a.price - b.price;
                if (sortBy === 'Stock') return (b.stock_count || 0) - (a.stock_count || 0);
                return 0;
            });
    }, [products, search, categoryFilter, stockFilter, sortBy]);

    // --- PAGINATION LOGIC ---
    useEffect(() => {
        setCurrentPage(1);
    }, [search, categoryFilter, stockFilter, sortBy]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    // --- HANDLERS ---

    // Product Handlers
    const openProductModal = (product = null) => {
        setEditingProduct(product);
        setPreview(product?.image_url || null);
        productForm.clearErrors();

        if (product) {
            productForm.setData({
                product: product.product || '',
                category_id: product.category_id || '',
                status: product.status || 'active',
                price: product.price || '',
                image: null,
                description: product.description || '',
            });
        } else {
            productForm.reset();
            productForm.setData({
                product: '',
                category_id: '',
                status: 'active',
                price: '',
                image: null,
                description: '',
            });
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
            productForm.transform((data) => ({ ...data, _method: 'put' }));
            productForm.post(url, options);
        } else {
            productForm.transform((data) => data);
            productForm.post(url, options);
        }
    };

    const deleteProduct = (product) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        router.delete(route('admin.products.destroy', product.id), {
            onSuccess: () => toast.success('Product deleted.'),
            onError: () => toast.error('Failed to delete.'),
        });
    };

    // Category Handlers
    const openCategoryModal = (category = null) => {
        setEditingCategory(category);
        categoryForm.clearErrors();
        categoryForm.setData('category', category ? category.category : '');
        setIsCategoryModalOpen(true);
    };

    const submitCategory = (e) => {
        e.preventDefault();
        if (editingCategory) {
            categoryForm.put(route('categories.update', editingCategory.id), {
                onSuccess: () => {
                    setIsCategoryModalOpen(false);
                    categoryForm.reset();
                    toast.success('Category updated!');
                }
            });
        } else {
            categoryForm.post(route('categories.store'), {
                onSuccess: () => {
                    setIsCategoryModalOpen(false);
                    categoryForm.reset();
                    toast.success('Category added!');
                }
            });
        }
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

                {/* 1. Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-800">Product Inventory</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage your products and stock levels</p>
                    </div>
                    <div className="flex gap-2">
                        {activeTab === 'products' ? (
                            <button
                                onClick={() => openProductModal()}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95"
                            >
                                <Plus size={18} />
                                New Product
                            </button>
                        ) : (
                            <button
                                onClick={() => openCategoryModal()}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95"
                            >
                                <Plus size={18} />
                                New Category
                            </button>
                        )}
                    </div>
                </div>

                <hr className="border-slate-100 mb-6" />

                {/* 2. Inventory Summary Cards */}
                {activeTab === 'products' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard label="Total Products" value={stats.total} icon={Package} color="bg-indigo-500" />
                        <StatCard label="In Stock" value={stats.inStock} icon={CheckCircle2} color="bg-emerald-500" />
                        <StatCard label="Low Stock" value={stats.lowStock} icon={AlertTriangle} color="bg-amber-500" />
                        <StatCard label="Out of Stock" value={stats.outOfStock} icon={XCircle} color="bg-rose-500" />
                    </div>
                )}

                {/* 3. Tabs */}
                <div className="bg-slate-100 p-1 rounded-xl inline-flex mb-6 w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        All Products
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'categories' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Categories
                    </button>
                </div>

                {/* 4. Search & Filter Section (Products Only) */}
                {activeTab === 'products' && (
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col xl:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full xl:w-96 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm transition-all"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto overflow-x-auto">
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                            >
                                <option value="All">All Categories</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.category}</option>)}
                            </select>

                            <select
                                value={stockFilter}
                                onChange={(e) => setStockFilter(e.target.value)}
                                className="pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                            >
                                <option value="All">All Status</option>
                                <option value="In Stock">In Stock</option>
                                <option value="Low Stock">Low Stock</option>
                                <option value="Out of Stock">Out of Stock</option>
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                            >
                                <option value="Newest">Newest First</option>
                                <option value="Stock">Stock Level</option>
                                <option value="Price High">Price: High to Low</option>
                                <option value="Price Low">Price: Low to High</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* 5. Content Grid */}
                {activeTab === 'products' ? (
                    filteredProducts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                                {paginatedProducts.map((product) => {
                                    const qty = product.stock_count || 0;
                                    const isOut = qty <= 0;
                                    const isLow = qty > 0 && qty <= 10;

                                    return (
                                        <div key={product.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-all group relative">
                                            {/* Actions Dropdown Trigger (Simplified for now) */}
                                            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="flex bg-white/90 backdrop-blur rounded-lg shadow-sm border border-slate-100 overflow-hidden">
                                                    <Link href={route('admin.products.show', product.id)} className="p-2 hover:bg-slate-50 text-indigo-600 border-r border-slate-100">
                                                        <Eye size={14} />
                                                    </Link>
                                                    <button onClick={() => openProductModal(product)} className="p-2 hover:bg-slate-50 text-emerald-600 border-r border-slate-100"><Edit3 size={14} /></button>
                                                    <button onClick={() => deleteProduct(product)} className="p-2 hover:bg-slate-50 text-rose-600"><Trash2 size={14} /></button>
                                                </div>
                                            </div>

                                            <div className="aspect-[4/3] bg-slate-100 rounded-xl overflow-hidden mb-4 relative flex items-center justify-center">
                                                {product.image_url && product.image_url.includes('img/') ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.product}
                                                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isOut ? 'grayscale opacity-70' : ''}`}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}
                                                <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-slate-300" style={{ display: product.image_url && product.image_url.includes('img/') ? 'none' : 'flex' }}>
                                                    <ImageIcon className="w-12 h-12 opacity-50" />
                                                </div>

                                                {/* Status Badge Over Image */}
                                                {isOut && <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md z-10">Sold Out</span>}
                                                {isLow && !isOut && <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md z-10">Low Stock</span>}
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-semibold text-slate-800 truncate pr-2">{product.product}</h3>
                                                    <p className="font-black text-slate-900">{formatPrice(product.price)}</p>
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

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-8">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        <ChevronDown className="rotate-90 w-5 h-5" />
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {getPageNumbers().map((page, index) => (
                                            typeof page === 'number' ? (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-10 h-10 rounded-lg text-sm font-bold transition ${currentPage === page ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'}`}
                                                >
                                                    {page}
                                                </button>
                                            ) : (
                                                <span key={index} className="px-2 text-slate-400 font-bold">...</span>
                                            )
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        <ChevronDown className="-rotate-90 w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        // Empty State Products
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
                            <div className="bg-slate-50 p-4 rounded-full mb-4">
                                <Package className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No products found</h3>
                            <p className="text-slate-500 text-sm mb-6 max-w-xs">Try adjusting your filters or add your first product to get started.</p>
                            <button onClick={() => openProductModal()} className="text-indigo-600 font-bold text-sm hover:underline">
                                + Add Product
                            </button>
                        </div>
                    )
                ) : (
                    // Categories Grid
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {categories.map((cat) => (
                            <div key={cat.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{cat.category}</h3>
                                    <p className="text-sm text-slate-500 mt-1">{cat.products_count || 0} Products</p>
                                </div>
                                <div className="flex gap-2 mt-4 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openCategoryModal(cat)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition"><Edit3 size={14} /></button>
                                    <button onClick={() => deleteCategory(cat.id)} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                        {/* Empty State Categories */}
                        {categories.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
                                <List className="w-8 h-8 text-slate-300 mb-4" />
                                <h3 className="text-lg font-bold text-slate-900">No categories</h3>
                                <button onClick={() => openCategoryModal()} className="text-indigo-600 font-bold text-sm hover:underline mt-2">
                                    + Add Category
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* --- MODALS --- */}

            {/* Product Modal */}
            <Transition show={isProductModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsProductModalOpen(false)}>
                    {/* Backdrop */}
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
                                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors relative overflow-hidden h-64 flex flex-col items-center justify-center bg-slate-50">
                                                    {preview ? (
                                                        <>
                                                            <img
                                                                src={preview}
                                                                alt="Preview"
                                                                className="w-full h-full object-contain absolute inset-0 z-0"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none'; // Hide img
                                                                    e.target.nextSibling.style.display = 'none'; // Hide overlay
                                                                    e.target.nextSibling.nextSibling.style.display = 'flex'; // Show fallback
                                                                }}
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center z-10 transition-all">
                                                                <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-xs shadow-sm hover:bg-slate-50 transition">
                                                                    Change Image
                                                                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                                                </label>
                                                            </div>
                                                            {/* Fallback for broken image */}
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-0" style={{ display: 'none' }}>
                                                                <ImageIcon className="w-10 h-10 text-slate-300 mb-2" />
                                                                <span className="text-sm font-bold text-slate-400">Image Unavailable</span>
                                                                <label className="cursor-pointer mt-2 text-indigo-600 font-bold text-xs hover:underline">
                                                                    Upload New Image
                                                                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                                                </label>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                                                            <ImageIcon className="w-10 h-10 text-slate-300 mb-2" />
                                                            <span className="text-sm font-bold text-indigo-600">Upload Image</span>
                                                            <span className="text-[10px] text-slate-400 mt-1">PNG, JPG up to 2MB</span>
                                                            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                                        </label>
                                                    )}
                                                </div>
                                                <InputError message={productForm.errors.image} className="mt-1" />
                                            </div>

                                            {/* Basic Info */}
                                            {/* Basic Info */}
                                            <div className="space-y-4">
                                                <div>
                                                    <InputLabel value="Product Name" className="mb-1.5 !text-xs !uppercase !tracking-wider !font-bold !text-slate-400" />
                                                    <TextInput
                                                        value={productForm.data.product}
                                                        onChange={e => productForm.setData('product', e.target.value)}
                                                        className="w-full !rounded-xl !border-slate-200"
                                                        placeholder="e.g. Silk Scarf"
                                                    />
                                                    <InputError message={productForm.errors.product} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <InputLabel value="Price (₱)" className="mb-1.5 !text-xs !uppercase !tracking-wider !font-bold !text-slate-400" />
                                                        <TextInput
                                                            type="number" step="0.01"
                                                            value={productForm.data.price}
                                                            onChange={e => productForm.setData('price', e.target.value)}
                                                            className="w-full !rounded-xl !border-slate-200"
                                                            placeholder="0.00"
                                                        />
                                                        <InputError message={productForm.errors.price} />
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Status" className="mb-1.5 !text-xs !uppercase !tracking-wider !font-bold !text-slate-400" />
                                                        <select
                                                            value={productForm.data.status}
                                                            onChange={e => productForm.setData('status', e.target.value)}
                                                            className="w-full border-slate-200 bg-slate-50 rounded-xl text-sm focus:ring-indigo-500"
                                                        >
                                                            <option value="active">Active</option>
                                                            <option value="inactive">Inactive</option>
                                                        </select>
                                                        <InputError message={productForm.errors.status} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <InputLabel value="Category" className="mb-1.5 !text-xs !uppercase !tracking-wider !font-bold !text-slate-400" />
                                                    <select
                                                        value={productForm.data.category_id}
                                                        onChange={e => productForm.setData('category_id', e.target.value)}
                                                        className="w-full border-slate-200 bg-slate-50 rounded-xl text-sm focus:ring-indigo-500"
                                                    >
                                                        <option value="">Select...</option>
                                                        {categories.map(c => <option key={c.id} value={c.id}>{c.category}</option>)}
                                                    </select>
                                                    <InputError message={productForm.errors.category_id} />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <InputLabel value="Description" className="mb-1.5 !text-xs !uppercase !tracking-wider !font-bold !text-slate-400" />
                                            <textarea
                                                value={productForm.data.description}
                                                onChange={e => productForm.setData('description', e.target.value)}
                                                className="w-full border-slate-200 bg-slate-50 rounded-xl text-sm focus:ring-indigo-500 min-h-[100px]"
                                                placeholder="Product details..."
                                            />
                                            <InputError message={productForm.errors.description} />
                                        </div>

                                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                            <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-6 py-2.5 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition">Cancel</button>
                                            <PrimaryButton className="!rounded-xl !px-6 !py-2.5 !bg-indigo-600" disabled={productForm.processing}>
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
                                            <TextInput
                                                value={categoryForm.data.category}
                                                onChange={e => categoryForm.setData('category', e.target.value)}
                                                className="w-full !rounded-xl"
                                                required
                                            />
                                            <InputError message={categoryForm.errors.category} />
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2">
                                            <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 text-slate-500 font-bold text-sm">Cancel</button>
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
