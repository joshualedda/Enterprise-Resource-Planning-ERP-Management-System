import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import pickBy from 'lodash/pickBy'; // Install lodash if needed: npm install lodash

export default function Reports({ auth, orders, filters }) {
    const [values, setValues] = useState({
        search: filters.search || '',
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
    });

    // Function para mag-trigger ng filter/search
    useEffect(() => {
        const query = pickBy(values);
        router.get(route('admin.reports'), query, {
            preserveState: true,
            replace: true,
        });
    }, [values.search, values.start_date, values.end_date]);

    const handleChange = (e) => {
        setValues(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // PDF and Excel handlers using the current filtered URL
    const handlePDF = () => {
        window.open(route('admin.reports.pdf', pickBy(values)), '_blank');
    };

    const handleExcel = () => {
        window.location.href = route('admin.reports.excel', pickBy(values));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800">Reports</h2>}>
            <Head title="Reports" />

            <div className="py-12 px-4">
                <div className="max-w-7xl mx-auto bg-white shadow-sm sm:rounded-lg p-6">
                    
                    {/* FILTERS SECTION */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
                        <div className="flex-1">
                            <label className="text-xs font-bold uppercase text-gray-500">Search Reference / Product</label>
                            <input type="text" name="search" value={values.search} onChange={handleChange} placeholder="Search..." className="w-full border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500">Start Date</label>
                            <input type="date" name="start_date" value={values.start_date} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500">End Date</label>
                            <input type="date" name="end_date" value={values.end_date} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handlePDF} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">PDF</button>
                            <button onClick={handleExcel} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Excel</button>
                        </div>
                    </div>

                    {/* TABLE SECTION */}
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Ref No</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Qty</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.data.map((order) => (
                                    <tr key={order.id}>
                                        <td className="px-6 py-4 text-sm font-medium text-blue-600">#{order.transaction?.reference_no}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{order.product?.product}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{order.quantity}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">₱{order.price_at_sale}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    <div className="mt-6 flex justify-center gap-1">
                        {orders.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={`px-4 py-2 border rounded-md ${link.active ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}