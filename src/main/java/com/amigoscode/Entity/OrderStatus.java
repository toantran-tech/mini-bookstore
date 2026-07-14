package com.amigoscode.Entity;

/**
 * Lifecycle statuses for an {@link Order}.
 * Stored as a STRING in the database to remain human-readable and stable
 * across refactors.
 */
public enum OrderStatus {
    /** Order created but not yet paid (COD or pending VNPay). */
    Pending,
    /** Payment confirmed; order is being prepared. */
    Processing,
    /** Order has been shipped to the customer. */
    Shipped,
    /** Order successfully delivered to the customer. */
    Delivered,
    /** Order was cancelled (failed payment or manual cancellation). */
    Cancelled
}
