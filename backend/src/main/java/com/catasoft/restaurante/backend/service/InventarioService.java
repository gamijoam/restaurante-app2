package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.model.Producto;
import com.catasoft.restaurante.backend.model.RecetaIngrediente;
import com.catasoft.restaurante.backend.model.Ingrediente;
import com.catasoft.restaurante.backend.repository.RecetaIngredienteRepository;
import com.catasoft.restaurante.backend.repository.IngredienteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InventarioService {
    public final RecetaIngredienteRepository recetaIngredienteRepository;
    public final IngredienteRepository ingredienteRepository;

    public InventarioService(RecetaIngredienteRepository recetaIngredienteRepository, IngredienteRepository ingredienteRepository) {
        this.recetaIngredienteRepository = recetaIngredienteRepository;
        this.ingredienteRepository = ingredienteRepository;
    }

    /**
     * Verifica si hay suficiente stock de ingredientes para preparar una cantidad de un producto.
     * Lanza IllegalStateException si falta stock de algún ingrediente.
     */
    public void validarStockIngredientes(Producto producto, int cantidad) {
        List<RecetaIngrediente> receta = recetaIngredienteRepository.findByProducto(producto);
        for (RecetaIngrediente ri : receta) {
            Ingrediente ing = ri.getIngrediente();
            double requerido = ri.getCantidad() * cantidad;
            if (ing.getStock() == null || ing.getStock() < requerido) {
                throw new IllegalStateException("Stock insuficiente para el ingrediente: " + ing.getNombre());
            }
        }
    }

    /**
     * Descuenta del stock los ingredientes usados para preparar una cantidad de un producto.
     * Lanza IllegalStateException si falta stock de algún ingrediente.
     */
    @Transactional
    public void descontarStockIngredientes(Producto producto, int cantidad) {
        List<RecetaIngrediente> receta = recetaIngredienteRepository.findByProducto(producto);
        for (RecetaIngrediente ri : receta) {
            Ingrediente ing = ri.getIngrediente();
            double requerido = ri.getCantidad() * cantidad;
            if (ing.getStock() == null || ing.getStock() < requerido) {
                throw new IllegalStateException("Stock insuficiente para el ingrediente: " + ing.getNombre());
            }
            ing.setStock(ing.getStock() - requerido);
            ingredienteRepository.save(ing);
        }
    }

    /**
     * Restaura el stock de ingredientes cuando se cancela una comanda.
     * Añade de vuelta al stock los ingredientes que se habían descontado.
     */
    @Transactional
    public void restaurarStockIngredientes(Producto producto, int cantidad) {
        List<RecetaIngrediente> receta = recetaIngredienteRepository.findByProducto(producto);
        for (RecetaIngrediente ri : receta) {
            Ingrediente ing = ri.getIngrediente();
            double devolver = ri.getCantidad() * cantidad;
            ing.setStock(ing.getStock() + devolver);
            ingredienteRepository.save(ing);
        }
    }
}
