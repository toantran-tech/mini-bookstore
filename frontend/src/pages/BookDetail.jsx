import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function BookDetail() {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [added, setAdded] = useState(false);
    const { addItem } = useCart();
    const { token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        api.get(`/books/${id}`)
            .then(res => setBook(res.data))
            .catch(() => navigate('/'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleAddToCart = () => {
        if (!token) { navigate('/login'); return; }
        addItem(book);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="text-amber-400 animate-pulse">Đang tải...</div>
        </div>
    );

    if (!book) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <button
                onClick={() => navigate(-1)}
                className="text-slate-400 hover:text-white transition mb-6 flex items-center gap-2 text-sm"
            >
                ← Quay lại
            </button>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden flex flex-col md:flex-row gap-0">
                {/* Ảnh bìa */}
                <div className="md:w-72 h-80 md:h-auto bg-slate-700 flex-shrink-0 flex items-center justify-center">
                    {book.imageUrl ? (
                        <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-8xl">📖</span>
                    )}
                </div>

                {/* Thông tin */}
                <div className="p-8 flex flex-col flex-1">
                    <div className="flex-1">
                        {book.categoryName && (
                            <span className="text-xs bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full font-medium">
                                {book.categoryName}
                            </span>
                        )}
                        <h1 className="text-3xl font-bold text-white mt-4 mb-2">{book.title}</h1>
                        <p className="text-slate-400 text-lg mb-4">✍️ {book.author}</p>

                        {book.description && (
                            <p className="text-slate-300 leading-relaxed mb-6">{book.description}</p>
                        )}

                        <div className="flex items-center gap-6 mb-6">
                            <span className="text-3xl font-bold text-amber-400">
                                {book.price?.toLocaleString('vi-VN')}đ
                            </span>
                            <span className="text-slate-400 text-sm">
                                Còn lại: <span className="text-white font-semibold">{book.stock}</span> cuốn
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={book.stock === 0}
                        className={`w-full py-4 rounded-xl font-bold text-white transition text-lg ${added
                                ? 'bg-green-600'
                                : book.stock === 0
                                    ? 'bg-slate-600 opacity-50 cursor-not-allowed'
                                    : 'bg-amber-500 hover:bg-amber-600'
                            }`}
                    >
                        {added ? '✅ Đã thêm vào giỏ!' : book.stock === 0 ? 'Hết hàng' : '🛒 Thêm vào giỏ hàng'}
                    </button>
                </div>
            </div>
        </div>
    );
}
