import { useState, useEffect } from 'react';
import api from '../services/api';

const STATUS_COLOR = {
    Pending: 'bg-yellow-500/20 text-yellow-400',
    Processing: 'bg-blue-500/20 text-blue-400',
    Shipped: 'bg-purple-500/20 text-purple-400',
    Delivered: 'bg-green-500/20 text-green-400',
};

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null); // id đơn đang mở

    useEffect(() => {
        api.get('/orders/my')
            .then(res => setOrders(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="text-amber-400 animate-pulse">Đang tải đơn hàng...</div>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-8">📋 Lịch Sử Đơn Hàng</h1>

            {orders.length === 0 ? (
                <div className="text-center text-slate-400 py-20">
                    <div className="text-6xl mb-4">📭</div>
                    <p>Bạn chưa có đơn hàng nào.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {orders.map(order => (
                        <div key={order.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                            {/* Header đơn hàng */}
                            <div
                                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-750 transition"
                                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                            >
                                <div>
                                    <p className="text-white font-semibold">Đơn #{order.id}</p>
                                    <p className="text-slate-400 text-sm mt-1">
                                        {new Date(order.orderDate).toLocaleDateString('vi-VN', {
                                            day: '2-digit', month: '2-digit', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${STATUS_COLOR[order.status] || 'bg-slate-600 text-slate-300'
                                        }`}>
                                        {order.status}
                                    </span>
                                    <span className="text-amber-400 font-bold">
                                        {order.totalAmount?.toLocaleString('vi-VN')}đ
                                    </span>
                                    <span className="text-slate-400">{expanded === order.id ? '▲' : '▼'}</span>
                                </div>
                            </div>

                            {/* Chi tiết đơn — accordion */}
                            {expanded === order.id && (
                                <div className="border-t border-slate-700 p-5">
                                    <p className="text-slate-400 text-xs uppercase tracking-wide mb-3 font-semibold">Chi tiết sản phẩm</p>
                                    <div className="flex flex-col gap-2">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                <span className="text-slate-300">{item.bookTitle}</span>
                                                <span className="text-slate-400">x{item.quantity}</span>
                                                <span className="text-white font-medium">
                                                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
