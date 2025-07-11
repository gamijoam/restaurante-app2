import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Alert,
  Box,
  Divider,
} from '@mui/material';
import { Warning, Refresh, ContactSupport } from '@mui/icons-material';
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

  const handleContactAdmin = () => {
    // Aquí podrías abrir un modal de contacto o redirigir a una página de contacto
    window.open('mailto:admin@restaurante.com?subject=Renovación de Licencia', '_blank');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        color: 'error.main',
        pb: 1
      }}>
        <Warning color="error" />
        Licencia Expirada
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Tu licencia ha expirado
          </Typography>
          <Typography variant="body2">
            Para continuar usando la aplicación, necesitas renovar tu licencia.
          </Typography>
        </Alert>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Opciones para renovar:
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ 
              p: 2, 
              border: '1px solid', 
              borderColor: 'primary.main', 
              borderRadius: 1,
              backgroundColor: 'primary.50'
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                <Refresh sx={{ mr: 1, verticalAlign: 'middle' }} />
                Renovar automáticamente
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Si tienes un código de licencia válido, puedes renovar directamente desde la aplicación.
              </Typography>
            </Box>
            
            <Box sx={{ 
              p: 2, 
              border: '1px solid', 
              borderColor: 'info.main', 
              borderRadius: 1,
              backgroundColor: 'info.50'
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                <ContactSupport sx={{ mr: 1, verticalAlign: 'middle' }} />
                Contactar administrador
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Si necesitas una nueva licencia, contacta al administrador del sistema.
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Nota: La aplicación se cerrará automáticamente si no renuevas la licencia en los próximos minutos.
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit">
          Cerrar
        </Button>
        <Button 
          onClick={handleContactAdmin} 
          variant="outlined" 
          color="info"
          startIcon={<ContactSupport />}
        >
          Contactar Admin
        </Button>
        <Button 
          onClick={handleRenewLicense} 
          variant="contained" 
          color="primary"
          startIcon={<Refresh />}
        >
          Renovar Licencia
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LicenseExpiredModal; 