package com.catasoft.restaurante.backend.service;

import com.catasoft.restaurante.backend.model.Permiso;
import com.catasoft.restaurante.backend.model.Rol;
import com.catasoft.restaurante.backend.repository.PermisoRepository;
import com.catasoft.restaurante.backend.repository.RolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class PermisoService {
    
    private final PermisoRepository permisoRepository;
    private final RolRepository rolRepository;
    
    @Autowired
    public PermisoService(PermisoRepository permisoRepository, RolRepository rolRepository) {
        this.permisoRepository = permisoRepository;
        this.rolRepository = rolRepository;
    }
    
    // Métodos para Permisos
    public List<Permiso> getAllPermisos() {
        return permisoRepository.findAll();
    }
    
    public Optional<Permiso> getPermisoById(Long id) {
        return permisoRepository.findById(id);
    }
    
    public Optional<Permiso> getPermisoByNombre(String nombre) {
        return permisoRepository.findByNombre(nombre);
    }
    
    public Permiso createPermiso(Permiso permiso) {
        return permisoRepository.save(permiso);
    }
    
    public Permiso updatePermiso(Long id, Permiso permisoDetails) {
        Permiso permiso = permisoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Permiso no encontrado"));
        
        permiso.setNombre(permisoDetails.getNombre());
        permiso.setDescripcion(permisoDetails.getDescripcion());
        
        return permisoRepository.save(permiso);
    }
    
    public void deletePermiso(Long id) {
        permisoRepository.deleteById(id);
    }
    
    // Métodos para Roles
    public List<Rol> getAllRoles() {
        return rolRepository.findAll();
    }
    
    public Optional<Rol> getRolById(Long id) {
        return rolRepository.findById(id);
    }
    
    public Optional<Rol> getRolByNombre(String nombre) {
        return rolRepository.findByNombre(nombre);
    }
    
    public Rol createRol(Rol rol) {
        return rolRepository.save(rol);
    }
    
    public Rol updateRol(Long id, Rol rolDetails) {
        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        
        rol.setNombre(rolDetails.getNombre());
        rol.setDescripcion(rolDetails.getDescripcion());
        
        return rolRepository.save(rol);
    }
    
    public void deleteRol(Long id) {
        rolRepository.deleteById(id);
    }
    
    // Métodos para gestionar permisos de roles
    public void asignarPermisoARol(Long rolId, Long permisoId) {
        Rol rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        Permiso permiso = permisoRepository.findById(permisoId)
                .orElseThrow(() -> new RuntimeException("Permiso no encontrado"));
        
        rol.addPermiso(permiso);
        rolRepository.save(rol);
    }
    
    public void removerPermisoDeRol(Long rolId, Long permisoId) {
        Rol rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        Permiso permiso = permisoRepository.findById(permisoId)
                .orElseThrow(() -> new RuntimeException("Permiso no encontrado"));
        
        rol.removePermiso(permiso);
        rolRepository.save(rol);
    }
    
    public Set<Permiso> getPermisosDeRol(Long rolId) {
        Rol rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        return rol.getPermisos();
    }
    
    // Método para inicializar permisos y roles por defecto
    @Transactional
    public void inicializarPermisosYRoles() {
        // Crear permisos básicos
        crearPermisoSiNoExiste("VER_REPORTES", "Puede ver reportes de ventas");
        crearPermisoSiNoExiste("EDITAR_PRODUCTOS", "Puede crear y editar productos");
        crearPermisoSiNoExiste("CREAR_USUARIOS", "Puede crear y gestionar usuarios");
        crearPermisoSiNoExiste("GESTIONAR_ROLES", "Puede gestionar roles y permisos");
        crearPermisoSiNoExiste("VER_FACTURACION", "Puede ver historial de facturación");
        crearPermisoSiNoExiste("DESCARGAR_FACTURAS", "Puede descargar facturas en PDF");
        crearPermisoSiNoExiste("GESTIONAR_MESAS", "Puede gestionar mesas del restaurante");
        crearPermisoSiNoExiste("GESTIONAR_INGREDIENTES", "Puede gestionar inventario de ingredientes");
        crearPermisoSiNoExiste("GESTIONAR_RECETAS", "Puede gestionar recetas de productos");
        crearPermisoSiNoExiste("TOMAR_PEDIDOS", "Puede tomar pedidos de clientes");
        crearPermisoSiNoExiste("VER_COCINA", "Puede ver vista de cocina");
        crearPermisoSiNoExiste("VER_CAJA", "Puede ver vista de caja");
        
        // Crear roles básicos
        Rol gerente = crearRolSiNoExiste("ROLE_GERENTE", "Gerente del restaurante");
        Rol camarero = crearRolSiNoExiste("ROLE_CAMARERO", "Camarero");
        Rol cocinero = crearRolSiNoExiste("ROLE_COCINERO", "Cocinero");
        
        // Asignar permisos a roles
        asignarPermisosAGerente(gerente);
        asignarPermisosACamarero(camarero);
        asignarPermisosACocinero(cocinero);
    }
    
    private void crearPermisoSiNoExiste(String nombre, String descripcion) {
        if (!permisoRepository.existsByNombre(nombre)) {
            Permiso permiso = new Permiso(nombre, descripcion);
            permisoRepository.save(permiso);
        }
    }
    
    private Rol crearRolSiNoExiste(String nombre, String descripcion) {
        if (!rolRepository.existsByNombre(nombre)) {
            Rol rol = new Rol(nombre, descripcion);
            return rolRepository.save(rol);
        } else {
            return rolRepository.findByNombre(nombre).orElseThrow();
        }
    }
    
    private void asignarPermisosAGerente(Rol gerente) {
        // Gerente tiene todos los permisos
        List<Permiso> todosLosPermisos = permisoRepository.findAll();
        for (Permiso permiso : todosLosPermisos) {
            if (!gerente.getPermisos().contains(permiso)) {
                gerente.addPermiso(permiso);
            }
        }
        rolRepository.save(gerente);
    }
    
    private void asignarPermisosACamarero(Rol camarero) {
        // Camarero puede tomar pedidos, ver caja y gestionar mesas
        asignarPermisoSiNoExiste(camarero, "TOMAR_PEDIDOS");
        asignarPermisoSiNoExiste(camarero, "VER_CAJA");
        asignarPermisoSiNoExiste(camarero, "GESTIONAR_MESAS");
        rolRepository.save(camarero);
    }
    
    private void asignarPermisosACocinero(Rol cocinero) {
        // Cocinero puede ver cocina y gestionar ingredientes
        asignarPermisoSiNoExiste(cocinero, "VER_COCINA");
        asignarPermisoSiNoExiste(cocinero, "GESTIONAR_INGREDIENTES");
        asignarPermisoSiNoExiste(cocinero, "GESTIONAR_RECETAS");
        rolRepository.save(cocinero);
    }
    
    private void asignarPermisoSiNoExiste(Rol rol, String nombrePermiso) {
        Permiso permiso = permisoRepository.findByNombre(nombrePermiso)
                .orElseThrow(() -> new RuntimeException("Permiso no encontrado: " + nombrePermiso));
        
        if (!rol.getPermisos().contains(permiso)) {
            rol.addPermiso(permiso);
        }
    }
} 