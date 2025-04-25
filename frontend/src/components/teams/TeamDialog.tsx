import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText } from '@mui/material';
import { Team } from '@/types/team';
import { Project } from '@/types/project';
import { User } from '@/types/user';

interface TeamDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { nombre: string; descripcion?: string; proyecto_id: string; miembros?: string[] }) => void;
  team?: Team & { miembros?: { usuario_id: string }[] } | null;
  projects: Project[];
  users: User[];
}

export default function TeamDialog({ open, onClose, onSave, team, projects, users }: TeamDialogProps) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [projectId, setProjectId] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (team) {
      setNombre(team.nombre);
      setDescripcion(team.descripcion || '');
      setProjectId(team.proyecto_id || '');
      setSelectedMembers(team.miembros?.map((m) => m.usuario_id) || []);
    } else if (projects.length) {
      setProjectId(projects[0].id);
      setSelectedMembers([]);
    }
  }, [team, projects]);

  const handleSubmit = () => {
    setTouched(true);
    if (!projectId) return;
    onSave({ nombre, descripcion: descripcion || undefined, proyecto_id: projectId, miembros: selectedMembers });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{team ? 'Editar Equipo' : 'Crear Equipo'}</DialogTitle>
      <DialogContent dividers>
        <FormControl margin="dense" fullWidth required error={touched && !projectId}>
          <InputLabel id="project-label">Proyecto</InputLabel>
          <Select
            labelId="project-label"
            value={projectId}
            label="Proyecto"
            onOpen={() => setTouched(true)}
            onChange={(e) => setProjectId(e.target.value)}
          >
            {projects.map((p) => (
              <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl margin="dense" fullWidth>
          <InputLabel id="members-label">Miembros</InputLabel>
          <Select
            labelId="members-label"
            multiple
            value={selectedMembers}
            label="Miembros"
            onChange={(e) => setSelectedMembers(e.target.value as string[])}
            renderValue={(selected) =>
              (selected as string[])
                .map((id) => users.find((u) => u.id === id)?.nombre || id)
                .join(', ')
            }
          >
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                <Checkbox checked={selectedMembers.indexOf(user.id) > -1} />
                <ListItemText primary={user.nombre} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          label="Nombre"
          fullWidth
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Descripción"
          fullWidth
          multiline
          rows={3}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {team ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
