import { useEffect, useRef, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

export default function PaymentReturn() {
    const [searchParams] = useSearchParams();
    const navigate       = useNavigate();
    const { clearCart }  = useCart();
    const cartCleared    = useRef(false);
    const [countdown, setCountdown] = useState(5);

    // These sanitized values are produced only after backend signature verification.
    const responseCode = searchParams.get('code');
    const success      = searchParams.get('success') === 'true';
    const orderId      = searchParams.get('orderId');

    useEffect(() => {
        if (success && !cartCleared.current) {
            cartCleared.current = true;
            clearCart().catch(() => {
                // The order is already paid; a later cart refresh can reconcile UI state.
            });
        }
    }, [success, clearCart]);
    useEffect(() => {
        // Đếm ngược 5 giây rồi tự redirect
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate(success ? '/profile?tab=orders' : '/cart');
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [success, navigate]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="text-center bg-white rounded-3xl shadow-xl border border-gray-100 p-10 max-w-md w-full">
                {success ? (
                    <>
                        {/* Thành công */}
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 mb-2">Thanh toán thành công!</h1>
                        <p className="text-gray-500 mb-1">Đơn hàng #{orderId} đã được xác nhận.</p>
                        <p className="text-gray-400 text-sm mb-6">Cảm ơn bạn đã mua hàng tại MiniBooks 📚</p>

                        <Link
                            to="/profile?tab=orders"
                            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-md shadow-indigo-200"
                        >
                            Xem đơn hàng
                        </Link>

                        <p className="text-xs text-gray-400 mt-4">
                            Tự động chuyển sau <span className="font-bold text-indigo-600">{countdown}s</span>
                        </p>
                    </>
                ) : (
                    <>
                        {/* Thất bại */}
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 mb-2">Thanh toán thất bại!</h1>
                        <p className="text-gray-500 mb-1">
                            {responseCode === '24'
                                ? 'Giao dịch bị hủy bởi người dùng.'
                                : `Lỗi thanh toán (mã: ${responseCode})`}
                        </p>
                        <p className="text-gray-400 text-sm mb-6">Đơn hàng chưa được xử lý. Vui lòng thử lại.</p>

                        <Link
                            to="/cart"
                            className="inline-block bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-3 rounded-xl transition shadow-md shadow-rose-200"
                        >
                            Quay lại giỏ hàng
                        </Link>

                        <p className="text-xs text-gray-400 mt-4">
                            Tự động chuyển sau <span className="font-bold text-rose-500">{countdown}s</span>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
