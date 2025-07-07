import React, { useState, useEffect } from 'react';
import { productAreaService, areaService } from '../services/areaService';
import type { ProductArea, PreparationArea } from '../services/areaService';
import { getProductos } from '../services/productoService';
import { useNotification } from '../hooks/useNotification';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import ModernModal from '../components/ModernModal';
import ModernForm from '../components/ModernForm';
import ModernTable from '../components/ModernTable';
import LoadingSpinner from '../components/LoadingSpinner';

interface Product {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  descripcion?: string;
}

const ProductAreaAssignmentPage: React.FC = () => {
  const [productAreas, setProductAreas] = useState<ProductArea[]>([]);
  const [areas, setAreas] = useState<PreparationArea[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<ProductArea | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [areasResponse, productsResponse, assignmentsResponse] = await Promise.all([
        areaService.getActive(),
        getProductos(),
        productAreaService.getAll()
      ]);
      
      setAreas(areasResponse.data);
      setProducts(productsResponse);
      setProductAreas(assignmentsResponse.data);
    } catch (error) {
      showError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAssignment(null);
    setShowModal(true);
  };

  const handleEdit = (assignment: ProductArea) => {
    console.log('Editando asignación:', assignment);
    setEditingAssignment(assignment);
    setShowModal(true);
  };

  const handleDelete = async (assignment: ProductArea) => {
    const id = assignment.id;
    console.log('Eliminando asignación con ID:', id);
    if (window.confirm('¿Estás seguro de que quieres eliminar esta asignación?')) {
      try {
        console.log('Enviando request DELETE para ID:', id);
        const response = await productAreaService.delete(id!);
        console.log('Respuesta del servidor:', response);
        showSuccess('Asignación eliminada correctamente');
        loadData();
      } catch (error: any) {
        console.error('Error al eliminar asignación:', error);
        showError(`Error al eliminar la asignación: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      console.log('Enviando datos del formulario:', formData);
      
      // Preparar solo los campos necesarios para el DTO
      const requestData = {
        productId: formData.productId,
        areaId: formData.areaId,
        preparationTime: formData.preparationTime
      };
      
      if (editingAssignment) {
        console.log('Actualizando asignación existente:', editingAssignment.id);
        await productAreaService.update(editingAssignment.id!, requestData);
        showSuccess('Asignación actualizada correctamente');
      } else {
        console.log('Creando nueva asignación');
        await productAreaService.create(requestData);
        showSuccess('Asignación creada correctamente');
      }
      setShowModal(false);
      loadData();
    } catch (error: any) {
      console.error('Error al guardar asignación:', error);
      
      // Manejar errores específicos
      if (error.response?.status === 409) {
        showError('Ya existe una asignación para este producto en esta área. Por favor, edite la asignación existente.');
      } else if (error.response?.status === 500) {
        const errorMessage = error.response?.data?.message || error.message;
        if (errorMessage.includes('Duplicate entry') || errorMessage.includes('uk_product_area')) {
          showError('Ya existe una asignación para este producto en esta área. Por favor, edite la asignación existente.');
        } else {
          showError(`Error al guardar la asignación: ${errorMessage}`);
        }
      } else {
        showError(`Error al guardar la asignación: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const formFields = [
    { 
      name: 'productId', 
      label: 'Producto', 
      type: 'select' as const, 
      options: products.map(p => ({ value: p.id, label: p.nombre })),
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
      name: 'preparationTime', 
      label: 'Tiempo de Preparación (minutos)', 
      type: 'number' as const, 
      required: true 
    }
  ];

  const getProductName = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product?.nombre || `Producto ${productId}`;
  };

  const getAreaName = (areaId: string) => {
    const area = areas.find(a => a.areaId === areaId);
    return area?.name || areaId;
  };

  const filteredAssignments = selectedArea === 'all' 
    ? productAreas 
    : productAreas.filter(pa => pa.areaId === selectedArea);

  const tableColumns = [
    { id: 'productId', label: 'Producto', render: (value: number) => getProductName(value) },
    { id: 'areaId', label: 'Área', render: (value: string) => getAreaName(value) },
    { id: 'preparationTime', label: 'Tiempo (min)' },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Asignación Producto-Área</h1>
        <ModernButton onClick={handleCreate} variant="primary">
          Nueva Asignación
        </ModernButton>
      </div>

      <div className="mb-4">
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

      <ModernCard>
        <ModernTable
          data={filteredAssignments}
          columns={tableColumns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          actions={true}
          emptyMessage="No hay asignaciones de productos a áreas"
        />
      </ModernCard>

      <ModernModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingAssignment ? 'Editar Asignación' : 'Nueva Asignación'}
      >
        <ModernForm
          fields={formFields}
          initialValues={editingAssignment || {}}
          onSubmit={handleSubmit}
          submitText={editingAssignment ? 'Actualizar' : 'Crear'}
        />
      </ModernModal>
    </div>
  );
};

export default ProductAreaAssignmentPage; 