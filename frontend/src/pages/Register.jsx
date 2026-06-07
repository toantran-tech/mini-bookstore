import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, User, Lock, ShieldCheck, ArrowRight, Loader2, BookOpen } from 'lucide-react';

const STEPS = {
    FORM: 'FORM',
    OTP: 'OTP',
};

export default function Register() {
    const [step, setStep] = useState(STEPS.FORM);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    const [otp, setOtp] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');

        if (!username.trim()) { setError('Vui lòng nhập tên đăng nhập!'); return; }
        if (!email.trim() || !email.includes('@')) { setError('Vui lòng nhập email hợp lệ!'); return; }
        if (password.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự!'); return; }
        if (password !== confirm) { setError('Mật khẩu xác nhận không khớp!'); return; }

        setLoading(true);
        try {
            await api.post('/auth/send-otp', { username, email });
            setStep(STEPS.OTP);
            setSuccess(`Mã OTP đã được gửi về ${email}. Vui lòng kiểm tra hòm thư!`);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể gửi OTP. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (!otp.trim() || otp.length !== 6) { setError('Vui lòng nhập đúng mã OTP 6 số!'); return; }

        setLoading(true);
        try {
            await api.post('/auth/register', { username, email, password, otp });
            setSuccess('🎉 Tạo tài khoản thành công! Đang chuyển hướng...');
            setTimeout(() => navigate('/login'), 1800);
        } catch (err) {
            setError(err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-12">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/30 mb-4">
                        <BookOpen className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-white">Mini Bookstore</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {step === STEPS.FORM ? 'Tạo tài khoản mới' : 'Xác thực email của bạn'}
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8">
                    <div className="flex items-center gap-3 mb-8">
                        {[1, 2].map((n) => {
                            const active = (n === 1 && step === STEPS.FORM) || (n === 2 && step === STEPS.OTP);
                            const done = n === 1 && step === STEPS.OTP;
                            return (
                                <div key={n} className="flex items-center gap-3 flex-1">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                                        done ? 'bg-green-500 text-white' :
                                        active ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40' :
                                        'bg-white/10 text-slate-400'
                                    }`}>
                                        {done ? '✓' : n}
                                    </div>
                                    <span className={`text-xs font-medium ${active ? 'text-white' : 'text-slate-500'}`}>
                                        {n === 1 ? 'Thông tin' : 'Xác thực OTP'}
                                    </span>
                                    {n === 1 && <div className="flex-1 h-px bg-white/10" />}
                                </div>
                            );
                        })}
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2">
                            <span>✅</span> {success}
                        </div>
                    )}

                    {step === STEPS.FORM && (
                        <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
                            <div>
                                <label className="block text-slate-300 text-sm font-semibold mb-2">Tên đăng nhập</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600 transition"
                                        placeholder="Nhập username..."
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-300 text-sm font-semibold mb-2">Email</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="email"
                                        className="w-full bg-white/5 border border-white/10 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600 transition"
                                        placeholder="example@gmail.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-300 text-sm font-semibold mb-2">Mật khẩu</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="password"
                                        className="w-full bg-white/5 border border-white/10 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600 transition"
                                        placeholder="Ít nhất 6 ký tự..."
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-300 text-sm font-semibold mb-2">Xác nhận mật khẩu</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="password"
                                        className="w-full bg-white/5 border border-white/10 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600 transition"
                                        placeholder="Nhập lại mật khẩu..."
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mt-1"
                            >
                                {loading
                                    ? <><Loader2 size={20} className="animate-spin" /> Đang gửi OTP...</>
                                    : <><ArrowRight size={20} /> Gửi mã xác thực</>
                                }
                            </button>
                        </form>
                    )}

                    {step === STEPS.OTP && (
                        <form onSubmit={handleRegister} className="flex flex-col gap-5">
                            <div className="text-center bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-2">
                                <Mail className="text-indigo-400 mx-auto mb-2" size={28} />
                                <p className="text-slate-300 text-sm">Mã OTP đã gửi đến</p>
                                <p className="text-white font-bold">{email}</p>
                            </div>

                            <div>
                                <label className="block text-slate-300 text-sm font-semibold mb-2 text-center">Nhập mã OTP 6 số</label>
                                <div className="relative">
                                    <ShieldCheck size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        className="w-full bg-white/5 border border-white/10 text-white pl-10 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600 transition text-center text-2xl font-bold tracking-[0.5em]"
                                        placeholder="• • • • • •"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        autoFocus
                                    />
                                </div>
                                <p className="text-slate-500 text-xs text-center mt-2">⏱ Mã có hiệu lực trong 5 phút</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                {loading
                                    ? <><Loader2 size={20} className="animate-spin" /> Đang xác thực...</>
                                    : <><ShieldCheck size={20} /> Xác nhận & Tạo tài khoản</>
                                }
                            </button>

                            <button
                                type="button"
                                onClick={() => { setStep(STEPS.FORM); setError(''); setSuccess(''); setOtp(''); }}
                                className="text-slate-400 hover:text-indigo-400 text-sm transition text-center"
                            >
                                ← Quay lại nhập thông tin
                            </button>
                        </form>
                    )}

                    <p className="text-center text-slate-500 text-sm mt-6">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition">
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
