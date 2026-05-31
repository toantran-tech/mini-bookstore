import { useState, useEffect } from 'react';
import api from '../../services/api';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const STATUS_COLOR = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Processing: 'bg-blue-100 text-blue-700',
    Shipped: 'bg-purple-100 text-purple-700',
    Delivered: 'bg-green-100 text-green-700',
};

export default function ManageOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Quản lý Đơn hàng</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Theo dõi và cập nhật trạng thái các đơn đặt hàng</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-400 uppercase text-xs font-black tracking-wider border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left">Mã Đơn</th>
                                    <th className="px-6 py-4 text-left">Khách Hàng</th>
                                    <th className="px-6 py-4 text-left">Ngày Đặt</th>
                                    <th className="px-6 py-4 text-left">Tổng Tiền</th>
                                    <th className="px-6 py-4 text-left">Trạng Thái</th>
                                    <th className="px-6 py-4 text-left">Cập Nhật</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map(order => (
                                    <tr key={order.id} className="hover:bg-indigo-50/50 transition">
                                        <td className="px-6 py-4 text-gray-500 font-bold">#{order.id}</td>
                                        <td className="px-6 py-4 text-gray-900 font-bold">{order.user?.username || '—'}</td>
                                        <td className="px-6 py-4 text-gray-500 font-medium">
                                            {order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-indigo-600 font-black">
                                            {order.totalAmount?.toLocaleString('vi-VN')}đ
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-3 py-1.5 rounded-lg font-bold ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={order.status}
                                                onChange={e => handleStatusChange(order.id, e.target.value)}
                                                disabled={updating === order.id}
                                                className="bg-gray-50 border border-gray-200 text-gray-900 font-semibold text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer shadow-sm transition-all"
                                            >
                                                {STATUSES.map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-400 font-medium">Chưa có đơn hàng nào.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
