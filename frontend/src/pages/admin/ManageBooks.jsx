import { useState, useEffect } from 'react';
import api from '../../services/api';

const EMPTY_FORM = { title: '', author: '', isbn: '', price: '', stock: '', categoryName: '', imageUrl: '', description: '' };

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
            isbn: book.isbn || '',
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Quản lý Sách</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Thêm, sửa, xóa các đầu sách trong cửa hàng</p>
                </div>
                <button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-md shadow-indigo-200 flex items-center gap-2">
                    <span className="text-lg">+</span> Thêm sách mới
                </button>
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
                                    <th className="px-6 py-4 text-left">Tên sách</th>
                                    <th className="px-6 py-4 text-left">Tác giả</th>
                                    <th className="px-6 py-4 text-left">ISBN</th>
                                    <th className="px-6 py-4 text-left">Giá</th>
                                    <th className="px-6 py-4 text-left">Tồn kho</th>
                                    <th className="px-6 py-4 text-left">Thể loại</th>
                                    <th className="px-6 py-4 text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {books.map(book => (
                                    <tr key={book.id} className="hover:bg-indigo-50/50 transition">
                                        <td className="px-6 py-4">
                                            <img src={book.imageUrl} alt={book.title} className="w-12 h-16 object-cover rounded" 
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://placehold.co/400x600/eef2ff/4f46e5?text=L%E1%BB%97i+%E1%BA%A2nh';
                                                }}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-gray-900 font-bold max-w-xs truncate">{book.title}</td>
                                        <td className="px-6 py-4 text-gray-500 font-medium">{book.author}</td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">{book.isbn || '-'}</td>
                                        <td className="px-6 py-4 text-indigo-600 font-black">{book.price?.toLocaleString('vi-VN')}đ</td>
                                        <td className="px-6 py-4 text-gray-500 font-medium">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${book.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {book.stock} cuốn
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-medium">{book.categoryName || '—'}</td>
                                        <td className="px-6 py-4 text-center flex gap-2 justify-center">
                                            <button onClick={() => openEdit(book)} className="text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg transition">Sửa</button>
                                            <button onClick={() => handleDelete(book.id)} className="text-xs font-bold bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition">Xóa</button>
                                        </td>
                                    </tr>
                                ))}
                                {books.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-gray-400 font-medium">Chưa có sách nào.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-gray-100 rounded-3xl w-full max-w-xl p-8 shadow-2xl">
                        <h2 className="text-2xl font-black text-gray-900 mb-6">{editingBook ? 'Sửa thông tin sách' : 'Thêm sách mới'}</h2>
                        <form onSubmit={handleSave} className="flex flex-col gap-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="col-span-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-1.5">Tên sách</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        required
                                        placeholder="Nhập tên sách..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-1.5">Tác giả</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                                        value={form.author}
                                        onChange={e => setForm({ ...form, author: e.target.value })}
                                        required
                                        placeholder="Nhập tên tác giả..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Mã ISBN</label>
                                    <input type="text" value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm text-sm" placeholder="VD: 978-3-16-148410-0" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-1.5">Thể loại</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                                        value={form.categoryName}
                                        onChange={e => setForm({ ...form, categoryName: e.target.value })}
                                        placeholder="VD: Thiếu nhi"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-1.5">Giá (VNĐ)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                                        value={form.price}
                                        onChange={e => setForm({ ...form, price: e.target.value })}
                                        required
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-1.5">Tồn kho</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                                        value={form.stock}
                                        onChange={e => setForm({ ...form, stock: e.target.value })}
                                        required
                                        placeholder="0"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-1.5">URL Ảnh bìa</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                                        value={form.imageUrl}
                                        onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-1.5">Mô tả chi tiết</label>
                                    <textarea
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition h-24 resize-none"
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        placeholder="Nhập mô tả sách..."
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition">Hủy</button>
                                <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 rounded-xl font-bold shadow-md shadow-indigo-200 transition">
                                    {saving ? 'Đang lưu...' : (editingBook ? 'Cập nhật sách' : 'Thêm sách')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
