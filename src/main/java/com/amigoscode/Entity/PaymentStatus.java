package com.amigoscode.Entity;

/**
 * Payment lifecycle for a VNPay (or future gateway) {@link Order}.
 * Stored as a STRING in the database.
 */
public enum PaymentStatus {
    /** Awaiting payment confirmation from the gateway. */
    PENDING,
    /** Gateway confirmed successful payment. */
    PAID,
    /** Payment failed or was cancelled by the user. */
    FAILED
}
