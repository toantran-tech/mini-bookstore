-- Payment callbacks use this reference as their idempotency key.
-- Keeping the constraint in V2 applies it to both baselined and new databases.
ALTER TABLE orders
    MODIFY COLUMN vnpay_txn_ref VARCHAR(100) NULL,
    ADD CONSTRAINT uq_orders_vnpay_txn_ref UNIQUE (vnpay_txn_ref);