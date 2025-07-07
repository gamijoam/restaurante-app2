import { useState, useCallback } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  message: string;
  title?: string;
  type: NotificationType;
  duration?: number;
  action?: React.ReactNode;
}

export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((
    message: string,
    type: NotificationType = 'info',
    title?: string,
    duration?: number,
    action?: React.ReactNode
  ) => {
    const id = Date.now().toString();
    const notification: Notification = {
      id,
      message,
      title,
      type,
      duration,
      action,
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove notification after duration
    if (duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration || 6000);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showSuccess = useCallback((message: string, title?: string, duration?: number) => {
    addNotification(message, 'success', title, duration);
  }, [addNotification]);

  const showError = useCallback((message: string, title?: string, duration?: number) => {
    addNotification(message, 'error', title, duration);
  }, [addNotification]);

  const showWarning = useCallback((message: string, title?: string, duration?: number) => {
    addNotification(message, 'warning', title, duration);
  }, [addNotification]);

  const showInfo = useCallback((message: string, title?: string, duration?: number) => {
    addNotification(message, 'info', title, duration);
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}; 