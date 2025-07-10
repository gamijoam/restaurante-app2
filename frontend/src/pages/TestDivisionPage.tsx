import React, { useState, useEffect } from 'react';
import { crearComandaConDivisionPorAreasAPI } from '../services/comandaService';
import { getProductos } from '../services/productoService';
import { useNotification } from '../hooks/useNotification';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import ModernModal from '../components/ModernModal';
import ModernForm from '../components/ModernForm';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Producto } from '../types';

interface ComandaItem {
  productoId: number;
  cantidad: number;
}

interface FormData {
  mesaId: string;
  items: string;
}

const TestDivisionPage: React.FC = () => {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { showSuccess, showError } = useNotification();

   
  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getProductos();
      setProducts(productsData);
    } catch {
      showError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateTestOrder = async (formData: FormData) => {
    console.log('handleCreateTestOrder called with:', formData);
    try {
      setLoading(true);

      let items: ComandaItem[];
      try {
        items = JSON.parse(formData.items).map((item: ComandaItem) => ({
          productoId: parseInt(item.productoId.toString()),
          cantidad: parseInt(item.cantidad.toString())
        }));
      } catch (e) {
        console.error('JSON parse error:', e);
        showError('Error en formato JSON', 'Por favor, verifica el formato del JSON');
        return;
      }

      const comandaData = {
        mesaId: parseInt(formData.mesaId),
        items
      };

      const response = await crearComandaConDivisionPorAreasAPI(comandaData);
      showSuccess('Comanda creada con división por áreas', `Comanda ID: ${response.id}`);
      setShowModal(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message: string };
      showError(`Error al crear comanda: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    {
      name: 'mesaId',
      label: 'ID de Mesa',
      type: 'number' as const,
      required: true
    },
    {
      name: 'items',
      label: 'Items (JSON)',
      type: 'textarea' as const,
      required: true,
      placeholder: '[{"productoId": 1, "cantidad": 2}, {"productoId": 4, "cantidad": 1}]'
    }
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Prueba de División por Áreas</h1>
        <ModernButton onClick={() => setShowModal(true)} variant="primary">
          Crear Comanda de Prueba
        </ModernButton>
      </div>

      <ModernCard>
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Productos Disponibles:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <div key={product.id} className="p-3 border rounded-lg">
                <div className="font-medium">{product.nombre}</div>
                <div className="text-sm text-gray-600">ID: {product.id}</div>
                <div className="text-sm text-gray-600">Categoría: {product.categoria}</div>
                <div className="text-sm text-gray-600">Precio: ${product.precio}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Instrucciones:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Selecciona un ID de mesa válido</li>
            <li>Ingresa los items en formato JSON</li>
            <li>La comanda se creará automáticamente dividida por áreas</li>
            <li>Verifica en la base de datos las tablas comanda_areas y comanda_area_items</li>
          </ol>
        </div>
      </ModernCard>

      <ModernModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Crear Comanda de Prueba"
      >
        <ModernForm
          fields={formFields}
          initialValues={{}}
          onSubmit={handleCreateTestOrder}
          submitText="Crear Comanda"
        />
      </ModernModal>
    </div>
  );
};

export default TestDivisionPage;
