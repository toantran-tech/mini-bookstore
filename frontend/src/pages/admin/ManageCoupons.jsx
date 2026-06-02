import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function ManageCoupons() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'PERCENT',
        discountValue: 0,
        minOrderValue: 0,
        maxDiscount: 0,
        maxUsage: 0,
        expiresAt: '',
        active: true
    });

    const fetchCoupons = async () => {
        try {
            const res = await api.get('/coupons/all');
            setCoupons(res.data);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            alert('Lỗi tải danh sách mã giảm giá');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleOpenModal = (coupon = null) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setFormData({
                ...coupon,
                expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 16) : '' // format for datetime-local
            });
        } else {
            setEditingCoupon(null);
            setFormData({
                code: '',
                discountType: 'PERCENT',
                discountValue: 0,
                minOrderValue: 0,
                maxDiscount: 0,
                maxUsage: 0,
                expiresAt: '',
                active: true
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                code: formData.code.toUpperCase().trim()
            };

            if (editingCoupon) {
                await api.put(`/coupons/${editingCoupon.id}`, payload);
            } else {
                await api.post('/coupons', payload);
            }
            setShowModal(false);
            fetchCoupons();
        } catch (error) {
            console.error('Lỗi khi lưu coupon:', error);
            alert('Có lỗi xảy ra khi lưu!');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) return;
        try {
            await api.delete(`/coupons/${id}`);
            fetchCoupons();
        } catch (error) {
            console.error('Lỗi khi xóa:', error);
            alert('Không thể xóa mã giảm giá!');
        }
    };

    const toggleActive = async (coupon) => {
        try {
            await api.put(`/coupons/${coupon.id}`, {
                ...coupon,
                active: !coupon.active
            });
            fetchCoupons();
        } catch (error) {
            console.error('Lỗi khi toggle active:', error);
        }
    };

    if (loading) return <div className="text-center py-10">Đang tải...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Mã Giảm Giá</h1>
                    <p className="text-gray-500 text-sm mt-1">Tạo và cấu hình các chương trình khuyến mãi</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition"
                >
                    + Thêm mã mới
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                            <th className="p-4 font-semibold">Mã Code</th>
                            <th className="p-4 font-semibold">Loại</th>
                            <th className="p-4 font-semibold">Giá trị</th>
                            <th className="p-4 font-semibold">Đã dùng / Tối đa</th>
                            <th className="p-4 font-semibold">Hết hạn</th>
                            <th className="p-4 font-semibold">Trạng thái</th>
                            <th className="p-4 font-semibold text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="p-8 text-center text-gray-500">
                                    Chưa có mã giảm giá nào. Hãy tạo mới!
                                </td>
                            </tr>
                        ) : (
                            coupons.map(c => (
                                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                    <td className="p-4">
                                        <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded border border-indigo-100">
                                            {c.code}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm font-medium">
                                        {c.discountType === 'PERCENT' ? 'Phần trăm (%)' : 'Cố định (đ)'}
                                    </td>
                                    <td className="p-4 text-sm font-bold text-green-600">
                                        {c.discountType === 'PERCENT' ? `${c.discountValue}%` : `${c.discountValue.toLocaleString()}đ`}
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        <span className="font-bold">{c.usedCount}</span> / {c.maxUsage > 0 ? c.maxUsage : '∞'}
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {c.expiresAt ? new Date(c.expiresAt).toLocaleString('vi-VN') : 'Không giới hạn'}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => toggleActive(c)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${c.active ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${c.active ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => handleOpenModal(c)} className="text-blue-500 hover:text-blue-700 mr-3 text-sm font-medium">Sửa</button>
                                        <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Xóa</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
                        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-white font-bold text-lg">{editingCoupon ? 'Chỉnh sửa Mã Giảm Giá' : 'Thêm Mã Giảm Giá Mới'}</h2>
                            <button onClick={handleCloseModal} className="text-indigo-200 hover:text-white text-2xl leading-none">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã Code *</label>
                                    <input required type="text" name="code" value={formData.code} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 uppercase" placeholder="VD: SUMMER20" />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                    <div className="flex items-center h-10">
                                        <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} className="w-5 h-5 text-indigo-600 rounded" />
                                        <span className="ml-2 text-gray-700">Kích hoạt (Cho phép dùng)</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại giảm giá</label>
                                    <select name="discountType" value={formData.discountType} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option value="PERCENT">Giảm theo %</option>
                                        <option value="FIXED">Giảm tiền cố định (đ)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {formData.discountType === 'PERCENT' ? 'Phần trăm giảm (%) *' : 'Số tiền giảm (đ) *'}
                                    </label>
                                    <input required type="number" min="0" step="0.1" name="discountValue" value={formData.discountValue} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Đơn hàng tối thiểu (đ)</label>
                                    <input type="number" min="0" name="minOrderValue" value={formData.minOrderValue} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Giảm tối đa (đ) <span className="text-gray-400 font-normal">(0 = Không giới hạn)</span>
                                    </label>
                                    <input type="number" min="0" name="maxDiscount" value={formData.maxDiscount} onChange={handleChange} disabled={formData.discountType === 'FIXED'} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Số lượt dùng tối đa <span className="text-gray-400 font-normal">(0 = Không giới hạn)</span>
                                    </label>
                                    <input type="number" min="0" name="maxUsage" value={formData.maxUsage} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn (bỏ trống = vĩnh viễn)</label>
                                    <input type="datetime-local" name="expiresAt" value={formData.expiresAt} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition">Hủy</button>
                                <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-sm transition">
                                    {editingCoupon ? 'Cập nhật' : 'Tạo mã'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
