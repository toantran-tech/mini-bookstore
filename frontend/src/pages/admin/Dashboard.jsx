import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const STATUS_COLORS = {
    Pending: '#f59e0b',
    Processing: '#3b82f6',
    Shipped: '#8b5cf6',
    Delivered: '#10b981',
    Cancelled: '#ef4444',
};
const PIE_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];

function StatCard({ icon, label, value, sub, color }) {
    return (
        <div className={`relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-200/40 p-6 flex items-center gap-5`}>
            <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider font-bold">{label}</p>
                <p className="text-gray-900 text-2xl font-black mt-0.5">{value}</p>
                {sub && <p className="text-gray-400 text-xs mt-0.5 font-medium">{sub}</p>}
            </div>
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.15] blur-2xl ${color.replace('text-', 'bg-')}`} />
        </div>
    );
}

function RevenueTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-xl shadow-gray-200/50 text-sm">
                <p className="text-gray-500 mb-1 font-bold">{label}</p>
                <p className="text-indigo-600 font-black text-lg">
                    {Number(payload[0].value).toLocaleString('vi-VN')}đ
                </p>
            </div>
        );
    }
    return null;
}

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data);
        } catch (err) {
            setError('Không thể tải dữ liệu thống kê.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-semibold">Đang tải dữ liệu...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="text-red-600 bg-red-50 border border-red-200 p-4 rounded-xl font-medium">{error}</div>
    );

    const pieData = stats.ordersByStatus
        ? Object.entries(stats.ordersByStatus).map(([name, value]) => ({ name, value }))
        : [];

    const revenueData = (stats.revenueByMonth || []).map(d => ({
        month: d.month,
        revenue: d.revenue,
    }));

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Thống kê</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Tổng quan hoạt động kinh doanh của MiniBooks</p>
                </div>
                <button
                    onClick={fetchStats}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 rounded-xl text-sm font-bold transition shadow-sm"
                >
                    🔄 Làm mới
                </button>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard
                    icon="💰"
                    label="Tổng Doanh Thu"
                    value={`${(stats.totalRevenue / 1_000_000).toFixed(1)}M đ`}
                    sub="Chỉ tính đơn Delivered"
                    color="bg-amber-100 text-amber-600"
                />
                <StatCard
                    icon="📦"
                    label="Tổng Đơn Hàng"
                    value={stats.totalOrders}
                    sub="Tất cả trạng thái"
                    color="bg-blue-100 text-blue-600"
                />
                <StatCard
                    icon="📚"
                    label="Đầu Sách"
                    value={stats.totalBooks}
                    sub="Trong kho"
                    color="bg-purple-100 text-purple-600"
                />
                <StatCard
                    icon="👥"
                    label="Thành Viên"
                    value={stats.totalUsers}
                    sub="Đã đăng ký"
                    color="bg-green-100 text-green-600"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                <div className="xl:col-span-2 rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-200/40 p-7">
                    <h2 className="text-gray-900 font-black text-lg mb-1">📈 Doanh Thu Theo Tháng</h2>
                    <p className="text-gray-400 text-xs mb-6 font-semibold uppercase tracking-wider">12 tháng gần nhất (đơn đã giao)</p>

                    {revenueData.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-gray-400 font-medium text-sm">
                            Chưa có dữ liệu doanh thu
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis
                                    tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                    axisLine={false} tickLine={false} dx={-10}
                                />
                                <Tooltip content={<RevenueTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#4f46e5"
                                    strokeWidth={3.5}
                                    fill="url(#revenueGradient)"
                                    dot={{ fill: '#ffffff', stroke: '#4f46e5', strokeWidth: 3, r: 5 }}
                                    activeDot={{ r: 7, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 3 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-200/40 p-7 flex flex-col">
                    <h2 className="text-gray-900 font-black text-lg mb-1">🥧 Trạng Thái Đơn</h2>
                    <p className="text-gray-400 text-xs mb-2 font-semibold uppercase tracking-wider">Phân bố theo trạng thái</p>

                    {pieData.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400 font-medium text-sm">
                            Chưa có đơn hàng
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 min-h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={4}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell
                                                    key={entry.name}
                                                    fill={STATUS_COLORS[entry.name] || PIE_COLORS[index % PIE_COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value, name) => [value + ' đơn', name]}
                                            contentStyle={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 12, fontSize: 13, fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            labelStyle={{ color: '#64748b', fontWeight: 600 }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <ul className="space-y-2.5 mt-2">
                                {pieData.map((entry, i) => (
                                    <li key={entry.name} className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-3">
                                            <span
                                                className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                                                style={{ background: STATUS_COLORS[entry.name] || PIE_COLORS[i % PIE_COLORS.length] }}
                                            />
                                            <span className="text-gray-600 font-bold">{entry.name}</span>
                                        </span>
                                        <span className="text-gray-900 font-black">{entry.value}</span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-200/40 p-7">
                <h2 className="text-gray-900 font-black text-lg mb-1">🏆 Top 5 Sách Bán Chạy</h2>
                <p className="text-gray-400 text-xs mb-6 font-semibold uppercase tracking-wider">Dựa trên số lượng đã bán</p>

                {!stats.topBooks || stats.topBooks.length === 0 ? (
                    <div className="text-gray-400 font-medium text-sm text-center py-8">Chưa có dữ liệu bán hàng</div>
                ) : (
                    <div className="space-y-4">
                        {stats.topBooks.map((book, i) => {
                            const maxSold = stats.topBooks[0]?.sold || 1;
                            const pct = Math.round((book.sold / maxSold) * 100);
                            const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                            return (
                                <div key={i} className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-2xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                                    <span className="text-2xl w-8 text-center flex-shrink-0 drop-shadow-sm">{medals[i]}</span>
                                    {book.imageUrl ? (
                                        <img src={book.imageUrl} alt="" className="w-12 h-14 object-cover rounded-xl shadow-sm flex-shrink-0" />
                                    ) : (
                                        <div className="w-12 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">📖</div>
                                    )}
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="text-gray-900 text-sm font-black truncate">{book.title}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className="text-indigo-600 text-xs font-black flex-shrink-0">{book.sold} cuốn</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-green-600 text-base font-black">
                                            {Number(book.revenue).toLocaleString('vi-VN')}đ
                                        </p>
                                        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mt-0.5">doanh thu</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
