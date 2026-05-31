import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// ---- Màu sắc cho biểu đồ Pie ----
const STATUS_COLORS = {
    Pending: '#f59e0b',
    Processing: '#3b82f6',
    Shipped: '#8b5cf6',
    Delivered: '#10b981',
    Cancelled: '#ef4444',
};
const PIE_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];

// ---- Stat Card đơn giản ----
function StatCard({ icon, label, value, sub, color }) {
    return (
        <div className={`relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/60 backdrop-blur p-6 flex items-center gap-5`}>
            <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider">{label}</p>
                <p className="text-white text-2xl font-bold mt-0.5">{value}</p>
                {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
            </div>
            {/* decorative glow */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-2xl ${color.replace('bg-', 'bg-')}`} />
        </div>
    );
}

// ---- Custom Tooltip doanh thu ----
function RevenueTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl text-sm">
                <p className="text-slate-300 mb-1">{label}</p>
                <p className="text-amber-400 font-bold">
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
                <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400">Đang tải dữ liệu...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="text-red-400 bg-red-900/20 border border-red-700 p-4 rounded-xl">{error}</div>
    );

    // Chuẩn bị data cho Pie Chart
    const pieData = stats.ordersByStatus
        ? Object.entries(stats.ordersByStatus).map(([name, value]) => ({ name, value }))
        : [];

    // Format tháng cho chart doanh thu
    const revenueData = (stats.revenueByMonth || []).map(d => ({
        month: d.month,
        revenue: d.revenue,
    }));

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">📊 Dashboard</h1>
                    <p className="text-slate-400 text-sm mt-1">Tổng quan hoạt động của cửa hàng</p>
                </div>
                <button
                    onClick={fetchStats}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg text-sm transition"
                >
                    🔄 Làm mới
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    icon="💰"
                    label="Tổng Doanh Thu"
                    value={`${(stats.totalRevenue / 1_000_000).toFixed(1)}M đ`}
                    sub="Chỉ tính đơn Delivered"
                    color="bg-amber-500/20 text-amber-400"
                />
                <StatCard
                    icon="📦"
                    label="Tổng Đơn Hàng"
                    value={stats.totalOrders}
                    sub="Tất cả trạng thái"
                    color="bg-blue-500/20 text-blue-400"
                />
                <StatCard
                    icon="📚"
                    label="Đầu Sách"
                    value={stats.totalBooks}
                    sub="Trong kho"
                    color="bg-purple-500/20 text-purple-400"
                />
                <StatCard
                    icon="👥"
                    label="Thành Viên"
                    value={stats.totalUsers}
                    sub="Đã đăng ký"
                    color="bg-green-500/20 text-green-400"
                />
            </div>

            {/* Row 2: Revenue Chart + Pie Chart */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Biểu đồ doanh thu theo tháng — chiếm 2/3 */}
                <div className="xl:col-span-2 rounded-2xl border border-slate-700 bg-slate-800/60 backdrop-blur p-6">
                    <h2 className="text-white font-semibold mb-1">📈 Doanh Thu Theo Tháng</h2>
                    <p className="text-slate-500 text-xs mb-5">12 tháng gần nhất (đơn đã giao)</p>

                    {revenueData.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
                            Chưa có dữ liệu doanh thu
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <YAxis
                                    tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                />
                                <Tooltip content={<RevenueTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#f59e0b"
                                    strokeWidth={2.5}
                                    fill="url(#revenueGradient)"
                                    dot={{ fill: '#f59e0b', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Biểu đồ Pie trạng thái đơn — chiếm 1/3 */}
                <div className="rounded-2xl border border-slate-700 bg-slate-800/60 backdrop-blur p-6">
                    <h2 className="text-white font-semibold mb-1">🥧 Trạng Thái Đơn</h2>
                    <p className="text-slate-500 text-xs mb-4">Phân bố theo trạng thái</p>

                    {pieData.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
                            Chưa có đơn hàng
                        </div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={3}
                                        dataKey="value"
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
                                        contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                                        labelStyle={{ color: '#94a3b8' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Legend */}
                            <ul className="space-y-1.5 mt-3">
                                {pieData.map((entry, i) => (
                                    <li key={entry.name} className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-2">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                style={{ background: STATUS_COLORS[entry.name] || PIE_COLORS[i % PIE_COLORS.length] }}
                                            />
                                            <span className="text-slate-300">{entry.name}</span>
                                        </span>
                                        <span className="text-white font-semibold">{entry.value}</span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            </div>

            {/* Row 3: Top 5 Books */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 backdrop-blur p-6">
                <h2 className="text-white font-semibold mb-1">🏆 Top 5 Sách Bán Chạy</h2>
                <p className="text-slate-500 text-xs mb-5">Dựa trên số lượng đã bán</p>

                {!stats.topBooks || stats.topBooks.length === 0 ? (
                    <div className="text-slate-500 text-sm text-center py-8">Chưa có dữ liệu bán hàng</div>
                ) : (
                    <div className="space-y-3">
                        {stats.topBooks.map((book, i) => {
                            const maxSold = stats.topBooks[0]?.sold || 1;
                            const pct = Math.round((book.sold / maxSold) * 100);
                            const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                            return (
                                <div key={i} className="flex items-center gap-4">
                                    <span className="text-xl w-7 flex-shrink-0">{medals[i]}</span>
                                    {book.imageUrl ? (
                                        <img src={book.imageUrl} alt="" className="w-10 h-12 object-cover rounded-lg flex-shrink-0" />
                                    ) : (
                                        <div className="w-10 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-lg flex-shrink-0">📖</div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-medium truncate">{book.title}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                                                <div
                                                    className="h-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className="text-amber-400 text-xs font-semibold flex-shrink-0">{book.sold} cuốn</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-green-400 text-sm font-bold">
                                            {Number(book.revenue).toLocaleString('vi-VN')}đ
                                        </p>
                                        <p className="text-slate-500 text-xs">doanh thu</p>
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
