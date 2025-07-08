import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
} from '@mui/material';
import {
  CheckCircle,
  Timer,
  PriorityHigh,
  Restaurant,
  LocalBar,
} from '@mui/icons-material';

interface AreaStatus {
  areaId: string;
  areaName: string;
  status: string;
  type: string;
}

interface OrderSummaryProps {
  comanda: any;
  areaStatuses?: AreaStatus[];
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ comanda, areaStatuses = [] }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READY':
        return 'success';
      case 'IN_PROGRESS':
        return 'info';
      case 'PENDING':
        return 'warning';
      case 'DELIVERED':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'READY':
        return <CheckCircle color="success" />;
      case 'IN_PROGRESS':
        return <PriorityHigh color="info" />;
      case 'PENDING':
        return <Timer color="warning" />;
      case 'DELIVERED':
        return <CheckCircle color="disabled" />;
      default:
        return <Timer />;
    }
  };

  const getAreaIcon = (type: string) => {
    switch (type) {
      case 'KITCHEN':
        return <Restaurant />;
      case 'BAR':
        return <LocalBar />;
      default:
        return <Restaurant />;
    }
  };

  const isAllAreasReady = () => {
    return areaStatuses.length > 0 && areaStatuses.every(area => area.status === 'READY');
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Comanda #{comanda.id} - Mesa {comanda.numeroMesa}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Chip
          label={comanda.estado}
          color={isAllAreasReady() ? 'success' : 'warning'}
          size="small"
        />
        {isAllAreasReady() && (
          <Chip
            label="Lista para cobrar"
            color="success"
            size="small"
            icon={<CheckCircle />}
          />
        )}
      </Box>

      {/* Estado por áreas */}
      {areaStatuses.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Estado por áreas de preparación:
          </Typography>
          <List dense>
            {areaStatuses.map((area, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getAreaIcon(area.type)}
                      <Typography variant="body2" fontWeight={500}>
                        {area.areaName}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {area.type === 'KITCHEN' ? 'Cocina' : 'Barra'}
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(area.status)}
                    <Chip
                      label={area.status === 'READY' ? 'Listo' : 
                             area.status === 'IN_PROGRESS' ? 'En preparación' :
                             area.status === 'PENDING' ? 'Pendiente' : 'Entregado'}
                      color={getStatusColor(area.status) as any}
                      size="small"
                    />
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </>
      )}

      {/* Items de la comanda */}
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2" gutterBottom>
        Items:
      </Typography>
      <List dense>
        {comanda.items?.map((item: any, index: number) => (
          <ListItem key={index} sx={{ px: 0 }}>
            <ListItemText
              primary={item.productoNombre}
              secondary={`$${item.precioUnitario} x ${item.cantidad}`}
            />
            <ListItemSecondaryAction>
              <Typography variant="body2" fontWeight={500}>
                ${(item.precioUnitario * item.cantidad).toFixed(2)}
              </Typography>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={500}>
          Total:
        </Typography>
        <Typography variant="h6" fontWeight={500}>
          ${comanda.total?.toFixed(2) || '0.00'}
        </Typography>
      </Box>
    </Paper>
  );
};

export default OrderSummary;