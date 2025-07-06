package com.catasoft.restaurante.backend.test.integration.controller;

import com.catasoft.restaurante.backend.dto.ComandaRequestDTO;
import com.catasoft.restaurante.backend.dto.ComandaResponseDTO;
import com.catasoft.restaurante.backend.dto.ItemRequestDTO;
import com.catasoft.restaurante.backend.dto.TicketDTO;
import com.catasoft.restaurante.backend.model.Comanda;
import com.catasoft.restaurante.backend.model.ComandaItem;
import com.catasoft.restaurante.backend.model.Mesa;
import com.catasoft.restaurante.backend.model.Producto;
import com.catasoft.restaurante.backend.model.enums.EstadoComanda;
import com.catasoft.restaurante.backend.model.enums.EstadoMesa;
import com.catasoft.restaurante.backend.repository.ComandaRepository;
import com.catasoft.restaurante.backend.repository.MesaRepository;
import com.catasoft.restaurante.backend.repository.ProductoRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Pruebas de integración para ComandaController
 * 
 * Estas pruebas verifican el flujo completo desde el endpoint HTTP
 * hasta la base de datos, incluyendo validaciones de negocio.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@TestPropertySource(properties = {
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect"
})
@Transactional
@DisplayName("ComandaController - Pruebas de Integración")
class ComandaControllerIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ComandaRepository comandaRepository;

    @Autowired
    private MesaRepository mesaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;
    private Mesa mesa;
    private Producto producto;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        
        // Crear datos de prueba
        mesa = new Mesa();
        mesa.setId(1L);
        mesa.setNombre("Mesa 1");
        mesa.setEstado(EstadoMesa.LIBRE);
        mesa = mesaRepository.save(mesa);

        producto = new Producto();
        producto.setId(1L);
        producto.setNombre("Hamburguesa");
        producto.setPrecio(new BigDecimal("12.50"));
        producto.setStock(10.0);
        producto = productoRepository.save(producto);
    }

    @Nested
    @DisplayName("Crear Comanda")
    class CrearComanda {

        @Test
        @DisplayName("Cuando crear comanda con mesa libre, entonces debe crear comanda exitosamente")
        void cuandoCrearComanda_conMesaLibre_entoncesDebeCrearComandaExitosamente() throws Exception {
            // Given
            ComandaRequestDTO request = new ComandaRequestDTO();
            request.setMesaId(1L);
            request.setItems(Arrays.asList(new ItemRequestDTO(1L, 2)));

            String requestJson = objectMapper.writeValueAsString(request);

            // When & Then
            mockMvc.perform(post("/api/v1/comandas")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestJson))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.numeroMesa").value(1))
                    .andExpect(jsonPath("$.estado").value("EN_PROCESO"))
                    .andExpect(jsonPath("$.total").value(25.00))
                    .andExpect(jsonPath("$.items").isArray())
                    .andExpect(jsonPath("$.items.length()").value(1))
                    .andExpect(jsonPath("$.items[0].productoId").value(1))
                    .andExpect(jsonPath("$.items[0].cantidad").value(2))
                    .andExpect(jsonPath("$.items[0].precioUnitario").value(12.50));

            // Verificar que la mesa se marcó como ocupada
            Mesa mesaActualizada = mesaRepository.findById(1L).orElse(null);
            assertNotNull(mesaActualizada);
            assertEquals(EstadoMesa.OCUPADA, mesaActualizada.getEstado());
        }

        @Test
        @DisplayName("Cuando crear comanda con mesa ocupada, entonces debe retornar error")
        void cuandoCrearComanda_conMesaOcupada_entoncesDebeRetornarError() throws Exception {
            // Given
            mesa.setEstado(EstadoMesa.OCUPADA);
            mesaRepository.save(mesa);

            ComandaRequestDTO request = new ComandaRequestDTO();
            request.setMesaId(1L);
            request.setItems(Arrays.asList(new ItemRequestDTO(1L, 2)));

            String requestJson = objectMapper.writeValueAsString(request);

            // When & Then
            mockMvc.perform(post("/api/v1/comandas")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestJson))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("ocupada")));
        }

        @Test
        @DisplayName("Cuando crear comanda con mesa inexistente, entonces debe retornar error")
        void cuandoCrearComanda_conMesaInexistente_entoncesDebeRetornarError() throws Exception {
            // Given
            ComandaRequestDTO request = new ComandaRequestDTO();
            request.setMesaId(999L);
            request.setItems(Arrays.asList(new ItemRequestDTO(1L, 2)));

            String requestJson = objectMapper.writeValueAsString(request);

            // When & Then
            mockMvc.perform(post("/api/v1/comandas")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestJson))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("no encontrada")));
        }

        @Test
        @DisplayName("Cuando crear comanda con producto inexistente, entonces debe retornar error")
        void cuandoCrearComanda_conProductoInexistente_entoncesDebeRetornarError() throws Exception {
            // Given
            ComandaRequestDTO request = new ComandaRequestDTO();
            request.setMesaId(1L);
            request.setItems(Arrays.asList(new ItemRequestDTO(999L, 2)));

            String requestJson = objectMapper.writeValueAsString(request);

            // When & Then
            mockMvc.perform(post("/api/v1/comandas")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestJson))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("no encontrado")));
        }

        @Test
        @DisplayName("Cuando crear comanda con items vacíos, entonces debe retornar error")
        void cuandoCrearComanda_conItemsVacios_entoncesDebeRetornarError() throws Exception {
            // Given
            ComandaRequestDTO request = new ComandaRequestDTO();
            request.setMesaId(1L);
            request.setItems(Arrays.asList());

            String requestJson = objectMapper.writeValueAsString(request);

            // When & Then
            mockMvc.perform(post("/api/v1/comandas")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestJson))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("items")));
        }

        @Test
        @DisplayName("Cuando crear comanda con cantidad cero, entonces debe retornar error")
        void cuandoCrearComanda_conCantidadCero_entoncesDebeRetornarError() throws Exception {
            // Given
            ComandaRequestDTO request = new ComandaRequestDTO();
            request.setMesaId(1L);
            request.setItems(Arrays.asList(new ItemRequestDTO(1L, 0)));

            String requestJson = objectMapper.writeValueAsString(request);

            // When & Then
            mockMvc.perform(post("/api/v1/comandas")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestJson))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("cantidad")));
        }
    }

    @Nested
    @DisplayName("Actualizar Estado de Comanda")
    class ActualizarEstadoComanda {

        private Comanda comanda;

        @BeforeEach
        void setUpComanda() {
            comanda = new Comanda();
            comanda.setMesa(mesa);
            comanda.setEstado(EstadoComanda.EN_PROCESO);
            comanda.setTotal(new BigDecimal("25.00"));
            comanda = comandaRepository.save(comanda);
        }

        @Test
        @DisplayName("Cuando actualizar estado a PAGADA, entonces debe actualizar estado y liberar mesa")
        void cuandoActualizarEstado_aPAGADA_entoncesDebeActualizarEstadoYLiberarMesa() throws Exception {
            // When & Then
            mockMvc.perform(put("/api/v1/comandas/" + comanda.getId() + "/estado")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("\"PAGADA\""))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.estado").value("PAGADA"))
                    .andExpect(jsonPath("$.numeroMesa").value(1));

            // Verificar que la mesa se liberó
            Mesa mesaActualizada = mesaRepository.findById(1L).orElse(null);
            assertNotNull(mesaActualizada);
            assertEquals(EstadoMesa.LIBRE, mesaActualizada.getEstado());
        }

        @Test
        @DisplayName("Cuando actualizar estado a LISTA, entonces debe actualizar estado")
        void cuandoActualizarEstado_aLISTA_entoncesDebeActualizarEstado() throws Exception {
            // When & Then
            mockMvc.perform(put("/api/v1/comandas/" + comanda.getId() + "/estado")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("\"LISTA\""))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.estado").value("LISTA"));

            // Verificar que la mesa sigue ocupada
            Mesa mesaActualizada = mesaRepository.findById(1L).orElse(null);
            assertNotNull(mesaActualizada);
            assertEquals(EstadoMesa.OCUPADA, mesaActualizada.getEstado());
        }

        @Test
        @DisplayName("Cuando actualizar estado de comanda inexistente, entonces debe retornar error")
        void cuandoActualizarEstado_deComandaInexistente_entoncesDebeRetornarError() throws Exception {
            // When & Then
            mockMvc.perform(put("/api/v1/comandas/999/estado")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("\"PAGADA\""))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("no encontrada")));
        }

        @Test
        @DisplayName("Cuando actualizar estado con estado inválido, entonces debe retornar error")
        void cuandoActualizarEstado_conEstadoInvalido_entoncesDebeRetornarError() throws Exception {
            // When & Then
            mockMvc.perform(put("/api/v1/comandas/" + comanda.getId() + "/estado")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("\"ESTADO_INVALIDO\""))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("estado")));
        }
    }

    @Nested
    @DisplayName("Obtener Datos de Ticket")
    class ObtenerDatosTicket {

        private Comanda comanda;

        @BeforeEach
        void setUpComandaConItems() {
            comanda = new Comanda();
            comanda.setMesa(mesa);
            comanda.setEstado(EstadoComanda.EN_PROCESO);
            comanda.setTotal(new BigDecimal("25.00"));
            comanda = comandaRepository.save(comanda);

            ComandaItem item = new ComandaItem();
            item.setComanda(comanda);
            item.setProducto(producto);
            item.setCantidad(2);
            item.setPrecioUnitario(new BigDecimal("12.50"));
            // Aquí necesitarías un ComandaItemRepository para guardar el item
        }

        @Test
        @DisplayName("Cuando obtener ticket data, entonces debe retornar datos completos")
        void cuandoObtenerTicketData_entoncesDebeRetornarDatosCompletos() throws Exception {
            // When & Then
            mockMvc.perform(get("/api/v1/comandas/" + comanda.getId() + "/ticket"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.mesaNombre").value("Mesa 1"))
                    .andExpect(jsonPath("$.total").value(25.00))
                    .andExpect(jsonPath("$.items").isArray());
        }

        @Test
        @DisplayName("Cuando obtener ticket data de comanda inexistente, entonces debe retornar error")
        void cuandoObtenerTicketData_deComandaInexistente_entoncesDebeRetornarError() throws Exception {
            // When & Then
            mockMvc.perform(get("/api/v1/comandas/999/ticket"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("no encontrada")));
        }
    }

    @Nested
    @DisplayName("Obtener Todas las Comandas")
    class ObtenerTodasComandas {

        @Test
        @DisplayName("Cuando obtener todas las comandas, entonces debe retornar lista")
        void cuandoObtenerTodasComandas_entoncesDebeRetornarLista() throws Exception {
            // Given
            Comanda comanda1 = new Comanda();
            comanda1.setMesa(mesa);
            comanda1.setEstado(EstadoComanda.EN_PROCESO);
            comanda1.setTotal(new BigDecimal("25.00"));
            comandaRepository.save(comanda1);

            // When & Then
            mockMvc.perform(get("/api/v1/comandas"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].numeroMesa").value(1))
                    .andExpect(jsonPath("$[0].estado").value("EN_PROCESO"));
        }

        @Test
        @DisplayName("Cuando obtener comandas por estado, entonces debe retornar filtradas")
        void cuandoObtenerComandasPorEstado_entoncesDebeRetornarFiltradas() throws Exception {
            // Given
            Comanda comanda1 = new Comanda();
            comanda1.setMesa(mesa);
            comanda1.setEstado(EstadoComanda.EN_PROCESO);
            comanda1.setTotal(new BigDecimal("25.00"));
            comandaRepository.save(comanda1);

            // When & Then
            mockMvc.perform(get("/api/v1/comandas")
                    .param("estado", "EN_PROCESO"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].estado").value("EN_PROCESO"));
        }
    }

    @Nested
    @DisplayName("Casos Edge")
    class CasosEdge {

        @Test
        @DisplayName("Cuando enviar JSON malformado, entonces debe retornar error")
        void cuandoEnviarJsonMalformado_entoncesDebeRetornarError() throws Exception {
            // When & Then
            mockMvc.perform(post("/api/v1/comandas")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{ invalid json }"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Cuando enviar request sin content-type, entonces debe retornar error")
        void cuandoEnviarRequestSinContentType_entoncesDebeRetornarError() throws Exception {
            // Given
            ComandaRequestDTO request = new ComandaRequestDTO();
            request.setMesaId(1L);
            request.setItems(Arrays.asList(new ItemRequestDTO(1L, 2)));

            String requestJson = objectMapper.writeValueAsString(request);

            // When & Then
            mockMvc.perform(post("/api/v1/comandas")
                    .content(requestJson))
                    .andExpect(status().isUnsupportedMediaType());
        }

        @Test
        @DisplayName("Cuando enviar request con campos faltantes, entonces debe retornar error")
        void cuandoEnviarRequestConCamposFaltantes_entoncesDebeRetornarError() throws Exception {
            // Given
            String requestJson = "{\"mesaId\": 1}"; // Sin items

            // When & Then
            mockMvc.perform(post("/api/v1/comandas")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestJson))
                    .andExpect(status().isBadRequest());
        }
    }
} 