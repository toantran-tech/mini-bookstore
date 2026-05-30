import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SHIPPING_OPTIONS = [
    {
        id: 'STANDARD',
        label: 'Giao hàng tiêu chuẩn',
        desc: '3-5 ngày làm việc',
        fee: 0,
        icon: '📦',
    },
    {
        id: 'EXPRESS',
        label: 'Giao hàng nhanh',
        desc: '1-2 ngày làm việc',
        fee: 20000,
        icon: '🚀',
    },
    {
        id: 'SAME_DAY',
        label: 'Giao hỏa tốc',
        desc: 'Trong ngày (nội thành)',
        fee: 50000,
        icon: '⚡',
    },
];

export default function Checkout() {
    const { items, totalPrice, clearCart } = useCart();
    const navigate = useNavigate();

    // Form state
    const [address, setAddress] = useState({ name: '', phone: '', street: '', city: '' });
    const [shippingMethod, setShippingMethod] = useState('STANDARD');
    const [couponCode, setCouponCode] = useState('');
    const [couponResult, setCouponResult] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [ordering, setOrdering] = useState(false);
    const [errors, setErrors] = useState({});

    const selectedShipping = SHIPPING_OPTIONS.find(o => o.id === shippingMethod);
    const shippingFee = selectedShipping?.fee || 0;
    const discountAmount = couponResult?.valid ? couponResult.discountAmount : 0;
    const finalTotal = totalPrice + shippingFee - discountAmount;

    // Validate coupon
    const handleValidateCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponResult(null);
        try {
            const res = await api.post('/coupons/validate', {
                code: couponCode.trim(),
                orderSubtotal: totalPrice,
            });
            setCouponResult(res.data);
        } catch {
            setCouponResult({ valid: false, message: 'Không thể kiểm tra mã. Thử lại sau.' });
        } finally {
            setCouponLoading(false);
        }
    };

    const removeCoupon = () => {
        setCouponCode('');
        setCouponResult(null);
    };

    // Validate form
    const validateForm = () => {
        const e = {};
        if (!address.name.trim()) e.name = 'Vui lòng nhập họ tên';
        if (!address.phone.trim()) e.phone = 'Vui lòng nhập số điện thoại';
        if (!address.street.trim()) e.street = 'Vui lòng nhập địa chỉ';
        if (!address.city.trim()) e.city = 'Vui lòng nhập tỉnh/thành phố';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) return;
        setOrdering(true);
        try {
            const fullAddress = `${address.name} | ${address.phone} | ${address.street}, ${address.city}`;
            await api.post('/orders', {
                items: items.map(i => ({ bookId: i.bookId, quantity: i.quantity })),
                shippingAddress: fullAddress,
                shippingMethod,
                couponCode: couponResult?.valid ? couponCode.trim() : null,
            });
            await clearCart();
            navigate('/order-success');
        } catch (err) {
            alert(err.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại!');
        } finally {
            setOrdering(false);
        }
    };

    if (items.length === 0) {
        navigate('/cart');
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10">
            <div className="max-w-5xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Thanh toán</h1>
                <p className="text-slate-500 mb-8">Hoàn tất thông tin để đặt hàng</p>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* ===== LEFT: FORM ===== */}
                    <div className="flex-1 flex flex-col gap-6">

                        {/* 1. Địa chỉ giao hàng */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                                <h2 className="text-lg font-bold text-slate-800">Địa chỉ giao hàng</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { key: 'name', label: 'Họ và tên', placeholder: 'Nguyễn Văn A', col: 1 },
                                    { key: 'phone', label: 'Số điện thoại', placeholder: '0901234567', col: 1 },
                                    { key: 'street', label: 'Địa chỉ cụ thể', placeholder: '123 Nguyễn Huệ, Phường Bến Nghé', col: 2 },
                                    { key: 'city', label: 'Tỉnh / Thành phố', placeholder: 'TP. Hồ Chí Minh', col: 1 },
                                ].map(field => (
                                    <div key={field.key} className={field.col === 2 ? 'sm:col-span-2' : ''}>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">{field.label}</label>
                                        <input
                                            type="text"
                                            placeholder={field.placeholder}
                                            value={address[field.key]}
                                            onChange={e => setAddress(prev => ({ ...prev, [field.key]: e.target.value }))}
                                            className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-indigo-300 ${errors[field.key] ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-indigo-400'}`}
                                        />
                                        {errors[field.key] && <p className="text-red-500 text-xs mt-1">{errors[field.key]}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Phương thức giao hàng */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                                <h2 className="text-lg font-bold text-slate-800">Phương thức giao hàng</h2>
                            </div>
                            <div className="flex flex-col gap-3">
                                {SHIPPING_OPTIONS.map(opt => (
                                    <label
                                        key={opt.id}
                                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${shippingMethod === opt.id
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="shipping"
                                            value={opt.id}
                                            checked={shippingMethod === opt.id}
                                            onChange={() => setShippingMethod(opt.id)}
                                            className="accent-indigo-600 w-4 h-4"
                                        />
                                        <span className="text-2xl">{opt.icon}</span>
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-800 text-sm">{opt.label}</p>
                                            <p className="text-slate-400 text-xs">{opt.desc}</p>
                                        </div>
                                        <span className={`font-bold text-sm ${opt.fee === 0 ? 'text-green-500' : 'text-slate-700'}`}>
                                            {opt.fee === 0 ? 'Miễn phí' : `+${opt.fee.toLocaleString('vi-VN')}đ`}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 3. Mã giảm giá */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                                <h2 className="text-lg font-bold text-slate-800">Mã giảm giá</h2>
                            </div>

                            {couponResult?.valid ? (
                                /* Coupon đã áp dụng thành công */
                                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🎉</span>
                                        <div>
                                            <p className="font-bold text-green-700 text-sm">{couponCode.toUpperCase()}</p>
                                            <p className="text-green-600 text-xs">Giảm {couponResult.discountAmount.toLocaleString('vi-VN')}đ</p>
                                        </div>
                                    </div>
                                    <button onClick={removeCoupon} className="text-slate-400 hover:text-red-500 transition text-xl font-bold">×</button>
                                </div>
                            ) : (
                                /* Ô nhập mã */
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        placeholder="Nhập mã giảm giá (VD: SALE20)"
                                        value={couponCode}
                                        onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); }}
                                        onKeyDown={e => e.key === 'Enter' && handleValidateCoupon()}
                                        className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
                                    />
                                    <button
                                        onClick={handleValidateCoupon}
                                        disabled={couponLoading || !couponCode.trim()}
                                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-5 py-3 rounded-xl transition text-sm"
                                    >
                                        {couponLoading ? '...' : 'Áp dụng'}
                                    </button>
                                </div>
                            )}

                            {/* Thông báo lỗi coupon */}
                            {couponResult && !couponResult.valid && (
                                <p className="mt-2 text-red-500 text-sm flex items-center gap-1">
                                    <span>❌</span> {couponResult.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ===== RIGHT: ORDER SUMMARY ===== */}
                    <div className="w-full lg:w-80 flex-shrink-0">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Đơn hàng ({items.length} sản phẩm)</h2>

                            {/* Danh sách sản phẩm */}
                            <div className="space-y-3 mb-4 max-h-52 overflow-y-auto pr-1">
                                {items.map(item => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        <div className="w-10 h-14 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                                            {item.imageUrl
                                                ? <img src={item.imageUrl} alt={item.bookTitle} className="w-full h-full object-cover" />
                                                : <div className="w-full h-full flex items-center justify-center text-lg">📖</div>
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-slate-700 line-clamp-2">{item.bookTitle}</p>
                                            <p className="text-xs text-slate-400">x{item.quantity}</p>
                                        </div>
                                        <p className="text-xs font-bold text-indigo-600 flex-shrink-0">
                                            {item.subtotal?.toLocaleString('vi-VN')}đ
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-dashed border-slate-200 pt-4 space-y-2 text-sm">
                                <div className="flex justify-between text-slate-500">
                                    <span>Tiền hàng</span>
                                    <span>{totalPrice?.toLocaleString('vi-VN')}đ</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>Phí vận chuyển</span>
                                    <span className={shippingFee === 0 ? 'text-green-500' : ''}>
                                        {shippingFee === 0 ? 'Miễn phí' : `+${shippingFee.toLocaleString('vi-VN')}đ`}
                                    </span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600 font-medium">
                                        <span>🎟️ Giảm giá</span>
                                        <span>-{discountAmount.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                )}
                                <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                                    <span className="font-semibold text-slate-700">Tổng thanh toán</span>
                                    <span className="text-2xl font-black text-indigo-600">
                                        {finalTotal.toLocaleString('vi-VN')}đ
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={ordering}
                                className="w-full mt-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-all shadow-md hover:shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] duration-200"
                            >
                                {ordering ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        Đang xử lý...
                                    </span>
                                ) : '✅ Xác nhận đặt hàng'}
                            </button>

                            <button
                                onClick={() => navigate('/cart')}
                                className="w-full mt-2 text-slate-400 hover:text-indigo-600 text-sm py-2 transition"
                            >
                                ← Quay lại giỏ hàng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
