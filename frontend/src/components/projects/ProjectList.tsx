import { Box, CircularProgress, Typography } from '@mui/material';
import { Project } from '../../types/project';
import ProjectCard from './ProjectCard';

interface Props {
  projects: Project[];
  loading: boolean;
  handleViewProject: (id: string) => void;
  handleMenuOpen: (e: React.MouseEvent<HTMLElement>, id: string) => void;
  getStatusClass: (status: string) => string;
  menuAnchorEl: null | HTMLElement;
  handleMenuClose: () => void;
  handleEditProject: () => void;
  handleDeleteClick: () => void;
  selectedProjectId: string | null;
}

export default function ProjectList({
  projects, loading, handleViewProject, handleMenuOpen,
  getStatusClass, menuAnchorEl, handleMenuClose,
  handleEditProject, handleDeleteClick, selectedProjectId
}: Props) {
  if (loading) return <Box display="flex" justifyContent="center"><CircularProgress /></Box>;
  if (!projects.length) return <Typography>No hay proyectos.</Typography>;
  return (
    <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(320px, 1fr))" gap={3} mb={4}>
      {projects.map(project => (
        <ProjectCard
          key={project.id}
          project={project}
          onView={() => handleViewProject(project.id)}
          onMenuOpen={e => handleMenuOpen(e, project.id)}
          getStatusClass={getStatusClass}
          menuAnchorEl={menuAnchorEl}
          handleMenuClose={handleMenuClose}
          handleEditProject={handleEditProject}
          handleDeleteClick={handleDeleteClick}
          isMenuOpen={selectedProjectId === project.id}
        />
      ))}
    </Box>
  );
}