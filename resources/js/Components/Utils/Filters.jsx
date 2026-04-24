import React from 'react';

export default function Filters({
    search = '',
    onSearchChange,
    searchPlaceholder = 'Search...',
    filters = [],
    onReset,
    className = '',
}) {
    const hasActiveFilters = search !== '' || filters.some(f => f.value && f.value !== '');

    return (
        <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-4 ${className}`}>
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">

                {/* Search Input */}
                <div className="relative flex-1">
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={e => onSearchChange(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition placeholder-slate-400"
                    />
                </div>

                {/* Dynamic Select Filters */}
                {filters.map(filter => (
                    <div key={filter.key} className="relative">
                        <select
                            value={filter.value}
                            onChange={e => filter.onChange(e.target.value)}
                            className="pl-3 pr-8 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none appearance-none cursor-pointer transition min-w-[140px] w-full"
                        >
                            <option value="">All {filter.label}</option>
                            {filter.options.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        {/* Custom dropdown chevron icon */}
                        <svg
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                ))}

                {/* Reset button */}
                {onReset && hasActiveFilters && (
                    <button
                        onClick={onReset}
                        className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition flex-shrink-0"
                        title="Clear all filters"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reset
                    </button>
                )}
            </div>
        </div>
    );
}
