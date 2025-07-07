import React from 'react';
import { 
  Button, 
  CircularProgress, 
  Box,
  Tooltip,
} from '@mui/material';
import type { ButtonProps } from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Save, 
  Cancel, 
  Search, 
  Refresh,
  Download,
  Upload,
  Print,
  Visibility,
} from '@mui/icons-material';

interface ModernButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: 'add' | 'edit' | 'delete' | 'save' | 'cancel' | 'search' | 'refresh' | 'download' | 'upload' | 'print' | 'view';
  tooltip?: string;
  fullWidth?: boolean;
}

const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  tooltip,
  fullWidth = false,
  disabled,
  onClick,
  sx,
  ...props
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'add':
        return <Add />;
      case 'edit':
        return <Edit />;
      case 'delete':
        return <Delete />;
      case 'save':
        return <Save />;
      case 'cancel':
        return <Cancel />;
      case 'search':
        return <Search />;
      case 'refresh':
        return <Refresh />;
      case 'download':
        return <Download />;
      case 'upload':
        return <Upload />;
      case 'print':
        return <Print />;
      case 'view':
        return <Visibility />;
      default:
        return null;
    }
  };

  const getVariantProps = () => {
    switch (variant) {
      case 'primary':
        return { variant: 'contained' as const, color: 'primary' as const };
      case 'secondary':
        return { variant: 'contained' as const, color: 'secondary' as const };
      case 'success':
        return { variant: 'contained' as const, sx: { ...sx, backgroundColor: 'success.main', '&:hover': { backgroundColor: 'success.dark' } } };
      case 'warning':
        return { variant: 'contained' as const, sx: { ...sx, backgroundColor: 'warning.main', '&:hover': { backgroundColor: 'warning.dark' } } };
      case 'error':
        return { variant: 'contained' as const, sx: { ...sx, backgroundColor: 'error.main', '&:hover': { backgroundColor: 'error.dark' } } };
      case 'info':
        return { variant: 'contained' as const, sx: { ...sx, backgroundColor: 'info.main', '&:hover': { backgroundColor: 'info.dark' } } };
      case 'outlined':
        return { variant: 'outlined' as const };
      case 'text':
        return { variant: 'text' as const };
      default:
        return { variant: 'contained' as const };
    }
  };

  const getSizeProps = () => {
    switch (size) {
      case 'small':
        return { size: 'small' as const, sx: { ...sx, minHeight: 32, fontSize: '0.75rem' } };
      case 'large':
        return { size: 'large' as const, sx: { ...sx, minHeight: 56, fontSize: '1rem' } };
      default:
        return { size: 'medium' as const, sx: { ...sx, minHeight: 44, fontSize: '0.875rem' } };
    }
  };

  const buttonContent = (
    <Button
      {...getVariantProps()}
      {...getSizeProps()}
      disabled={disabled || loading}
      onClick={onClick}
      fullWidth={fullWidth}
      startIcon={loading ? <CircularProgress size={16} /> : getIcon()}
      sx={{
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 600,
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow placement="top">
        <Box component="span">
          {buttonContent}
        </Box>
      </Tooltip>
    );
  }

  return buttonContent;
};

export default ModernButton; 