package com.catasoft.restaurante.backend.model.enums;

public enum EstadoComanda {
    EN_PROCESO,     // La comanda ha sido creada y está en preparación.
    LISTA,          // La cocina ha terminado de preparar los platos.
    ENTREGADA,      // El camarero ha entregado la comanda a la mesa.
    PAGADA,         // La comanda ha sido pagada.
    CANCELADA       // La comanda fue cancelada.
}