package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.model.Producto;
import com.catasoft.restaurante.backend.model.RecetaIngrediente;
import com.catasoft.restaurante.backend.repository.RecetaIngredienteRepository;
import com.catasoft.restaurante.backend.repository.IngredienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductoStockService {
    private final RecetaIngredienteRepository recetaIngredienteRepository;
    private final IngredienteRepository ingredienteRepository;

    public ProductoStockService(RecetaIngredienteRepository recetaIngredienteRepository, IngredienteRepository ingredienteRepository) {
        this.recetaIngredienteRepository = recetaIngredienteRepository;
        this.ingredienteRepository = ingredienteRepository;
    }

    /**
     * Calcula cuántas unidades de un producto se pueden preparar con el stock actual de ingredientes.
     */
    public int calcularStockDisponible(Producto producto) {
        List<RecetaIngrediente> receta = recetaIngredienteRepository.findByProducto(producto);
        int maxUnidades = Integer.MAX_VALUE;
        for (RecetaIngrediente ri : receta) {
            double stockIngrediente = ri.getIngrediente().getStock() != null ? ri.getIngrediente().getStock() : 0;
            double requeridoPorUnidad = ri.getCantidad();
            if (requeridoPorUnidad <= 0) continue;
            int unidadesPorIngrediente = (int) (stockIngrediente / requeridoPorUnidad);
            if (unidadesPorIngrediente < maxUnidades) {
                maxUnidades = unidadesPorIngrediente;
            }
        }
        return maxUnidades == Integer.MAX_VALUE ? 0 : maxUnidades;
    }
}
