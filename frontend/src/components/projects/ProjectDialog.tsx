import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';

interface ProjectFormData {
  nombre: string;
  descripcion: string;
  fecha_inicio: Dayjs | null;
  fecha_fin: Dayjs | null;
  estado: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  isEditMode: boolean;
  formData: ProjectFormData;
  handleFormChange: (field: keyof ProjectFormData, value: string | Dayjs | null) => void;
  handleFormSubmit: () => void;
  formSubmitting: boolean;
}

export default function ProjectDialog({
  open, onClose, isEditMode, formData, handleFormChange, handleFormSubmit, formSubmitting
}: Props) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      sx={{ 
        zIndex: 10000, // Higher z-index to prevent overlap
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.7)' // Darker backdrop for better visibility
        }
      }}>
      <DialogTitle>{isEditMode ? 'Editar Proyecto' : 'Nuevo Proyecto'}</DialogTitle>
      <DialogContent>
        <TextField
          label="Nombre"
          value={formData.nombre}
          onChange={e => handleFormChange('nombre', e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Descripción"
          value={formData.descripcion}
          onChange={e => handleFormChange('descripcion', e.target.value)}
          fullWidth
          margin="normal"
          multiline
          minRows={2}
        />
        <TextField
          label="Fecha de inicio"
          type="date"
          value={formData.fecha_inicio ? formData.fecha_inicio.format('YYYY-MM-DD') : ''}
          onChange={e => handleFormChange('fecha_inicio', dayjs(e.target.value))}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          label="Fecha de fin"
          type="date"
          value={formData.fecha_fin ? formData.fecha_fin.format('YYYY-MM-DD') : ''}
          onChange={e => handleFormChange('fecha_fin', dayjs(e.target.value))}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Estado"
          select
          value={formData.estado}
          onChange={e => handleFormChange('estado', e.target.value)}
          fullWidth
          margin="normal"
        >
          <MenuItem value="planificado">Planificado</MenuItem>
          <MenuItem value="en progreso">En progreso</MenuItem>
          <MenuItem value="completado">Completado</MenuItem>
          <MenuItem value="cancelado">Cancelado</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={formSubmitting}>Cancelar</Button>
        <Button onClick={handleFormSubmit} variant="contained" disabled={formSubmitting}>
          {isEditMode ? 'Guardar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}