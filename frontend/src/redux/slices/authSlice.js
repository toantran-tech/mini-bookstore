import { createSlice } from '@reduxjs/toolkit';

// Hàm decode JWT lấy thông tin user
const parseUser = (accessToken) => {
    if (!accessToken) return null;
    try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        return {
            username: payload.sub,
            role: payload.role ?? null,
        };
    } catch {
        return null;
    }
};

const accessToken = localStorage.getItem('accessToken');

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        accessToken: accessToken || null,
        refreshToken: localStorage.getItem('refreshToken') || null,
        user: parseUser(accessToken),   // { username, role }
    },
    reducers: {
        // Gọi sau khi login thành công
        loginSuccess: (state, action) => {
            const { accessToken, refreshToken } = action.payload;
            state.accessToken = accessToken;
            state.refreshToken = refreshToken;
            state.user = parseUser(accessToken);
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
        },
        // Gọi khi refresh token thành công → chỉ cập nhật accessToken
        refreshSuccess: (state, action) => {
            state.accessToken = action.payload;
            state.user = parseUser(action.payload);
            localStorage.setItem('accessToken', action.payload);
        },
        // Gọi khi logout
        logoutSuccess: (state) => {
            state.accessToken = null;
            state.refreshToken = null;
            state.user = null;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        },
    },
});

export const { loginSuccess, refreshSuccess, logoutSuccess } = authSlice.actions;

// ─── Selectors ────────────────────────────────────────────
export const selectUser      = (state) => state.auth.user;
export const selectIsAdmin   = (state) => state.auth.user?.role === 'ROLE_ADMIN';
export const selectIsLoggedIn = (state) => !!state.auth.accessToken;
export const selectAccessToken = (state) => state.auth.accessToken;

export default authSlice.reducer;
