import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth(); // ← Lấy hàm login từ Context

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { username, password });
            login(response.data.token); // ← Gọi hàm login của Context (tự lưu localStorage)
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Sai tài khoản hoặc mật khẩu!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
                <h2 className="text-3xl font-bold text-center text-white mb-2">🔑 Đăng Nhập</h2>
                <p className="text-slate-400 text-center mb-8 text-sm">Chào mừng trở lại!</p>

                {error && (
                    <div className="bg-red-500/10 text-red-400 border border-red-500/30 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-slate-300 text-sm font-semibold mb-2">Tên đăng nhập</label>
                        <input
                            type="text"
                            className="w-full bg-slate-700 border border-slate-600 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-400"
                            placeholder="Nhập username..."
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-300 text-sm font-semibold mb-2">Mật khẩu</label>
                        <input
                            type="password"
                            className="w-full bg-slate-700 border border-slate-600 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-400"
                            placeholder="Nhập password..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition duration-200 mt-2"
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                    </button>
                </form>

                <p className="text-center text-slate-400 text-sm mt-6">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="text-amber-400 hover:underline font-semibold">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    );
}
