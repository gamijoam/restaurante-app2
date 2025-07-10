import React, { useState, useEffect } from 'react';
import { comandaAreaService, areaService } from '../services/areaService';
import type { ComandaArea, PreparationArea } from '../services/areaService';
import { useNotification } from '../hooks/useNotification';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import ModernModal from '../components/ModernModal';
import ModernForm from '../components/ModernForm';
import ModernTable from '../components/ModernTable';
import LoadingSpinner from '../components/LoadingSpinner';

const ComandaAreaManagementPage: React.FC = () => {
  const [comandaAreas, setComandaAreas] = useState<ComandaArea[]>([]);
  const [areas, setAreas] = useState<PreparationArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingComandaArea, setEditingComandaArea] = useState<ComandaArea | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [areasResponse, comandaAreasResponse] = await Promise.all([
        areaService.getActive(),
        comandaAreaService.getAll()
      ]);
      
      setAreas(areasResponse.data);
      setComandaAreas(comandaAreasResponse.data);
    } catch {
      showError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingComandaArea(null);
    setShowModal(true);
  };

  const handleEdit = (comandaArea: ComandaArea) => {
    console.log('Editando comanda área:', comandaArea);
    setEditingComandaArea(comandaArea);
    setShowModal(true);
  };

  const handleDelete = async (comandaArea: ComandaArea) => {
    const id = comandaArea.id;
    console.log('Eliminando comanda área con ID:', id);
    if (window.confirm('¿Estás seguro de que quieres eliminar esta comanda de área?')) {
      try {
        console.log('Enviando request DELETE para ID:', id);
        const response = await comandaAreaService.delete(id!);
        console.log('Respuesta del servidor:', response);
        showSuccess('Comanda de área eliminada correctamente');
        loadData();
      } catch (error: unknown) {
        const err = error as { message?: string; response?: { data?: { message?: string } } };
        console.error('Error al eliminar comanda área:', err);
        showError(`Error al eliminar la comanda de área: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  // const handleStatusChange = async (comandaArea: ComandaArea, newStatus: string) => {
  //   try {
  //     const updatedComandaArea = { ...comandaArea, status: newStatus };
  //     await comandaAreaService.update(comandaArea.id!, updatedComandaArea);
  //     showSuccess('Estado actualizado correctamente');
  //     loadData();
  //   } catch (error: unknown) {
  //     const err = error as { message?: string; response?: { data?: { message?: string } } };
  //     console.error('Error al actualizar estado:', err);
  //     showError(`Error al actualizar el estado: ${err.response?.data?.message || err.message}`);
  //   }
  // };

  const handleSubmit = async (formData: Record<string, unknown>) => {
    // Convertir formData a ComandaArea usando los campos requeridos
    const comandaArea: ComandaArea = {
      ...(editingComandaArea ?? {}),
      comandaId: Number(formData.comandaId),
      areaId: String(formData.areaId),
      status: String(formData.status),
      assignedTo: formData.assignedTo ? String(formData.assignedTo) : undefined,
      notes: formData.notes ? String(formData.notes) : undefined,
      estimatedTime: formData.estimatedTime ? Number(formData.estimatedTime) : undefined,
      startedAt: formData.startedAt ? String(formData.startedAt) : undefined,
      completedAt: formData.completedAt ? String(formData.completedAt) : undefined,
    };
    try {
      console.log('Enviando datos del formulario:', comandaArea);
      if (editingComandaArea) {
        console.log('Actualizando comanda área existente:', editingComandaArea.id);
        await comandaAreaService.update(editingComandaArea.id!, comandaArea);
        showSuccess('Comanda de área actualizada correctamente');
      } else {
        console.log('Creando nueva comanda área');
        await comandaAreaService.create(comandaArea);
        showSuccess('Comanda de área creada correctamente');
      }
      setShowModal(false);
      loadData();
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } };
      console.error('Error al guardar comanda área:', err);
      showError(`Error al guardar la comanda de área: ${err.response?.data?.message || err.message}`);
    }
  };

  const formFields = [
    { 
      name: 'comandaId', 
      label: 'ID de Comanda', 
      type: 'number' as const, 
      required: true 
    },
    { 
      name: 'areaId', 
      label: 'Área de Preparación', 
      type: 'select' as const, 
      options: areas.map(a => ({ value: a.areaId, label: a.name })),
      required: true 
    },
    { 
      name: 'status', 
      label: 'Estado', 
      type: 'select' as const, 
      options: [
        { value: 'PENDING', label: 'Pendiente' },
        { value: 'IN_PROGRESS', label: 'En Progreso' },
        { value: 'COMPLETED', label: 'Completado' },
        { value: 'CANCELLED', label: 'Cancelado' }
      ],
      required: true 
    },
    { 
      name: 'assignedTo', 
      label: 'Asignado a', 
      type: 'text' as const 
    },
    { 
      name: 'notes', 
      label: 'Notas', 
      type: 'textarea' as const 
    },
    { 
      name: 'estimatedTime', 
      label: 'Tiempo Estimado (minutos)', 
      type: 'number' as const 
    }
  ];

  const getAreaName = (areaId: string) => {
    const area = areas.find(a => a.areaId === areaId);
    return area?.name || areaId;
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'IN_PROGRESS': 'En Progreso',
      'COMPLETED': 'Completado',
      'CANCELLED': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  // const getStatusColor = (status: string) => {
  //   const colorMap: { [key: string]: string } = {
  //     'PENDING': 'warning',
  //     'IN_PROGRESS': 'info',
  //     'COMPLETED': 'success',
  //     'CANCELLED': 'error'
  //   };
  //   return colorMap[status] || 'default';
  // };

  const filteredComandaAreas = comandaAreas.filter(ca => {
    const areaMatch = selectedArea === 'all' || ca.areaId === selectedArea;
    const statusMatch = selectedStatus === 'all' || ca.status === selectedStatus;
    return areaMatch && statusMatch;
  });

  const tableColumns = [
    { id: 'comandaId', label: 'Comanda ID' },
    { id: 'areaId', label: 'Área', render: (value: string) => getAreaName(value) },
    { 
      id: 'status', 
      label: 'Estado', 
      render: (value: string) => getStatusLabel(value)
    },
    { id: 'assignedTo', label: 'Asignado a' },
    { id: 'estimatedTime', label: 'Tiempo Est. (min)' },
    { id: 'notes', label: 'Notas' },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Comandas por Área</h1>
        <ModernButton onClick={handleCreate} variant="primary">
          Nueva Comanda Área
        </ModernButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por área:
          </label>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Todas las áreas</option>
            {areas.map(area => (
              <option key={area.areaId} value={area.areaId}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por estado:
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="IN_PROGRESS">En Progreso</option>
            <option value="COMPLETED">Completado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>
      </div>

      <ModernCard>
        <ModernTable
          data={filteredComandaAreas}
          columns={tableColumns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          actions={true}
          emptyMessage="No hay comandas de área"
        />
      </ModernCard>

      <ModernModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingComandaArea ? 'Editar Comanda Área' : 'Nueva Comanda Área'}
      >
        <ModernForm
          fields={formFields}
          initialValues={editingComandaArea || {}}
          onSubmit={handleSubmit}
          submitText={editingComandaArea ? 'Actualizar' : 'Crear'}
        />
      </ModernModal>
    </div>
  );
};

export default ComandaAreaManagementPage; 