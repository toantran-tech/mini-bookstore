import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirm) {
            setError('Mật khẩu xác nhận không khớp!');
            return;
        }
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự!');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/register', { username, password });
            setSuccess('Tạo tài khoản thành công! Đang chuyển hướng...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Tên đăng nhập đã tồn tại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
                <h2 className="text-3xl font-bold text-center text-white mb-2">📝 Đăng Ký</h2>
                <p className="text-slate-400 text-center mb-8 text-sm">Tạo tài khoản mới</p>

                {error && (
                    <div className="bg-red-500/10 text-red-400 border border-red-500/30 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-500/10 text-green-400 border border-green-500/30 p-3 rounded-lg mb-4 text-sm text-center">
                        {success}
                    </div>
                )}

                <form onSubmit={handleRegister} className="flex flex-col gap-5">
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
                            placeholder="Nhập password (ít nhất 6 ký tự)..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-300 text-sm font-semibold mb-2">Xác nhận mật khẩu</label>
                        <input
                            type="password"
                            className="w-full bg-slate-700 border border-slate-600 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-400"
                            placeholder="Nhập lại password..."
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition duration-200 mt-2"
                    >
                        {loading ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản'}
                    </button>
                </form>

                <p className="text-center text-slate-400 text-sm mt-6">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="text-amber-400 hover:underline font-semibold">
                        Đăng nhập ngay
                    </Link>
                </p>
            </div>
        </div>
    );
}
