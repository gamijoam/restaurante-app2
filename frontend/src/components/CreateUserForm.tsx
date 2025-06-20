import { useState, type FormEvent } from 'react';
import { Button, TextField, Box, Select, MenuItem, InputLabel, FormControl, type SelectChangeEvent, OutlinedInput, Chip } from '@mui/material';
import { registerAPI } from '../services/authService';
import type { RegisterRequestDTO } from '../dto/authDTOs';

// Definimos las "props" que recibirá este componente
interface CreateUserFormProps {
    onUserCreated: () => void; // Una función para llamar cuando el usuario se cree con éxito
    onCancel: () => void;      // Una función para llamar al cancelar
}

const ROLES = ['CAMARERO', 'COCINERO', 'GERENTE']; // Roles disponibles

const CreateUserForm = ({ onUserCreated, onCancel }: CreateUserFormProps) => {
    const [formData, setFormData] = useState<RegisterRequestDTO>({
        username: '',
        password: '',
        nombre: '',
        email: '',
        roles: ['CAMARERO'] // Rol por defecto
    });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleRolesChange = (event: SelectChangeEvent<string[]>) => {
        const { target: { value } } = event;
        setFormData({
            ...formData,
            roles: typeof value === 'string' ? value.split(',') : value,
        });
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        try {
            await registerAPI(formData);
            alert('Usuario creado con éxito');
            onUserCreated(); // Avisamos al componente padre que hemos terminado
        } catch (err) {
            setError('Error al crear el usuario. El username o email ya podrían existir.');
            console.error(err);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField margin="normal" required fullWidth label="Nombre de Usuario" name="username" value={formData.username} onChange={handleChange} />
            <TextField margin="normal" required fullWidth label="Contraseña" name="password" type="password" value={formData.password} onChange={handleChange} />
            <TextField margin="normal" required fullWidth label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} />
            <TextField margin="normal" required fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
            <FormControl fullWidth margin="normal">
                <InputLabel id="roles-select-label">Roles</InputLabel>
                <Select
                    labelId="roles-select-label"
                    multiple
                    value={formData.roles}
                    name="roles"
                    onChange={handleRolesChange}
                    input={<OutlinedInput label="Roles" />}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => <Chip key={value} label={value} />)}
                        </Box>
                    )}
                >
                    {ROLES.map((rol) => (
                        <MenuItem key={rol} value={rol}>{rol}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button onClick={onCancel}>Cancelar</Button>
                <Button type="submit" variant="contained">Crear</Button>
            </Box>
        </Box>
    );
};

export default CreateUserForm;