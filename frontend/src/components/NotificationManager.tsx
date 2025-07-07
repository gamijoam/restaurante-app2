import React from 'react';
import { Box } from '@mui/material';
import NotificationToast from './NotificationToast';
import { useNotification } from '../hooks/useNotification';

const NotificationManager: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
      {notifications.map((notification) => (
        <Box key={notification.id} sx={{ mb: 1 }}>
          <NotificationToast
            open={true}
            message={notification.message}
            title={notification.title}
            type={notification.type}
            duration={notification.duration}
            onClose={() => removeNotification(notification.id)}
            action={notification.action}
          />
        </Box>
      ))}
    </Box>
  );
};

export default NotificationManager; 