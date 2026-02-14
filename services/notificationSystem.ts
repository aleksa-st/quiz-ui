/**
 * Utility for handling browser notifications (Chrome/Edge/Safari etc.)
 */
export const notificationSystem = {
    /**
     * Request permission for browser notifications
     */
    requestPermission: async (): Promise<boolean> => {
        if (!('Notification' in window)) {
            console.warn('This browser does not support desktop notification');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    },

    /**
     * Display a browser notification
     */
    show: (title: string, options: NotificationOptions = {}): Notification | null => {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            return null;
        }

        const defaultOptions: NotificationOptions = {
            icon: '/favicon.ico', // Fallback icon
            badge: '/favicon.ico',
            ...options
        };

        const notification = new Notification(title, defaultOptions);

        notification.onclick = function (event) {
            event.preventDefault(); // prevent the browser from focusing the Notification's tab
            window.focus();
            notification.close();
        };

        return notification;
    }
};
