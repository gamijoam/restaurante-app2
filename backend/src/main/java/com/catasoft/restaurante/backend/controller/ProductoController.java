package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.exception.ResourceNotFoundException;
import com.catasoft.restaurante.backend.model.Producto;
import com.catasoft.restaurante.backend.repository.ProductoRepository;
import com.catasoft.restaurante.backend.service.ProductoStockService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/v1/productos")
public class ProductoController {

    private final ProductoRepository productoRepository;
    private final ProductoStockService productoStockService;

    // Inyección de dependencias vía constructor (mejor práctica)
    public ProductoController(ProductoRepository productoRepository, ProductoStockService productoStockService) {
        this.productoRepository = productoRepository;
        this.productoStockService = productoStockService;
    }
    /**
     * Endpoint para obtener el stock real disponible de un producto según los ingredientes.
     * HTTP GET http://localhost:8080/api/v1/productos/{id}/stock-disponible
     */
    @GetMapping("/{id}/stock-disponible")
    public ResponseEntity<Integer> getStockDisponible(@PathVariable Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
        int stockDisponible = productoStockService.calcularStockDisponible(producto);
        return ResponseEntity.ok(stockDisponible);
    }

    /**
     * Endpoint para obtener todos los productos.
     * HTTP GET http://localhost:8080/api/v1/productos
     *
     * @return Lista de todos los productos en la base de datos.
     */
    @GetMapping
    public List<Producto> getAllProductos() {
        return productoRepository.findAll();
    }

    /**
     * Endpoint para crear un nuevo producto.
     * HTTP POST http://localhost:8080/api/v1/productos
     *
     * @param producto El producto a crear, viene en el cuerpo de la petición en formato JSON.
     * @return El producto guardado, con el ID asignado por la base de datos.
     */
    @PostMapping
    public Producto createProducto(@RequestBody Producto producto) {
        // Establecer stock inicial en 0 ya que se calcula dinámicamente
        producto.setStock(0.0);
        return productoRepository.save(producto);
    }
    /**
     * Endpoint para obtener un producto por su ID.
     * HTTP GET http://localhost:8080/api/v1/productos/1
     * @param id El ID del producto a buscar, viene de la URL.
     * @return El producto encontrado. Lanza ResourceNotFoundException si no existe.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Producto> getProductoById(@PathVariable Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
        return ResponseEntity.ok(producto);
    }

    /**
     * Endpoint para actualizar un producto existente.
     * HTTP PUT http://localhost:8080/api/v1/productos/1
     * @param id El ID del producto a actualizar.
     * @param productoDetails Los nuevos datos del producto.
     * @return El producto actualizado.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Producto> updateProducto(@PathVariable Long id, @RequestBody Producto productoDetails) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));

        producto.setNombre(productoDetails.getNombre());
        producto.setDescripcion(productoDetails.getDescripcion());
        producto.setPrecio(productoDetails.getPrecio());
        
        // No actualizar el stock ya que se calcula dinámicamente
        // producto.setStock(productoDetails.getStock());

        final Producto updatedProducto = productoRepository.save(producto);
        return ResponseEntity.ok(updatedProducto);
    }

    /**
     * Endpoint para eliminar un producto.
     * HTTP DELETE http://localhost:8080/api/v1/productos/1
     * @param id El ID del producto a eliminar.
     * @return Una respuesta vacía con código 204 No Content.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProducto(@PathVariable Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));

        productoRepository.delete(producto);
        return ResponseEntity.noContent().build();
    }
}