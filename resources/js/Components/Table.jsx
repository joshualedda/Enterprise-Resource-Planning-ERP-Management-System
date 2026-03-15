import React from 'react';

/**
 * Reusable Table Component
 * 
 * @param {Object} props
 * @param {string} props.title - The title of the table (e.g. "🏷️ Category List")
 * @param {string} props.subtitle - The subtitle description for the table
 * @param {number|string} props.badgeCount - The total number of items shown in the header badge
 * @param {string} props.badgeColor - Tailwind color classes for the badge (e.g. "text-emerald-600 bg-emerald-50")
 * @param {Array<string>} props.columns - Array of string column headers
 * @param {React.ReactNode} props.children - The <tbody> rows to render
 * @param {React.ReactNode} [props.emptyState] - Optional empty state UI to show if children is empty
 */
export default function Table({
    title,
    subtitle,
    badgeCount,
    badgeColor = 'text-emerald-600 bg-emerald-50',
    columns = [],
    children,
    emptyState = null,
    footer = null,
}) {
    // If children is empty or an empty array, show the empty state, otherwise show the rows.
    const hasRows = React.Children.count(children) > 0;

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">{title}</h2>
                    {subtitle && <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>}
                </div>
                {badgeCount !== undefined && (
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${badgeColor}`}>
                        {badgeCount} items
                    </span>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/60 border-b border-slate-100">
                            {columns.map((h, index) => (
                                <th key={index} className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {hasRows ? children : (
                            <tr>
                                <td colSpan={columns.length} className="py-16 text-center">
                                    {emptyState || (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="text-4xl">📭</div>
                                            <p className="text-sm font-black text-slate-300">No data found</p>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {footer && footer}
        </div>
    );
}

// ─────────────────────────────────────────────────────────
// TABLE ROW/CELL COMPONENTS (Optional Helpers)
// ─────────────────────────────────────────────────────────

export function Td({ children, className = '', ...props }) {
    return (
        <td className={`px-5 py-3.5 ${className}`} {...props}>
            {children}
        </td>
    );
}

export function Tr({ children, className = '', ...props }) {
    return (
        <tr className={`hover:bg-slate-50/70 transition-colors group ${className}`} {...props}>
            {children}
        </tr>
    );
}
