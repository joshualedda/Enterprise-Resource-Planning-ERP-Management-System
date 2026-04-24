import React, { useState, useRef, useEffect, useMemo } from 'react';

export default function SearchableSelect({ 
    options = [], 
    value, 
    onChange, 
    placeholder = 'Select an option', 
    searchPlaceholder = 'Search...',
    className = '',
    error = false
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);

    // Find the current label for the selected value
    const selectedOption = useMemo(() => 
        options.find(opt => String(opt.value) === String(value)),
    [options, value]);

    // Filter options based on search
    const filteredOptions = useMemo(() => {
        if (!search) return options;
        return options.filter(opt => 
            opt.label.toLowerCase().includes(search.toLowerCase())
        );
    }, [options, search]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset search when opening
    useEffect(() => {
        if (isOpen) setSearch('');
    }, [isOpen]);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {/* Trigger / Display */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-white hover:border-indigo-400 transition-all ${isOpen ? 'ring-2 ring-indigo-600/10 border-indigo-600 bg-white shadow-sm' : ''} ${error ? 'border-rose-500 ring-rose-500/10' : ''}`}
            >
                <span className={`text-sm ${!selectedOption ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-[60] w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/60 overflow-hidden animate-in fade-in zoom-in duration-200">
                    {/* Search Input inside dropdown */}
                    <div className="p-2 border-b border-slate-50 bg-slate-50/30">
                        <div className="relative">
                            <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                autoFocus
                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                placeholder={searchPlaceholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt.value}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between group ${String(opt.value) === String(value) ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}
                                >
                                    <span>{opt.label}</span>
                                    {String(opt.value) === String(value) && (
                                        <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-center">
                                <p className="text-sm text-slate-400 font-medium">No results found</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}} />
        </div>
    );
}
