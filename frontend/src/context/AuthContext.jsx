import { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    loginSuccess,
    logoutSuccess,
    selectUser,
    selectIsAdmin,
    selectIsLoggedIn,
    selectAccessToken,
} from '../redux/slices/authSlice';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const dispatch = useDispatch();

    // Lấy state từ Redux store
    const user      = useSelector(selectUser);
    const isAdmin   = useSelector(selectIsAdmin);
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const token     = useSelector(selectAccessToken);  // backward-compat

    // Gọi sau khi đăng nhập thành công
    const login = (accessToken, refreshToken) => {
        dispatch(loginSuccess({ accessToken, refreshToken }));
    };

    // Đăng xuất: revoke refreshToken ở backend rồi xóa state
    const logout = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            try {
                await api.post('/auth/logout', { refreshToken });
            } catch { /* ignore lỗi network khi logout */ }
        }
        dispatch(logoutSuccess());
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isAdmin, isLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
