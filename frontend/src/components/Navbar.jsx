import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useNotifications } from '../hooks/useNotifications';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { items } = useCart();
    const { wishlist } = useWishlist();
    const navigate = useNavigate();
    const cartCount = items?.length || 0;

    const { notifications, unreadCount, markAllRead } = useNotifications(user?.username);
    const [showNotif, setShowNotif] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };

    const handleBellClick = () => {
        setShowNotif(prev => !prev);
        if (!showNotif) markAllRead(); // Đánh dấu đã đọc khi mở
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">

                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                            <span className="text-white font-black text-sm">MB</span>
                        </div>
                        <span className="text-xl font-black text-gray-800">
                            Mini<span className="text-indigo-600">Books</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/" className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition">
                            Trang chủ
                        </Link>
                        <Link to="/top" className="text-sm font-semibold text-amber-600 hover:text-amber-700 transition flex items-center gap-1">
                            🏆 Bảng xếp hạng
                        </Link>
                        {user && (
                            <>
                                <Link to="/cart" className="relative p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    {cartCount > 0 && (
                                        <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-rose-500 rounded-full shadow-sm ring-2 ring-white">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>

                                <Link to="/wishlist" className="relative p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all hidden md:block">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    {wishlist?.length > 0 && (
                                        <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-rose-500 rounded-full shadow-sm ring-2 ring-white">
                                            {wishlist.length}
                                        </span>
                                    )}
                                </Link>

                                <Link to="/profile?tab=orders" className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition">
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

                    <div className="flex items-center gap-3">
                        {/* Notification Bell — chỉ hiển thị khi đã đăng nhập */}
                        {user && (
                            <div className="relative">
                                <button
                                    onClick={handleBellClick}
                                    className="relative p-2 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                    title="Thông báo"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1 ring-2 ring-white">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Dropdown notification */}
                                {showNotif && (
                                    <div className="absolute right-0 top-12 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                            <span className="font-bold text-sm text-gray-800">Thông báo</span>
                                            {notifications.length > 0 && (
                                                <button
                                                    onClick={() => { setShowNotif(false); }}
                                                    className="text-xs text-gray-400 hover:text-indigo-600 transition"
                                                >
                                                    Đóng
                                                </button>
                                            )}
                                        </div>
                                        {notifications.length === 0 ? (
                                            <div className="py-8 text-center">
                                                <p className="text-2xl mb-2">🔔</p>
                                                <p className="text-gray-400 text-sm">Chưa có thông báo nào</p>
                                            </div>
                                        ) : (
                                            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                                                {notifications.slice(0, 10).map((n, i) => (
                                                    <div key={i} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                                                        <p className="font-semibold text-sm text-gray-800">{n.title}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                                                        <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {user ? (
                            <>
                                <Link to="/profile?tab=info" className="hidden sm:flex items-center gap-2 hover:bg-gray-50 px-2 py-1 rounded-lg transition">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                        {user.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">{user.username}</span>
                                </Link>
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
