import { Link, Outlet, useLocation } from 'react-router-dom';

export default function AdminLayout() {
    const location = useLocation();

    const navItems = [
        { path: '/admin', label: '📊 Dashboard', exact: true },
        { path: '/admin/books', label: '📚 Quản lý Sách' },
        { path: '/admin/orders', label: '📋 Quản lý Đơn hàng' },
        { path: '/admin/coupons', label: '🎁 Mã Giảm Giá' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-56 bg-white border-r border-gray-200 p-4 flex flex-col gap-2 shadow-sm">
                <p className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-4 px-2">Admin Panel</p>
                {navItems.map(item => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                            item.exact
                                ? location.pathname === item.path
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                    : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                                : location.pathname.startsWith(item.path)
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                    : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
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
