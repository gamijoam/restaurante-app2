// frontend/src/dto/comandaDTOs.ts

// Define la forma de un item individual en una petición
export interface ItemRequestDTO {
    productoId: number;
    cantidad: number;
}

// Define la forma de la petición completa para crear una comanda
export interface ComandaRequestDTO {
    mesaId: number;
    items: ItemRequestDTO[];
}