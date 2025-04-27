import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  title = 'Eliminar Equipo',
  message = '¿Estás seguro de que deseas eliminar este equipo?',
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{cancelText}</Button>
        <Button onClick={onConfirm} color="error" variant="contained">{confirmText}</Button>
      </DialogActions>
    </Dialog>
  );
}
