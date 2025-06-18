import type { ItemRequestDTO } from './ItemRequestDTO';

export interface ComandaRequestDTO {
    mesaId: number;
    items: ItemRequestDTO[];
}