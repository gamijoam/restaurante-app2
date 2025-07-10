import React from 'react';
import { 
  Snackbar, 
  Alert, 
  AlertTitle, 
  Typography,
  Slide,
} from '@mui/material';
import type { SlideProps } from '@mui/material';
import { 
  CheckCircle, 
  Error, 
  Warning, 
  Info, 
} from '@mui/icons-material';

interface NotificationToastProps {
  open: boolean;
  message: string;
  title?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
  action?: React.ReactNode;
}

const SlideTransition = (props: SlideProps) => {
  return <Slide {...props} direction="up" />;
};

const NotificationToast: React.FC<NotificationToastProps> = ({
  open,
  message,
  title,
  type,
  duration = 6000,
  onClose,
  action
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle fontSize="small" />;
      case 'error':
        return <Error fontSize="small" />;
      case 'warning':
        return <Warning fontSize="small" />;
      case 'info':
        return <Info fontSize="small" />;
      default:
        return <Info fontSize="small" />;
    }
  };

  const getSeverity = () => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      TransitionComponent={SlideTransition}
      sx={{
        '& .MuiSnackbarContent-root': {
          minWidth: 300,
          maxWidth: 400,
        },
      }}
    >
      <Alert
        severity={getSeverity()}
        icon={getIcon()}
        onClose={onClose}
        action={action}
        sx={{
          width: '100%',
          borderRadius: 2,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
          '& .MuiAlert-icon': {
            fontSize: 20,
          },
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        {title && (
          <AlertTitle sx={{ fontWeight: 600, mb: 0.5 }}>
            {title}
          </AlertTitle>
        )}
        <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
          {message}
        </Typography>
      </Alert>
    </Snackbar>
  );
};

export default NotificationToast; 