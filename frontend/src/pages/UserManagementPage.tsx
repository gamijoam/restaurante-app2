import { useState, useEffect } from 'react';
import type { UsuarioResponseDTO } from '../types';
import { getUsuarios } from '../services/usuarioService';
import { Container, Typography, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Dialog, DialogTitle, DialogContent } from '@mui/material';
import CreateUserForm from '../components/CreateUserForm'; // <-- 1. Importamos nuestro formulario

const UserManagementPage = () => {
    const [usuarios, setUsuarios] = useState<UsuarioResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // 2. Añadimos un estado para controlar si el modal está abierto
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchUsuarios = async () => {
        try {
            const data = await getUsuarios();
            setUsuarios(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('No tienes permiso para ver esta página o hubo un error.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const handleUserCreated = () => {
        setIsModalOpen(false); // Cierra el modal
        fetchUsuarios(); // Refresca la lista de usuarios
    };

    if (loading) return <Container sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ py: 8 }}><Alert severity="error">{error}</Alert></Container>;

    return (
        <>
            <Container sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" component="h1">
                        Gestión de Usuarios
                    </Typography>
                    {/* 3. Añadimos el botón para abrir el modal */}
                    <Button variant="contained" onClick={() => setIsModalOpen(true)}>
                        Crear Usuario
                    </Button>
                </Box>
                <TableContainer component={Paper}>
                    {/* ... (el código de la tabla no cambia) ... */}
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Username</TableCell>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Roles</TableCell>
                                <TableCell>Activo</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {usuarios.map((usuario) => (
                                <TableRow key={usuario.id}>
                                    <TableCell>{usuario.id}</TableCell>
                                    <TableCell>{usuario.username}</TableCell>
                                    <TableCell>{usuario.nombre} {usuario.apellido}</TableCell>
                                    <TableCell>{usuario.email}</TableCell>
                                    <TableCell>{usuario.roles.join(', ')}</TableCell>
                                    <TableCell>{usuario.activo ? 'Sí' : 'No'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>

            {/* 4. Añadimos el componente de Diálogo (Modal) */}
            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <DialogTitle>Registrar Nuevo Empleado</DialogTitle>
                <DialogContent>
                    <CreateUserForm 
                        onUserCreated={handleUserCreated} 
                        onCancel={() => setIsModalOpen(false)} 
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};

export default UserManagementPage;