import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useState } from 'react';

export default function Cart() {
    const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems, loading } = useCart();
    const navigate = useNavigate();
    const [ordering, setOrdering] = useState(false);
    const [message, setMessage] = useState('');

    const handlePlaceOrder = () => {
        if (items.length === 0) return;
        navigate('/checkout');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Đang tải giỏ hàng...</p>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
                <div className="text-center">
                    <div className="text-8xl mb-6 animate-bounce">🛒</div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-3">Giỏ hàng đang trống</h2>
                    <p className="text-slate-500 mb-8 text-lg">Hãy khám phá và thêm những cuốn sách hay vào giỏ nhé!</p>
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-indigo-200 hover:scale-105 duration-200"
                    >
                        <span>🔍</span> Khám phá sách
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10">
            <div className="max-w-5xl mx-auto px-4">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Giỏ Hàng</h1>
                        <p className="text-slate-500 mt-1">{totalItems} sản phẩm đang chờ bạn</p>
                    </div>
                    <button
                        onClick={clearCart}
                        className="flex items-center gap-2 text-sm text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-4 py-2 rounded-xl transition-all"
                    >
                        🗑️ Xóa tất cả
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Danh sách sản phẩm */}
                    <div className="flex-1 flex flex-col gap-4">
                        {items.map((item, index) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-5 hover:shadow-md transition-shadow duration-200"
                                style={{ animationDelay: `${index * 60}ms` }}
                            >
                                {/* Ảnh sách */}
                                <div className="w-20 h-28 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 shadow">
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.bookTitle}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl">📖</div>
                                    )}
                                </div>

                                {/* Thông tin */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-slate-800 text-base leading-tight line-clamp-2 mb-1">
                                        {item.bookTitle}
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-2">{item.bookAuthor}</p>
                                    <p className="text-indigo-600 font-bold text-base">
                                        {item.price?.toLocaleString('vi-VN')}đ
                                    </p>
                                </div>

                                {/* Điều chỉnh số lượng */}
                                <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="w-8 h-8 flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 rounded-lg font-bold text-lg transition shadow-sm"
                                    >
                                        −
                                    </button>
                                    <span className="text-slate-800 font-bold w-8 text-center text-sm">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="w-8 h-8 flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 rounded-lg font-bold text-lg transition shadow-sm"
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Subtotal */}
                                <div className="text-right min-w-[90px]">
                                    <p className="font-bold text-slate-800 text-base">
                                        {item.subtotal?.toLocaleString('vi-VN')}đ
                                    </p>
                                </div>

                                {/* Xóa */}
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all text-xl"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="w-full lg:w-80 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-slate-800 mb-5">Tóm tắt đơn hàng</h2>

                            <div className="space-y-3 mb-5">
                                <div className="flex justify-between text-slate-500 text-sm">
                                    <span>Số lượng sản phẩm</span>
                                    <span className="font-medium text-slate-700">{totalItems}</span>
                                </div>
                                <div className="flex justify-between text-slate-500 text-sm">
                                    <span>Phí vận chuyển</span>
                                    <span className="text-green-500 font-medium">Miễn phí 🎉</span>
                                </div>
                                <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-center">
                                    <span className="font-semibold text-slate-700">Tổng cộng</span>
                                    <span className="text-2xl font-bold text-indigo-600">
                                        {totalPrice?.toLocaleString('vi-VN')}đ
                                    </span>
                                </div>
                            </div>

                            {/* Success message */}
                            {message === 'success' && (
                                <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm text-center font-medium">
                                    ✅ Đặt hàng thành công! Đang chuyển hướng...
                                </div>
                            )}
                            {message && message !== 'success' && (
                                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                                    ❌ {message}
                                </div>
                            )}

                            <button
                                onClick={handlePlaceOrder}
                                disabled={ordering}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-all shadow-md hover:shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] duration-200 text-base"
                            >
                                {ordering ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        Đang đặt...
                                    </span>
                                ) : '🛍️ Đặt Hàng Ngay'}
                            </button>

                            <button
                                onClick={() => navigate('/')}
                                className="w-full mt-3 text-slate-500 hover:text-indigo-600 font-medium py-2 rounded-xl transition text-sm"
                            >
                                ← Tiếp tục mua sắm
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
