import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const { token } = useAuth();

    const fetchWishlist = async () => {
        if (!token) {
            setWishlist([]);
            return;
        }
        try {
            const res = await api.get('/wishlist');
            setWishlist(res.data);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [token]);

    const toggleWishlist = async (book) => {
        if (!token) {
            alert('Vui lòng đăng nhập để lưu sách yêu thích!');
            return;
        }
        try {
            // Optimistic update
            const isFavorite = wishlist.some(b => b.id === book.id);
            if (isFavorite) {
                setWishlist(prev => prev.filter(b => b.id !== book.id));
            } else {
                setWishlist(prev => [...prev, book]);
            }
            
            // API call
            await api.post(`/wishlist/${book.id}`);
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            // Revert on error
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
