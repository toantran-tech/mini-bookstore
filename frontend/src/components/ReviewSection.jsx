import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function StarDisplay({ rating, size = 'sm' }) {
    const sz = size === 'lg' ? 'text-2xl' : 'text-base';
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <span key={s} className={`${sz} ${s <= rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
            ))}
        </div>
    );
}

function StarPicker({ value, onChange }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(s => (
                <button
                    key={s}
                    type="button"
                    onMouseEnter={() => setHover(s)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => onChange(s)}
                    className={`text-3xl transition-transform hover:scale-110 ${s <= (hover || value) ? 'text-amber-400' : 'text-slate-300'
                        }`}
                >
                    ★
                </button>
            ))}
        </div>
    );
}

export default function ReviewSection({ bookId }) {
    const { token } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitMsg, setSubmitMsg] = useState('');
    const [canReview, setCanReview] = useState(false);

    const fetchReviews = useCallback(async () => {
        try {
            const res = await api.get(`/reviews/book/${bookId}`);
            setReviews(res.data.reviews || []);
            setAvgRating(res.data.averageRating || 0);
            setTotalReviews(res.data.totalReviews || 0);
        } catch {
            setReviews([]);
            setAvgRating(0);
            setTotalReviews(0);
        }
    }, [bookId]);

    useEffect(() => {
        fetchReviews();
        if (token) {
            api.get(`/reviews/can-review/${bookId}`)
                .then(res => setCanReview(res.data))
                .catch(() => setCanReview(false));
        } else {
            setCanReview(false);
        }
    }, [bookId, token, fetchReviews]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setSubmitting(true);
        setSubmitMsg('');
        try {
            await api.post('/reviews', { bookId, rating: newRating, comment: newComment.trim() });
            setNewComment('');
            setNewRating(5);
            setSubmitMsg('✅ Đánh giá của bạn đã được ghi nhận!');
            await fetchReviews();
            setTimeout(() => setSubmitMsg(''), 3000);
        } catch (err) {
            setSubmitMsg('❌ ' + (err.response?.data?.message || 'Gửi đánh giá thất bại!'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Xóa đánh giá này?')) return;
        try {
            await api.delete(`/reviews/${reviewId}`);
            await fetchReviews();
        } catch {
            alert('Không thể xóa đánh giá!');
        }
    };

    const starCounts = [5, 4, 3, 2, 1].map(s => ({
        star: s,
        count: reviews.filter(r => r.rating === s).length,
        pct: totalReviews > 0 ? (reviews.filter(r => r.rating === s).length / totalReviews) * 100 : 0,
    }));

    return (
        <section className="mt-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-gray-200" />
                <h2 className="text-xl font-extrabold text-gray-800 whitespace-nowrap">⭐ Đánh giá & Bình luận</h2>
                <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6 flex flex-col sm:flex-row gap-6 items-center">
                <div className="text-center flex-shrink-0">
                    <div className="text-6xl font-black text-indigo-600 leading-none">{avgRating.toFixed(1)}</div>
                    <StarDisplay rating={Math.round(avgRating)} size="lg" />
                    <p className="text-slate-400 text-sm mt-1">{totalReviews} đánh giá</p>
                </div>
                <div className="flex-1 w-full">
                    {starCounts.map(({ star, count, pct }) => (
                        <div key={star} className="flex items-center gap-3 mb-1.5">
                            <span className="text-xs text-slate-500 w-4 text-right">{star}</span>
                            <span className="text-amber-400 text-xs">★</span>
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-slate-400 w-5">{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {token ? (
                canReview ? (
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
                        <h3 className="font-bold text-slate-700 mb-4">✍️ Viết đánh giá của bạn</h3>
                        <div className="mb-4">
                            <p className="text-sm text-slate-500 mb-2">Chọn số sao:</p>
                            <StarPicker value={newRating} onChange={setNewRating} />
                        </div>
                        <textarea
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
                            rows={4}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition resize-none"
                        />
                        {submitMsg && (
                            <p className={`mt-2 text-sm ${submitMsg.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>
                                {submitMsg}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={submitting || !newComment.trim()}
                            className="mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl transition"
                        >
                            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </button>
                    </form>
                ) : (
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-6 text-center">
                        <p className="text-amber-700 text-sm font-medium">

                        </p>
                    </div>
                )
            ) : (
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-6 text-center">
                    <p className="text-slate-600 text-sm">
                        <a href="/login" className="text-indigo-600 font-bold hover:underline">Đăng nhập</a> để viết đánh giá của bạn.
                    </p>
                </div>
            )}

            {reviews.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                    <div className="text-5xl mb-3">💬</div>
                    <p>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {reviews.map(r => (
                        <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                                        {r.username?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">{r.username}</p>
                                        <StarDisplay rating={r.rating} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-slate-300 text-xs">
                                        {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(r.id)}
                                        className="text-slate-200 hover:text-red-400 transition text-lg leading-none"
                                        title="Xóa đánh giá"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                            {r.comment && (
                                <p className="mt-3 text-slate-600 text-sm leading-relaxed pl-12">{r.comment}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
