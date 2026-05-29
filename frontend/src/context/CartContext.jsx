import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    // Đọc giỏ hàng từ localStorage khi khởi động
    const [items, setItems] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });

    // Mỗi khi items thay đổi → lưu vào localStorage
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    // Thêm sách vào giỏ (nếu đã có thì tăng số lượng)
    const addItem = (book) => {
        setItems(prev => {
            const existing = prev.find(i => i.bookId === book.id);
            if (existing) {
                return prev.map(i =>
                    i.bookId === book.id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }
            return [...prev, { bookId: book.id, title: book.title, price: book.price, quantity: 1 }];
        });
    };

    // Xóa 1 sách khỏi giỏ
    const removeItem = (bookId) => {
        setItems(prev => prev.filter(i => i.bookId !== bookId));
    };

    // Thay đổi số lượng
    const updateQuantity = (bookId, quantity) => {
        if (quantity <= 0) {
            removeItem(bookId);
            return;
        }
        setItems(prev =>
            prev.map(i => i.bookId === bookId ? { ...i, quantity } : i)
        );
    };

    // Xóa toàn bộ giỏ hàng (sau khi đặt hàng thành công)
    const clearCart = () => setItems([]);

    // Tổng số lượng (hiển thị badge trên icon giỏ hàng)
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

    // Tổng tiền
    const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
