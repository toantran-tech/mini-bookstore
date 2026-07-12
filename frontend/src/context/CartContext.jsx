import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cart, setCart] = useState(null); // { cartId, items, totalPrice, totalItems }
    const [loading, setLoading] = useState(false);

    const isLoggedIn = () => !!localStorage.getItem('accessToken');

    const fetchCart = useCallback(async () => {
        if (!isLoggedIn()) { setCart(null); return; }
        try {
            setLoading(true);
            const res = await api.get('/cart');
            setCart(res.data);
        } catch {
            setCart(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addItem = async (bookId, quantity = 1) => {
        if (!isLoggedIn()) return;
        const res = await api.post(`/cart/add?bookId=${bookId}&quantity=${quantity}`);
        setCart(res.data);
    };

    const updateQuantity = async (cartItemId, quantity) => {
        if (quantity <= 0) {
            await removeItem(cartItemId);
            return;
        }
        const res = await api.put(`/cart/item/${cartItemId}?quantity=${quantity}`);
        setCart(res.data);
    };

    const removeItem = async (cartItemId) => {
        await api.delete(`/cart/item/${cartItemId}`);
        await fetchCart();
    };

    const clearCart = async () => {
        await api.delete('/cart/clear');
        await fetchCart();
    };

    const items = cart?.items || [];
    const totalItems = cart?.totalItems || 0;
    const totalPrice = cart?.totalPrice || 0;

    return (
        <CartContext.Provider value={{
            cart, items, totalItems, totalPrice, loading,
            addItem, updateQuantity, removeItem, clearCart, fetchCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
