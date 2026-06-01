import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLOR = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Processing: 'bg-blue-100 text-blue-700',
    Shipped: 'bg-purple-100 text-purple-700',
    Delivered: 'bg-green-100 text-green-700',
};

export default function Profile() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Lấy tab từ URL, mặc định là 'info'
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') || 'info';

    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        const tab = queryParams.get('tab') || 'info';
        if (tab !== activeTab) setActiveTab(tab);
    }, [location.search]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        navigate(`/profile?tab=${tab}`);
    };

    // Form thông tin
    const [profile, setProfile] = useState({ fullName: '', phone: '', address: '', email: '', avatarUrl: '' });
    const [savingProfile, setSavingProfile] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                return alert('Vui lòng chọn ảnh có kích thước dưới 2MB');
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile({ ...profile, avatarUrl: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteImage = () => {
        setProfile({ ...profile, avatarUrl: '' });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    // Form đổi mật khẩu
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [savingPassword, setSavingPassword] = useState(false);

    // Modal thông báo thành công
    const [successModal, setSuccessModal] = useState({ show: false, message: '', onClose: null });

    // Lịch sử đơn hàng
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    useEffect(() => {
        fetchProfile();
        fetchOrders();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/profile');
            setProfile({
                fullName: res.data.fullName || '',
                phone: res.data.phone || '',
                address: res.data.address || '',
                email: res.data.email || '',
                avatarUrl: res.data.avatarUrl || ''
            });
        } catch (err) {
            console.error('Lỗi tải thông tin cá nhân', err);
        }
    };

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const res = await api.get('/orders/my');
            setOrders(res.data);
        } catch (err) {
            console.error('Lỗi tải đơn hàng', err);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            await api.put('/users/profile', {
                fullName: profile.fullName,
                phone: profile.phone,
                address: profile.address,
                avatarUrl: profile.avatarUrl
            });
            setSuccessModal({ show: true, message: 'Cập nhật thông tin thành công!' });
        } catch (err) {
            alert('Lỗi cập nhật thông tin!');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return alert('Mật khẩu xác nhận không khớp!');
        }
        setSavingPassword(true);
        try {
            await api.put('/users/password', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            setSuccessModal({
                show: true, 
                message: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.',
                onClose: () => {
                    logout();
                    navigate('/login');
                }
            });
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi đổi mật khẩu!');
        } finally {
            setSavingPassword(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-10 px-4">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
                
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <h2 className="text-xl font-black text-gray-900 mb-6 px-4">Cài đặt tài khoản</h2>
                    <nav className="flex flex-col gap-1">
                        <button 
                            onClick={() => handleTabChange('info')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left ${activeTab === 'info' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 rounded-l-none' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            <span className="text-lg">👤</span> Hồ sơ cá nhân
                        </button>
                        <button 
                            onClick={() => handleTabChange('password')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left ${activeTab === 'password' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 rounded-l-none' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            <span className="text-lg">🔐</span> Đổi mật khẩu
                        </button>
                        <button 
                            onClick={() => handleTabChange('orders')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-left ${activeTab === 'orders' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 rounded-l-none' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            <span className="text-lg">📦</span> Lịch sử đơn hàng
                        </button>
                        
                        <div className="my-4 border-t border-gray-200"></div>

                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-rose-500 hover:bg-rose-50 transition text-left"
                        >
                            <span className="text-lg">🚪</span> Đăng xuất
                        </button>
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        
                        {/* Tab: Hồ sơ cá nhân */}
                        {activeTab === 'info' && (
                            <div className="animate-fade-in">
                                <h3 className="text-xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">Thông tin cá nhân</h3>
                                
                                {/* Avatar Section */}
                                <div className="flex items-center gap-6 mb-10">
                                    <div className="relative">
                                        {profile.avatarUrl ? (
                                            <img src={profile.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover shadow-lg border-2 border-white" />
                                        ) : (
                                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-black shadow-lg">
                                                {user?.username?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm hover:bg-indigo-700 transition"
                                        >
                                            📷
                                        </button>
                                    </div>
                                    <div className="flex gap-3">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            hidden 
                                            ref={fileInputRef} 
                                            onChange={handleImageUpload} 
                                        />
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold rounded-lg transition shadow-sm"
                                        >
                                            Tải ảnh mới
                                        </button>
                                        <button 
                                            onClick={handleDeleteImage}
                                            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition"
                                        >
                                            Xóa ảnh
                                        </button>
                                    </div>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Họ và Tên <span className="text-rose-500">*</span></label>
                                            <input
                                                type="text"
                                                className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
                                                value={profile.fullName}
                                                onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                                                placeholder="Nhập họ tên của bạn"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Tên đăng nhập (Username)</label>
                                            <input
                                                type="text"
                                                className="w-full bg-gray-50 border border-gray-200 text-gray-500 px-4 py-3 rounded-lg cursor-not-allowed"
                                                value={user?.username || ''}
                                                disabled
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Địa chỉ Email</label>
                                            <input
                                                type="email"
                                                className="w-full bg-gray-50 border border-gray-200 text-gray-500 px-4 py-3 rounded-lg cursor-not-allowed"
                                                value={profile.email}
                                                disabled
                                                placeholder="example@gmail.com"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">Email không thể thay đổi sau khi đăng ký.</p>
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Số điện thoại liên hệ</label>
                                            <input
                                                type="text"
                                                className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
                                                value={profile.phone}
                                                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                                placeholder="0987 654 321"
                                            />
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Địa chỉ giao hàng mặc định</label>
                                            <input
                                                type="text"
                                                className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
                                                value={profile.address}
                                                onChange={e => setProfile({ ...profile, address: e.target.value })}
                                                placeholder="Nhập địa chỉ nhận hàng của bạn"
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={savingProfile}
                                            className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-3 px-8 rounded-lg shadow-sm transition disabled:opacity-70"
                                        >
                                            {savingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Tab: Đổi mật khẩu */}
                        {activeTab === 'password' && (
                            <div className="animate-fade-in max-w-xl">
                                <h3 className="text-xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">Đổi mật khẩu</h3>
                                <form onSubmit={handleChangePassword} className="space-y-6">
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Mật khẩu hiện tại <span className="text-rose-500">*</span></label>
                                        <input
                                            type="password"
                                            className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
                                            value={passwordData.oldPassword}
                                            onChange={e => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                            required
                                            placeholder="Nhập mật khẩu cũ"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Mật khẩu mới <span className="text-rose-500">*</span></label>
                                        <input
                                            type="password"
                                            className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
                                            value={passwordData.newPassword}
                                            onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            required
                                            placeholder="Nhập mật khẩu mới"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Xác nhận mật khẩu mới <span className="text-rose-500">*</span></label>
                                        <input
                                            type="password"
                                            className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
                                            value={passwordData.confirmPassword}
                                            onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            required
                                            placeholder="Nhập lại mật khẩu mới"
                                        />
                                    </div>
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={savingPassword}
                                            className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-3 px-8 rounded-lg shadow-sm transition disabled:opacity-70"
                                        >
                                            {savingPassword ? 'Đang đổi...' : 'Cập nhật mật khẩu'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Tab: Lịch sử đơn hàng */}
                        {activeTab === 'orders' && (
                            <div className="animate-fade-in">
                                <h3 className="text-xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">Lịch sử giao dịch</h3>
                                {loadingOrders ? (
                                    <div className="flex justify-center py-20">
                                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-20">
                                        <div className="text-6xl mb-4 opacity-30">📦</div>
                                        <p className="text-gray-500 font-medium">Bạn chưa thực hiện giao dịch nào.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {orders.map(order => (
                                            <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition">
                                                <div className="bg-gray-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200">
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Mã đơn hàng</p>
                                                        <p className="text-lg font-black text-indigo-700">#{order.id}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Ngày đặt</p>
                                                        <p className="text-gray-900 font-bold">
                                                            {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Tổng tiền</p>
                                                        <p className="text-gray-900 font-bold">{order.totalAmount?.toLocaleString('vi-VN')}đ</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Trạng thái</p>
                                                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${STATUS_COLOR[order.status] || 'bg-gray-200 text-gray-700'}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="px-6 py-5">
                                                    <div className="space-y-4">
                                                        {order.items?.map((item, idx) => (
                                                            <div key={idx} className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                                                <div className="flex-1">
                                                                    <p className="text-gray-900 font-bold">{item.bookTitle}</p>
                                                                    <p className="text-gray-500 text-sm">Số lượng: {item.quantity}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-gray-900 font-bold">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Success Modal Overlay */}
            {successModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center transform scale-100 transition-transform">
                        <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                            ✓
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Thành công!</h3>
                        <p className="text-gray-500 mb-6">{successModal.message}</p>
                        <button 
                            onClick={() => {
                                setSuccessModal({ show: false, message: '', onClose: null });
                                if (successModal.onClose) successModal.onClose();
                            }}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
