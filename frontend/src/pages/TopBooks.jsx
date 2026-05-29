import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

// ─── Rank Badge ───────────────────────────────────────────────────────────────
const RankBadge = ({ rank }) => {
    const colors = {
        1: 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-amber-200',
        2: 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-gray-200',
        3: 'bg-gradient-to-br from-orange-400 to-amber-600 text-white shadow-orange-200',
    };
    const icons = { 1: '🥇', 2: '🥈', 3: '🥉' };
    return (
        <div className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow-lg z-10 ${colors[rank] || 'bg-indigo-600 text-white shadow-indigo-200'}`}>
            {rank <= 3 ? icons[rank] : `#${rank}`}
        </div>
    );
};

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
    <div className="flex-shrink-0 w-52 bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
        <div className="h-44 bg-gray-200"></div>
        <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            <div className="h-4 bg-gray-200 rounded w-3/5"></div>
            <div className="h-5 bg-gray-200 rounded w-2/5"></div>
        </div>
    </div>
);

// ─── Horizontal Product Card ──────────────────────────────────────────────────
const HorizontalBookCard = ({ book, rank, onClick }) => (
    <div onClick={() => onClick(book.id)}
        className="group flex-shrink-0 w-52 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-indigo-100 hover:-translate-y-1 overflow-hidden">
        <div className="relative h-44 overflow-hidden bg-gray-50">
            <RankBadge rank={rank} />
            <img src={book.imageUrl || 'https://placehold.co/300x200?text=📖'}
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.target.src = 'https://placehold.co/300x200?text=📖'; }}
            />
        </div>
        <div className="p-3">
            {book.categoryName && <p className="text-xs text-indigo-500 font-bold">{book.categoryName}</p>}
            <h3 className="text-sm font-bold text-gray-800 mt-1 mb-2 line-clamp-2 leading-snug min-h-[2.5rem] group-hover:text-indigo-600 transition">
                {book.title}
            </h3>
            <p className="text-xs text-gray-500 mb-2">✍️ {book.author}</p>
            <div className="flex items-end justify-between">
                <p className="text-sm font-extrabold text-indigo-600">{book.price?.toLocaleString('vi-VN')}đ</p>
            </div>
        </div>
    </div>
);

// ─── Horizontal Carousel with Pagination ─────────────────────────────────────
const HorizontalCarousel = ({ books, loading, onBookClick, itemsPerPage = 5 }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const totalPages = Math.ceil(books.length / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const visibleBooks = books.slice(startIndex, startIndex + itemsPerPage);

    if (loading) {
        return (
            <div className="flex gap-4 overflow-hidden">
                {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Prev button */}
            <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
                className={`absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all
                    ${currentPage === 0
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white border border-gray-200 hover:border-indigo-600 hover:scale-110'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Cards */}
            <div className="overflow-hidden mx-4">
                <div className="flex gap-4 transition-all duration-500">
                    {visibleBooks.map((b, i) => (
                        <HorizontalBookCard key={b.id} book={b} rank={startIndex + i + 1} onClick={onBookClick} />
                    ))}
                </div>
            </div>

            {/* Next button */}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}
                className={`absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all
                    ${currentPage >= totalPages - 1
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white border border-gray-200 hover:border-indigo-600 hover:scale-110'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Dot indicators */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {[...Array(totalPages)].map((_, i) => (
                        <button key={i} onClick={() => setCurrentPage(i)}
                            className={`rounded-full transition-all duration-300 ${i === currentPage ? 'w-6 h-2.5 bg-indigo-600' : 'w-2.5 h-2.5 bg-gray-300 hover:bg-indigo-300'}`} />
                    ))}
                </div>
            )}

            <p className="text-center text-xs text-gray-400 mt-2">
                Trang {currentPage + 1} / {totalPages} • Hiển thị {startIndex + 1}–{Math.min(startIndex + itemsPerPage, books.length)} trong {books.length} cuốn
            </p>
        </div>
    );
};

// ─── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ icon, title, subtitle, badge, badgeColor }) => (
    <div className="flex items-end justify-between mb-8">
        <div>
            <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl">{icon}</span>
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-extrabold text-gray-800">{title}</h2>
                        {badge && <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${badgeColor}`}>{badge}</span>}
                    </div>
                    {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
                </div>
            </div>
        </div>
    </div>
);

// ════════════════════════════════════════════════════════════════════════════
//  TOP BOOKS PAGE
// ════════════════════════════════════════════════════════════════════════════
export default function TopBooks() {
    const navigate = useNavigate();
    const [data, setData] = useState({ bestsellers: [], mostViewed: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        api.get('/books/top')
            .then(res => setData(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleBookClick = (id) => navigate(`/books/${id}`);

    const tabs = [
        { key: 'all',         label: '🏆 Tất cả' },
        { key: 'bestsellers', label: '🔥 Bán chạy' },
        { key: 'viewed',      label: '👁️ Xem nhiều' },
    ];

    const medalColors = [
        'from-yellow-400 to-amber-500',
        'from-gray-300 to-gray-400',
        'from-orange-400 to-amber-600',
    ];
    const viewedColors = [
        'from-violet-500 to-purple-600',
        'from-indigo-400 to-blue-500',
        'from-cyan-400 to-teal-500',
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            <main className="max-w-7xl mx-auto px-4 py-8">

                {/* Page header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2 rounded-full text-sm font-bold mb-4">
                        🏆 Bảng xếp hạng sách
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Top 10 Sách Nổi Bật</h1>
                    <p className="text-gray-500 max-w-xl mx-auto text-sm">
                        Xếp hạng theo lượt mua và lượt xem. Cập nhật liên tục theo thời gian thực.
                    </p>
                    <Link to="/" className="inline-flex items-center gap-1 mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-semibold">
                        ← Quay lại trang chủ
                    </Link>
                </div>

                {/* Tab switcher */}
                <div className="flex justify-center gap-2 mb-10">
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                                activeTab === tab.key
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100 scale-105'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── BESTSELLERS SECTION ── */}
                {(activeTab === 'all' || activeTab === 'bestsellers') && (
                    <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
                        <SectionHeader icon="🔥" title="Top 10 Bán Chạy Nhất"
                            subtitle="Những cuốn sách được mua nhiều nhất bởi khách hàng"
                            badge="Bestseller" badgeColor="bg-rose-100 text-rose-600 border border-rose-200" />

                        {/* Top 3 podium cards */}
                        {!loading && data.bestsellers.length > 0 && (
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                {data.bestsellers.slice(0, 3).map((b, i) => (
                                    <div key={b.id} onClick={() => handleBookClick(b.id)}
                                        className={`bg-gradient-to-br ${medalColors[i]} rounded-2xl p-4 text-white cursor-pointer hover:scale-[1.02] transition-transform shadow-lg`}>
                                        <div className="text-3xl mb-2">{['🥇', '🥈', '🥉'][i]}</div>
                                        {b.categoryName && <p className="text-xs font-bold opacity-80 uppercase mb-1">{b.categoryName}</p>}
                                        <p className="font-bold text-sm line-clamp-2 mb-2">{b.title}</p>
                                        <p className="text-xs opacity-80">✍️ {b.author}</p>
                                        <p className="text-xs mt-1 opacity-90">🛒 Đã bán: <strong>{(b.soldCount || 0).toLocaleString()}</strong></p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <HorizontalCarousel books={data.bestsellers} loading={loading} onBookClick={handleBookClick} itemsPerPage={5} />
                    </section>
                )}

                {/* ── MOST VIEWED SECTION ── */}
                {(activeTab === 'all' || activeTab === 'viewed') && (
                    <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <SectionHeader icon="👁️" title="Xem Nhiều Nhất"
                            subtitle="Những cuốn sách được khách hàng quan tâm và xem nhiều nhất"
                            badge="Trending" badgeColor="bg-purple-100 text-purple-600 border border-purple-200" />

                        {/* Top 3 most viewed */}
                        {!loading && data.mostViewed.length > 0 && (
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                {data.mostViewed.slice(0, 3).map((b, i) => (
                                    <div key={b.id} onClick={() => handleBookClick(b.id)}
                                        className={`bg-gradient-to-br ${viewedColors[i]} rounded-2xl p-4 text-white cursor-pointer hover:scale-[1.02] transition-transform shadow-lg`}>
                                        <div className="text-2xl font-black mb-2">{['#1', '#2', '#3'][i]}</div>
                                        {b.categoryName && <p className="text-xs font-bold opacity-80 uppercase mb-1">{b.categoryName}</p>}
                                        <p className="font-bold text-sm line-clamp-2 mb-2">{b.title}</p>
                                        <p className="text-xs opacity-80">✍️ {b.author}</p>
                                        <p className="text-xs mt-1 opacity-90">👁️ Lượt xem: <strong>{(b.viewCount || 0).toLocaleString()}</strong></p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <HorizontalCarousel books={data.mostViewed} loading={loading} onBookClick={handleBookClick} itemsPerPage={5} />
                    </section>
                )}

                {/* ── Leaderboard table (tab all) ── */}
                {activeTab === 'all' && !loading && data.bestsellers.length > 0 && (
                    <section className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
                                📊 Bảng xếp hạng tổng hợp
                            </h2>
                            <p className="text-sm text-gray-500">So sánh thứ hạng bán chạy và lượt xem</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        {['#', 'Sách', 'Danh mục', '🛒 Đã bán', '👁️ Lượt xem', 'Giá'].map(h => (
                                            <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3 first:pl-6 last:pr-6 last:text-right">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {data.bestsellers.map((b, i) => (
                                        <tr key={b.id} onClick={() => handleBookClick(b.id)}
                                            className="hover:bg-indigo-50/50 cursor-pointer transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="text-lg font-black">
                                                    {i < 3 ? ['🥇', '🥈', '🥉'][i] : <span className="text-sm text-gray-400 font-bold">#{i + 1}</span>}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={b.imageUrl || 'https://placehold.co/60x60?text=📖'} alt={b.title}
                                                        className="w-12 h-12 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
                                                    <span className="font-semibold text-sm text-gray-800 group-hover:text-indigo-600 transition line-clamp-2 max-w-48">
                                                        {b.title}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                {b.categoryName && (
                                                    <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg">
                                                        {b.categoryName}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="font-bold text-gray-700">{(b.soldCount || 0).toLocaleString()}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="font-bold text-gray-700">{(b.viewCount || 0).toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="font-extrabold text-indigo-600 text-sm">{b.price?.toLocaleString('vi-VN')}đ</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
