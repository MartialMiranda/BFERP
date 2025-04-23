import { Box, Pagination as MuiPagination } from '@mui/material';
import { Project as ProjectType } from '../../types/project';

interface Props {
  loading: boolean;
  projects: ProjectType[];
  pagination: { pagina: number; total_paginas: number; };
  handlePageChange: (page: number) => void;
}

export default function Pagination({ loading, projects, pagination, handlePageChange }: Props) {
  if (loading || !projects.length) return null;
  return (
    <Box display="flex" justifyContent="center" my={3}>
      <MuiPagination
        count={pagination.total_paginas}
        page={pagination.pagina}
        onChange={(_, page) => handlePageChange(page)}
        color="primary"
      />
    </Box>
  );
}