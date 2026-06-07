import { useState, useEffect, Fragment, useMemo } from 'react';
import api from '../../services/api';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_CONFIG = {
    // Status mới
    Pending:    { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Chờ xử lý' },
    Processing: { color: 'bg-blue-100 text-blue-800 border-blue-200',       label: 'Đang xử lý' },
    Shipped:    { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Đã giao' },
    Delivered:  { color: 'bg-green-100 text-green-800 border-green-200',    label: 'Hoàn thành' },
    Cancelled:  { color: 'bg-red-100 text-red-800 border-red-200',          label: 'Đã hủy' },
    // Status cũ trong DB (legacy)
    CONFIRMED:  { color: 'bg-green-100 text-green-800 border-green-200',    label: 'Đã xác nhận' },
    PENDING:    { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Chờ xử lý' },
    CANCELLED:  { color: 'bg-red-100 text-red-800 border-red-200',          label: 'Đã hủy' },
    DELIVERED:  { color: 'bg-green-100 text-green-800 border-green-200',    label: 'Hoàn thành' },
};

const STATUS_NEXT = { Pending: 'Processing', Processing: 'Shipped', Shipped: 'Delivered' };

export default function ManageOrders() {
    const [orders, setOrders]         = useState([]);
    const [loading, setLoading]       = useState(true);
    const [updating, setUpdating]     = useState(null);
    const [filterStatus, setFilter]   = useState('');
    const [search, setSearch]         = useState('');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => { fetchOrders(); }, []);

    async function fetchOrders() {
        setLoading(true);
        try {
            const res = await api.get('/orders/all');
            const data = res.data;
            console.log('[ManageOrders] API response:', data);
            const list = Array.isArray(data) ? data : (data?.content || []);
            console.log('[ManageOrders] Orders list length:', list.length);
            setOrders(list);
        } catch (e) {
            console.error('Lỗi tải đơn hàng:', e);
            alert('Lỗi tải đơn hàng: ' + (e.response?.status || e.message));
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusChange(orderId, newStatus) {
        setUpdating(orderId);
        try {
            await api.patch(`/orders/${orderId}/status`, { status: newStatus });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch {
            alert('Cập nhật trạng thái thất bại!');
        } finally {
            setUpdating(null);
        }
    }

    const filtered = useMemo(() => orders.filter(o => {
        if (filterStatus && o.status !== filterStatus) return false;
        if (search) {
            const q = search.toLowerCase();
            return (
                String(o.id).includes(q) ||
                (o.user?.username || '').toLowerCase().includes(q) ||
                (o.shippingAddress || '').toLowerCase().includes(q)
            );
        }
        return true;
    }), [orders, filterStatus, search]);

    const stats = useMemo(() => ({
        total:      orders.length,
        pending:    orders.filter(o => o.status === 'Pending').length,
        processing: orders.filter(o => o.status === 'Processing').length,
        delivered:  orders.filter(o => o.status === 'Delivered').length,
        revenue:    orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + (o.totalAmount || 0), 0),
    }), [orders]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Quản lý Đơn hàng</h1>
                    <p className="text-gray-500 text-sm mt-1">Theo dõi và cập nhật trạng thái đơn đặt hàng</p>
                </div>
                <button onClick={fetchOrders}
                    className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-semibold text-sm hover:bg-indigo-100 transition">
                    ↻ Làm mới
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Tổng đơn',   value: stats.total,      cls: 'bg-gray-50   border-gray-200   text-gray-700' },
                    { label: 'Chờ xử lý',  value: stats.pending,    cls: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                    { label: 'Đang xử lý', value: stats.processing, cls: 'bg-blue-50   border-blue-200   text-blue-700' },
                    { label: 'Hoàn thành', value: stats.delivered,  cls: 'bg-green-50  border-green-200  text-green-700' },
                    { label: 'Doanh thu',  value: stats.revenue.toLocaleString('vi-VN') + 'đ', cls: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
                ].map(s => (
                    <div key={s.label} className={`${s.cls} border rounded-2xl p-4`}>
                        <p className="text-xs font-semibold opacity-70 mb-1">{s.label}</p>
                        <p className="text-xl font-black">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    placeholder="Tìm theo mã đơn, tên khách hàng..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <div className="flex gap-2 flex-wrap">
                    {['', ...STATUSES].map(s => (
                        <button key={s || 'all'} onClick={() => setFilter(s)}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                                filterStatus === s
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-400'
                            }`}>
                            {s ? STATUS_CONFIG[s].label : 'Tất cả'}
                            {s && <span className="ml-1 opacity-60">({orders.filter(o => o.status === s).length})</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-400 uppercase text-xs font-black tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left w-8"></th>
                                <th className="px-6 py-4 text-left">Mã</th>
                                <th className="px-6 py-4 text-left">Khách hàng</th>
                                <th className="px-6 py-4 text-left">Ngày đặt</th>
                                <th className="px-6 py-4 text-left">Tổng tiền</th>
                                <th className="px-6 py-4 text-left">Trạng thái</th>
                                <th className="px-6 py-4 text-left">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-gray-400 font-medium">
                                        {orders.length === 0 ? 'Chưa có đơn hàng nào.' : 'Không tìm thấy đơn hàng phù hợp.'}
                                    </td>
                                </tr>
                            )}
                            {filtered.map(order => (
                                <Fragment key={order.id}>
                                    {/* Row chính */}
                                    <tr
                                        className={`hover:bg-indigo-50/30 cursor-pointer transition ${expandedId === order.id ? 'bg-indigo-50/20' : ''}`}
                                        onClick={() => setExpandedId(prev => prev === order.id ? null : order.id)}
                                    >
                                        <td className="px-6 py-4 text-gray-400 text-xs font-bold">
                                            {expandedId === order.id ? '▼' : '▶'}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-500">#{order.id}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900">{order.user?.username || '—'}</td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {order.orderDate
                                                ? new Date(order.orderDate).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                : '—'}
                                        </td>
                                        <td className="px-6 py-4 font-black text-indigo-600">
                                            {(order.totalAmount || 0).toLocaleString('vi-VN')}đ
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2.5 py-1 rounded-lg font-bold border ${STATUS_CONFIG[order.status]?.color || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                {STATUS_CONFIG[order.status]?.label || order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center gap-2">
                                                {STATUS_NEXT[order.status] && (
                                                    <button
                                                        onClick={() => handleStatusChange(order.id, STATUS_NEXT[order.status])}
                                                        disabled={updating === order.id}
                                                        className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition disabled:opacity-50">
                                                        {updating === order.id ? '...' : `→ ${STATUS_CONFIG[STATUS_NEXT[order.status]].label}`}
                                                    </button>
                                                )}
                                                <select
                                                    value={order.status}
                                                    onChange={e => handleStatusChange(order.id, e.target.value)}
                                                    disabled={updating === order.id}
                                                    onClick={e => e.stopPropagation()}
                                                    className="text-xs bg-gray-50 border border-gray-200 text-gray-800 px-2 py-1.5 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50">
                                                    {STATUSES.map(s => (
                                                        <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Row chi tiết (expanded) */}
                                    {expandedId === order.id && (
                                        <tr>
                                            <td colSpan="7" className="px-10 py-4 bg-indigo-50/10">
                                                <div className="bg-white rounded-xl border border-indigo-100 overflow-hidden">
                                                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                                            Chi tiết đơn #{order.id}
                                                        </span>
                                                        <div className="flex gap-4 text-xs text-gray-500">
                                                            {order.shippingAddress && <span>Địa chỉ: <strong>{order.shippingAddress}</strong></span>}
                                                            {order.couponCode && <span>Coupon: <strong className="text-green-600">{order.couponCode}</strong></span>}
                                                            {order.discountAmount > 0 && (
                                                                <span>Giảm: <strong className="text-red-500">-{(order.discountAmount).toLocaleString('vi-VN')}đ</strong></span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="text-xs text-gray-400 uppercase bg-gray-50/60">
                                                                <th className="px-4 py-2 text-left">Sách</th>
                                                                <th className="px-4 py-2 text-right">Đơn giá</th>
                                                                <th className="px-4 py-2 text-right">SL</th>
                                                                <th className="px-4 py-2 text-right">Thành tiền</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {(order.orderDetails || []).map((d, i) => (
                                                                <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/50">
                                                                    <td className="px-4 py-2.5 font-medium text-gray-900">
                                                                        {d.book?.title || `Sản phẩm #${i + 1}`}
                                                                        {d.book?.author && <span className="text-gray-400 text-xs ml-2">/ {d.book.author}</span>}
                                                                    </td>
                                                                    <td className="px-4 py-2.5 text-right text-gray-600">{(d.price || 0).toLocaleString('vi-VN')}đ</td>
                                                                    <td className="px-4 py-2.5 text-right text-gray-700 font-semibold">×{d.quantity}</td>
                                                                    <td className="px-4 py-2.5 text-right text-indigo-600 font-bold">
                                                                        {((d.price || 0) * (d.quantity || 1)).toLocaleString('vi-VN')}đ
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                        <tfoot className="border-t border-gray-100">
                                                            <tr>
                                                                <td colSpan="3" className="px-4 py-2.5 text-right font-bold text-gray-700">Tổng:</td>
                                                                <td className="px-4 py-2.5 text-right font-black text-indigo-600">
                                                                    {(order.totalAmount || 0).toLocaleString('vi-VN')}đ
                                                                </td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 font-medium">
                    Hiển thị {filtered.length} / {orders.length} đơn hàng
                </div>
            </div>
        </div>
    );
}
