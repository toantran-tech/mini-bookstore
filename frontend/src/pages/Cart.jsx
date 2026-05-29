import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useState } from 'react';

export default function Cart() {
    const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handlePlaceOrder = async () => {
        if (items.length === 0) return;
        setLoading(true);
        setMessage('');
        try {
            const orderPayload = {
                items: items.map(i => ({
                    bookId: i.bookId,
                    quantity: i.quantity,
                }))
            };
            await api.post('/orders', orderPayload);
            clearCart();
            setMessage('✅ Đặt hàng thành công!');
            setTimeout(() => navigate('/orders'), 1500);
        } catch (err) {
            setMessage('❌ ' + (err.response?.data?.message || 'Đặt hàng thất bại!'));
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <div className="text-8xl mb-6">🛒</div>
                <h2 className="text-2xl font-bold text-white mb-4">Giỏ hàng trống!</h2>
                <p className="text-slate-400 mb-8">Hãy thêm sách vào giỏ trước nhé.</p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 rounded-xl transition"
                >
                    Mua sắm ngay
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-8">🛒 Giỏ Hàng ({totalItems} sản phẩm)</h1>

            {/* Danh sách sản phẩm */}
            <div className="flex flex-col gap-4 mb-8">
                {items.map(item => (
                    <div key={item.bookId} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
                        <div className="text-4xl">📖</div>
                        <div className="flex-1">
                            <h3 className="text-white font-semibold">{item.title}</h3>
                            <p className="text-amber-400 font-bold">{item.price?.toLocaleString('vi-VN')}đ</p>
                        </div>

                        {/* Điều chỉnh số lượng */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                                className="w-8 h-8 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition"
                            >
                                −
                            </button>
                            <span className="text-white font-bold w-8 text-center">{item.quantity}</span>
                            <button
                                onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                                className="w-8 h-8 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition"
                            >
                                +
                            </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right w-28">
                            <p className="text-white font-bold">
                                {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                            </p>
                        </div>

                        {/* Xóa */}
                        <button
                            onClick={() => removeItem(item.bookId)}
                            className="text-slate-400 hover:text-red-400 transition text-xl"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            {/* Tổng + Đặt hàng */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-slate-300 text-lg">Tổng cộng:</span>
                    <span className="text-amber-400 text-2xl font-bold">
                        {totalPrice.toLocaleString('vi-VN')}đ
                    </span>
                </div>

                {message && (
                    <div className={`p-3 rounded-lg mb-4 text-center text-sm ${message.startsWith('✅') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                        {message}
                    </div>
                )}

                <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition text-lg"
                >
                    {loading ? 'Đang đặt hàng...' : '✅ Đặt Hàng Ngay'}
                </button>
            </div>
        </div>
    );
}
