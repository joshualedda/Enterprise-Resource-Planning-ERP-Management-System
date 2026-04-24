import { useState, useCallback, useRef, useEffect } from 'react';
import HRStaffLayout from '@/Layouts/HRStaffLayout';
import { Head, Link, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import toast, { Toaster } from 'react-hot-toast';
import Table, { Tr, Td } from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import Filters from '@/Components/Utils/Filters';

export default function Employees({ employees, departments, positions, employeeStatuses, filters: serverFilters = {} }) {

    // Filter state seeded from server
    const [search, setSearch]     = useState(serverFilters.search ?? '');
    const [deptId, setDeptId]     = useState(serverFilters.department_id ?? '');
    const [posId, setPosId]       = useState(serverFilters.position_id ?? '');
    const [statusId, setStatusId] = useState(serverFilters.employee_status_id ?? '');
    const [sortField, setSortField] = useState('');
    const [sortDir, setSortDir]     = useState('asc');

    // Debounced server request
    const isInitial = useRef(true);
    const applyFilters = useCallback((params) => {
        router.get(
            route('staff.hr.employees'),
            {
                search:              params.search      || undefined,
                department_id:       params.deptId      || undefined,
                position_id:         params.posId       || undefined,
                employee_status_id:  params.statusId    || undefined,
            },
            { preserveState: true, replace: true }
        );
    }, []);

    useEffect(() => {
        if (isInitial.current) { isInitial.current = false; return; }
        const id = setTimeout(() => applyFilters({ search, deptId, posId, statusId }), 350);
        return () => clearTimeout(id);
    }, [search, deptId, posId, statusId]);

    const handleReset = () => {
        setSearch(''); setDeptId(''); setPosId(''); setStatusId('');
    };

    // Sort displayed rows client-side (already paginated from server)
    const rows = employees.data ?? [];
    const sorted = [...rows].sort((a, b) => {
        if (!sortField) return 0;
        const aVal = sortField === 'name'
            ? `${a.first_name} ${a.last_name}`.toLowerCase()
            : (a[sortField] ?? '');
        const bVal = sortField === 'name'
            ? `${b.first_name} ${b.last_name}`.toLowerCase()
            : (b[sortField] ?? '');
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    const toggleSort = (field) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('asc'); }
    };

    const SortIcon = ({ field }) => (
        <svg className={`inline w-3 h-3 ml-1 transition-transform ${sortField === field && sortDir === 'desc' ? 'rotate-180' : ''} ${sortField === field ? 'text-indigo-500' : 'text-slate-300'}`}
            fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 10l5-5 5 5H5z" />
        </svg>
    );

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this employee?')) {
            router.delete(route('staff.hr.employees.destroy', id), {
                onSuccess: () => toast.success('Employee deleted successfully!'),
                onError:   () => toast.error('Failed to delete employee.')
            });
        }
    };

    return (
        <HRStaffLayout>
            <Head title="Employees Management" />
            <Toaster position="top-right" />

            <div className="space-y-6 animate-in fade-in duration-500">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Employees Management</h1>
                        <p className="text-sm text-slate-400 font-medium mt-0.5">
                            Manage staff records and information.
                            {employees.total > 0 && (
                                <span className="ml-2 text-indigo-500 font-bold">{employees.total} total</span>
                            )}
                        </p>
                    </div>
                    <Link href={route('staff.hr.employees.create')}>
                        <PrimaryButton className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                            </svg>
                            New Employee
                        </PrimaryButton>
                    </Link>
                </div>

                {/* Filters */}
                <Filters
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search by name or email…"
                    onReset={handleReset}
                    filters={[
                        {
                            key: 'department_id',
                            label: 'Department',
                            value: deptId,
                            onChange: setDeptId,
                            options: departments.map(d => ({ value: String(d.id), label: d.department_name })),
                        },
                        {
                            key: 'position_id',
                            label: 'Position',
                            value: posId,
                            onChange: setPosId,
                            options: positions.map(p => ({ value: String(p.id), label: p.position_name })),
                        },
                        {
                            key: 'employee_status_id',
                            label: 'Emp. Status',
                            value: statusId,
                            onChange: setStatusId,
                            options: employeeStatuses.map(s => ({ value: String(s.id), label: s.employee_status_name })),
                        },
                    ]}
                />

                {/* Table */}
                <Table
                    title="👥 Employee Roster"
                    subtitle="List of all active and inactive employees"
                    badgeCount={employees.total}
                    badgeColor="bg-indigo-50 text-indigo-600"
                    columns={[
                        'Profile',
                        <button key="name" onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-indigo-600 transition">
                            Name <SortIcon field="name" />
                        </button>,
                        <button key="dept" onClick={() => toggleSort('department_id')} className="flex items-center gap-1 hover:text-indigo-600 transition">
                            Department <SortIcon field="department_id" />
                        </button>,
                        'Position',
                        'Emp. Status',
                        'Status',
                        'Actions',
                    ]}
                >
                    {sorted.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="text-center py-12 text-slate-400 text-sm font-medium">
                                No employees found matching your filters.
                            </td>
                        </tr>
                    ) : sorted.map((emp) => (
                        <Tr key={emp.id}>
                            {/* Avatar */}
                            <Td>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 overflow-hidden flex-shrink-0">
                                    {emp.image_url ? (
                                        <img src={emp.image_url} alt={emp.first_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-indigo-600 font-black text-sm">
                                            {(emp.first_name?.[0] || '').toUpperCase()}{(emp.last_name?.[0] || '').toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </Td>
                            {/* Name */}
                            <Td>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-800">{emp.first_name} {emp.last_name}</span>
                                    <span className="text-[10px] font-medium text-slate-400">{emp.email || emp.contact || 'No contact info'}</span>
                                </div>
                            </Td>
                            {/* Department */}
                            <Td>
                                <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                    {emp.department?.department_name || '-'}
                                </span>
                            </Td>
                            {/* Position */}
                            <Td>
                                <span className="text-xs font-medium text-slate-500">
                                    {emp.position?.position_name || '-'}
                                </span>
                            </Td>
                            {/* Employment Status */}
                            <Td>
                                <span className="text-xs font-medium text-slate-500">
                                    {emp.employee_status?.employee_status_name || '-'}
                                </span>
                            </Td>
                            {/* Active Status */}
                            <Td>
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                    emp.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                }`}>
                                    {emp.status}
                                </span>
                            </Td>
                            {/* Actions */}
                            <Td>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={route('staff.hr.employees.edit', emp.id)}
                                        className="p-2 inline-flex text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(emp.id)}
                                        className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </Td>
                        </Tr>
                    ))}
                </Table>

                {/* Pagination */}
                {employees.last_page > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                        <p className="text-xs text-slate-400 font-medium">
                            Showing <span className="font-black text-slate-600">{employees.from}–{employees.to}</span> of{' '}
                            <span className="font-black text-slate-600">{employees.total}</span> employees
                        </p>
                        <Pagination
                            currentPage={employees.current_page}
                            totalPages={employees.last_page}
                            onPageChange={(page) =>
                                router.get(route('staff.hr.employees'), {
                                    search:              search      || undefined,
                                    department_id:       deptId      || undefined,
                                    position_id:         posId       || undefined,
                                    employee_status_id:  statusId    || undefined,
                                    page,
                                }, { preserveState: true })
                            }
                        />
                    </div>
                )}
            </div>
        </HRStaffLayout>
    );
}
