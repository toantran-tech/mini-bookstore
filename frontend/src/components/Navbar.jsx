import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { totalItems } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                            <span className="text-white font-black text-sm">MB</span>
                        </div>
                        <span className="text-xl font-black text-gray-800">
                            Mini<span className="text-indigo-600">Books</span>
                        </span>
                    </Link>

                    {/* Nav links */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/" className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition">
                            Trang chủ
                        </Link>
                        <Link to="/top" className="text-sm font-semibold text-amber-600 hover:text-amber-700 transition flex items-center gap-1">
                            🏆 Bảng xếp hạng
                        </Link>
                        {user && (
                            <>
                                <Link to="/cart" className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition relative">
                                    Giỏ hàng
                                    {totalItems > 0 && (
                                        <span className="absolute -top-2 -right-3 bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                                            {totalItems > 9 ? '9+' : totalItems}
                                        </span>
                                    )}
                                </Link>
                                <Link to="/orders" className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition">
                                    Đơn hàng
                                </Link>
                            </>
                        )}
                        {user?.role === 'ROLE_ADMIN' && (
                            <Link to="/admin/books" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition">
                                ⚙️ Admin
                            </Link>
                        )}
                    </div>

                    {/* Auth */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            <>
                                <div className="hidden sm:flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                        {user.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{user.username}</span>
                                </div>
                                <button onClick={handleLogout}
                                    className="text-xs px-3 py-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 font-semibold transition">
                                    Đăng xuất
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition">
                                    Đăng nhập
                                </Link>
                                <Link to="/register"
                                    className="text-sm font-bold px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-200">
                                    Đăng ký
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
