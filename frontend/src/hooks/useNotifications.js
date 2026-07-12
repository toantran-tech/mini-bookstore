import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';

const WS_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api')
    .replace('http://', 'ws://')
    .replace('https://', 'wss://')
    .replace('/api', '');  // → ws://localhost:8080

const MAX_RECONNECT_ATTEMPTS = 3; // Chỉ thử reconnect tối đa 3 lần, tránh spam console

export function useNotifications(username) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount,   setUnreadCount]   = useState(0);
    const [connected,     setConnected]     = useState(false);
    const clientRef      = useRef(null);
    const attemptCountRef = useRef(0);

    useEffect(() => {
        if (!username) return;

        const client = new Client({
            brokerURL: `${WS_BASE}/ws/websocket`,

            onConnect: () => {
                setConnected(true);
                attemptCountRef.current = 0; // reset khi kết nối thành công
                client.subscribe(`/user/${username}/queue/notifications`, (frame) => {
                    try {
                        const notification = JSON.parse(frame.body);
                        setNotifications(prev => [notification, ...prev].slice(0, 50));
                        setUnreadCount(prev => prev + 1);
                    } catch { /* ignore */ }
                });
            },

            onDisconnect: () => setConnected(false),

            // Chặn spam: sau MAX attempts thì dừng reconnect
            onStompError: () => {
                attemptCountRef.current += 1;
                if (attemptCountRef.current >= MAX_RECONNECT_ATTEMPTS) {
                    client.deactivate();
                }
            },

            onWebSocketError: () => {
                attemptCountRef.current += 1;
                if (attemptCountRef.current >= MAX_RECONNECT_ATTEMPTS) {
                    client.deactivate(); // Dừng hẳn, không retry nữa
                }
            },

            reconnectDelay: 10000, // Tăng lên 10s thay vì 5s
            // Tắt log nội bộ của stompjs cho gọn console
            debug: () => {},
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [username]);

    const markAllRead = useCallback(() => setUnreadCount(0), []);
    const clearAll    = useCallback(() => { setNotifications([]); setUnreadCount(0); }, []);

    return { notifications, unreadCount, connected, markAllRead, clearAll };
}
