# 🚀 Quick Start - Testing Suite

## ⚡ Ejecutar Tests Rápidamente

### Windows
```bash
# Ejecutar todos los tests
run-tests.bat

# O manualmente
mvn clean test jacoco:report
```

### Linux/Mac
```bash
# Hacer ejecutable el script
chmod +x run-tests.sh

# Ejecutar todos los tests
./run-tests.sh

# O manualmente
mvn clean test jacoco:report
```

## 📊 Ver Reportes

Después de ejecutar los tests, los reportes estarán disponibles en:

- **Cobertura de Código**: `target/site/jacoco/index.html`
- **Resultados de Tests**: `target/site/surefire-report.html`

## 🎯 Metas de Cobertura

| Servicio | Cobertura Objetivo | Estado |
|----------|-------------------|---------|
| InventarioService | 100% | 🔴 Pendiente |
| ComandaService | 100% | 🔴 Pendiente |
| PrinterConfigurationService | 95% | 🔴 Pendiente |
| AuthService | 90% | 🔴 Pendiente |
| **Total** | **75%** | 🔴 Pendiente |

## 🧪 Tipos de Tests

### 1. Pruebas Unitarias
```bash
# Ejecutar solo pruebas unitarias
mvn test

# Ejecutar pruebas específicas
mvn test -Dtest=InventarioServiceTest
```

### 2. Pruebas de Integración
```bash
# Ejecutar pruebas de integración
mvn integration-test

# Ejecutar pruebas específicas
mvn test -Dtest=*IntegrationTest
```

### 3. Pruebas E2E
```bash
# Ejecutar pruebas end-to-end
mvn test -Dtest=*E2ETest
```

## 📁 Estructura de Tests

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

## 🔧 Configuración

### Base de Datos de Test
- **Tipo**: H2 en memoria
- **Configuración**: `application-test.properties`
- **Comportamiento**: Se crea y destruye automáticamente

### Dependencias de Test
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>test</scope>
</dependency>
```

## 📝 Convenciones de Nomenclatura

### Nombres de Tests
```java
// Formato: cuando[Accion]_entonces[Resultado]
@Test
void cuandoCrearComanda_conMesaLibre_entoncesComandaSeCrea() { }

@Test
void cuandoValidarStock_conStockInsuficiente_entoncesLanzaExcepcion() { }
```

### Organización con @Nested
```java
@Nested
class CrearComanda {
    @Test
    void conMesaLibre_debeCrearComanda() { }
    
    @Test
    void conMesaOcupada_debeLanzarExcepcion() { }
}
```

## 🎭 Mocking y Stubbing

### Ejemplo Básico
```java
@ExtendWith(MockitoExtension.class)
class ServiceTest {
    
    @Mock
    private Repository repository;
    
    @InjectMocks
    private Service service;
    
    @Test
    void test() {
        // Given
        when(repository.findById(1L)).thenReturn(Optional.of(entity));
        
        // When
        service.method();
        
        // Then
        verify(repository).save(any(Entity.class));
    }
}
```

## 📈 Métricas de Calidad

### Objetivos
- ✅ **Cobertura de Código**: >75%
- ✅ **Tiempo de Ejecución**: <30 segundos
- ✅ **Tests por Método**: >2
- ✅ **Assertions por Test**: >3

### Verificar Cobertura
```bash
# Generar reporte de cobertura
mvn clean test jacoco:report

# Verificar que cumple con las reglas
mvn jacoco:check
```

## 🚨 Solución de Problemas

### Problema: "Tests fallan intermitentemente"
```java
@Transactional
@Rollback
@Test
void testConTransaccion() {
    // Cada test se ejecuta en su propia transacción
}
```

### Problema: "Base de datos no se limpia"
```java
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@Test
void testConContextoLimpio() {
    // El contexto se recrea después de cada test
}
```

### Problema: "Tests lentos"
```java
@Test
@Timeout(value = 5, unit = TimeUnit.SECONDS)
void testConTimeout() {
    // El test falla si toma más de 5 segundos
}
```

## 🔄 CI/CD Integration

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
```

## 📚 Recursos Adicionales

- 📖 [Documentación Completa](README.md)
- 🧪 [Pruebas Unitarias](unit-tests.md)
- 🔗 [Pruebas de Integración](integration-tests.md)
- 📁 [Ejemplos de Tests](test-examples/)

---

**🎉 ¡Listo para testing! Tu código está blindado y listo para producción.** 