import InventoryStaffLayout from '@/Layouts/InventoryStaffLayout';
import { Head } from '@inertiajs/react';

export default function StaffTasks() {
    const tasks = [
        { id: 1, title: 'Feeding Cycle: Batch A', priority: 'High', due: '10:00 AM', status: 'Pending', category: 'Biological' },
        { id: 2, title: 'Warehouse A-1 Disinfection', priority: 'Medium', due: '02:00 PM', status: 'In Progress', category: 'Maintenance' },
        { id: 3, title: 'Prepare Silk Reeling Machine', priority: 'Low', due: 'Tomorrow', status: 'Completed', category: 'Equipment' },
    ];

    return (
        <InventoryStaffLayout>
            <Head title="Tasks" />

            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Daily Task Board</h1>
                    <p className="text-slate-500 font-medium mt-1">Track and manage your daily operations.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {['Pending', 'In Progress', 'Completed'].map((status) => (
                        <div key={status} className="space-y-4">
                            <div className="flex items-center justify-between px-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{status}</h3>
                                <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                    {tasks.filter(t => t.status === status).length}
                                </span>
                            </div>

                            <div className="space-y-4">
                                {tasks.filter(t => t.status === status).map((task) => (
                                    <div key={task.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition group cursor-pointer">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${task.priority === 'High' ? 'bg-rose-50 text-rose-600' :
                                                    task.priority === 'Medium' ? 'bg-amber-50 text-amber-600' :
                                                        'bg-slate-100 text-slate-500'
                                                }`}>
                                                {task.priority}
                                            </span>
                                            <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-emerald-600 transition">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                </svg>
                                            </button>
                                        </div>
                                        <h4 className="font-bold text-slate-900 mb-1 group-hover:text-emerald-600 transition">{task.title}</h4>
                                        <p className="text-xs text-slate-500 mb-6">{task.category}</p>

                                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-[10px] font-bold uppercase">{task.due}</span>
                                            </div>
                                            <div className="flex -space-x-2">
                                                <img className="w-6 h-6 rounded-lg border-2 border-white bg-emerald-500" src="https://ui-avatars.com/api/?name=Staff&background=10b981&color=fff" alt="" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 text-xs font-bold hover:bg-slate-50 hover:border-emerald-200 hover:text-emerald-500 transition">
                                    + New Task
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </InventoryStaffLayout>
    );
}
