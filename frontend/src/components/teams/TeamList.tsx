import { Table, TableHead, TableBody, TableRow, TableCell, IconButton, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Team } from '@/types/team';

interface TeamListProps {
  teams: Team[];
  loading: boolean;
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
}

export default function TeamList({ teams, loading, onEdit, onDelete }: TeamListProps) {
  if (loading) return <Typography>Cargando equipos...</Typography>;
  if (!teams.length) return <Typography>No hay equipos disponibles.</Typography>;

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Nombre</TableCell>
          <TableCell>Descripción</TableCell>
          <TableCell>Líder</TableCell>
          <TableCell align="right">Acciones</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {teams.map((team) => (
          <TableRow key={team.id}>
            <TableCell>{team.nombre}</TableCell>
            <TableCell>{team.descripcion}</TableCell>
            <TableCell>{team.lider_nombre}</TableCell>
            <TableCell align="right">
              <IconButton size="small" onClick={() => onEdit(team)}>
                <EditIcon />
              </IconButton>
              <IconButton size="small" onClick={() => onDelete(team)}>
                <DeleteIcon color="error" />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
