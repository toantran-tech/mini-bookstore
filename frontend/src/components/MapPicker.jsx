import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Sửa lỗi icon bị thiếu của Leaflet khi dùng chung với Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition, setAddressDetails }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    // Lấy địa chỉ tự động (Reverse Geocoding)
    useEffect(() => {
        if (position) {
            const fetchAddress = async () => {
                try {
                    const res = await axios.get(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&zoom=18&addressdetails=1`
                    );
                    
                    if (res.data && res.data.address) {
                        const { road, suburb, city_district, city, state, country } = res.data.address;
                        
                        // Ghép chuỗi địa chỉ gọn gàng
                        const streetArr = [];
                        if (road) streetArr.push(road);
                        if (suburb) streetArr.push(suburb);
                        if (city_district) streetArr.push(city_district);
                        
                        const streetStr = streetArr.join(', ') || res.data.display_name.split(',')[0];
                        const cityStr = city || state || country || '';

                        setAddressDetails({
                            full: res.data.display_name,
                            street: streetStr,
                            city: cityStr
                        });
                    }
                } catch (error) {
                    console.error("Lỗi lấy địa chỉ:", error);
                }
            };
            
            const timerId = setTimeout(() => fetchAddress(), 500); // Debounce
            return () => clearTimeout(timerId);
        }
    }, [position, setAddressDetails]);

    return position === null ? null : <Marker position={position} />;
}

export default function MapPicker({ onConfirm, onClose, initialAddress }) {
    // Tọa độ mặc định: Hồ Chí Minh
    const defaultCenter = { lat: 10.762622, lng: 106.660172 };
    
    const [position, setPosition] = useState(null);
    const [addressDetails, setAddressDetails] = useState({ street: '', city: '', full: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Tìm kiếm vị trí (Forward Geocoding)
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        
        setIsSearching(true);
        try {
            const res = await axios.get(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
            );
            if (res.data && res.data.length > 0) {
                const result = res.data[0];
                const newPos = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
                setPosition(newPos);
            } else {
                alert("Không tìm thấy địa điểm này!");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[85vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">📍 Chọn vị trí giao hàng</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 rounded-full">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body: Search + Map */}
                <div className="flex-1 flex flex-col md:flex-row relative">
                    
                    {/* Map Sidebar / Info */}
                    <div className="w-full md:w-80 bg-gray-50 p-6 flex flex-col gap-6 border-r border-gray-100 shadow-inner z-10">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tìm kiếm địa điểm</label>
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Nhập tên đường, tòa nhà..."
                                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                                />
                                <button type="submit" disabled={isSearching} className="bg-indigo-600 text-white px-4 rounded-xl hover:bg-indigo-700 transition font-medium shadow-sm flex items-center justify-center disabled:opacity-70">
                                    {isSearching ? '...' : '🔍'}
                                </button>
                            </form>
                        </div>

                        <div className="flex-1 bg-white border border-indigo-100 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                            <h3 className="text-sm font-bold text-indigo-600 mb-4 flex items-center gap-2">
                                <span>🎯</span> Kết quả chọn
                            </h3>
                            
                            {!position ? (
                                <p className="text-sm text-gray-400 italic">Vui lòng click thả ghim trên bản đồ hoặc tìm kiếm địa chỉ.</p>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Đường / Tòa nhà</p>
                                        <p className="text-sm font-semibold text-gray-800">{addressDetails.street || 'Đang tải...'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Tỉnh / Thành phố</p>
                                        <p className="text-sm font-semibold text-gray-800">{addressDetails.city || 'Đang tải...'}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={() => onConfirm(addressDetails)}
                            disabled={!position || !addressDetails.street}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-95"
                        >
                            ✅ Dùng địa chỉ này
                        </button>
                    </div>

                    {/* Map Area */}
                    <div className="flex-1 h-full min-h-[300px] relative z-0">
                        <MapContainer 
                            center={defaultCenter} 
                            zoom={13} 
                            style={{ height: "100%", width: "100%" }}
                            scrollWheelZoom={true}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <LocationMarker position={position} setPosition={setPosition} setAddressDetails={setAddressDetails} />
                        </MapContainer>
                        
                        {!position && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-white/90 backdrop-blur px-6 py-3 rounded-full shadow-lg border border-indigo-100 animate-bounce">
                                <span className="font-semibold text-indigo-600 text-sm">👇 Click chọn vị trí trên bản đồ</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
