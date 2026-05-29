import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';

export default function BookDetail() {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [similarBooks, setSimilarBooks] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [addedMsg, setAddedMsg] = useState('');

    const { addItem } = useCart();
    const { token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        setQuantity(1);
        setThumbsSwiper(null);
        api.get(`/books/${id}`)
            .then(res => {
                setBook(res.data);
                return api.get(`/books/${id}/similar`);
            })
            .then(res => setSimilarBooks(res.data))
            .catch(() => navigate('/'))
            .finally(() => setLoading(false));
    }, [id]);

    const getImages = (book) => {
        const urls = [];
        if (book.imageUrls) urls.push(...book.imageUrls.split(',').map(u => u.trim()).filter(Boolean));
        if (book.imageUrl && !urls.includes(book.imageUrl)) urls.unshift(book.imageUrl);
        return urls.length > 0 ? urls : null;
    };

    const handleAddToCart = () => {
        if (!token) { navigate('/login'); return; }
        for (let i = 0; i < quantity; i++) addItem(book);
        setAddedMsg(`✅ Đã thêm ${quantity} cuốn vào giỏ!`);
        setTimeout(() => setAddedMsg(''), 2500);
    };

    const stockStatus = (stock) => {
        if (stock === 0) return { label: 'Hết hàng', color: 'text-red-500', bar: 'bg-red-400', pct: 0 };
        if (stock <= 5) return { label: `Còn ${stock} cuốn (sắp hết!)`, color: 'text-orange-500', bar: 'bg-orange-400', pct: 20 };
        if (stock <= 20) return { label: `Còn ${stock} cuốn`, color: 'text-amber-600', bar: 'bg-amber-400', pct: 60 };
        return { label: `Còn ${stock} cuốn (sẵn hàng)`, color: 'text-emerald-600', bar: 'bg-emerald-500', pct: 100 };
    };

    if (loading) return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <div className="flex gap-8 animate-pulse">
                <div className="w-72 h-96 bg-gray-200 rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                    <div className="h-10 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-24 bg-gray-200 rounded" />
                    <div className="h-12 bg-gray-200 rounded" />
                </div>
            </div>
        </div>
    );

    if (!book) return null;

    const images = getImages(book);
    const stock = stockStatus(book.stock);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-8">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                    <Link to="/" className="hover:text-indigo-600 transition font-medium">Trang chủ</Link>
                    <span>/</span>
                    {book.categoryName && (
                        <><span className="hover:text-indigo-600 cursor-pointer transition font-medium">{book.categoryName}</span><span>/</span></>
                    )}
                    <span className="text-gray-700 font-semibold truncate max-w-xs">{book.title}</span>
                </nav>

                {/* Main card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

                        {/* ===== ẢNH / SWIPER ===== */}
                        <div className="p-6 bg-gray-50 border-r border-gray-100">
                            {images && images.length > 1 ? (
                                <>
                                    <Swiper
                                        modules={[Navigation, Thumbs]}
                                        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                                        navigation
                                        className="rounded-2xl overflow-hidden mb-3 aspect-[3/4] bg-white border border-gray-200"
                                    >
                                        {images.map((url, i) => (
                                            <SwiperSlide key={i}>
                                                <img src={url} alt={`${book.title} ${i + 1}`} className="w-full h-full object-cover" />
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                    <Swiper modules={[FreeMode, Thumbs]} onSwiper={setThumbsSwiper}
                                        freeMode watchSlidesProgress slidesPerView={4} spaceBetween={8}
                                        className="thumbs-swiper">
                                        {images.map((url, i) => (
                                            <SwiperSlide key={i}>
                                                <img src={url} alt={`thumb-${i}`}
                                                    className="w-full aspect-square object-cover rounded-xl cursor-pointer border-2 border-transparent hover:border-indigo-500 transition" />
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </>
                            ) : (
                                <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white aspect-[3/4] flex items-center justify-center shadow-sm">
                                    {images?.[0]
                                        ? <img src={images[0]} alt={book.title} className="w-full h-full object-cover" />
                                        : <span className="text-9xl">📖</span>
                                    }
                                </div>
                            )}
                        </div>

                        {/* ===== THÔNG TIN ===== */}
                        <div className="p-8 flex flex-col">

                            {/* Category */}
                            {book.categoryName && (
                                <span className="inline-block self-start bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full mb-3 border border-indigo-200">
                                    📌 {book.categoryName}
                                </span>
                            )}

                            <h1 className="text-3xl font-extrabold text-gray-900 leading-snug mb-2">{book.title}</h1>
                            <p className="text-gray-500 text-base mb-4">✍️ <span className="text-gray-700 font-medium">{book.author}</span></p>

                            {/* Giá + sold count */}
                            <div className="flex items-baseline gap-4 mb-4">
                                <span className="text-4xl font-black text-indigo-600">
                                    {book.price?.toLocaleString('vi-VN')}đ
                                </span>
                                {book.soldCount > 0 && (
                                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                                        🔥 Đã bán <span className="text-gray-800 font-bold">{book.soldCount}</span>
                                    </span>
                                )}
                                {book.viewCount > 0 && (
                                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                                        👁️ <span className="text-gray-800 font-bold">{book.viewCount}</span> lượt xem
                                    </span>
                                )}
                            </div>

                            {/* Stock indicator */}
                            <div className="mb-5">
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className={`font-semibold ${stock.color}`}>{stock.label}</span>
                                    <span className="text-gray-400">Tồn kho</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className={`h-full ${stock.bar} rounded-full transition-all duration-500`}
                                        style={{ width: `${stock.pct}%` }} />
                                </div>
                            </div>

                            {/* Mô tả */}
                            {book.description && (
                                <p className="text-gray-600 text-sm leading-relaxed mb-6 border-l-4 border-indigo-200 pl-4 bg-indigo-50 py-3 rounded-r-xl">
                                    {book.description}
                                </p>
                            )}

                            {/* Quantity selector */}
                            {book.stock > 0 && (
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="text-gray-600 text-sm font-medium">Số lượng:</span>
                                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="w-10 h-10 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xl font-bold transition flex items-center justify-center">−</button>
                                        <span className="w-12 text-center text-gray-900 font-bold bg-white h-10 flex items-center justify-center border-x border-gray-200">
                                            {quantity}
                                        </span>
                                        <button onClick={() => setQuantity(q => Math.min(book.stock, q + 1))}
                                            className="w-10 h-10 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xl font-bold transition flex items-center justify-center">+</button>
                                    </div>
                                    <span className="text-gray-400 text-xs">Tối đa {book.stock}</span>
                                </div>
                            )}

                            {/* Tổng */}
                            {book.stock > 0 && quantity > 1 && (
                                <div className="flex items-center gap-2 mb-4 text-sm">
                                    <span className="text-gray-500">Tổng:</span>
                                    <span className="text-indigo-600 font-black text-xl">{(book.price * quantity).toLocaleString('vi-VN')}đ</span>
                                </div>
                            )}

                            {/* Message */}
                            {addedMsg && (
                                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-4 font-medium">
                                    {addedMsg}
                                </div>
                            )}

                            {/* Add to cart */}
                            <button onClick={handleAddToCart} disabled={book.stock === 0}
                                className={`w-full py-4 rounded-2xl font-bold text-lg transition shadow-lg ${
                                    book.stock === 0
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:shadow-indigo-300'
                                }`}>
                                {book.stock === 0 ? '😔 Hết hàng' : `🛒 Thêm ${quantity > 1 ? quantity + ' cuốn ' : ''}vào giỏ hàng`}
                            </button>

                            {/* Policy chips */}
                            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                                {[
                                    { icon: '🚚', label: 'Giao hàng', value: 'Toàn quốc' },
                                    { icon: '💳', label: 'Thanh toán', value: 'COD / CK' },
                                    { icon: '↩️', label: 'Đổi trả', value: '7 ngày nếu lỗi' },
                                    { icon: '✅', label: 'Bảo đảm', value: 'Hàng chính hãng' },
                                ].map(item => (
                                    <div key={item.label} className="flex items-start gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
                                        <span className="text-base">{item.icon}</span>
                                        <div>
                                            <p className="text-gray-400 text-xs">{item.label}</p>
                                            <p className="text-gray-700 font-semibold text-xs">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== SÁCH TƯƠNG TỰ ===== */}
                {similarBooks.length > 0 && (
                    <section className="mt-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex-1 h-px bg-gray-200" />
                            <h2 className="text-xl font-extrabold text-gray-800 whitespace-nowrap">📚 Sách tương tự</h2>
                            <div className="flex-1 h-px bg-gray-200" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {similarBooks.map(b => <BookCard key={b.id} book={b} />)}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
