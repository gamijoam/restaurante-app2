import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { 
  Box, 
  Button, 
  Paper, 
  Typography, 
  Stack, 
  IconButton, 
  TextField, 
  MenuItem, 
  Select,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Save as SaveIcon, 
  Close as CloseIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { 
  getAreas, 
  getTemplateByArea, 
  saveTemplate, 
  createArea, 
  generatePreviewFromTemplate 
} from '../services/ticketTemplateService';
import type { TicketTemplateDTO as TicketTemplate, TicketBlockDTO as TicketBlock, Area } from '../services/ticketTemplateService';

const TICKET_WIDTH = 32; // caracteres por línea

const blockPalette = [
  { type: 'text', value: 'Texto', align: 'left', bold: false } as TicketBlock,
  { type: 'line', id: '' } as TicketBlock,
  { type: 'table', columns: ['Producto', 'Cant', 'Precio', 'Total'], id: '' } as TicketBlock,
  { type: 'total', label: 'Total', field: 'total', id: '' } as TicketBlock,
  { type: 'qr', value: 'https://turestaurante.com', id: '' } as TicketBlock,
  { type: 'logo', id: '' } as TicketBlock,
  { type: 'datetime', format: 'DD/MM/YYYY HH:mm', id: '' } as TicketBlock,
];

function renderBlock(block: TicketBlock, isEditing: boolean, editValue: any, setEditValue: any) {
  if (isEditing) {
    switch (block.type) {
      case 'text':
        return (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField size="small" value={editValue.value} onChange={e => setEditValue((v: any) => ({ ...v, value: e.target.value }))} sx={{ flex: 1 }} />
            <Select size="small" value={editValue.align} onChange={e => setEditValue((v: any) => ({ ...v, align: e.target.value }))}>
              <MenuItem value="left">Izquierda</MenuItem>
              <MenuItem value="center">Centro</MenuItem>
              <MenuItem value="right">Derecha</MenuItem>
            </Select>
            <Button variant={editValue.bold ? 'contained' : 'outlined'} size="small" onClick={() => setEditValue((v: any) => ({ ...v, bold: !v.bold }))}>Negrita</Button>
          </Box>
        );
      case 'table':
        return (
          <TextField size="small" value={editValue.columns.join(',')} onChange={e => setEditValue((v: any) => ({ ...v, columns: e.target.value.split(',') }))} fullWidth label="Columnas (separadas por coma)" />
        );
      case 'total':
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField size="small" value={editValue.label} onChange={e => setEditValue((v: any) => ({ ...v, label: e.target.value }))} label="Etiqueta" />
            <TextField size="small" value={editValue.field} onChange={e => setEditValue((v: any) => ({ ...v, field: e.target.value }))} label="Campo" />
          </Box>
        );
      case 'qr':
        return (
          <TextField size="small" value={editValue.value} onChange={e => setEditValue((v: any) => ({ ...v, value: e.target.value }))} fullWidth label="Valor QR" />
        );
      case 'datetime':
        return (
          <TextField size="small" value={editValue.format} onChange={e => setEditValue((v: any) => ({ ...v, format: e.target.value }))} fullWidth label="Formato" />
        );
      default:
        return null;
    }
  }
  // Renderizado normal
  switch (block.type) {
    case 'text':
      return (
        <div style={{ textAlign: block.align, fontWeight: block.bold ? 'bold' : 'normal', fontFamily: 'monospace' }}>
          {block.value}
        </div>
      );
    case 'line':
      return <div style={{ fontFamily: 'monospace' }}>{'-'.repeat(TICKET_WIDTH)}</div>;
    case 'table':
      return (
        <div style={{ fontFamily: 'monospace' }}>
          {block.columns?.join(' | ') || 'Producto | Cant | Precio | Total'}
          <div>{'Producto1 | 2 | $10 | $20'}</div>
          <div>{'Producto2 | 1 | $15 | $15'}</div>
        </div>
      );
    case 'total':
      return (
        <div style={{ fontFamily: 'monospace', textAlign: 'right' }}>
          {block.label}: $99.99
        </div>
      );
    case 'qr':
      return <div style={{ textAlign: 'center' }}>[QR: {block.value}]</div>;
    case 'logo':
      return <div style={{ textAlign: 'center' }}>[LOGO]</div>;
    case 'datetime':
      return <div style={{ fontFamily: 'monospace', textAlign: 'left' }}>{'07/07/2025 20:00'}</div>;
    default:
      return null;
  }
}

interface TicketEditorPageProps {
  initialTemplate?: TicketTemplate | null;
  onTemplateSaved?: () => void;
}

const TicketEditorPage: React.FC<TicketEditorPageProps> = ({ 
  initialTemplate, 
  onTemplateSaved 
}) => {
  const [blocks, setBlocks] = useState<TicketBlock[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<any>({});
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [currentTemplate, setCurrentTemplate] = useState<TicketTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showNewAreaDialog, setShowNewAreaDialog] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaDescription, setNewAreaDescription] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Cargar áreas al montar el componente
  useEffect(() => {
    loadAreas();
  }, []);

  // Cargar plantilla inicial si se proporciona
  useEffect(() => {
    if (initialTemplate && initialTemplate.area) {
      setSelectedArea(initialTemplate.area);
      setCurrentTemplate(initialTemplate);
      setBlocks(initialTemplate.blocks || []);
    }
  }, [initialTemplate]);

  // Cargar plantilla cuando cambie el área seleccionada
  useEffect(() => {
    if (selectedArea && !initialTemplate) {
      loadTemplateForArea(selectedArea);
    }
  }, [selectedArea, initialTemplate]);

  const loadAreas = async () => {
    try {
      const areasData = await getAreas();
      setAreas(areasData);
      if (areasData.length > 0 && !selectedArea) {
        setSelectedArea(areasData[0].areaId);
      }
    } catch (error) {
      console.error('Error loading areas:', error);
    }
  };

  const loadTemplateForArea = async (areaId: string) => {
    setLoading(true);
    try {
      const template = await getTemplateByArea(areaId);
      if (template) {
        setCurrentTemplate(template);
        setBlocks(template.blocks);
      } else {
        // Crear plantilla por defecto
        const defaultTemplate = {
          area: areaId,
          name: `Plantilla ${areas.find(a => a.areaId === areaId)?.name || ''}`,
          blocks: [
            { type: 'text', value: 'Restaurante', align: 'center', bold: true, id: '1' },
            { type: 'line', id: '2' },
            { type: 'datetime', format: 'DD/MM/YYYY HH:mm', id: '3' },
            { type: 'table', columns: ['Producto', 'Cant', 'Precio', 'Total'], id: '4' },
            { type: 'total', label: 'Total', field: 'total', id: '5' },
            { type: 'text', value: '¡Gracias!', align: 'center', id: '6' }
          ] as TicketBlock[]
        };
        setCurrentTemplate(defaultTemplate);
        setBlocks(defaultTemplate.blocks);
      }
    } catch (error) {
      console.error('Error loading template:', error);
      setSnackbar({ open: true, message: 'Error al cargar la plantilla', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!selectedArea || blocks.length === 0) {
      setSnackbar({ open: true, message: 'Selecciona un área y agrega al menos un bloque', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      const templateToSave: TicketTemplate = {
        ...currentTemplate,
        area: selectedArea,
        name: currentTemplate?.name || `Plantilla ${areas.find(a => a.areaId === selectedArea)?.name}`,
        blocks: blocks,
        isDefault: currentTemplate?.isDefault || false
      };

      const savedTemplate = await saveTemplate(templateToSave);
      setCurrentTemplate(savedTemplate);
      setSnackbar({ open: true, message: 'Plantilla guardada exitosamente', severity: 'success' });
      
      if (onTemplateSaved) {
        onTemplateSaved();
      }
    } catch (error) {
      console.error('Error saving template:', error);
      setSnackbar({ open: true, message: 'Error al guardar la plantilla', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewTemplate = async () => {
    if (blocks.length === 0) {
      setSnackbar({ open: true, message: 'Agrega al menos un bloque para generar la previsualización', severity: 'error' });
      return;
    }

    setPreviewLoading(true);
    try {
      const templateToPreview: TicketTemplate = {
        ...currentTemplate,
        area: selectedArea,
        name: currentTemplate?.name || `Plantilla ${areas.find(a => a.areaId === selectedArea)?.name}`,
        blocks: blocks,
        isDefault: currentTemplate?.isDefault || false
      };

      const pdfBlob = await generatePreviewFromTemplate(templateToPreview);
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-preview-${templateToPreview.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSnackbar({ open: true, message: 'Previsualización PDF generada exitosamente', severity: 'success' });
    } catch (error) {
      console.error('Error generating preview:', error);
      setSnackbar({ open: true, message: 'Error al generar la previsualización PDF', severity: 'error' });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCreateNewArea = async () => {
    if (!newAreaName.trim()) return;

    try {
      const newArea = await createArea({
        areaId: newAreaName.toLowerCase().replace(/\s+/g, '-'),
        name: newAreaName,
        description: newAreaDescription
      });
      
      setAreas([...areas, newArea]);
      setSelectedArea(newArea.areaId);
      setShowNewAreaDialog(false);
      setNewAreaName('');
      setNewAreaDescription('');
      setSnackbar({ open: true, message: 'Área creada exitosamente', severity: 'success' });
    } catch (error) {
      console.error('Error creating area:', error);
      setSnackbar({ open: true, message: 'Error al crear el área', severity: 'error' });
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over.id);
      setBlocks(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  // Agregar bloque desde la paleta
  const handleAddBlock = (block: TicketBlock) => {
    setBlocks([...blocks, { ...block, id: Date.now().toString() }]);
  };

  // Editar bloque
  const handleEditBlock = (block: TicketBlock) => {
    setEditingId(block.id || '');
    setEditValue({ ...block });
  };

  const handleSaveEdit = () => {
    setBlocks(blocks.map(b => b.id === editingId ? { ...b, ...editValue } : b));
    setEditingId(null);
    setEditValue({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue({});
  };

  // Eliminar bloque
  const handleDeleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Header con selector de área */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">Editor de Plantillas de Tickets</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<PdfIcon />}
              onClick={handlePreviewTemplate}
              disabled={previewLoading || blocks.length === 0}
            >
              {previewLoading ? 'Generando...' : 'Previsualizar PDF'}
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveTemplate}
              disabled={loading || !selectedArea}
            >
              Guardar Plantilla
            </Button>
          </Box>
        </Box>

        {/* Tabs para áreas principales */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={selectedArea} 
            onChange={(_, newValue) => setSelectedArea(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {areas.map((area) => (
              <Tab key={area.areaId} label={area.name} value={area.areaId} />
            ))}
          </Tabs>
        </Box>

        {/* Dropdown para todas las áreas + botón para crear nueva */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Seleccionar Área</InputLabel>
            <Select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              label="Seleccionar Área"
            >
              {areas.map((area) => (
                <MenuItem key={area.areaId} value={area.areaId}>
                  {area.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setShowNewAreaDialog(true)}
          >
            Nueva Área
          </Button>

          {selectedArea && (
            <Typography variant="body2" color="text.secondary">
              Editando plantilla para: <strong>{areas.find(a => a.areaId === selectedArea)?.name}</strong>
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Contenido principal */}
      <Box sx={{ display: 'flex', gap: 4 }}>
        {/* Paleta de bloques */}
        <Paper sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Bloques</Typography>
          <Stack spacing={2}>
            {blockPalette.map((block, idx) => (
              <Button key={idx} variant="outlined" onClick={() => handleAddBlock(block)}>
                {block.type.charAt(0).toUpperCase() + block.type.slice(1)}
              </Button>
            ))}
          </Stack>
        </Paper>

        {/* Área de diseño drag & drop */}
        <Paper sx={{ p: 2, flex: 1, minHeight: 500 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Diseño del Ticket - {areas.find(a => a.areaId === selectedArea)?.name}
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <Typography>Cargando plantilla...</Typography>
            </Box>
          ) : (
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={blocks.map(b => b.id || '')} strategy={verticalListSortingStrategy}>
                <Stack spacing={1}>
                  {blocks.map(block => (
                    <Box key={block.id} sx={{ border: '1px dashed #ccc', borderRadius: 1, p: 1, bgcolor: '#fafafa', display: 'flex', alignItems: 'center', gap: 1 }}>
                      {renderBlock(block, editingId === block.id, editValue, setEditValue)}
                      {editingId === block.id ? (
                        <>
                          <IconButton color="success" onClick={handleSaveEdit}><SaveIcon /></IconButton>
                          <IconButton color="error" onClick={handleCancelEdit}><CloseIcon /></IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton color="primary" onClick={() => handleEditBlock(block)}><EditIcon /></IconButton>
                          <IconButton color="error" onClick={() => handleDeleteBlock(block.id || '')}><DeleteIcon /></IconButton>
                        </>
                      )}
                    </Box>
                  ))}
                </Stack>
              </SortableContext>
            </DndContext>
          )}
        </Paper>

        {/* Previsualización fiel */}
        <Paper sx={{ p: 2, minWidth: 320, bgcolor: '#222', color: '#fff' }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#fff' }}>Previsualización</Typography>
          <Box sx={{ fontFamily: 'monospace', fontSize: 16, bgcolor: '#111', p: 2, borderRadius: 2, minHeight: 500, width: 320 }}>
            {blocks.map(block => (
              <div key={block.id}>{renderBlock(block, false, {}, () => {})}</div>
            ))}
          </Box>
        </Paper>
      </Box>

      {/* Dialog para crear nueva área */}
      <Dialog open={showNewAreaDialog} onClose={() => setShowNewAreaDialog(false)}>
        <DialogTitle>Crear Nueva Área</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre del Área"
              value={newAreaName}
              onChange={(e) => setNewAreaName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Descripción (opcional)"
              value={newAreaDescription}
              onChange={(e) => setNewAreaDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewAreaDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateNewArea} variant="contained" disabled={!newAreaName.trim()}>
            Crear Área
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TicketEditorPage; 