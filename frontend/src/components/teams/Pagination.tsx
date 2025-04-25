import { Box, Pagination as MuiPagination } from '@mui/material';

interface Props {
  loading: boolean;
  pagination: { pagina: number; total_paginas: number };
  onPageChange: (page: number) => void;
}

export default function Pagination({ loading, pagination, onPageChange }: Props) {
  if (loading || pagination.total_paginas < 1) return null;
  return (
    <Box display="flex" justifyContent="center" my={3}>
      <MuiPagination
        count={pagination.total_paginas}
        page={pagination.pagina}
        onChange={(_, p) => onPageChange(p)}
        color="primary"
      />
    </Box>
  );
}
