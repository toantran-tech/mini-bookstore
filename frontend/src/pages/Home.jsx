import { useState, useEffect } from 'react';
import api from '../services/api';
import BookCard from '../components/BookCard';

export default function Home() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchBooks();
    }, [page, search]);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                size: 8,
                ...(search && { search }),
            };
            const res = await api.get('/books/all', { params });

            // Spring trả về Page object: { content: [], totalPages: N }
            if (res.data.content) {
                setBooks(res.data.content);
                setTotalPages(res.data.totalPages);
            } else {
                // Nếu backend trả về array thẳng (không phân trang)
                setBooks(res.data);
            }
        } catch (err) {
            console.error('Lỗi lấy sách:', err);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search: chờ 400ms sau khi user gõ xong mới gọi API
    let debounceTimer;
    const handleSearch = (val) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            setSearch(val);
            setPage(0);
        }, 400);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-white mb-3">
                    📚 Kho Sách
                </h1>
                <p className="text-slate-400 text-lg">Khám phá hàng ngàn đầu sách hay</p>
            </div>

            {/* Search bar */}
            <div className="max-w-xl mx-auto mb-8">
                <input
                    type="text"
                    className="w-full bg-slate-800 border border-slate-600 text-white p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-400"
                    placeholder="🔍 Tìm kiếm sách theo tên..."
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            {/* Loading */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-amber-400 text-lg animate-pulse">Đang tải sách...</div>
                </div>
            ) : books.length === 0 ? (
                <div className="text-center text-slate-400 py-20">
                    <div className="text-6xl mb-4">📭</div>
                    <p>Không tìm thấy sách nào.</p>
                </div>
            ) : (
                <>
                    {/* Grid sách */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                        {books.map(book => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-3 mt-10">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white rounded-lg transition"
                            >
                                ← Trước
                            </button>

                            <span className="text-slate-400 text-sm">
                                Trang {page + 1} / {totalPages}
                            </span>

                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white rounded-lg transition"
                            >
                                Sau →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
