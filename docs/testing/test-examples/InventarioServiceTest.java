package com.catasoft.restaurante.backend.test.unit.service;

import com.catasoft.restaurante.backend.model.Producto;
import com.catasoft.restaurante.backend.model.RecetaIngrediente;
import com.catasoft.restaurante.backend.repository.ProductoRepository;
import com.catasoft.restaurante.backend.repository.RecetaIngredienteRepository;
import com.catasoft.restaurante.backend.service.InventarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para InventarioService
 * 
 * Este servicio es crítico para el funcionamiento del restaurante ya que
 * maneja la gestión de stock y recetas. Debe tener 100% de cobertura.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("InventarioService - Pruebas Unitarias")
class InventarioServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private RecetaIngredienteRepository recetaRepository;

    @InjectMocks
    private InventarioService inventarioService;

    private Producto producto;
    private List<RecetaIngrediente> receta;

    @BeforeEach
    void setUp() {
        // Configurar producto de prueba
        producto = new Producto();
        producto.setId(1L);
        producto.setNombre("Hamburguesa");
        producto.setPrecio(new BigDecimal("12.50"));
        producto.setStock(10.0);

        // Configurar receta de prueba
        receta = Arrays.asList(
            new RecetaIngrediente(1L, 2.0), // 2 unidades de ingrediente 1
            new RecetaIngrediente(2L, 1.0)  // 1 unidad de ingrediente 2
        );
    }

    @Nested
    @DisplayName("Validar Stock de Ingredientes")
    class ValidarStockIngredientes {

        @Test
        @DisplayName("Cuando validar stock con stock suficiente, entonces no lanza excepción")
        void cuandoValidarStock_conStockSuficiente_entoncesNoLanzaExcepcion() {
            // Given
            when(recetaRepository.findByProductoId(1L)).thenReturn(receta);
            when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));

            // When & Then
            assertDoesNotThrow(() -> 
                inventarioService.validarStockIngredientes(producto, 3));
        }

        @Test
        @DisplayName("Cuando validar stock con stock insuficiente, entonces lanza excepción")
        void cuandoValidarStock_conStockInsuficiente_entoncesLanzaExcepcion() {
            // Given
            when(recetaRepository.findByProductoId(1L)).thenReturn(receta);
            when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));

            // When & Then
            IllegalStateException exception = assertThrows(IllegalStateException.class, () -> 
                inventarioService.validarStockIngredientes(producto, 10));
            
            assertTrue(exception.getMessage().contains("insuficiente"));
        }

        @Test
        @DisplayName("Cuando validar stock con producto sin receta, entonces lanza excepción")
        void cuandoValidarStock_conProductoSinReceta_entoncesLanzaExcepcion() {
            // Given
            when(recetaRepository.findByProductoId(1L)).thenReturn(Arrays.asList());

            // When & Then
            IllegalStateException exception = assertThrows(IllegalStateException.class, () -> 
                inventarioService.validarStockIngredientes(producto, 1));
            
            assertTrue(exception.getMessage().contains("receta"));
        }

        @Test
        @DisplayName("Cuando validar stock con cantidad cero, entonces no lanza excepción")
        void cuandoValidarStock_conCantidadCero_entoncesNoLanzaExcepcion() {
            // Given
            when(recetaRepository.findByProductoId(1L)).thenReturn(receta);
            when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));

            // When & Then
            assertDoesNotThrow(() -> 
                inventarioService.validarStockIngredientes(producto, 0));
        }

        @Test
        @DisplayName("Cuando validar stock con cantidad negativa, entonces lanza excepción")
        void cuandoValidarStock_conCantidadNegativa_entoncesLanzaExcepcion() {
            // Given
            when(recetaRepository.findByProductoId(1L)).thenReturn(receta);

            // When & Then
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> 
                inventarioService.validarStockIngredientes(producto, -1));
            
            assertTrue(exception.getMessage().contains("negativa"));
        }
    }

    @Nested
    @DisplayName("Descontar Stock de Ingredientes")
    class DescontarStockIngredientes {

        @Test
        @DisplayName("Cuando descontar stock, entonces stock se reduce correctamente")
        void cuandoDescontarStock_entoncesStockSeReduceCorrectamente() {
            // Given
            when(recetaRepository.findByProductoId(1L)).thenReturn(receta);
            when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
            when(productoRepository.save(any(Producto.class))).thenReturn(producto);

            ArgumentCaptor<Producto> productCaptor = ArgumentCaptor.forClass(Producto.class);

            // When
            inventarioService.descontarStockIngredientes(producto, 3);

            // Then
            verify(productoRepository).save(productCaptor.capture());
            Producto savedProduct = productCaptor.getValue();
            assertEquals(4.0, savedProduct.getStock()); // 10.0 - (2.0 * 3) = 4.0
        }

        @Test
        @DisplayName("Cuando descontar stock con cantidad cero, entonces no cambia stock")
        void cuandoDescontarStock_conCantidadCero_entoncesNoCambiaStock() {
            // Given
            when(recetaRepository.findByProductoId(1L)).thenReturn(receta);
            when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
            when(productoRepository.save(any(Producto.class))).thenReturn(producto);

            ArgumentCaptor<Producto> productCaptor = ArgumentCaptor.forClass(Producto.class);

            // When
            inventarioService.descontarStockIngredientes(producto, 0);

            // Then
            verify(productoRepository).save(productCaptor.capture());
            Producto savedProduct = productCaptor.getValue();
            assertEquals(10.0, savedProduct.getStock()); // No cambia
        }

        @Test
        @DisplayName("Cuando descontar stock con cantidad negativa, entonces lanza excepción")
        void cuandoDescontarStock_conCantidadNegativa_entoncesLanzaExcepcion() {
            // Given
            when(recetaRepository.findByProductoId(1L)).thenReturn(receta);

            // When & Then
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> 
                inventarioService.descontarStockIngredientes(producto, -1));
            
            assertTrue(exception.getMessage().contains("negativa"));
            verify(productoRepository, never()).save(any(Producto.class));
        }

        @Test
        @DisplayName("Cuando descontar stock con producto sin receta, entonces lanza excepción")
        void cuandoDescontarStock_conProductoSinReceta_entoncesLanzaExcepcion() {
            // Given
            when(recetaRepository.findByProductoId(1L)).thenReturn(Arrays.asList());

            // When & Then
            IllegalStateException exception = assertThrows(IllegalStateException.class, () -> 
                inventarioService.descontarStockIngredientes(producto, 1));
            
            assertTrue(exception.getMessage().contains("receta"));
            verify(productoRepository, never()).save(any(Producto.class));
        }
    }

    @Nested
    @DisplayName("Restaurar Stock de Ingredientes")
    class RestaurarStockIngredientes {

        @Test
        @DisplayName("Cuando restaurar stock, entonces stock se incrementa correctamente")
        void cuandoRestaurarStock_entoncesStockSeIncrementaCorrectamente() {
            // Given
            when(recetaRepository.findByProductoId(1L)).thenReturn(receta);
            when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
            when(productoRepository.save(any(Producto.class))).thenReturn(producto);

            ArgumentCaptor<Producto> productCaptor = ArgumentCaptor.forClass(Producto.class);

            // When
            inventarioService.restaurarStockIngredientes(producto, 2);

            // Then
            verify(productoRepository).save(productCaptor.capture());
            Producto savedProduct = productCaptor.getValue();
            assertEquals(14.0, savedProduct.getStock()); // 10.0 + (2.0 * 2) = 14.0
        }

        @Test
        @DisplayName("Cuando restaurar stock con cantidad cero, entonces no cambia stock")
        void cuandoRestaurarStock_conCantidadCero_entoncesNoCambiaStock() {
            // Given
            when(recetaRepository.findByProductoId(1L)).thenReturn(receta);
            when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
            when(productoRepository.save(any(Producto.class))).thenReturn(producto);

            ArgumentCaptor<Producto> productCaptor = ArgumentCaptor.forClass(Producto.class);

            // When
            inventarioService.restaurarStockIngredientes(producto, 0);

            // Then
            verify(productoRepository).save(productCaptor.capture());
            Producto savedProduct = productCaptor.getValue();
            assertEquals(10.0, savedProduct.getStock()); // No cambia
        }

        @Test
        @DisplayName("Cuando restaurar stock con cantidad negativa, entonces lanza excepción")
        void cuandoRestaurarStock_conCantidadNegativa_entoncesLanzaExcepcion() {
            // Given
            when(recetaRepository.findByProductoId(1L)).thenReturn(receta);

            // When & Then
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> 
                inventarioService.restaurarStockIngredientes(producto, -1));
            
            assertTrue(exception.getMessage().contains("negativa"));
            verify(productoRepository, never()).save(any(Producto.class));
        }
    }

    @Nested
    @DisplayName("Validar Stock Suficiente")
    class ValidarStockSuficiente {

        @Test
        @DisplayName("Cuando validar stock suficiente con stock disponible, entonces retorna true")
        void cuandoValidarStockSuficiente_conStockDisponible_entoncesRetornaTrue() {
            // Given
            when(recetaRepository.findByProductoId(1L)).thenReturn(receta);
            when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));

            // When
            boolean resultado = inventarioService.validarStockSuficiente(producto, 3);

            // Then
            assertTrue(resultado);
        }

        @Test
        @DisplayName("Cuando validar stock suficiente con stock insuficiente, entonces retorna false")
        void cuandoValidarStockSuficiente_conStockInsuficiente_entoncesRetornaFalse() {
            // Given
            when(recetaRepository.findByProductoId(1L)).thenReturn(receta);
            when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));

            // When
            boolean resultado = inventarioService.validarStockSuficiente(producto, 10);

            // Then
            assertFalse(resultado);
        }

        @Test
        @DisplayName("Cuando validar stock suficiente con cantidad cero, entonces retorna true")
        void cuandoValidarStockSuficiente_conCantidadCero_entoncesRetornaTrue() {
            // Given
            when(recetaRepository.findByProductoId(1L)).thenReturn(receta);
            when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));

            // When
            boolean resultado = inventarioService.validarStockSuficiente(producto, 0);

            // Then
            assertTrue(resultado);
        }
    }

    @Nested
    @DisplayName("Casos Edge")
    class CasosEdge {

        @Test
        @DisplayName("Cuando producto es null, entonces lanza excepción")
        void cuandoProductoEsNull_entoncesLanzaExcepcion() {
            // When & Then
            assertThrows(IllegalArgumentException.class, () -> 
                inventarioService.validarStockIngredientes(null, 1));
        }

        @Test
        @DisplayName("Cuando receta tiene ingredientes con cantidad cero, entonces se maneja correctamente")
        void cuandoRecetaTieneIngredientesConCantidadCero_entoncesSeManejaCorrectamente() {
            // Given
            List<RecetaIngrediente> recetaConCeros = Arrays.asList(
                new RecetaIngrediente(1L, 0.0),
                new RecetaIngrediente(2L, 1.0)
            );
            
            when(recetaRepository.findByProductoId(1L)).thenReturn(recetaConCeros);
            when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));

            // When & Then
            assertDoesNotThrow(() -> 
                inventarioService.validarStockIngredientes(producto, 1));
        }

        @Test
        @DisplayName("Cuando stock es null, entonces lanza excepción")
        void cuandoStockEsNull_entoncesLanzaExcepcion() {
            // Given
            producto.setStock(null);
            when(recetaRepository.findByProductoId(1L)).thenReturn(receta);

            // When & Then
            assertThrows(IllegalStateException.class, () -> 
                inventarioService.validarStockIngredientes(producto, 1));
        }
    }
} 