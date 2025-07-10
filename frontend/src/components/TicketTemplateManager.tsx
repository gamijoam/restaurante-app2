import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { 
  getAllTemplates, 
  deleteTemplate, 
  generatePreview, 
  getAreas, 
  createArea 
} from '../services/ticketTemplateService';
import type { TicketTemplateDTO as TicketTemplate, Area } from '../services/ticketTemplateService';

interface TicketTemplateManagerProps {
  onEditTemplate: (template: TicketTemplate) => void;
}

const TicketTemplateManager: React.FC<TicketTemplateManagerProps> = ({ onEditTemplate }) => {
  const [templates, setTemplates] = useState<TicketTemplate[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<TicketTemplate | null>(null);
  const [previewLoading, setPreviewLoading] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [showNewAreaDialog, setShowNewAreaDialog] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaDescription, setNewAreaDescription] = useState('');
  const [creatingArea, setCreatingArea] = useState(false);

  useEffect(() => {
    loadTemplates();
    loadAreas();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const templatesData = await getAllTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading templates:', error);
      setSnackbar({ open: true, message: 'Error al cargar las plantillas', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadAreas = async () => {
    try {
      const areasData = await getAreas();
      setAreas(areasData);
    } catch (error) {
      console.error('Error loading areas:', error);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete?.id) return;

    try {
      await deleteTemplate(templateToDelete.id);
      setTemplates(templates.filter(t => t.id !== templateToDelete.id));
      setSnackbar({ open: true, message: 'Plantilla eliminada exitosamente', severity: 'success' });
    } catch (error) {
      console.error('Error deleting template:', error);
      setSnackbar({ open: true, message: 'Error al eliminar la plantilla', severity: 'error' });
    } finally {
      setShowDeleteDialog(false);
      setTemplateToDelete(null);
    }
  };

  const handleEditTemplate = (template: TicketTemplate) => {
    onEditTemplate(template);
    // Cuando se edita una plantilla, recargar la lista tras guardar
    setTimeout(() => loadTemplates(), 1000);
  };

  const handlePreviewTemplate = async (template: TicketTemplate) => {
    if (!template.id) {
      setSnackbar({ open: true, message: 'No se puede generar previsualización para plantillas sin guardar', severity: 'error' });
      return;
    }

    setPreviewLoading(template.id);
    try {
      const pdfBlob = await generatePreview(template.id);
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-preview-${template.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSnackbar({ open: true, message: 'Previsualización PDF generada exitosamente', severity: 'success' });
    } catch (error) {
      console.error('Error generating preview:', error);
      setSnackbar({ open: true, message: 'Error al generar la previsualización PDF', severity: 'error' });
    } finally {
      setPreviewLoading(null);
    }
  };

  const handleCreateArea = async () => {
    if (!newAreaName.trim()) return;
    setCreatingArea(true);
    try {
      await createArea({ areaId: '', name: newAreaName, description: newAreaDescription });
      setSnackbar({ open: true, message: 'Área creada exitosamente', severity: 'success' });
      setShowNewAreaDialog(false);
      setNewAreaName('');
      setNewAreaDescription('');
      await loadAreas();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error al crear el área', severity: 'error' });
    } finally {
      setCreatingArea(false);
    }
  };

  const getAreaName = (areaId: string) => {
    return areas.find(a => a.areaId === areaId)?.name || areaId;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Plantillas de Tickets</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onEditTemplate({} as TicketTemplate)}
          >
            Nueva Plantilla
          </Button>
            <Button
              variant="outlined"
              onClick={() => setShowNewAreaDialog(true)}
            >
              Nueva Área
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography>Cargando plantillas...</Typography>
          </Box>
        ) : templates.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No hay plantillas guardadas. Crea una nueva plantilla para comenzar.
            </Typography>
          </Box>
        ) : (
          <List>
            {templates.map((template) => (
              <ListItem
                key={template.id}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    bgcolor: '#f5f5f5'
                  }
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6">{template.name}</Typography>
                      <Chip 
                        label={getAreaName(template.area)} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                      {template.isDefault && (
                        <Chip 
                          label="Por defecto" 
                          size="small" 
                          color="secondary"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Área: {getAreaName(template.area)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Bloques: {template.blocks?.length || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Última modificación: {formatDate(template.updatedAt)}
                      </Typography>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    color="primary"
                    onClick={() => handleEditTemplate(template)}
                    title="Editar plantilla"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="info"
                    onClick={() => handleEditTemplate(template)}
                    title="Ver plantilla"
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => handlePreviewTemplate(template)}
                    disabled={previewLoading === template.id}
                    title="Generar previsualización PDF"
                  >
                    {previewLoading === template.id ? (
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        border: '2px solid #ccc', 
                        borderTop: '2px solid #1976d2', 
                        borderRadius: '50%', 
                        animation: 'spin 1s linear infinite' 
                      }} />
                    ) : (
                      <PdfIcon />
                    )}
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => {
                      setTemplateToDelete(template);
                      setShowDeleteDialog(true);
                    }}
                    title="Eliminar plantilla"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar la plantilla "{templateToDelete?.name}"?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={handleDeleteTemplate} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para crear nueva área */}
      <Dialog open={showNewAreaDialog} onClose={() => setShowNewAreaDialog(false)}>
        <DialogTitle>Nueva Área</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <input
              type="text"
              placeholder="Nombre del área"
              value={newAreaName}
              onChange={e => setNewAreaName(e.target.value)}
              style={{ padding: 8, fontSize: 16 }}
            />
            <input
              type="text"
              placeholder="Descripción (opcional)"
              value={newAreaDescription}
              onChange={e => setNewAreaDescription(e.target.value)}
              style={{ padding: 8, fontSize: 16 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewAreaDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateArea} variant="contained" disabled={creatingArea || !newAreaName.trim()}>
            {creatingArea ? 'Creando...' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TicketTemplateManager; 