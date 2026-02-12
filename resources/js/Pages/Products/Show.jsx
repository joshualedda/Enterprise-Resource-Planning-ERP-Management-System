import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ product }) {
  if (!product) return <div>Loading...</div>;

  return (
    <AuthenticatedLayout
      header={<h2 className="font-bold text-xl text-slate-800 leading-tight">Product Details</h2>}
    >
      <Head title={product.product} />

      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <Link
            href={route('products.index')}
            className="flex items-center text-indigo-600 hover:text-indigo-800 font-bold transition"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Inventory
          </Link>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100 flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="md:w-1/2 h-96 md:h-auto relative bg-slate-50">
            <img 
              src={product.image_path || 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=800'} 
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
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    product.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                    product.status === 'inactive' ? 'bg-amber-100 text-amber-700' : 
                    'bg-slate-100 text-slate-600'
                 }`}>
                    {product.status}
                 </span>
              </div>
              
              <div className="space-y-6">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <h3 className="text-sm uppercase tracking-widest text-slate-400 font-bold mb-2">Category Information</h3>
                    <p className="font-medium text-slate-700">{product.category ? product.category.category : 'No category assigned'}</p>
                </div>
                
                 <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <h3 className="text-sm uppercase tracking-widest text-slate-400 font-bold mb-2">Internal ID</h3>
                    <p className="font-mono text-slate-600">#{product.id}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex gap-4">
                <button className="flex-1 bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                    Edit Product
                </button>
                <button className="px-6 py-4 bg-rose-50 text-rose-600 font-bold rounded-2xl hover:bg-rose-100 transition">
                    Delete
                </button>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
