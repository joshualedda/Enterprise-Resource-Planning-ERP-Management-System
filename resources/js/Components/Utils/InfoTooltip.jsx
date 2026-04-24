import { useState } from 'react';

export default function InfoTooltip({ text, position = 'top' }) {
    const [isVisible, setIsVisible] = useState(false);

    const positions = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
        <div className="relative inline-block ml-1 group">
            <button
                type="button"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 flex items-center justify-center transition-colors cursor-help"
            >
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>

            {isVisible && (
                <div className={`absolute z-[100] w-48 p-2.5 bg-slate-800 text-white text-[10px] font-bold rounded-xl shadow-xl animate-in fade-in zoom-in duration-200 ${positions[position]}`}>
                    {text}
                    {/* Arrow */}
                    <div className={`absolute w-2 h-2 bg-slate-800 rotate-45 ${
                        position === 'top' ? 'top-full -mt-1 left-1/2 -translate-x-1/2' :
                        position === 'bottom' ? 'bottom-full -mb-1 left-1/2 -translate-x-1/2' :
                        position === 'left' ? 'left-full -ml-1 top-1/2 -translate-y-1/2' :
                        'right-full -mr-1 top-1/2 -translate-y-1/2'
                    }`} />
                </div>
            )}
        </div>
    );
}
