package com.catasoft.restaurante.backend.controller;

import com.catasoft.restaurante.backend.dto.auth.AuthResponseDTO;
import com.catasoft.restaurante.backend.dto.auth.LoginRequestDTO;
import com.catasoft.restaurante.backend.dto.auth.RegisterRequestDTO;
import com.catasoft.restaurante.backend.service.AuthService;
import com.catasoft.restaurante.backend.repository.UsuarioRepository;
import com.catasoft.restaurante.backend.model.Usuario;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
 // Permitimos peticiones desde el frontend
public class AuthController {

    private final AuthService authService;
    private final UsuarioRepository usuarioRepository;

    public AuthController(AuthService authService, UsuarioRepository usuarioRepository) {
        this.authService = authService;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@RequestBody RegisterRequestDTO request) {
        return ResponseEntity.ok(authService.register(request));
    }
    
    @GetMapping("/verificar-sesion")
    public ResponseEntity<?> verificarMiSesion(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No hay una sesión activa.");
        }

        // Creamos un mapa para devolver la información de forma clara
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("username", authentication.getName());

        // Extraemos los 'authorities' (roles) del objeto de autenticación
        var authorities = authentication.getAuthorities().stream()
                                .map(GrantedAuthority::getAuthority)
                                .collect(Collectors.toList());
        userInfo.put("roles", authorities);

        return ResponseEntity.ok(userInfo);
    }
    
    @GetMapping("/test-usuario/{username}")
    public ResponseEntity<?> testUsuario(@PathVariable String username) {
        Optional<Usuario> usuario = usuarioRepository.findByUsername(username);
        
        if (usuario.isPresent()) {
            Map<String, Object> userInfo = new HashMap<>();
            Usuario user = usuario.get();
            userInfo.put("id", user.getId());
            userInfo.put("username", user.getUsername());
            userInfo.put("nombre", user.getNombre());
            userInfo.put("email", user.getEmail());
            userInfo.put("activo", user.isActivo());
            
            // Solo incluir nombres de roles para evitar recursión
            var roleNames = user.getRoles().stream()
                    .map(rol -> rol.getNombre())
                    .collect(Collectors.toList());
            userInfo.put("roles", roleNames);
            
            return ResponseEntity.ok(userInfo);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}