# 🧪 Pruebas Unitarias - Restaurante App

## 📋 Índice
1. [Servicios Críticos](#servicios-críticos)
2. [Patrones de Testing](#patrones-de-testing)
3. [Mocking y Stubbing](#mocking-y-stubbing)
4. [Datos de Prueba](#datos-de-prueba)
5. [Assertions](#assertions)
6. [Ejemplos Completos](#ejemplos-completos)

---

## 🔴 Servicios Críticos

### 1. InventarioService
**Responsabilidad**: Gestión de stock y recetas
**Cobertura Objetivo**: 100%

#### Métodos a Probar:
- ✅ `validarStockIngredientes()` - Validar stock disponible
- ✅ `descontarStockIngredientes()` - Descontar stock
- ✅ `restaurarStockIngredientes()` - Restaurar stock
- ✅ `validarStockSuficiente()` - Validar stock suficiente

#### Casos de Prueba:
```java
@Test
void cuandoValidarStock_conStockSuficiente_entoncesNoLanzaExcepcion()

@Test
void cuandoValidarStock_conStockInsuficiente_entoncesLanzaExcepcion()

@Test
void cuandoDescontarStock_entoncesStockSeReduceCorrectamente()

@Test
void cuandoRestaurarStock_entoncesStockSeIncrementaCorrectamente()
```

### 2. ComandaService
**Responsabilidad**: Lógica de negocio principal
**Cobertura Objetivo**: 100%

#### Métodos a Probar:
- ✅ `crearComanda()` - Crear nueva comanda
- ✅ `updateEstadoComanda()` - Cambiar estado
- ✅ `getTicketData()` - Obtener datos para ticket
- ✅ `getCocinaTicketData()` - Obtener datos para cocina

#### Casos de Prueba:
```java
@Test
void cuandoCrearComanda_conMesaLibre_entoncesComandaSeCrea()

@Test
void cuandoCrearComanda_conMesaOcupada_entoncesLanzaExcepcion()

@Test
void cuandoActualizarEstado_aPAGADA_entoncesMesaSeLibera()

@Test
void cuandoObtenerTicketData_entoncesRetornaDatosCompletos()
```

### 3. PrinterConfigurationService
**Responsabilidad**: Configuración de impresoras
**Cobertura Objetivo**: 95%

#### Métodos a Probar:
- ✅ `getConfigurationByRole()` - Obtener configuración por rol
- ✅ `saveConfiguration()` - Guardar configuración
- ✅ `deleteConfiguration()` - Eliminar configuración

---

## 🎯 Patrones de Testing

### 1. Given-When-Then Pattern
```java
@Test
void cuandoDescontarStock_entoncesStockSeReduce() {
    // Given - Preparar datos
    Producto producto = new Producto();
    producto.setId(1L);
    producto.setStock(10.0);
    
    List<RecetaIngrediente> receta = Arrays.asList(
        new RecetaIngrediente(1L, 2.0)
    );
    
    when(recetaRepository.findByProductoId(1L)).thenReturn(receta);
    when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
    
    // When - Ejecutar acción
    inventarioService.descontarStockIngredientes(producto, 3);
    
    // Then - Verificar resultado
    verify(productoRepository).save(argThat(p -> p.getStock() == 4.0));
}
```

### 2. AAA Pattern (Arrange-Act-Assert)
```java
@Test
void testCrearComanda() {
    // Arrange - Preparar
    ComandaRequestDTO request = new ComandaRequestDTO();
    request.setMesaId(1L);
    request.setItems(Arrays.asList(new ItemRequestDTO(1L, 2)));
    
    Mesa mesa = new Mesa();
    mesa.setId(1L);
    mesa.setEstado(EstadoMesa.LIBRE);
    
    when(mesaRepository.findById(1L)).thenReturn(Optional.of(mesa));
    
    // Act - Ejecutar
    ComandaResponseDTO result = comandaService.crearComanda(request);
    
    // Assert - Verificar
    assertNotNull(result);
    assertEquals(1L, result.getNumeroMesa());
    assertEquals(EstadoComanda.EN_PROCESO, result.getEstado());
}
```

### 3. Nested Tests
```java
@Nested
class CrearComanda {
    
    @Test
    void conMesaLibre_debeCrearComanda() { }
    
    @Test
    void conMesaOcupada_debeLanzarExcepcion() { }
    
    @Test
    void conProductoInexistente_debeLanzarExcepcion() { }
    
    @Nested
    class ConItemsValidos {
        @Test
        void debeCalcularTotalCorrectamente() { }
        
        @Test
        void debeDescontarStock() { }
    }
}
```

---

## 🎭 Mocking y Stubbing

### 1. Mocking de Repositorios
```java
@ExtendWith(MockitoExtension.class)
class InventarioServiceTest {
    
    @Mock
    private ProductoRepository productoRepository;
    
    @Mock
    private RecetaIngredienteRepository recetaRepository;
    
    @InjectMocks
    private InventarioService inventarioService;
    
    @Test
    void testConMocks() {
        // Given
        when(recetaRepository.findByProductoId(1L))
            .thenReturn(Arrays.asList(new RecetaIngrediente(1L, 2.0)));
        
        // When & Then
        assertDoesNotThrow(() -> 
            inventarioService.validarStockIngredientes(producto, 3));
    }
}
```

### 2. Verificación de Interacciones
```java
@Test
void debeLlamarRepositorioCorrectamente() {
    // Given
    Producto producto = new Producto();
    producto.setId(1L);
    
    // When
    inventarioService.descontarStockIngredientes(producto, 2);
    
    // Then
    verify(productoRepository, times(1)).save(any(Producto.class));
    verify(productoRepository, never()).delete(any());
}
```

### 3. Argument Captor
```java
@Test
void debeGuardarProductoConStockCorrecto() {
    // Given
    Producto producto = new Producto();
    producto.setStock(10.0);
    
    ArgumentCaptor<Producto> productCaptor = ArgumentCaptor.forClass(Producto.class);
    
    // When
    inventarioService.descontarStockIngredientes(producto, 3);
    
    // Then
    verify(productoRepository).save(productCaptor.capture());
    Producto savedProduct = productCaptor.getValue();
    assertEquals(4.0, savedProduct.getStock());
}
```

---

## 📊 Datos de Prueba

### 1. Test Data Builders
```java
public class ProductoTestBuilder {
    
    private Long id = 1L;
    private String nombre = "Hamburguesa";
    private BigDecimal precio = new BigDecimal("12.50");
    private Double stock = 10.0;
    
    public ProductoTestBuilder conId(Long id) {
        this.id = id;
        return this;
    }
    
    public ProductoTestBuilder conNombre(String nombre) {
        this.nombre = nombre;
        return this;
    }
    
    public ProductoTestBuilder conPrecio(BigDecimal precio) {
        this.precio = precio;
        return this;
    }
    
    public ProductoTestBuilder conStock(Double stock) {
        this.stock = stock;
        return this;
    }
    
    public Producto build() {
        Producto producto = new Producto();
        producto.setId(id);
        producto.setNombre(nombre);
        producto.setPrecio(precio);
        producto.setStock(stock);
        return producto;
    }
}
```

### 2. Uso de Builders
```java
@Test
void testConBuilder() {
    // Given
    Producto producto = new ProductoTestBuilder()
        .conId(1L)
        .conNombre("Hamburguesa")
        .conPrecio(new BigDecimal("12.50"))
        .conStock(10.0)
        .build();
    
    // When & Then
    assertNotNull(producto);
    assertEquals("Hamburguesa", producto.getNombre());
}
```

### 3. Datos de Prueba Reutilizables
```java
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ComandaServiceTest {
    
    private ComandaRequestDTO requestValido;
    private Mesa mesaLibre;
    private Producto productoValido;
    
    @BeforeAll
    void setUp() {
        requestValido = new ComandaRequestDTO();
        requestValido.setMesaId(1L);
        requestValido.setItems(Arrays.asList(new ItemRequestDTO(1L, 2)));
        
        mesaLibre = new Mesa();
        mesaLibre.setId(1L);
        mesaLibre.setEstado(EstadoMesa.LIBRE);
        
        productoValido = new ProductoTestBuilder()
            .conId(1L)
            .conNombre("Hamburguesa")
            .conPrecio(new BigDecimal("12.50"))
            .build();
    }
}
```

---

## ✅ Assertions

### 1. Assertions Básicas
```java
@Test
void assertionsBasicas() {
    // Given
    Producto producto = new ProductoTestBuilder().build();
    
    // Then
    assertNotNull(producto);
    assertEquals(1L, producto.getId());
    assertTrue(producto.getStock() > 0);
    assertFalse(producto.getNombre().isEmpty());
}
```

### 2. Assertions de Excepciones
```java
@Test
void debeLanzarExcepcionConStockInsuficiente() {
    // Given
    Producto producto = new ProductoTestBuilder()
        .conStock(1.0)
        .build();
    
    // When & Then
    assertThrows(IllegalStateException.class, () -> 
        inventarioService.validarStockIngredientes(producto, 5));
}
```

### 3. Assertions de Colecciones
```java
@Test
void debeRetornarListaConElementosCorrectos() {
    // Given
    List<ComandaResponseDTO> comandas = comandaService.getAllComandas();
    
    // Then
    assertNotNull(comandas);
    assertFalse(comandas.isEmpty());
    assertTrue(comandas.size() > 0);
    
    // Verificar que todos los elementos tienen ID válido
    assertTrue(comandas.stream().allMatch(c -> c.getId() != null));
}
```

---

## 📝 Ejemplos Completos

### 1. InventarioServiceTest Completo
```java
@ExtendWith(MockitoExtension.class)
class InventarioServiceTest {
    
    @Mock
    private ProductoRepository productoRepository;
    
    @Mock
    private RecetaIngredienteRepository recetaRepository;
    
    @InjectMocks
    private InventarioService inventarioService;
    
    @Test
    void cuandoValidarStock_conStockSuficiente_entoncesNoLanzaExcepcion() {
        // Given
        Producto producto = new ProductoTestBuilder()
            .conId(1L)
            .conStock(10.0)
            .build();
        
        List<RecetaIngrediente> receta = Arrays.asList(
            new RecetaIngrediente(1L, 2.0)
        );
        
        when(recetaRepository.findByProductoId(1L)).thenReturn(receta);
        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
        
        // When & Then
        assertDoesNotThrow(() -> 
            inventarioService.validarStockIngredientes(producto, 3));
    }
    
    @Test
    void cuandoValidarStock_conStockInsuficiente_entoncesLanzaExcepcion() {
        // Given
        Producto producto = new ProductoTestBuilder()
            .conId(1L)
            .conStock(1.0)
            .build();
        
        List<RecetaIngrediente> receta = Arrays.asList(
            new RecetaIngrediente(1L, 2.0)
        );
        
        when(recetaRepository.findByProductoId(1L)).thenReturn(receta);
        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
        
        // When & Then
        assertThrows(IllegalStateException.class, () -> 
            inventarioService.validarStockIngredientes(producto, 3));
    }
    
    @Test
    void cuandoDescontarStock_entoncesStockSeReduceCorrectamente() {
        // Given
        Producto producto = new ProductoTestBuilder()
            .conId(1L)
            .conStock(10.0)
            .build();
        
        List<RecetaIngrediente> receta = Arrays.asList(
            new RecetaIngrediente(1L, 2.0)
        );
        
        when(recetaRepository.findByProductoId(1L)).thenReturn(receta);
        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
        
        ArgumentCaptor<Producto> productCaptor = ArgumentCaptor.forClass(Producto.class);
        
        // When
        inventarioService.descontarStockIngredientes(producto, 3);
        
        // Then
        verify(productoRepository).save(productCaptor.capture());
        Producto savedProduct = productCaptor.getValue();
        assertEquals(4.0, savedProduct.getStock());
    }
}
```

### 2. ComandaServiceTest Completo
```java
@ExtendWith(MockitoExtension.class)
class ComandaServiceTest {
    
    @Mock
    private ComandaRepository comandaRepository;
    
    @Mock
    private MesaRepository mesaRepository;
    
    @Mock
    private ProductoRepository productoRepository;
    
    @Mock
    private SimpMessagingTemplate messagingTemplate;
    
    @InjectMocks
    private ComandaService comandaService;
    
    @Nested
    class CrearComanda {
        
        @Test
        void conMesaLibre_debeCrearComanda() {
            // Given
            ComandaRequestDTO request = new ComandaRequestDTO();
            request.setMesaId(1L);
            request.setItems(Arrays.asList(new ItemRequestDTO(1L, 2)));
            
            Mesa mesa = new Mesa();
            mesa.setId(1L);
            mesa.setEstado(EstadoMesa.LIBRE);
            
            Producto producto = new ProductoTestBuilder()
                .conId(1L)
                .conPrecio(new BigDecimal("12.50"))
                .build();
            
            when(mesaRepository.findById(1L)).thenReturn(Optional.of(mesa));
            when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
            when(comandaRepository.save(any(Comanda.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
            
            // When
            ComandaResponseDTO result = comandaService.crearComanda(request);
            
            // Then
            assertNotNull(result);
            assertEquals(1L, result.getNumeroMesa());
            assertEquals(EstadoComanda.EN_PROCESO, result.getEstado());
            assertEquals(new BigDecimal("25.00"), result.getTotal());
        }
        
        @Test
        void conMesaOcupada_debeLanzarExcepcion() {
            // Given
            ComandaRequestDTO request = new ComandaRequestDTO();
            request.setMesaId(1L);
            
            Mesa mesa = new Mesa();
            mesa.setId(1L);
            mesa.setEstado(EstadoMesa.OCUPADA);
            
            when(mesaRepository.findById(1L)).thenReturn(Optional.of(mesa));
            
            // When & Then
            assertThrows(IllegalStateException.class, () -> 
                comandaService.crearComanda(request));
        }
    }
}
```

---

## 📈 Métricas de Calidad

### 🎯 **Objetivos por Servicio**
- ✅ **InventarioService**: 100% cobertura
- ✅ **ComandaService**: 100% cobertura
- ✅ **PrinterConfigurationService**: 95% cobertura
- ✅ **AuthService**: 90% cobertura

### 📊 **Métricas de Calidad**
- ✅ **Tests por Método**: >3
- ✅ **Assertions por Test**: >3
- ✅ **Tiempo de Ejecución**: <5 segundos
- ✅ **Cobertura de Líneas**: >95%

---

**🎉 ¡Pruebas unitarias implementadas! Tu código está blindado contra errores.** 