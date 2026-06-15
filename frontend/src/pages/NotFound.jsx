import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="relative mb-8">
                    <p className="text-[10rem] font-black text-indigo-100 leading-none select-none">404</p>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-7xl">📚</span>
                    </div>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-800 mb-3">
                    Trang không tồn tại
                </h1>
                <p className="text-gray-500 mb-8 text-base leading-relaxed">
                    Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên, hoặc chưa từng tồn tại.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300"
                    >
                        🏠 Về trang chủ
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-bold px-6 py-3 rounded-xl border border-gray-200 transition-all"
                    >
                        ← Quay lại
                    </button>
                </div>
            </div>
        </div>
    );
}
