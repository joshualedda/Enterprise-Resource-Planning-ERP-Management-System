import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import axios from 'axios';

export default function Index({ auth, orders }) {
    const [processingId, setProcessingId] = useState(null);
    const [activeFilter, setActiveFilter] = useState('To Pickup');
    
    // Modals State
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [viewingOrder, setViewingOrder] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ open: false, id: null });
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    
    // Rating State
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingData, setRatingData] = useState({ items: [], orderId: null, ratings: {} });
    const [hoveredStars, setHoveredStars] = useState({});

    const getStatusStyles = (status) => {
        const styles = {
            'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-100',
            'In Process': 'bg-blue-50 text-blue-700 border-blue-100',
            'Ready to Pickup': 'bg-emerald-600 text-white border-emerald-700 animate-pulse', // Ginawang GREEN
            'Product Received': 'bg-slate-100 text-slate-600 border-slate-200',
            'Cancelled': 'bg-gray-50 text-gray-400 border-gray-100',
        };
        return styles[status] || 'bg-gray-50 text-gray-700 border-gray-100';
    };

    const filteredOrders = useMemo(() => {
        const data = orders?.data || [];
        if (activeFilter === 'To Pickup') {
            return data.filter(o => o.status !== 'Product Received' && o.status !== 'Cancelled')
                       .sort((a, b) => (a.status === 'Ready to Pickup' ? -1 : 1));
        }
        return data.filter(o => o.status === 'Product Received' || o.status === 'Cancelled');
    }, [orders, activeFilter]);

    const handleProductReceived = async () => {
        const transactionId = confirmModal.id;
        const currentOrder = orders.data.find(o => o.id === transactionId);
        setProcessingId(transactionId);
        setConfirmModal({ open: false, id: null });

        try {
            await axios.patch(`/transactions/${transactionId}/status`, { status: 'Product Received' });
            setRatingData({ items: currentOrder.order_items, orderId: transactionId, ratings: {} });
            setShowRatingModal(true);
            router.reload({ preserveScroll: true });
        } catch (error) {
            alert('Update failed.');
        } finally {
            setProcessingId(null);
        }
    };

    const submitRatings = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const ratings = ratingData.items.map(item => ({
            product_id: item.product_id,
            stars: ratingData.ratings[item.product_id] || 5,
            comment: formData.get(`comment-${item.product_id}`)
        }));

        try {
            await axios.post('/ratings/bulk', { ratings, order_id: ratingData.orderId });
            setShowRatingModal(false);
            setShowSuccessModal(true); // English Modal
            router.reload({ preserveScroll: true });
        } catch (error) {
            alert('Could not submit ratings.');
        }
    };

    const openDetails = (order) => {
        setViewingOrder(order);
        setIsDetailsOpen(true);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="My Orders" />

            <div className="py-12 bg-slate-50 min-h-screen font-sans">
                <div className="max-w-5xl mx-auto px-4">
                    
                    <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">My Orders</h1>
                            <p className="text-slate-500 font-medium">Track your facility pickups and history.</p>
                        </div>
                        
                        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                            {['To Pickup', 'History'].map(tab => (
                                <button key={tab} onClick={() => setActiveFilter(tab)}
                                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredOrders.length > 0 ? filteredOrders.map((transaction) => (
                            <div key={transaction.id} className={`bg-white rounded-[2rem] border transition-all ${transaction.status === 'Ready to Pickup' ? 'border-emerald-300 ring-4 ring-emerald-50 shadow-xl shadow-emerald-100/50' : 'border-slate-200 shadow-sm'}`}>
                                <div className="p-6 flex flex-col lg:flex-row items-center justify-between gap-6">
                                    <div className="flex flex-col gap-1 w-full lg:w-1/4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">#{transaction.reference_no}</span>
                                            <span className={`px-3 py-1 text-[9px] font-black uppercase border rounded-full ${getStatusStyles(transaction.status)}`}>
                                                {transaction.status}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">{new Date(transaction.created_at).toDateString()}</p>
                                    </div>

                                    <div className="flex-1 flex justify-center -space-x-3">
                                        {transaction.order_items.slice(0, 4).map((item, idx) => (
                                            <img key={idx} className="h-12 w-12 rounded-full border-4 border-white object-cover bg-slate-100 shadow-sm" src={item.product?.image_url || '/placeholder.png'} />
                                        ))}
                                    </div>

                                    <div className="text-center lg:text-right w-full lg:w-1/4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</p>
                                        <p className="text-xl font-black text-slate-900">₱{Number(transaction.total_amount).toLocaleString()}</p>
                                    </div>

                                    <div className="flex gap-2 w-full lg:w-auto">
                                        {transaction.status === 'Ready to Pickup' && (
                                            <button onClick={() => setConfirmModal({ open: true, id: transaction.id })}
                                                disabled={processingId === transaction.id}
                                                className="flex-1 px-6 py-3 bg-emerald-600 text-white text-[10px] font-black rounded-xl uppercase hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all"
                                            >
                                                {processingId === transaction.id ? '...' : 'Receive'}
                                            </button>
                                        )}
                                        <button onClick={() => openDetails(transaction)} className="flex-1 px-6 py-3 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase hover:bg-black transition-all">
                                            Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="bg-white rounded-[3rem] py-20 text-center border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 font-black uppercase text-xs tracking-widest text-center">No orders found in this section</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- ORDER DETAILS MODAL (ORIGINAL UI RETAINED) --- */}
            {isDetailsOpen && viewingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 uppercase">Order Details</h2>
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">REF: {viewingOrder.reference_no}</p>
                                        <span className={`px-2 py-0.5 text-[8px] font-black uppercase border rounded-md ${getStatusStyles(viewingOrder.status)}`}>
                                            {viewingOrder.status}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => setIsDetailsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                {viewingOrder.order_items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 bg-slate-50/50">
                                        <img src={item.product?.image_url || '/placeholder.png'} className="w-14 h-14 rounded-xl object-cover shadow-sm bg-white" />
                                        <div className="flex-1">
                                            <p className="text-sm font-black text-slate-900 uppercase leading-none mb-1">{item.product?.product}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Qty: {item.quantity} × ₱{Number(item.price_at_sale).toLocaleString()}</p>
                                        </div>
                                        <p className="text-sm font-black text-slate-900">₱{(item.quantity * item.price_at_sale).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Grand Total</span>
                                <span className="text-2xl font-black text-indigo-600">₱{Number(viewingOrder.total_amount).toLocaleString()}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-8">
                                <button onClick={() => setIsDetailsOpen(false)} className="py-4 bg-slate-100 text-slate-600 font-black text-[10px] rounded-2xl uppercase hover:bg-slate-200 transition-all">
                                    Close
                                </button>
                                {/* Only show Rate button if Received and not yet rated */}
                                {viewingOrder.status === 'Product Received' && !viewingOrder.is_rated && (
                                    <button 
                                        onClick={() => {
                                            setRatingData({ items: viewingOrder.order_items, orderId: viewingOrder.id, ratings: {} });
                                            setShowRatingModal(true);
                                            setIsDetailsOpen(false);
                                        }}
                                        className="py-4 bg-indigo-600 text-white font-black text-[10px] rounded-2xl uppercase hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                                    >
                                        Rate Products
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- RATING MODAL (GLOWING STARS) --- */}
            {showRatingModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
                    <form onSubmit={submitRatings} className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-black text-slate-900 uppercase">Rate Your Items</h3>
                            <p className="text-slate-500 text-sm font-medium mt-1">Tell us what you think about our facility products.</p>
                        </div>

                        <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                            {ratingData.items.map((item) => (
                                <div key={item.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <img src={item.product?.image_url || '/placeholder.png'} className="w-8 h-8 rounded-lg object-cover" />
                                        <p className="text-xs font-black uppercase text-slate-700">{item.product?.product}</p>
                                    </div>
                                    <div className="flex gap-2 mb-4">
                                        {[1, 2, 3, 4, 5].map(star => {
                                            const isSelected = (ratingData.ratings[item.product_id] || 0) >= star;
                                            const isHovered = (hoveredStars[item.product_id] || 0) >= star;
                                            return (
                                                <label key={star} className="cursor-pointer transition-transform hover:scale-125"
                                                    onMouseEnter={() => setHoveredStars(p => ({ ...p, [item.product_id]: star }))}
                                                    onMouseLeave={() => setHoveredStars(p => ({ ...p, [item.product_id]: 0 }))}>
                                                    <input type="radio" name={`stars-${item.product_id}`} value={star} className="hidden" 
                                                        onChange={() => setRatingData(p => ({ ...p, ratings: { ...p.ratings, [item.product_id]: star } }))} />
                                                    <span className={`text-3xl transition-all duration-200 ${isSelected || isHovered ? 'drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] grayscale-0' : 'grayscale opacity-30'}`}>
                                                        ⭐
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    <textarea name={`comment-${item.product_id}`} placeholder="Optional: How was the quality?"
                                        className="w-full text-xs font-medium rounded-2xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px] p-4 bg-white shadow-inner"></textarea>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button type="button" onClick={() => setShowRatingModal(false)} className="flex-1 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Not now</button>
                            <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white text-[10px] font-black rounded-2xl uppercase hover:bg-indigo-700 shadow-xl shadow-indigo-100 tracking-widest">Submit Review</button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- SUCCESS THANK YOU MODAL (ENGLISH) --- */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl text-center animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✨</div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase">Thank You!</h3>
                        <p className="text-slate-500 text-sm mb-8 font-medium">Your review has been successfully submitted. We appreciate your feedback!</p>
                        <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 bg-slate-900 text-white text-[10px] font-black rounded-2xl uppercase hover:bg-black transition-all">
                            Back to My Orders
                        </button>
                    </div>
                </div>
            )}

            {/* --- CONFIRM MODAL --- */}
            {confirmModal.open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl text-center animate-in zoom-in duration-200">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">📦</div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase">Received?</h3>
                        <p className="text-slate-500 text-sm mb-10 font-medium leading-relaxed">Confirming this means you have physically picked up your order from SRDI.</p>
                        <div className="flex flex-col gap-2">
                            <button onClick={handleProductReceived} className="w-full py-4 bg-emerald-600 text-white text-[10px] font-black rounded-2xl uppercase hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all tracking-widest">Yes, Received</button>
                            <button onClick={() => setConfirmModal({ open: false, id: null })} className="w-full py-4 text-[10px] font-black text-slate-400 uppercase hover:text-slate-600 tracking-widest transition-all">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}