import { useState, useEffect } from 'react';
import api from '../../services/api';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const STATUS_COLOR = {
    Pending: 'bg-yellow-500/20 text-yellow-400',
    Processing: 'bg-blue-500/20 text-blue-400',
    Shipped: 'bg-purple-500/20 text-purple-400',
    Delivered: 'bg-green-500/20 text-green-400',
};

export default function ManageOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null); // id đang update

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get('/orders/all');
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdating(orderId);
        try {
            await api.patch(`/orders/${orderId}/status`, { status: newStatus });
            // Cập nhật local state luôn, không cần fetch lại
            setOrders(prev =>
                prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
            );
        } catch (err) {
            alert('Cập nhật thất bại!');
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">📋 Quản lý Đơn hàng</h1>

            {loading ? (
                <div className="text-amber-400 animate-pulse">Đang tải...</div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-700">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 text-left">ID</th>
                                <th className="px-4 py-3 text-left">User</th>
                                <th className="px-4 py-3 text-left">Ngày đặt</th>
                                <th className="px-4 py-3 text-left">Tổng tiền</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Cập nhật</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} className="border-t border-slate-700 hover:bg-slate-800/50 transition">
                                    <td className="px-4 py-3 text-slate-400">#{order.id}</td>
                                    <td className="px-4 py-3 text-white font-medium">{order.user?.username || '—'}</td>
                                    <td className="px-4 py-3 text-slate-300">
                                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-amber-400 font-semibold">
                                        {order.totalAmount?.toLocaleString('vi-VN')}đ
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${STATUS_COLOR[order.status] || 'bg-slate-600 text-slate-300'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={order.status}
                                            onChange={e => handleStatusChange(order.id, e.target.value)}
                                            disabled={updating === order.id}
                                            className="bg-slate-700 border border-slate-600 text-white text-xs px-2 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
                                        >
                                            {STATUSES.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
