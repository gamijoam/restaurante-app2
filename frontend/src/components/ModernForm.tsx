import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Switch,
  Slider,
  Chip,
  Autocomplete,
  InputAdornment,
  IconButton,
  Collapse,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Search,
  Clear,
  Add,
  Remove,
} from '@mui/icons-material';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'switch' | 'slider' | 'autocomplete';
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    custom?: (value: any) => string | null;
  };
  options?: { value: any; label: string }[];
  multiple?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  grid?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

interface ModernFormProps {
  fields: FormField[];
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  initialValues?: any;
  submitText?: string;
  cancelText?: string;
  showCancel?: boolean;
  layout?: 'vertical' | 'horizontal';
  spacing?: number;
  sx?: any;
}

const ModernForm: React.FC<ModernFormProps> = ({
  fields,
  onSubmit,
  onCancel,
  title,
  subtitle,
  loading = false,
  initialValues = {},
  submitText = 'Guardar',
  cancelText = 'Cancelar',
  showCancel = true,
  layout = 'vertical',
  spacing = 2,
  sx,
}) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || value === '')) {
      return `${field.label} es requerido`;
    }

    if (value && field.validation) {
      const { validation } = field;

      if (validation.pattern && !validation.pattern.test(value)) {
        return `${field.label} no tiene el formato correcto`;
      }

      if (validation.minLength && value.length < validation.minLength) {
        return `${field.label} debe tener al menos ${validation.minLength} caracteres`;
      }

      if (validation.maxLength && value.length > validation.maxLength) {
        return `${field.label} debe tener máximo ${validation.maxLength} caracteres`;
      }

      if (validation.min !== undefined && Number(value) < validation.min) {
        return `${field.label} debe ser mayor a ${validation.min}`;
      }

      if (validation.max !== undefined && Number(value) > validation.max) {
        return `${field.label} debe ser menor a ${validation.max}`;
      }

      if (validation.custom) {
        return validation.custom(value);
      }
    }

    return null;
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [fieldName]: value }));
    
    const field = fields.find(f => f.name === fieldName);
    if (field) {
      const error = validateField(field, value);
      setErrors((prev: Record<string, string>) => ({ ...prev, [fieldName]: error || '' }));
    }
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouched((prev: Record<string, boolean>) => ({ ...prev, [fieldName]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('ModernForm handleSubmit called');
    console.log('Form data:', formData);
    console.log('Errors:', errors);
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    setTouched((prev: Record<string, boolean>) => {
      const newTouched = { ...prev };
      fields.forEach(field => {
        newTouched[field.name] = true;
      });
      return newTouched;
    });

    // If no errors, submit
    if (Object.keys(newErrors).length === 0) {
      console.log('No errors, calling onSubmit with:', formData);
      onSubmit(formData);
    } else {
      console.log('Validation errors found:', newErrors);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];
    const isTouched = touched[field.name];
    const showError = isTouched && error;

    const commonProps = {
      fullWidth: true,
      label: field.label,
      placeholder: field.placeholder,
      helperText: showError ? error : field.helperText,
      error: !!showError,
      disabled: field.disabled || loading,
      required: field.required,
      onBlur: () => handleFieldBlur(field.name),
      sx: { mb: 1 },
    };

    switch (field.type) {
      case 'password':
        return (
          <TextField
            {...commonProps}
            type={showPassword[field.name] ? 'text' : 'password'}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev: Record<string, boolean>) => ({ ...prev, [field.name]: !prev[field.name] }))}
                    edge="end"
                  >
                    {showPassword[field.name] ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              startAdornment: field.startAdornment,
            }}
          />
        );

      case 'textarea':
        return (
          <TextField
            {...commonProps}
            multiline
            rows={4}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            InputProps={{
              startAdornment: field.startAdornment,
              endAdornment: field.endAdornment,
            }}
          />
        );

      case 'select':
        return (
          <FormControl {...commonProps} error={!!showError}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              label={field.label}
              multiple={field.multiple}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {showError && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!value}
                onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                disabled={field.disabled || loading}
              />
            }
            label={field.label}
            sx={{ mb: 1 }}
          />
        );

      case 'radio':
        return (
          <FormControl {...commonProps} error={!!showError}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {field.label}
            </Typography>
            <RadioGroup
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
            >
              {field.options?.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
            {showError && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      case 'switch':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={!!value}
                onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                disabled={field.disabled || loading}
              />
            }
            label={field.label}
            sx={{ mb: 1 }}
          />
        );

      case 'slider':
        return (
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {field.label}
            </Typography>
            <Slider
              value={value || 0}
              onChange={(e, newValue) => handleFieldChange(field.name, newValue)}
              disabled={field.disabled || loading}
              min={field.validation?.min}
              max={field.validation?.max}
              marks
              valueLabelDisplay="auto"
            />
          </Box>
        );

      case 'autocomplete':
        return (
          <Autocomplete
            options={field.options || []}
            getOptionLabel={(option) => option.label}
            value={field.multiple 
              ? (field.options || []).filter(opt => 
                  Array.isArray(value) && value.includes(opt.value)
                )
              : (field.options || []).find(opt => opt.value === value) || null
            }
            onChange={(e, newValue) => {
              if (field.multiple) {
                const selectedValues = Array.isArray(newValue) 
                  ? newValue.map((opt: any) => opt.value)
                  : [];
                handleFieldChange(field.name, selectedValues);
              } else {
                handleFieldChange(field.name, (newValue as any)?.value || '');
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                {...commonProps}
                error={!!showError}
                helperText={showError ? error : field.helperText}
              />
            )}
            disabled={field.disabled || loading}
            multiple={field.multiple}
            renderTags={(selectedOptions, getTagProps) =>
              selectedOptions.map((option, index) => (
                <Chip
                  label={option.label}
                  {...getTagProps({ index })}
                  size="small"
                />
              ))
            }
          />
        );

      default:
        return (
          <TextField
            {...commonProps}
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            InputProps={{
              startAdornment: field.startAdornment,
              endAdornment: field.endAdornment,
            }}
          />
        );
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={sx}>
      {title && (
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
          {title}
        </Typography>
      )}
      
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {subtitle}
        </Typography>
      )}

      <Grid container spacing={spacing}>
        {fields.filter(field => !field.hidden).map((field) => (
          <Grid
            item
            key={field.name}
            xs={field.grid?.xs || 12}
            sm={field.grid?.sm || field.grid?.xs || 12}
            md={field.grid?.md || field.grid?.sm || field.grid?.xs || 12}
            lg={field.grid?.lg || field.grid?.md || field.grid?.sm || field.grid?.xs || 12}
          >
            {renderField(field)}
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
          sx={{ minWidth: 120 }}
          onClick={() => console.log('Submit button clicked')}
        >
          {submitText}
        </Button>
        
        {showCancel && onCancel && (
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ModernForm; 