'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  IconButton,
  Divider,
  FormHelperText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../../../types/task';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { userService } from '@/services/userService';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (taskData: CreateTaskRequest | (UpdateTaskRequest & { id: string })) => void;
  task?: Task;
  isLoading: boolean;
  projectOptions: { value: string; label: string }[];
  users: { id: string; nombre: string }[];
  loadingUsers: boolean;
  errorUsers: string | null;
  onProjectChange?: (projectId: string | null) => void;
  teamOptions: { value: string; label: string }[];
  loadingTeams: boolean;
  errorTeams: string | null;
}

/**
 * Esquema de validación para el formulario de tareas
 */
const taskFormSchema = z.object({
  titulo: z.string()
    .min(1, 'El título es requerido')
    .max(100, 'El título no puede tener más de 100 caracteres'),
  descripcion: z.string()
    .max(500, 'La descripción no puede tener más de 500 caracteres')
    .optional(),
  estado: z.string().min(1, 'El estado es requerido'),
  prioridad: z.string().min(1, 'La prioridad es requerida'),
  proyecto_id: z.string().min(1, 'El proyecto es requerido'),
  equipo_id: z.string().min(1, 'El equipo es requerido'),
  fecha_vencimiento: z.date().nullable(),
  asignado_a: z.string().optional()
});

type TaskFormInputs = z.infer<typeof taskFormSchema>;

/**
 * Componente de formulario para crear o editar tareas
 */
const TaskForm = ({
  open,
  onClose,
  onSave,
  task,
  isLoading,
  projectOptions,
  users,
  loadingUsers,
  errorUsers,
  onProjectChange,
  teamOptions,
  loadingTeams,
  errorTeams,
}: TaskFormProps) => {
  const isEditMode = !!task;
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(
    task?.fecha_vencimiento ? dayjs(task.fecha_vencimiento) : null
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TaskFormInputs>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      titulo: task?.titulo || '',
      descripcion: task?.descripcion || '',
      estado: task?.estado || 'pendiente',
      prioridad: task?.prioridad || 'media',
      proyecto_id: task?.proyecto_id || '',
      equipo_id: task?.equipo_id || '',
      fecha_vencimiento: task?.fecha_vencimiento ? dayjs(task.fecha_vencimiento).toDate() : null,
      asignado_a: task?.asignado_a || '',
    },
  });

  const selectedProjectId = watch('proyecto_id');

  useEffect(() => {
    if (open) {
      const defaultProjectId = task?.proyecto_id || '';
      reset({
        titulo: task?.titulo || '',
        descripcion: task?.descripcion || '',
        estado: (task?.estado || 'pendiente') as 'pendiente' | 'en progreso' | 'completada' | 'bloqueada',
        prioridad: (task?.prioridad || 'media') as 'baja' | 'media' | 'alta',
        proyecto_id: defaultProjectId,
        equipo_id: task?.equipo_id || '',
        fecha_vencimiento: task?.fecha_vencimiento ? dayjs(task.fecha_vencimiento).toDate() : null,
        asignado_a: (task?.proyecto_id === defaultProjectId && task?.asignado_a) ? task.asignado_a : '',
      });
      setSelectedDate(task?.fecha_vencimiento ? dayjs(task.fecha_vencimiento) : null);
      onProjectChange?.(defaultProjectId || null);
    }
  }, [open, task, reset]);

  useEffect(() => {
    const currentAssignee = watch('asignado_a');
    if (currentAssignee) {
      const isValidAssignee = users.some(user => user.id === currentAssignee);
      if (!isValidAssignee) {
        setValue('asignado_a', ''); // Clear if the current assignee is no longer valid
      }
    }
  }, [selectedProjectId, users, setValue, watch]);

  useEffect(() => {
    // Also clear team selection when project changes
    setValue('equipo_id', '');
  }, [selectedProjectId, setValue]);

  const onSubmit = (data: TaskFormInputs) => {
    if (task) {
      const updateData: UpdateTaskRequest = {
        titulo: data.titulo,
        descripcion: data.descripcion || undefined,
        estado: data.estado as 'pendiente' | 'en progreso' | 'completada' | 'bloqueada',
        prioridad: data.prioridad as 'baja' | 'media' | 'alta',
        fecha_vencimiento: data.fecha_vencimiento ? data.fecha_vencimiento.toISOString() : undefined,
        asignado_a: data.asignado_a || undefined
      };
      onSave({ id: task.id, ...updateData });
    } else {
      const createData: CreateTaskRequest = {
        titulo: data.titulo,
        descripcion: data.descripcion || undefined,
        estado: data.estado as 'pendiente' | 'en progreso' | 'completada' | 'bloqueada',
        prioridad: data.prioridad as 'baja' | 'media' | 'alta',
        fecha_vencimiento: data.fecha_vencimiento ? data.fecha_vencimiento.toISOString() : undefined,
        equipo_id: data.equipo_id,
        asignado_a: data.asignado_a || undefined
      };
      onSave(createData);
    }
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setSelectedDate(date);
    setValue('fecha_vencimiento', date ? date.toDate() : null);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
    >
      <DialogTitle className="flex justify-between items-center">
        <Typography variant="h6" component="span">
          {isEditMode ? 'Editar tarea' : 'Crear nueva tarea'}
        </Typography>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Divider />
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="titulo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Título de la tarea"
                    error={!!errors.titulo}
                    helperText={errors.titulo?.message}
                    variant="outlined"
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="descripcion"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Descripción"
                    multiline
                    rows={4}
                    error={!!errors.descripcion}
                    helperText={errors.descripcion?.message}
                    variant="outlined"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="proyecto_id"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={!!errors.proyecto_id}
                    variant="outlined"
                    required
                  >
                    <InputLabel>Proyecto</InputLabel>
                    <Select
                      {...field}
                      label="Proyecto"
                      onChange={(e) => {
                        const newProjectId = (e.target as HTMLInputElement).value;
                        // Update form value to selected project
                        field.onChange(newProjectId);
                        // Clear team selection when project changes
                        setValue('equipo_id', '');
                        // Notify parent to fetch members/teams
                        onProjectChange?.(newProjectId);
                      }}
                    >
                      <MenuItem value="">Seleccionar proyecto</MenuItem>
                      {projectOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.proyecto_id && (
                      <FormHelperText>{errors.proyecto_id.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="equipo_id"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={!!errors.equipo_id}
                    variant="outlined"
                    required
                  >
                    <InputLabel>Equipo</InputLabel>
                    <Select
                      {...field}
                      label="Equipo"
                      disabled={!selectedProjectId || loadingTeams}
                    >
                      <MenuItem value="">Seleccionar equipo</MenuItem>
                      {teamOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.equipo_id && (
                      <FormHelperText>{errors.equipo_id.message}</FormHelperText>
                    )}
                    {errorTeams && (
                      <FormHelperText error>{errorTeams}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="estado"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={!!errors.estado}
                    variant="outlined"
                    required
                  >
                    <InputLabel>Estado</InputLabel>
                    <Select
                      {...field}
                      label="Estado"
                    >
                      <MenuItem value="pendiente">Pendiente</MenuItem>
                      <MenuItem value="en progreso">En progreso</MenuItem>
                      <MenuItem value="completada">Completada</MenuItem>
                      <MenuItem value="bloqueada">Bloqueada</MenuItem>
                    </Select>
                    {errors.estado && (
                      <FormHelperText>{errors.estado.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="prioridad"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={!!errors.prioridad}
                    variant="outlined"
                    required
                  >
                    <InputLabel>Prioridad</InputLabel>
                    <Select
                      {...field}
                      label="Prioridad"
                    >
                      <MenuItem value="baja">Baja</MenuItem>
                      <MenuItem value="media">Media</MenuItem>
                      <MenuItem value="alta">Alta</MenuItem>
                    </Select>
                    {errors.prioridad && (
                      <FormHelperText>{errors.prioridad.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Controller
                  name="fecha_vencimiento"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Fecha de vencimiento"
                      value={selectedDate}
                      onChange={(date: any) => handleDateChange(date)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          variant="outlined"
                          error={!!errors.fecha_vencimiento}
                          helperText={errors.fecha_vencimiento?.message}
                        />
                      )}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="asignado_a"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={!!errors.asignado_a || !!errorUsers}
                    variant="outlined"
                  >
                    <InputLabel>Asignar a</InputLabel>
                    <Select
                      {...field}
                      label="Asignar a"
                      value={field.value || ''}
                      disabled={loadingUsers}
                    >
                      <MenuItem value="" disabled={!selectedProjectId}>
                        <em>{selectedProjectId ? (loadingUsers ? 'Cargando...' : 'Sin asignar') : 'Seleccione un proyecto primero'}</em>
                      </MenuItem>
                      {!loadingUsers && !errorUsers && users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                    {(errors.asignado_a || errorUsers) && (
                      <FormHelperText>{errors.asignado_a?.message || errorUsers}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <Divider />
        
        <DialogActions className="p-4">
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskForm;
