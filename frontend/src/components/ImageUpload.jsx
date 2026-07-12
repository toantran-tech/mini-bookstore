import { useState, useRef } from 'react';
import api from '../services/api';

export default function ImageUpload({ bookId, currentImageUrl, onUploaded }) {
    const [preview, setPreview] = useState(currentImageUrl || null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('Chỉ chấp nhận file ảnh!');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('File quá lớn (tối đa 5MB)');
            return;
        }

        // Preview ngay
        setPreview(URL.createObjectURL(file));
        setError('');
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post(`/admin/books/${bookId}/upload-image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onUploaded(res.data.imageUrl);
        } catch {
            setError('Upload thất bại. Thử lại!');
            setPreview(currentImageUrl);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
            >
                {preview ? (
                    <img src={preview} alt="Preview" className="h-32 mx-auto object-contain rounded-lg" />
                ) : (
                    <div className="text-gray-400 py-4">
                        <p className="text-2xl">📷</p>
                        <p className="text-sm mt-1">Click để chọn ảnh</p>
                    </div>
                )}
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />
            {uploading && (
                <div className="flex items-center gap-2 text-sm text-indigo-600">
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    Đang upload...
                </div>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
}
