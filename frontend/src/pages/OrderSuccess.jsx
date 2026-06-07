import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OrderSuccess() {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => navigate('/orders'), 5000);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-3xl font-black text-slate-800 mb-3">Đặt hàng thành công! 🎉</h1>
                <p className="text-slate-500 mb-2 text-base leading-relaxed">
                    Cảm ơn bạn đã tin tưởng mua sắm tại <span className="text-indigo-600 font-semibold">Mega Bookstore</span>.
                </p>
                <p className="text-slate-400 text-sm mb-8">
                    Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ giao hàng sớm nhất có thể!
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => navigate('/orders')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-2xl transition shadow-md hover:shadow-indigo-200"
                    >
                        📋 Xem đơn hàng
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 font-medium px-8 py-3 rounded-2xl transition"
                    >
                        🔍 Tiếp tục mua sắm
                    </button>
                </div>

                <p className="text-slate-300 text-xs mt-6">Tự động chuyển sang lịch sử đơn hàng sau 5 giây...</p>
            </div>
        </div>
    );
}
