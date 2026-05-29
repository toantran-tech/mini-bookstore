import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function BookCard({ book }) {
    const { addItem } = useCart();
    const { token } = useAuth();
    const navigate = useNavigate();

    const handleAddToCart = () => {
        if (!token) {
            navigate('/login');
            return;
        }
        addItem(book);
    };

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 group flex flex-col">
            {/* Ảnh bìa sách */}
            <div className="relative h-52 bg-slate-700 overflow-hidden">
                {book.imageUrl ? (
                    <img
                        src={book.imageUrl}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                        📖
                    </div>
                )}
            </div>

            {/* Nội dung */}
            <div className="p-4 flex flex-col flex-1">
                <Link to={`/books/${book.id}`}>
                    <h3 className="text-white font-bold text-base mb-1 hover:text-amber-400 transition line-clamp-2">
                        {book.title}
                    </h3>
                </Link>
                <p className="text-slate-400 text-sm mb-3">{book.author}</p>

                <div className="mt-auto flex items-center justify-between">
                    <span className="text-amber-400 font-bold text-lg">
                        {book.price?.toLocaleString('vi-VN')}đ
                    </span>
                    <button
                        onClick={handleAddToCart}
                        className="bg-amber-500 hover:bg-amber-600 text-white text-sm px-3 py-2 rounded-lg transition font-semibold"
                    >
                        + Giỏ
                    </button>
                </div>
            </div>
        </div>
    );
}
