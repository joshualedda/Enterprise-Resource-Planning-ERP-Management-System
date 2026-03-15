import React from 'react';

export default function Alert({ message, onClose, type = 'success' }) {
    if (!message) return null;

    return (
        <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
            <div className={`bg-white border-l-4 shadow-lg rounded-xl p-4 flex items-center gap-3 ${
                type === 'success' ? 'border-emerald-500' : 'border-rose-500'
            }`}>
                <div className={`rounded-full p-1.5 ${
                    type === 'success' ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'
                }`}>
                    {type === 'success' ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                </div>
                <p className="text-sm font-bold text-slate-800">{message}</p>
                {onClose && (
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 ml-4 focus:outline-none">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}
