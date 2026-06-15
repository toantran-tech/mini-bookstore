import { useState, useEffect } from 'react';
import api from '../../services/api';

const ROLE_LABELS = {
    'ROLE_ADMIN': { label: 'Admin', color: 'bg-red-100 text-red-700' },
    'ROLE_USER': { label: 'User', color: 'bg-green-100 text-green-700' },
};

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch {
            alert('Lỗi tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleRoleChange = async (id, newRole) => {
        if (!window.confirm(`Đổi role thành ${newRole}?`)) return;
        try {
            await api.put(`/admin/users/${id}/role`, { role: newRole });
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể thay đổi role!');
        }
    };

    const handleDelete = async (id, username) => {
        if (!window.confirm(`Xóa tài khoản "${username}"? Hành động này không thể hoàn tác.`)) return;
        try {
            await api.delete(`/admin/users/${id}`);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể xóa tài khoản!');
        }
    };

    const filtered = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="text-center py-10 text-gray-500">Đang tải...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Người Dùng</h1>
                    <p className="text-gray-500 text-sm mt-1">Xem, phân quyền và xóa tài khoản</p>
                </div>
                <span className="bg-indigo-50 text-indigo-700 font-bold px-4 py-2 rounded-lg text-sm">
                    Tổng: {users.length} tài khoản
                </span>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="🔍 Tìm theo tên đăng nhập hoặc email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full sm:w-80 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                            <th className="px-6 py-4 font-semibold">#</th>
                            <th className="px-6 py-4 font-semibold">Tài khoản</th>
                            <th className="px-6 py-4 font-semibold">Email</th>
                            <th className="px-6 py-4 font-semibold">Số điện thoại</th>
                            <th className="px-6 py-4 font-semibold">Role</th>
                            <th className="px-6 py-4 font-semibold text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-400">
                                    Không tìm thấy tài khoản nào.
                                </td>
                            </tr>
                        ) : filtered.map((user, i) => {
                            const roleInfo = ROLE_LABELS[user.role] || { label: user.role, color: 'bg-gray-100 text-gray-600' };
                            return (
                                <tr key={user.id} className="hover:bg-indigo-50/40 transition">
                                    <td className="px-6 py-4 text-gray-400 text-sm">{i + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{user.username}</p>
                                                {user.fullName && <p className="text-gray-400 text-xs">{user.fullName}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">{user.email || '—'}</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">{user.phone || '—'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${roleInfo.color}`}>
                                            {roleInfo.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <select
                                            value={user.role}
                                            onChange={e => handleRoleChange(user.id, e.target.value)}
                                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 mr-3 outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                                        >
                                            <option value="ROLE_USER">User</option>
                                            <option value="ROLE_ADMIN">Admin</option>
                                        </select>
                                        <button
                                            onClick={() => handleDelete(user.id, user.username)}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
