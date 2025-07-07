import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  IconButton,
  Typography,
  Box,
  Divider,
  Fade,
  Slide,
} from '@mui/material';
import type { SlideProps } from '@mui/material';
import {
  Close,
  Warning,
  Info,
  Error,
  CheckCircle,
  Help,
} from '@mui/icons-material';
import ModernButton from './ModernButton';

interface ModernModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  fullScreen?: boolean;
  variant?: 'default' | 'alert' | 'confirm' | 'form' | 'info';
  type?: 'info' | 'success' | 'warning' | 'error';
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  loading?: boolean;
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
  sx?: any;
}

const SlideTransition = (props: SlideProps) => {
  return <Slide {...props} direction="up" />;
};

const ModernModal: React.FC<ModernModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  fullScreen = false,
  variant = 'default',
  type = 'info',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false,
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  sx,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'error':
        return <Error color="error" />;
      case 'info':
      default:
        return <Info color="info" />;
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return 'success.main';
      case 'warning':
        return 'warning.main';
      case 'error':
        return 'error.main';
      case 'info':
      default:
        return 'primary.main';
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      handleClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      handleClose();
    }
  };

  const renderTitle = () => {
    if (!title) return null;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {variant === 'alert' && getIcon()}
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
    );
  };

  const renderContent = () => {
    if (variant === 'alert' && message) {
      return (
        <DialogContentText sx={{ mt: 1 }}>
          {message}
        </DialogContentText>
      );
    }

    return children;
  };

  const renderActions = () => {
    if (actions) {
      return actions;
    }

    if (variant === 'alert' || variant === 'confirm') {
      return (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          {variant === 'confirm' && (
            <ModernButton
              variant="outlined"
              onClick={handleCancel}
              disabled={loading}
            >
              {cancelText}
            </ModernButton>
          )}
          <ModernButton
            variant={variant === 'confirm' ? 'primary' : type === 'error' ? 'error' : 'primary'}
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmText}
          </ModernButton>
        </Box>
      );
    }

    return null;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={fullScreen}
      TransitionComponent={SlideTransition}
      disableEscapeKeyDown={disableEscapeKeyDown}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.16)',
          ...sx,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          color: variant === 'alert' ? getTitleColor() : 'text.primary',
        }}
      >
        {renderTitle()}
        <IconButton
          onClick={handleClose}
          disabled={loading}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      {subtitle && (
        <Box sx={{ px: 3, pb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      )}

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        {renderContent()}
      </DialogContent>

      {renderActions() && (
        <>
          <Divider />
          <DialogActions sx={{ p: 2 }}>
            {renderActions()}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default ModernModal; 