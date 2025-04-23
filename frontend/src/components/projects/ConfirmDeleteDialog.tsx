import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteDialog({ open, onClose, onConfirm }: Props) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      sx={{ 
        zIndex: 10000, // Higher z-index to prevent overlap
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.7)' // Darker backdrop for better visibility
        }
      }}
    >
      <DialogTitle>Eliminar Proyecto</DialogTitle>
      <DialogContent>
        <Typography>¿Estás seguro de que deseas eliminar este proyecto?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={onConfirm} color="error" variant="contained">Eliminar</Button>
      </DialogActions>
    </Dialog>
  );
}