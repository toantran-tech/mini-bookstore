import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import BookCard from '../components/BookCard';
import { useAuth } from '../context/AuthContext';
import { 
    BookOpen, Search, Zap, Truck, Gift, FolderOpen, Flame, Sparkles, 
    SlidersHorizontal, Library, Trophy, Inbox, CheckCircle2, PartyPopper, 
    Code, Briefcase, BrainCircuit, BookType, Microscope, SearchX
} from 'lucide-react';

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
        <div className="h-52 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
        <div className="p-4 space-y-2.5">
            <div className="h-3 bg-gray-200 rounded-full w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded-full w-4/5"></div>
            <div className="h-3 bg-gray-200 rounded-full w-3/5"></div>
            <div className="flex justify-between"><div className="h-5 bg-gray-200 rounded-full w-2/5"></div><div className="h-8 bg-gray-200 rounded-xl w-16"></div></div>
        </div>
    </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, subtitle, badge, badgeColor = 'bg-rose-100 text-rose-600', viewAllLink }) => (
    <div className="flex items-end justify-between mb-6">
        <div>
            <div className="flex items-center gap-2 mb-1">
                {Icon && <span className="text-indigo-600 p-2 bg-indigo-50 rounded-xl"><Icon size={24} /></span>}
                <h2 className="text-2xl font-extrabold text-gray-800">{title}</h2>
                {badge && <span className={`ml-1 px-3 py-0.5 rounded-full text-xs font-bold uppercase ${badgeColor}`}>{badge}</span>}
            </div>
            {subtitle && <p className="text-sm text-gray-500 ml-9">{subtitle}</p>}
        </div>
        {viewAllLink && (
            <Link to={viewAllLink} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition flex items-center gap-1">
                Xem tất cả <span>→</span>
            </Link>
        )}
    </div>
);

// ─── Mini Horizontal Book Row ─────────────────────────────────────────────────
function BookRow({ title, icon, badge, badgeColor, sortBy, size = 4, viewAllLink }) {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/books/all', { params: { sortBy, size, page: 0 } })
            .then(res => setBooks(res.data.content || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="mb-12">
            <SectionHeader icon={icon} title={title} badge={badge} badgeColor={badgeColor} subtitle="" viewAllLink={viewAllLink} />
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {books.map(b => <BookCard key={b.id} book={b} />)}
                </div>
            )}
        </section>
    );
}

// ─── Loading More Indicator ───────────────────────────────────────────────────
const LoadingMore = () => (
    <div className="flex flex-col items-center gap-3 py-10">
        <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
                <div key={i} className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
        </div>
        <p className="text-sm text-gray-400 font-medium">Đang tải thêm sách...</p>
    </div>
);

const SORT_OPTIONS = [
    { value: '',           label: '🔀 Mặc định' },
    { value: 'newest',     label: '✨ Mới nhất' },
    { value: 'bestseller', label: '🔥 Bán chạy' },
    { value: 'price_asc',  label: '💰 Giá thấp → cao' },
    { value: 'price_desc', label: '💎 Giá cao → thấp' },
];

// ════════════════════════════════════════════════════════════════════════════
//  HOME PAGE
// ════════════════════════════════════════════════════════════════════════════
export default function Home() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Filter/search state
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [categories, setCategories] = useState([]);
    const [showFilter, setShowFilter] = useState(false);

    // Lazy loading state
    const [books, setBooks] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [totalBooks, setTotalBooks] = useState(0);
    const [initialLoading, setInitialLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const observerRef = useRef(null);
    const sentinelRef = useRef(null);
    const isFetchingRef = useRef(false);
    const debounceRef = useRef(null);

    const PAGE_SIZE = 8;
    const isFiltering = !!(search || selectedCategory || sortBy || minPrice || maxPrice);

    // Fetch categories
    useEffect(() => {
        api.get('/categories').then(res => setCategories(res.data)).catch(() => {});
    }, []);

    // Reset khi filter thay đổi
    useEffect(() => {
        if (isFiltering) {
            setBooks([]);
            setPage(0);
            setHasMore(true);
            setInitialLoading(true);
            isFetchingRef.current = false;
        }
    }, [search, selectedCategory, sortBy]);

    // Fetch books (lazy loading)
    const fetchPage = useCallback(async (pageNum) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        try {
            const params = {
                page: pageNum,
                size: PAGE_SIZE,
                ...(search && { search }),
                ...(selectedCategory && { categoryName: selectedCategory }),
                ...(sortBy && { sortBy }),
                ...(minPrice && { minPrice }),
                ...(maxPrice && { maxPrice }),
            };
            const res = await api.get('/books/all', { params });
            const content = res.data.content || [];
            const totalPages = res.data.totalPages || 1;

            setTotalBooks(res.data.totalElements || content.length);
            setHasMore(pageNum < totalPages - 1);
            setBooks(prev => pageNum === 0 ? content : [...prev, ...content]);
        } catch (err) {
            console.error(err);
        } finally {
            setInitialLoading(false);
            setLoadingMore(false);
            isFetchingRef.current = false;
        }
    }, [search, selectedCategory, sortBy, minPrice, maxPrice]);

    useEffect(() => {
        if (isFiltering) fetchPage(page);
    }, [page, fetchPage, isFiltering]);

    // IntersectionObserver — lazy loading trigger
    useEffect(() => {
        if (!isFiltering) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isFetchingRef.current) {
                    setLoadingMore(true);
                    setPage(prev => prev + 1);
                }
            },
            { threshold: 0.1, rootMargin: '200px' }
        );

        if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
        return () => observerRef.current?.disconnect();
    }, [hasMore, isFiltering]);

    const handleSearch = (val) => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setSearch(val), 400);
    };
    const handleCategoryClick = (name) => setSelectedCategory(prev => prev === name ? '' : name);
    const handleSortChange = (val) => setSortBy(val);
    const resetFilters = () => {
        setSearch(''); setSortBy(''); setMinPrice(''); setMaxPrice('');
        setSelectedCategory(''); setShowFilter(false);
    };

    const loadedCount = books.length;
    const progressPercent = totalBooks > 0 ? Math.round((loadedCount / totalBooks) * 100) : 0;

    const CATEGORY_ICONS = {
        'Lập trình': Code, 
        'Kinh doanh & Khởi nghiệp': Briefcase,
        'Tâm lý & Kỹ năng sống': BrainCircuit, 
        'Tiểu thuyết': BookType, 
        'Khoa học & Công nghệ': Microscope,
    };

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ===== HERO BANNER ===== */}
            {!isFiltering && (
                <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden mx-4 mt-4 rounded-3xl">
                    {/* Decorative circles */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 left-8 w-40 h-40 rounded-full border-4 border-white"></div>
                        <div className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full border-4 border-white"></div>
                        <div className="absolute top-1/2 right-1/4 w-20 h-20 rounded-full border-2 border-white"></div>
                    </div>

                    <div className="relative max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-white max-w-lg">
                            <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 backdrop-blur-sm border border-white/20">
                                <BookOpen size={14} /> KHO SÁCH CHÍNH HÃNG 2025
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black leading-tight mb-3">
                                Mini Bookstore<br />
                                <span className="text-yellow-300">Tri Thức Mở</span>
                            </h1>
                            <p className="text-white/80 mb-6 text-base">
                                Chào mừng{user ? ` ${user.username}!` : '!'} Khám phá hơn 200+ đầu sách từ các tác giả nổi tiếng trong và ngoài nước.
                            </p>
                            <div className="flex gap-3 flex-wrap">
                                <Link to="/top"
                                    className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-yellow-300 hover:text-indigo-800 transition shadow-lg text-sm flex items-center gap-2">
                                    <Trophy size={18} /> Bảng xếp hạng →
                                </Link>
                                <button onClick={() => setShowFilter(true)}
                                    className="px-6 py-3 bg-white/20 text-white rounded-xl font-bold hover:bg-white/30 transition backdrop-blur-sm border border-white/30 text-sm flex items-center gap-2">
                                    <Search size={18} /> Tìm kiếm
                                </button>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-4">
                            <img
                                src="https://covers.openlibrary.org/b/id/10432254-L.jpg"
                                alt="Featured Book"
                                className="w-48 h-60 object-cover rounded-2xl shadow-2xl rotate-3 hover:-rotate-3 transition-transform duration-500"
                            />
                        </div>
                    </div>

                    {/* Stats bar */}
                    <div className="relative bg-white/10 backdrop-blur-sm border-t border-white/20 px-8 py-4">
                        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-4 text-white text-center">
                            {[{ num: '15+', label: 'Đầu sách' }, { num: '5', label: 'Danh mục' }, { num: '100+', label: 'Khách hàng' }].map(s => (
                                <div key={s.label}>
                                    <p className="text-xl font-black">{s.num}</p>
                                    <p className="text-xs text-white/70">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* ===== PROMO BANNERS ===== */}
                {!isFiltering && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                        {[
                            { color: 'from-orange-400 to-rose-500', icon: Zap, title: 'Flash Sale', sub: 'Hôm nay -20%', badge: 'Hết hạn 24h' },
                            { color: 'from-emerald-400 to-teal-500', icon: Truck, title: 'Miễn phí vận chuyển', sub: 'Đơn hàng từ 200K', badge: 'Toàn quốc' },
                            { color: 'from-violet-500 to-purple-600', icon: Gift, title: 'Mã giảm giá', sub: 'NEWBOOK20 - Giảm 20%', badge: 'Thành viên mới' },
                        ].map((p, idx) => (
                            <div key={idx} className={`bg-gradient-to-r ${p.color} rounded-2xl p-5 text-white flex items-center gap-4 shadow-md hover:scale-[1.02] transition-transform cursor-pointer`}>
                                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm"><p.icon size={28} /></div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-base">{p.title}</h3>
                                        <span className="text-xs bg-white/25 px-2 py-0.5 rounded-full">{p.badge}</span>
                                    </div>
                                    <p className="text-white/80 text-sm">{p.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ===== SEARCH + FILTER BAR ===== */}
                <div className="flex gap-3 mb-6">
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Search size={20} /></span>
                        <input type="text"
                            className="w-full bg-white border border-gray-200 text-gray-800 pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 shadow-sm"
                            placeholder="Tìm kiếm sách..."
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                    <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-700 px-3 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm">
                        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <button onClick={() => setShowFilter(!showFilter)}
                        className={`px-4 py-3 rounded-xl border text-sm font-semibold transition shadow-sm flex items-center gap-2 ${showFilter ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600'}`}>
                        <SlidersHorizontal size={18} /> Lọc
                    </button>
                </div>

                {/* ===== FILTER PANEL ===== */}
                {showFilter && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm flex flex-wrap gap-6 items-end">
                        {/* Category */}
                        <div className="flex-1 min-w-56">
                            <label className="text-gray-500 text-xs uppercase tracking-wide mb-2 block font-bold">Danh mục</label>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => setSelectedCategory('')}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${selectedCategory === '' ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 bg-white'}`}>
                                    Tất cả
                                </button>
                                {categories.map(c => {
                                    const Icon = CATEGORY_ICONS[c.name] || FolderOpen;
                                    return (
                                        <button key={c.id} onClick={() => handleCategoryClick(c.name)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${selectedCategory === c.name ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 bg-white'}`}>
                                            <Icon size={14} /> {c.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Price range */}
                        <div>
                            <label className="text-gray-500 text-xs uppercase tracking-wide mb-2 block font-bold">Khoảng giá (đ)</label>
                            <div className="flex items-center gap-2">
                                <input type="number" placeholder="Từ" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                                    className="w-28 bg-white border border-gray-200 text-gray-800 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                <span className="text-gray-400">—</span>
                                <input type="number" placeholder="Đến" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                                    className="w-28 bg-white border border-gray-200 text-gray-800 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                <button onClick={() => { setInitialLoading(true); setBooks([]); setPage(0); setHasMore(true); setTimeout(() => isFetchingRef.current = false, 0); }}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-xl transition font-semibold">
                                    Áp dụng
                                </button>
                            </div>
                        </div>

                        {isFiltering && (
                            <button onClick={resetFilters} className="text-gray-400 hover:text-indigo-600 text-sm font-semibold transition self-end pb-1">
                                ✕ Xóa tất cả
                            </button>
                        )}
                    </div>
                )}

                {/* ===== HOMEPAGE SECTIONS (không filter) ===== */}
                {!isFiltering ? (
                    <>
                        {/* Category pills */}
                        <section className="mb-12">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
                                    <FolderOpen className="text-indigo-500" size={24} /> Danh mục sách
                                </h2>
                                <span className="text-xs text-gray-400">Nhấp để xem toàn bộ</span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {categories.map(cat => {
                                    const Icon = CATEGORY_ICONS[cat.name] || FolderOpen;
                                    return (
                                        <button key={cat.id}
                                            onClick={() => { setSelectedCategory(cat.name); setShowFilter(true); }}
                                            className="group flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all font-semibold text-gray-700 hover:text-indigo-700 shadow-sm">
                                            <span className="text-gray-400 group-hover:text-indigo-600 transition-colors"><Icon size={20} /></span>
                                            <span>{cat.name}</span>
                                            <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        <BookRow title="Bán Chạy Nhất" icon={Flame} badge="Bestseller" badgeColor="bg-rose-100 text-rose-600"
                            sortBy="bestseller" viewAllLink="/top" />
                        <BookRow title="Mới Nhất" icon={Sparkles} badge="New" badgeColor="bg-emerald-100 text-emerald-600"
                            sortBy="newest" />

                        {/* Mid-page promo banner */}
                        <div className="relative bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl p-8 overflow-hidden mb-12">
                            <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10"></div>
                            <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full bg-white/10"></div>
                            <div className="relative text-white max-w-xl">
                                <div className="text-sm font-bold mb-2 bg-white/25 inline-flex items-center gap-2 px-3 py-1.5 rounded-full"><PartyPopper size={16} /> Ưu đãi đặc biệt</div>
                                <h2 className="text-2xl font-black mb-2">Thành viên mới — Giảm 20%<br />cho đơn đầu tiên!</h2>
                                <p className="text-white/80 mb-4 text-sm">Áp dụng cho tất cả sản phẩm. Mã: <strong>NEWBOOK20</strong></p>
                                {!user && (
                                    <Link to="/register" className="inline-block px-6 py-2.5 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition shadow-lg text-sm">
                                        Đăng ký ngay →
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Browse all CTA */}
                        <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-gray-500 mb-4 text-sm">Chưa tìm được cuốn sách ưng ý?</p>
                            <button onClick={() => { setSortBy('newest'); setInitialLoading(true); setBooks([]); setPage(0); setHasMore(true); isFetchingRef.current = false; }}
                                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-200 text-sm flex items-center justify-center gap-2 mx-auto">
                                <Library size={20} /> Xem toàn bộ kho sách →
                            </button>
                        </div>
                    </>
                ) : (
                    /* ===== LAZY LOADING GRID ===== */
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                {search ? `Kết quả "${search}"` : selectedCategory || 'Tất cả sách'}
                            </h2>
                            <button onClick={resetFilters} className="text-sm text-gray-400 hover:text-indigo-600 font-semibold transition">← Về trang chủ</button>
                        </div>

                        {/* Progress bar */}
                        {!initialLoading && totalBooks > 0 && (
                            <div className="mb-6">
                                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                                    <span>Đã hiển thị <strong className="text-indigo-600">{loadedCount}</strong> / {totalBooks} cuốn</span>
                                    <span>{progressPercent}%</span>
                                </div>
                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                        style={{ width: `${progressPercent}%` }} />
                                </div>
                            </div>
                        )}

                        {/* Grid */}
                        {initialLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                                {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                            </div>
                        ) : books.length === 0 ? (
                            <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 flex flex-col items-center">
                                <div className="bg-gray-50 p-6 rounded-full mb-4"><SearchX className="text-gray-300" size={64} /></div>
                                <h3 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy sách nào</h3>
                                <p className="text-sm text-gray-400">Thử thay đổi điều kiện tìm kiếm nhé!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                                {books.map((book, i) => <BookCard key={`${book.id}-${i}`} book={book} />)}
                            </div>
                        )}

                        {/* Lazy load indicators */}
                        {loadingMore && <LoadingMore />}

                        {!hasMore && !initialLoading && books.length > 0 && (
                            <div className="text-center py-10 border-t border-dashed border-gray-200 mt-6 flex flex-col items-center">
                                <CheckCircle2 className="text-green-500 mb-2" size={32} />
                                <p className="text-sm font-semibold text-gray-600">Đã hiển thị tất cả {totalBooks} cuốn sách</p>
                                <p className="text-xs text-gray-400 mt-1">Kéo lên để xem lại</p>
                            </div>
                        )}

                        {/* Sentinel div cho IntersectionObserver */}
                        <div ref={sentinelRef} className="h-4 w-full" aria-hidden="true" />

                        {/* Back to top */}
                        {books.length > 8 && (
                            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="fixed bottom-6 right-6 w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition flex items-center justify-center hover:scale-110 active:scale-95 z-40">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
