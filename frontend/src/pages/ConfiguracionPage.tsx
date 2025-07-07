import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, TextField, Button, Alert, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getImpuesto, setImpuesto } from '../services/configService';

const ConfiguracionPage = () => {
  const { roles } = useAuth();
  const isGerente = roles.includes('ROLE_GERENTE');
  const [impuesto, setImpuestoState] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isGerente) {
      getImpuesto()
        .then((valor) => setImpuestoState(valor.toString()))
        .catch(() => setError('No se pudo obtener el impuesto actual.'));
    }
  }, [isGerente]);

  const handleGuardar = async () => {
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      await setImpuesto(parseFloat(impuesto));
      setSuccess('Impuesto actualizado correctamente.');
    } catch (e) {
      setError('Error al actualizar el impuesto.');
    } finally {
      setLoading(false);
    }
  };

  if (!isGerente) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="error">No tienes permiso para acceder a esta sección.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
          Configuración del Sistema
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 3 }}>
          Modifica el impuesto que se aplica en la facturación. Ingresa el valor como decimal (por ejemplo, 0.16 para 16%).
        </Typography>
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <TextField
            label="Impuesto"
            type="number"
            value={impuesto}
            onChange={e => setImpuestoState(e.target.value)}
            inputProps={{ step: '0.01', min: '0' }}
            sx={{ flex: 1 }}
          />
          <Button variant="contained" color="primary" onClick={handleGuardar} disabled={loading}>
            Guardar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ConfiguracionPage; 