import { ChevronDown } from 'lucide-react';

/**
 * Reusable Pagination Component
 *
 * Props:
 *   currentPage  {number}
 *   totalPages   {number}
 *   onPageChange {(page: number) => void}
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= 3) {
            [1, 2, 3, 4, '...', totalPages].forEach(p => pages.push(p));
        } else if (currentPage >= totalPages - 2) {
            [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages].forEach(p => pages.push(p));
        } else {
            [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages].forEach(p => pages.push(p));
        }
        return pages;
    };

    return (
        <div className="flex justify-center items-center gap-2 mt-6">
            <button
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                aria-label="Previous page"
            >
                <ChevronDown className="rotate-90 w-5 h-5" />
            </button>

            <div className="flex items-center gap-1">
                {getPageNumbers().map((page, idx) =>
                    typeof page === 'number' ? (
                        <button
                            key={idx}
                            onClick={() => onPageChange(page)}
                            className={`w-10 h-10 rounded-lg text-sm font-bold transition ${currentPage === page
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                    : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                                }`}
                        >
                            {page}
                        </button>
                    ) : (
                        <span key={idx} className="px-2 text-slate-400 font-bold">...</span>
                    )
                )}
            </div>

            <button
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                aria-label="Next page"
            >
                <ChevronDown className="-rotate-90 w-5 h-5" />
            </button>
        </div>
    );
}
