package com.catasoft.restaurante.backend.repository;

import com.catasoft.restaurante.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Método para buscar un usuario por su nombre de usuario
    Optional<Usuario> findByUsername(String username);
}