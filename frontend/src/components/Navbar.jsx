import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { totalItems } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="text-xl font-bold text-amber-400 hover:text-amber-300 transition">
                    📚 Mini Bookstore
                </Link>

                {/* Nav links */}
                <div className="flex items-center gap-6">
                    <Link to="/" className="text-slate-300 hover:text-white transition text-sm font-medium">
                        Trang Chủ
                    </Link>

                    {/* Giỏ hàng — chỉ hiện khi đã login */}
                    {user && (
                        <Link to="/cart" className="relative text-slate-300 hover:text-white transition text-sm font-medium">
                            🛒 Giỏ hàng
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-3 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                    )}

                    {/* Lịch sử đơn hàng */}
                    {user && (
                        <Link to="/orders" className="text-slate-300 hover:text-white transition text-sm font-medium">
                            📋 Đơn hàng
                        </Link>
                    )}

                    {/* Admin link */}
                    {user?.role === 'ROLE_ADMIN' && (
                        <Link to="/admin/books" className="text-amber-400 hover:text-amber-300 transition text-sm font-medium">
                            ⚙️ Admin
                        </Link>
                    )}
                </div>

                {/* Auth buttons */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            <span className="text-slate-400 text-sm">Xin chào, <span className="text-amber-400 font-semibold">{user.username}</span></span>
                            <button
                                onClick={handleLogout}
                                className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-4 py-2 rounded-lg transition"
                            >
                                Đăng xuất
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-slate-300 hover:text-white transition text-sm">
                                Đăng nhập
                            </Link>
                            <Link
                                to="/register"
                                className="bg-amber-500 hover:bg-amber-600 text-white text-sm px-4 py-2 rounded-lg transition font-semibold"
                            >
                                Đăng ký
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
