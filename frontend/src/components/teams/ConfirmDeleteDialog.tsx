import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteDialog({ open, onClose, onConfirm }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs">
      <DialogTitle>Eliminar Equipo</DialogTitle>
      <DialogContent>
        <Typography>¿Estás seguro de que deseas eliminar este equipo?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={onConfirm} color="error" variant="contained">Eliminar</Button>
      </DialogActions>
    </Dialog>
  );
}
