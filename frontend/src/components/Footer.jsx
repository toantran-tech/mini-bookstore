import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 mt-auto">
            <div className="max-w-6xl mx-auto px-4 py-10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">📚</span>
                            <span className="text-white font-extrabold text-lg">Mini Bookstore</span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Nơi khám phá tri thức — hàng nghìn đầu sách chọn lọc, giao hàng tận nơi.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <p className="text-white font-bold mb-3 uppercase text-xs tracking-widest">Khám phá</p>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="hover:text-indigo-400 transition">🏠 Trang chủ</Link></li>
                            <li><Link to="/top" className="hover:text-indigo-400 transition">🔥 Sách bán chạy</Link></li>
                            <li><Link to="/wishlist" className="hover:text-indigo-400 transition">❤️ Danh sách yêu thích</Link></li>
                            <li><Link to="/profile" className="hover:text-indigo-400 transition">👤 Hồ sơ cá nhân</Link></li>
                        </ul>
                    </div>

                    {/* Tech Stack */}
                    <div>
                        <p className="text-white font-bold mb-3 uppercase text-xs tracking-widest">Công nghệ</p>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>⚡ Spring Boot 3 + JWT Security</li>
                            <li>⚛️ React 19 + Vite + TailwindCSS</li>
                            <li>🗄️ MySQL / PostgreSQL + JPA</li>
                            <li>🚀 Vercel + Render Deploy</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-gray-500">© 2025 Mini Bookstore · Built with ❤️ by Toan Tran</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <a
                            href="https://github.com/toantran00/mini-bookstore"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-white transition flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
                            </svg>
                            GitHub
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
