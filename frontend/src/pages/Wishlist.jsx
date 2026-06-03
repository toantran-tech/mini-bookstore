import { useWishlist } from '../context/WishlistContext';
import BookCard from '../components/BookCard';
import { Link } from 'react-router-dom';

export default function Wishlist() {
    const { wishlist } = useWishlist();

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <span className="text-3xl">❤️</span>
                    <h1 className="text-2xl font-bold text-gray-800">Sách Yêu Thích</h1>
                </div>

                {wishlist.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="text-6xl mb-4">💔</div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Bạn chưa có sách yêu thích nào</h2>
                        <p className="text-gray-500 mb-6">Hãy dạo quanh cửa hàng và "thả tim" những cuốn sách bạn muốn mua sau nhé!</p>
                        <Link to="/" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-sm">
                            Khám phá ngay
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                        {wishlist.map(book => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
