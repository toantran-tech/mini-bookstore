package com.amigoscode.controller;

import com.amigoscode.service.NotificationService;
import com.amigoscode.service.OrderService;
import com.amigoscode.service.VNPayService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class OrderControllerPaymentTest {

    private OrderService orderService;
    private VNPayService vnPayService;
    private OrderController controller;

    @BeforeEach
    void setUp() {
        orderService = mock(OrderService.class);
        vnPayService = mock(VNPayService.class);
        controller = new OrderController(
                orderService,
                vnPayService,
                mock(NotificationService.class),
                "http://localhost:5173/payment-return"
        );
    }

    @Test
    void invalidSignatureNeverChangesOrderState() {
        Map<String, String> params = callbackParams();
        when(vnPayService.validateCallback(params)).thenReturn(false);

        ResponseEntity<Void> response = controller.vnpayReturn(params);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SEE_OTHER);
        assertThat(response.getHeaders().getLocation().toString())
                .contains("success=false")
                .contains("code=INVALID_SIGNATURE");
        verifyNoInteractions(orderService);
    }

    @Test
    void validSuccessCallbackPassesSignedAmountToService() {
        Map<String, String> params = callbackParams();
        when(vnPayService.validateCallback(params)).thenReturn(true);

        ResponseEntity<Void> response = controller.vnpayReturn(params);

        verify(orderService).confirmPayment(42L, "42_123456", 15_000_000L);
        assertThat(response.getHeaders().getLocation().toString())
                .contains("success=true")
                .contains("orderId=42");
    }

    @Test
    void malformedReferenceNeverCallsSignatureOrOrderServices() {
        Map<String, String> params = callbackParams();
        params.put("vnp_TxnRef", "../../42");

        ResponseEntity<Void> response = controller.vnpayReturn(params);

        assertThat(response.getHeaders().getLocation().toString())
                .contains("code=INVALID_REFERENCE");
        verifyNoInteractions(vnPayService, orderService);
    }

    private Map<String, String> callbackParams() {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_TxnRef", "42_123456");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_Amount", "15000000");
        params.put("vnp_SecureHash", "signed-value");
        return params;
    }
}