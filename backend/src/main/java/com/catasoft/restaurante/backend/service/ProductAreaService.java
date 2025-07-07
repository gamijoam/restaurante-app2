package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.model.ProductArea;
import com.catasoft.restaurante.backend.model.Producto;
import com.catasoft.restaurante.backend.repository.ProductAreaRepository;
import com.catasoft.restaurante.backend.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductAreaService {
    @Autowired
    private ProductAreaRepository productAreaRepository;
    
    @Autowired
    private ProductoRepository productoRepository;

    public List<ProductArea> findAll() {
        return productAreaRepository.findAll();
    }

    public Optional<ProductArea> findById(Long id) {
        return productAreaRepository.findById(id);
    }

    public List<ProductArea> findByProductoId(Long productoId) {
        return productAreaRepository.findByProductoId(productoId);
    }

    public List<ProductArea> findByAreaId(String areaId) {
        return productAreaRepository.findByAreaId(areaId);
    }

    public ProductArea save(ProductArea pa) {
        // Si el producto tiene solo ID, cargar la entidad completa
        if (pa.getProducto() != null && pa.getProducto().getId() != null && pa.getProducto().getNombre() == null) {
            Optional<Producto> productoOpt = productoRepository.findById(pa.getProducto().getId());
            if (productoOpt.isPresent()) {
                pa.setProducto(productoOpt.get());
            }
        }
        return productAreaRepository.save(pa);
    }

    public void delete(Long id) {
        productAreaRepository.deleteById(id);
    }
} 