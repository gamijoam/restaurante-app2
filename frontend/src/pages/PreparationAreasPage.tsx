import React, { useState, useEffect } from 'react';
import { areaService } from '../services/areaService';
import type { PreparationArea } from '../services/areaService';
import { useNotification } from '../hooks/useNotification';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import ModernModal from '../components/ModernModal';
import ModernForm from '../components/ModernForm';
import ModernTable from '../components/ModernTable';
import LoadingSpinner from '../components/LoadingSpinner';

const PreparationAreasPage: React.FC = () => {
  const [areas, setAreas] = useState<PreparationArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArea, setEditingArea] = useState<PreparationArea | null>(null);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      setLoading(true);
      const response = await areaService.getAll();
      setAreas(response.data);
    } catch (error) {
      showError('Error al cargar las áreas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingArea(null);
    setShowModal(true);
  };

  const handleEdit = (area: PreparationArea) => {
    console.log('Editando área:', area);
    setEditingArea(area);
    setShowModal(true);
  };

  const handleDelete = async (area: PreparationArea) => {
    const id = area.id;
    console.log('Eliminando área con ID:', id);
    if (window.confirm('¿Estás seguro de que quieres eliminar esta área?')) {
      try {
        console.log('Enviando request DELETE para ID:', id);
        const response = await areaService.delete(id!);
        console.log('Respuesta del servidor:', response);
        showSuccess('Área eliminada correctamente');
        loadAreas();
      } catch (error: any) {
        console.error('Error al eliminar área:', error);
        console.error('Detalles del error:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: error.config
        });
        showError(`Error al eliminar el área: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      console.log('Enviando datos del formulario:', formData);
      if (editingArea) {
        console.log('Actualizando área existente:', editingArea.id);
        await areaService.update(editingArea.id!, formData);
        showSuccess('Área actualizada correctamente');
      } else {
        console.log('Creando nueva área');
        await areaService.create(formData);
        showSuccess('Área creada correctamente');
      }
      setShowModal(false);
      loadAreas();
    } catch (error) {
      console.error('Error al guardar área:', error);
      showError('Error al guardar el área');
    }
  };

  const formFields = [
    { name: 'areaId', label: 'ID del Área', type: 'text' as const, required: true },
    { name: 'name', label: 'Nombre', type: 'text' as const, required: true },
    { name: 'type', label: 'Tipo', type: 'select' as const, options: [
      { value: 'KITCHEN', label: 'Cocina' },
      { value: 'BAR', label: 'Barra' },
      { value: 'CUSTOM', label: 'Personalizado' }
    ], required: true },
    { name: 'description', label: 'Descripción', type: 'textarea' as const },
    { name: 'active', label: 'Activa', type: 'checkbox' as const },
    { name: 'orderIndex', label: 'Orden', type: 'number' as const, required: true }
  ];

  const tableColumns = [
    { id: 'areaId', label: 'ID' },
    { id: 'name', label: 'Nombre' },
    { id: 'type', label: 'Tipo' },
    { id: 'description', label: 'Descripción' },
    { id: 'active', label: 'Activa', render: (value: boolean) => value ? 'Sí' : 'No' },
    { id: 'orderIndex', label: 'Orden' }
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Áreas de Preparación</h1>
        <ModernButton onClick={handleCreate} variant="primary">
          Nueva Área
        </ModernButton>
      </div>

      <ModernCard>
        <ModernTable
          data={areas}
          columns={tableColumns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          actions={true}
          emptyMessage="No hay áreas de preparación"
        />
      </ModernCard>

      <ModernModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingArea ? 'Editar Área' : 'Nueva Área'}
      >
        <ModernForm
          fields={formFields}
          initialValues={editingArea || {}}
          onSubmit={handleSubmit}
          submitText={editingArea ? 'Actualizar' : 'Crear'}
        />
      </ModernModal>
    </div>
  );
};

export default PreparationAreasPage; 