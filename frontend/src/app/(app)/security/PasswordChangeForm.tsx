import React, { useState } from 'react';
import { Box, Button, TextField, Alert, CircularProgress } from '@mui/material';
import { authService } from '../../../services/authService';

const PasswordChangeForm: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      const resp = await authService.changePassword(currentPassword, newPassword, confirmNewPassword);
      setSuccess(resp.message || 'Contraseña actualizada correctamente.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err?.response?.data?.errors?.length) {
        setError(err.response.data.errors[0].msg);
      } else {
        setError('Error al cambiar la contraseña.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {success && <Alert severity="success">{success}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Contraseña actual"
        type="password"
        value={currentPassword}
        onChange={e => setCurrentPassword(e.target.value)}
        required
        autoComplete="current-password"
      />
      <TextField
        label="Nueva contraseña"
        type="password"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        required
        autoComplete="new-password"
        helperText="Mínimo 8 caracteres."
      />
      <TextField
        label="Confirmar nueva contraseña"
        type="password"
        value={confirmNewPassword}
        onChange={e => setConfirmNewPassword(e.target.value)}
        required
        autoComplete="new-password"
      />
      <Button type="submit" variant="contained" color="primary" disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Cambiar contraseña'}
      </Button>
    </Box>
  );
};

export default PasswordChangeForm;
