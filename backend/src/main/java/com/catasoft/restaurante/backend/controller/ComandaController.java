package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.dto.ComandaRequestDTO;
import com.catasoft.restaurante.backend.model.Comanda;
import com.catasoft.restaurante.backend.service.ComandaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/comandas")
public class ComandaController {

    private final ComandaService comandaService;

    public ComandaController(ComandaService comandaService) {
        this.comandaService = comandaService;
    }

    @PostMapping
    public ResponseEntity<Comanda> createComanda(@RequestBody ComandaRequestDTO request) {
        Comanda nuevaComanda = comandaService.crearComanda(request);
        return new ResponseEntity<>(nuevaComanda, HttpStatus.CREATED);
    }
}