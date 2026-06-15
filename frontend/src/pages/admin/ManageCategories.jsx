import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function ManageCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/admin/categories');
            setCategories(res.data);
        } catch {
            alert('Lỗi tải danh sách danh mục');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleOpen = (category = null) => {
        setEditingCategory(category);
        setName(category ? category.name : '');
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setSubmitting(true);
        try {
            if (editingCategory) {
                await api.put(`/admin/categories/${editingCategory.id}`, { name });
            } else {
                await api.post('/admin/categories', { name });
            }
            setShowModal(false);
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra!');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, catName) => {
        if (!window.confirm(`Xóa danh mục "${catName}"? Tất cả sách trong danh mục này sẽ không có danh mục.`)) return;
        try {
            await api.delete(`/admin/categories/${id}`);
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể xóa!');
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-500">Đang tải...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Danh Mục</h1>
                    <p className="text-gray-500 text-sm mt-1">Thêm, sửa, xóa các danh mục sách</p>
                </div>
                <button
                    onClick={() => handleOpen()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition"
                >
                    + Thêm danh mục
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                            <th className="px-6 py-4 font-semibold">#</th>
                            <th className="px-6 py-4 font-semibold">Tên danh mục</th>
                            <th className="px-6 py-4 font-semibold">Số sách</th>
                            <th className="px-6 py-4 font-semibold text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-400">
                                    Chưa có danh mục nào.
                                </td>
                            </tr>
                        ) : categories.map((cat, i) => (
                            <tr key={cat.id} className="hover:bg-indigo-50/40 transition">
                                <td className="px-6 py-4 text-gray-400 text-sm">{i + 1}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-lg text-sm">
                                        {cat.name}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-sm">
                                    {cat.books?.length ?? 0} cuốn
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleOpen(cat)}
                                        className="text-blue-500 hover:text-blue-700 mr-4 text-sm font-medium"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id, cat.name)}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-white font-bold text-lg">
                                {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-indigo-200 hover:text-white text-2xl">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tên danh mục *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                placeholder="VD: Lập trình Backend"
                                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                            />
                            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition">
                                    Hủy
                                </button>
                                <button type="submit" disabled={submitting} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-sm transition disabled:opacity-60">
                                    {submitting ? 'Đang lưu...' : editingCategory ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
