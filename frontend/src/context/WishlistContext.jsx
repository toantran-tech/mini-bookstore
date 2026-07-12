import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const { token } = useAuth();

    const fetchWishlist = useCallback(async () => {
        if (!token) {
            setWishlist([]);
            return;
        }
        try {
            const res = await api.get('/wishlist');
            setWishlist(res.data);
        } catch (error) {
            // 401/403 = chưa đăng nhập hoặc token hết hạn → không cần log
            if (error.response?.status !== 401 && error.response?.status !== 403) {
                console.error('Error fetching wishlist:', error);
            }
            setWishlist([]);
        }
    }, [token]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const toggleWishlist = async (book) => {
        if (!token) {
            alert('Vui lòng đăng nhập để lưu sách yêu thích!');
            return;
        }
        try {
            const isFavorite = wishlist.some(b => b.id === book.id);
            if (isFavorite) {
                setWishlist(prev => prev.filter(b => b.id !== book.id));
            } else {
                setWishlist(prev => [...prev, book]);
            }
            
            await api.post(`/wishlist/${book.id}`);
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            fetchWishlist();
        }
    };

    const isFavorite = (bookId) => {
        return wishlist.some(b => b.id === bookId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isFavorite, fetchWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
