import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TableSortLabel, Paper, Box, Typography, IconButton, Tooltip, useTheme, useMediaQuery } from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';

interface Column {
  id: string;
  label: string;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
}

interface ModernTableProps {
  columns: Column[];
  data: any[];
  title?: string;
  pagination?: boolean;
  searchable?: boolean;
  selectable?: boolean;
  actions?: boolean;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onView?: (row: any) => void;
  onRowClick?: (row: any) => void;
  rowsPerPageOptions?: number[];
  emptyMessage?: string;
  sx?: any;
}

const ModernTable: React.FC<ModernTableProps> = ({
  columns,
  data,
  title,
  pagination = true,
  actions = false,
  onEdit,
  onDelete,
  onView,
  onRowClick,
  rowsPerPageOptions = [5, 10, 25],
  emptyMessage = 'No hay datos disponibles',
  sx,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [orderBy, setOrderBy] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (columnId: string) => {
    const isAsc = orderBy === columnId && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnId);
  };

  const sortedData = React.useMemo(() => {
    if (!orderBy) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      
      if (order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [data, orderBy, order]);

  const paginatedData = pagination 
    ? sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : sortedData;

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderCell = (column: Column, row: any) => {
    const value = row[column.id];
    
    if (column.render) {
      return column.render(value, row);
    }
    
    return value;
  };

  const renderActions = (row: any) => (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {onView && (
        <Tooltip title="Ver detalles">
          <IconButton size="small" onClick={() => onView(row)}>
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {onEdit && (
        <Tooltip title="Editar">
          <IconButton size="small" onClick={() => onEdit(row)}>
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip title="Eliminar">
          <IconButton size="small" onClick={() => onDelete(row)}>
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <Box sx={{ ...sx }}>
        {title && (
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {title}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {paginatedData.map((row, index) => (
            <Paper
              key={index}
              sx={{
                p: 2,
                borderRadius: 2,
                cursor: onRowClick ? 'pointer' : 'default',
                '&:hover': onRowClick ? {
                  backgroundColor: 'action.hover',
                } : {},
              }}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <Box key={column.id} sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {column.label}
                  </Typography>
                  <Typography variant="body2">
                    {renderCell(column, row)}
                  </Typography>
                </Box>
              ))}
              {actions && renderActions(row)}
            </Paper>
          ))}
        </Box>
        
        {pagination && (
          <TablePagination
            component="div"
            count={sortedData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={rowsPerPageOptions}
          />
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ ...sx }}>
      {title && (
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {title}
        </Typography>
      )}
      
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'background.light' }}>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sortDirection={orderBy === column.id ? order : false}
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    width: column.width,
                  }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {actions && (
                <TableCell align="center" sx={{ width: 120 }}>
                  Acciones
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    py: 4 
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      {emptyMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  key={index}
                  hover
                  onClick={() => onRowClick?.(row)}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align || 'left'}
                      sx={{
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      {renderCell(column, row)}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell align="center">
                      {renderActions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {pagination && (
        <TablePagination
          component="div"
          count={sortedData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      )}
    </Box>
  );
};

export default ModernTable; 