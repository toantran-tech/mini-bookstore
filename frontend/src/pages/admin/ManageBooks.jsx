import { useState, useEffect } from 'react';
import api from '../../services/api';

const EMPTY_FORM = { title: '', author: '', price: '', stock: '', categoryName: '', imageUrl: '', description: '' };

export default function ManageBooks() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null); // null = thêm mới, object = sửa
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchBooks(); }, []);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const res = await api.get('/books/all?page=0&size=100');
            setBooks(res.data.content || []);
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setEditingBook(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const openEdit = (book) => {
        setEditingBook(book);
        setForm({
            title: book.title || '',
            author: book.author || '',
            price: book.price || '',
            stock: book.stock || '',
            categoryName: book.categoryName || '',
            imageUrl: book.imageUrl || '',
            description: book.description || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Xóa sách này?')) return;
        await api.delete(`/books/${id}`);
        fetchBooks();
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingBook) {
                await api.put(`/books/${editingBook.id}`, form);
            } else {
                await api.post('/books', { ...form, price: Number(form.price), stock: Number(form.stock) });
            }
            setShowModal(false);
            fetchBooks();
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi lưu sách!');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">📚 Quản lý Sách</h1>
                <button onClick={openAdd} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold transition">
                    + Thêm sách
                </button>
            </div>

            {loading ? (
                <div className="text-amber-400 animate-pulse">Đang tải...</div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-700">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 text-left">Tên sách</th>
                                <th className="px-4 py-3 text-left">Tác giả</th>
                                <th className="px-4 py-3 text-left">Giá</th>
                                <th className="px-4 py-3 text-left">Tồn kho</th>
                                <th className="px-4 py-3 text-left">Thể loại</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.map(book => (
                                <tr key={book.id} className="border-t border-slate-700 hover:bg-slate-800/50 transition">
                                    <td className="px-4 py-3 text-white font-medium max-w-xs truncate">{book.title}</td>
                                    <td className="px-4 py-3 text-slate-300">{book.author}</td>
                                    <td className="px-4 py-3 text-amber-400 font-semibold">{book.price?.toLocaleString('vi-VN')}đ</td>
                                    <td className="px-4 py-3 text-slate-300">{book.stock}</td>
                                    <td className="px-4 py-3 text-slate-400">{book.categoryName || '—'}</td>
                                    <td className="px-4 py-3 text-center flex gap-2 justify-center">
                                        <button onClick={() => openEdit(book)} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-lg transition">Sửa</button>
                                        <button onClick={() => handleDelete(book.id)} className="text-xs bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-1 rounded-lg transition">Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal thêm/sửa */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg p-6">
                        <h2 className="text-xl font-bold text-white mb-5">{editingBook ? 'Sửa sách' : 'Thêm sách mới'}</h2>
                        <form onSubmit={handleSave} className="flex flex-col gap-4">
                            {[
                                { name: 'title', label: 'Tên sách', required: true },
                                { name: 'author', label: 'Tác giả', required: true },
                                { name: 'price', label: 'Giá (VNĐ)', type: 'number', required: true },
                                { name: 'stock', label: 'Tồn kho', type: 'number', required: true },
                                { name: 'categoryName', label: 'Thể loại' },
                                { name: 'imageUrl', label: 'URL ảnh bìa' },
                                { name: 'description', label: 'Mô tả' },
                            ].map(field => (
                                <div key={field.name}>
                                    <label className="block text-slate-300 text-sm mb-1">{field.label}</label>
                                    <input
                                        type={field.type || 'text'}
                                        className="w-full bg-slate-700 border border-slate-600 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        value={form[field.name]}
                                        onChange={e => setForm({ ...form, [field.name]: e.target.value })}
                                        required={field.required}
                                    />
                                </div>
                            ))}
                            <div className="flex gap-3 mt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition">Hủy</button>
                                <button type="submit" disabled={saving} className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white py-2 rounded-lg font-semibold transition">
                                    {saving ? 'Đang lưu...' : 'Lưu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
