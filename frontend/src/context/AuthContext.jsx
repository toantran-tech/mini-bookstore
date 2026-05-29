import { createContext, useContext, useState, useEffect } from 'react';

// 1. Tạo Context
const AuthContext = createContext(null);

// 2. Provider — bọc bên ngoài toàn bộ app
export function AuthProvider({ children }) {
    // Khởi tạo: đọc token từ localStorage (để F5 vẫn còn login)
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(null); // { username, role }

    // Mỗi khi token thay đổi → parse ra thông tin user
    useEffect(() => {
        if (token) {
            try {
                // JWT có dạng: header.payload.signature
                // Lấy phần payload, decode base64
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({
                    username: payload.sub, // Spring Boot mặc định đặt username vào "sub"
                    role: payload.role ?? payload.roles ?? null,
                });
            } catch {
                // Token bị lỗi → logout
                logout();
            }
        } else {
            setUser(null);
        }
    }, [token]);

    // Hàm login: lưu token vào state + localStorage
    const login = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    // Hàm logout: xóa hết
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    // isAdmin: kiểm tra nhanh xem có phải admin không
    const isAdmin = user?.role === 'ROLE_ADMIN';

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

// 3. Custom hook tiện dụng — dùng ở mọi component
export function useAuth() {
    return useContext(AuthContext);
}
