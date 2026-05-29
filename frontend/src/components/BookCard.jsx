import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function BookCard({ book }) {
    const { addItem, items } = useCart();
    const { token } = useAuth();
    const navigate = useNavigate();

    const inCart = items.some(i => i.bookId === book.id);

    const handleAddToCart = (e) => {
        e.preventDefault();
        if (!token) { navigate('/login'); return; }
        addItem(book);
    };

    return (
        <Link to={`/books/${book.id}`} className="group block">
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-100 hover:-translate-y-1 flex flex-col h-full">

                {/* Ảnh bìa */}
                <div className="relative h-52 bg-gray-50 overflow-hidden">
                    {book.imageUrl ? (
                        <img
                            src={book.imageUrl}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-indigo-50 to-purple-50">
                            📖
                        </div>
                    )}

                    {/* Badges */}
                    {book.soldCount > 100 && (
                        <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow">HOT</span>
                    )}
                    {book.stock === 0 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="bg-red-500 text-white font-bold text-sm px-3 py-1.5 rounded-full">Hết hàng</span>
                        </div>
                    )}
                    {book.categoryName && (
                        <span className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow">
                            {book.categoryName}
                        </span>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
                        <span className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            Xem chi tiết →
                        </span>
                    </div>
                </div>

                {/* Nội dung */}
                <div className="p-4 flex flex-col flex-1">
                    <p className="text-xs text-indigo-500 font-bold mb-1 uppercase tracking-wide">{book.categoryName}</p>
                    <h3 className="text-sm font-bold text-gray-800 mb-2 line-clamp-2 leading-snug min-h-[2.5rem] group-hover:text-indigo-600 transition">
                        {book.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">✍️ {book.author}</p>

                    <div className="mt-auto flex items-end justify-between">
                        <div>
                            <p className="text-base font-extrabold text-indigo-600">
                                {book.price?.toLocaleString('vi-VN')}đ
                            </p>
                            {book.soldCount > 0 && (
                                <p className="text-xs text-gray-400">Đã bán {book.soldCount}</p>
                            )}
                        </div>
                        <button
                            onClick={handleAddToCart}
                            disabled={book.stock === 0}
                            className={`text-xs font-bold px-3 py-2 rounded-xl transition flex-shrink-0 shadow-sm ${
                                inCart
                                    ? 'bg-green-500 text-white'
                                    : book.stock === 0
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                            }`}
                        >
                            {inCart ? '✓ Đã thêm' : '+ Giỏ'}
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}
