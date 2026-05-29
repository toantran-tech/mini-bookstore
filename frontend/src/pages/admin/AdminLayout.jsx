import { Link, Outlet, useLocation } from 'react-router-dom';

export default function AdminLayout() {
    const location = useLocation();

    const navItems = [
        { path: '/admin/books', label: '📚 Quản lý Sách' },
        { path: '/admin/orders', label: '📋 Quản lý Đơn hàng' },
    ];

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-56 bg-slate-900 border-r border-slate-700 p-4 flex flex-col gap-2">
                <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-4">Admin Panel</p>
                {navItems.map(item => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition ${location.pathname === item.path
                                ? 'bg-amber-500 text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        {item.label}
                    </Link>
                ))}
            </aside>

            {/* Content */}
            <main className="flex-1 p-8">
                <Outlet />
            </main>
        </div>
    );
}
