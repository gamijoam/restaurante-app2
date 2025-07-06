# 🧪 Testing - Restaurante App

## 📋 Índice
1. [Estrategia de Testing](#estrategia-de-testing)
2. [Estructura de Pruebas](#estructura-de-pruebas)
3. [Ejecutar Pruebas](#ejecutar-pruebas)
4. [Cobertura de Código](#cobertura-de-código)
5. [Pruebas Unitarias](#pruebas-unitarias)
6. [Pruebas de Integración](#pruebas-de-integración)
7. [Mejores Prácticas](#mejores-prácticas)
8. [Solución de Problemas](#solución-de-problemas)

---

## 🎯 Estrategia de Testing

### 🏗️ Arquitectura de Pruebas

```
┌─────────────────────────────────────────────────────────────┐
│                    Testing Pyramid                        │
├─────────────────────────────────────────────────────────────┤
│                    E2E Tests                             │
│              (Pruebas End-to-End)                        │
├─────────────────────────────────────────────────────────────┤
│                Integration Tests                          │
│           (Pruebas de Integración)                       │
├─────────────────────────────────────────────────────────────┤
│                  Unit Tests                               │
│            (Pruebas Unitarias)                           │
└─────────────────────────────────────────────────────────────┘
```

### 📊 Prioridades de Testing

#### 🔴 **Crítico (Debe tener 100% cobertura)**
- ✅ **InventarioService** - Gestión de stock y recetas
- ✅ **ComandaService** - Lógica de negocio principal
- ✅ **Autenticación** - Seguridad del sistema

#### 🟡 **Importante (Debe tener >80% cobertura)**
- ✅ **PrinterConfigurationService** - Configuración de impresoras
- ✅ **WebSocketService** - Comunicación en tiempo real
- ✅ **FacturaService** - Generación de facturas

#### 🟢 **Deseable (Debe tener >60% cobertura)**
- ✅ **ReporteService** - Generación de reportes
- ✅ **UsuarioService** - Gestión de usuarios
- ✅ **MesaService** - Gestión de mesas

---

## 📁 Estructura de Pruebas

```
backend/src/test/java/com/catasoft/restaurante/backend/
├── unit/
│   ├── service/
│   │   ├── InventarioServiceTest.java
│   │   ├── ComandaServiceTest.java
│   │   └── PrinterConfigurationServiceTest.java
│   └── repository/
│       ├── ComandaRepositoryTest.java
│       └── ProductoRepositoryTest.java
├── integration/
│   ├── controller/
│   │   ├── ComandaControllerTest.java
│   │   └── AuthControllerTest.java
│   └── websocket/
│       └── WebSocketServiceTest.java
└── e2e/
    └── ComandaFlowTest.java
```

---

## 🚀 Ejecutar Pruebas

### Pruebas Unitarias
```bash
# Ejecutar todas las pruebas unitarias
mvn test

# Ejecutar pruebas específicas
mvn test -Dtest=InventarioServiceTest

# Ejecutar con cobertura
mvn test jacoco:report
```

### Pruebas de Integración
```bash
# Ejecutar pruebas de integración
mvn test -Dtest=*IntegrationTest

# Ejecutar con base de datos de prueba
mvn test -Dspring.profiles.active=test
```

### Pruebas E2E
```bash
# Ejecutar pruebas end-to-end
mvn test -Dtest=*E2ETest
```

---

## 📊 Cobertura de Código

### Configuración de JaCoCo
```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.11</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

### Verificar Cobertura
```bash
# Generar reporte de cobertura
mvn clean test jacoco:report

# Ver reporte en: target/site/jacoco/index.html
```

### Metas de Cobertura
- 🎯 **Servicios Críticos**: >95%
- 🎯 **Servicios Importantes**: >80%
- 🎯 **Servicios Deseables**: >60%
- 🎯 **Cobertura Total**: >75%

---

## 🧪 Pruebas Unitarias

### Ejemplo: InventarioServiceTest
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
    void cuandoDescontarStock_entoncesStockSeReduce() {
        // Given
        Producto producto = new Producto();
        producto.setId(1L);
        
        List<RecetaIngrediente> receta = Arrays.asList(
            new RecetaIngrediente(1L, 2.0) // 2 unidades de ingrediente 1
        );
        
        when(recetaRepository.findByProductoId(1L)).thenReturn(receta);
        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
        
        // When
        inventarioService.descontarStockIngredientes(producto, 3);
        
        // Then
        verify(productoRepository).save(any(Producto.class));
    }
}
```

### Patrones de Testing
- ✅ **Given-When-Then** - Estructura clara
- ✅ **AAA Pattern** - Arrange, Act, Assert
- ✅ **Mocking** - Aislar dependencias
- ✅ **Test Data Builders** - Datos de prueba reutilizables

---

## 🔗 Pruebas de Integración

### Ejemplo: ComandaControllerTest
```java
@SpringBootTest
@AutoConfigureTestDatabase
@TestPropertySource(properties = {
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class ComandaControllerTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void crearComanda_debeRetornarComandaCreada() {
        // Given
        ComandaRequestDTO request = new ComandaRequestDTO();
        request.setMesaId(1L);
        request.setItems(Arrays.asList(
            new ItemRequestDTO(1L, 2) // 2 hamburguesas
        ));
        
        // When
        ResponseEntity<ComandaResponseDTO> response = 
            restTemplate.postForEntity("/api/v1/comandas", request, ComandaResponseDTO.class);
        
        // Then
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1L, response.getBody().getNumeroMesa());
    }
}
```

---

## 📋 Mejores Prácticas

### ✅ **Nomenclatura de Pruebas**
```java
// Formato: cuando[Accion]_entonces[Resultado]
@Test
void cuandoCrearComanda_conMesaLibre_entoncesComandaSeCrea() { }

@Test
void cuandoCrearComanda_conMesaOcupada_entoncesLanzaExcepcion() { }
```

### ✅ **Organización de Pruebas**
```java
@Nested
class CrearComanda {
    
    @Test
    void conMesaLibre_debeCrearComanda() { }
    
    @Test
    void conMesaOcupada_debeLanzarExcepcion() { }
    
    @Test
    void conProductoInexistente_debeLanzarExcepcion() { }
}
```

### ✅ **Datos de Prueba**
```java
@TestMethodOrder(OrderAnnotation.class)
class ComandaServiceTest {
    
    @Test
    @Order(1)
    void setup() {
        // Configurar datos de prueba
    }
    
    @Test
    @Order(2)
    void testCrearComanda() {
        // Probar creación
    }
    
    @Test
    @Order(3)
    void cleanup() {
        // Limpiar datos
    }
}
```

---

## 🔧 Solución de Problemas

### Problema: "Tests fallan intermitentemente"
**Solución**:
```java
@Transactional
@Rollback
@Test
void testConTransaccion() {
    // Cada test se ejecuta en su propia transacción
    // y se hace rollback al final
}
```

### Problema: "Base de datos de prueba no se limpia"
**Solución**:
```java
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@Test
void testConContextoLimpio() {
    // El contexto se recrea después de cada test
}
```

### Problema: "Tests lentos"
**Solución**:
```java
@Test
@Timeout(value = 5, unit = TimeUnit.SECONDS)
void testConTimeout() {
    // El test falla si toma más de 5 segundos
}
```

---

## 📈 Métricas de Calidad

### 🎯 **Objetivos de Calidad**
- ✅ **Cobertura de Código**: >75%
- ✅ **Tiempo de Ejecución**: <30 segundos
- ✅ **Pruebas por Método**: >2
- ✅ **Assertions por Test**: >3

### 📊 **Reportes Automáticos**
```bash
# Generar reporte completo
mvn clean test jacoco:report surefire-report:report

# Ver reportes en:
# - target/site/jacoco/index.html (cobertura)
# - target/site/surefire-report.html (resultados)
```

---

## 🚀 CI/CD Integration

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 21
        uses: actions/setup-java@v3
        with:
          java-version: '21'
      - name: Run Tests
        run: mvn clean test
      - name: Generate Coverage Report
        run: mvn jacoco:report
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
```

---

**🎉 ¡Testing implementado! Tu código ahora está blindado y listo para producción.** 