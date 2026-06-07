package com.amigoscode.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
public class OtpStore {

    private final Map<String, String> store = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    private static final long OTP_TTL_MINUTES = 5;

    public void save(String email, String otp) {
        store.put(email, otp);
        scheduler.schedule(() -> store.remove(email), OTP_TTL_MINUTES, TimeUnit.MINUTES);
    }

    public boolean verify(String email, String otp) {
        String stored = store.get(email);
        if (stored != null && stored.equals(otp)) {
            store.remove(email);
            return true;
        }
        return false;
    }

    public boolean hasPending(String email) {
        return store.containsKey(email);
    }
}
