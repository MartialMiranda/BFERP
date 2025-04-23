import { Card, CardContent, Typography, IconButton, Menu, MenuItem, Chip, Box } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Project } from '../../types/project';

interface Props {
  project: Project;
  onView: () => void;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>) => void;
  getStatusClass: (status: string) => string;
  menuAnchorEl: null | HTMLElement;
  handleMenuClose: () => void;
  handleEditProject: () => void;
  handleDeleteClick: () => void;
  isMenuOpen: boolean;
}

export default function ProjectCard({
  project, onView, onMenuOpen, getStatusClass,
  menuAnchorEl, handleMenuClose, handleEditProject, handleDeleteClick, isMenuOpen
}: Props) {
  return (
    <Card sx={{ cursor: 'pointer', position: 'relative' }} onClick={onView}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{project.nombre}</Typography>
          <IconButton onClick={e => { e.stopPropagation(); onMenuOpen(e); }}>
            <MoreVertIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" color="textSecondary" mb={1}>{project.descripcion}</Typography>
        <Chip label={project.estado} className={getStatusClass(project.estado)} size="small" />
        {/* Puedes agregar más info aquí */}
      </CardContent>
      <Menu
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        onClick={e => e.stopPropagation()}
      >
        <MenuItem onClick={handleEditProject}>Editar</MenuItem>
        <MenuItem onClick={handleDeleteClick}>Eliminar</MenuItem>
      </Menu>
    </Card>
  );
}