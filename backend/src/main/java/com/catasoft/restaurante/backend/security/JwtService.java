package com.catasoft.restaurante.backend.security;

import com.catasoft.restaurante.backend.model.Usuario; // <-- Importar nuestro Usuario
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${application.jwt.secret-key}")
    private String secretKey;
    
    @Value("${jwt.expiration}")
    private long jwtExpiration;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // --- MÉTODO generateToken MODIFICADO ---
    public String generateToken(Usuario usuario) {
        Map<String, Object> extraClaims = new HashMap<>();
        
        // Convertir roles a strings
        Set<String> roles = usuario.getRoles().stream()
            .map(rol -> rol.name())
            .collect(Collectors.toSet());
        extraClaims.put("roles", roles);
        
        // Agregar permisos al token
        Set<String> permisos = usuario.getPermisos().stream()
            .map(permiso -> permiso.getNombre())
            .collect(Collectors.toSet());
        extraClaims.put("permisos", permisos);
        
        // Agregar información adicional del usuario
        extraClaims.put("userId", usuario.getId());
        extraClaims.put("nombre", usuario.getNombre());
        extraClaims.put("apellido", usuario.getApellido());

        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(usuario.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    
    // Método para extraer permisos del token
    public Set<String> extractPermissions(String token) {
        Claims claims = extractAllClaims(token);
        @SuppressWarnings("unchecked")
        Set<String> permisos = (Set<String>) claims.get("permisos");
        return permisos;
    }
    
    // Método para extraer roles del token
    public Set<String> extractRoles(String token) {
        Claims claims = extractAllClaims(token);
        @SuppressWarnings("unchecked")
        Set<String> roles = (Set<String>) claims.get("roles");
        return roles;
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    // El resto de los métodos privados no cambian...
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}