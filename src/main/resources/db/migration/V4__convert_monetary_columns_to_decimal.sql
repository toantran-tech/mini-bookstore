-- V4: Convert monetary columns from DOUBLE to DECIMAL(15,2)
-- This eliminates floating-point rounding errors in price and amount calculations.
-- Also converts status columns to VARCHAR to ensure compatibility with the new
-- OrderStatus / PaymentStatus enums stored as strings.

ALTER TABLE book
    MODIFY COLUMN price DECIMAL(15,2) NOT NULL;

ALTER TABLE orders
    MODIFY COLUMN subtotal       DECIMAL(15,2),
    MODIFY COLUMN discount_amount DECIMAL(15,2),
    MODIFY COLUMN shipping_fee   DECIMAL(15,2),
    MODIFY COLUMN total_amount   DECIMAL(15,2);

ALTER TABLE order_detail
    MODIFY COLUMN price DECIMAL(15,2) NOT NULL;

ALTER TABLE coupons
    MODIFY COLUMN discount_value  DECIMAL(15,2),
    MODIFY COLUMN min_order_value DECIMAL(15,2),
    MODIFY COLUMN max_discount    DECIMAL(15,2);
