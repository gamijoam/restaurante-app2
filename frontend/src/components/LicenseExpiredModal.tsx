import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Alert,
} from '@mui/material';
import { Warning } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface LicenseExpiredModalProps {
  open: boolean;
  onClose: () => void;
}

const LicenseExpiredModal: React.FC<LicenseExpiredModalProps> = ({ open, onClose }) => {
  const navigate = useNavigate();

  const handleRenewLicense = () => {
    navigate('/license');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning color="error" />
        Licencia Expirada
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="error" sx={{ mb: 2 }}>
          Tu licencia ha expirado
        </Alert>
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          La licencia de este equipo ha expirado. Para continuar usando la aplicación, 
          necesitas renovar tu licencia.
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Por favor, contacta al administrador para obtener una nueva licencia o 
          utiliza la página de activación de licencias.
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cerrar
        </Button>
        <Button 
          onClick={handleRenewLicense} 
          variant="contained" 
          color="primary"
        >
          Renovar Licencia
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LicenseExpiredModal; 