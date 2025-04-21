/**
 * Utilidades para validación de parámetros API
 * Previene errores de validación comunes en peticiones al backend
 */

export interface TaskQueryParams {
  titulo?: string;
  estado?: 'pendiente' | 'en progreso' | 'completada' | '';
  prioridad?: 'baja' | 'media' | 'alta' | '';
  proyecto_id?: string;
  asignado_a?: string;
  ordenar_por?: string;
  orden?: 'asc' | 'desc';
  pagina?: number;
  por_pagina?: number;
}

export interface ProjectQueryParams {
  nombre?: string;
  estado?: 'activo' | 'completado' | 'cancelado' | '';
  ordenar_por?: string;
  orden?: 'asc' | 'desc';
  pagina?: number;
  por_pagina?: number;
}

/**
 * Valida y limpia parámetros de consulta para tareas
 * @param params Parámetros originales
 * @returns Parámetros validados
 */
export const validateTaskQueryParams = (params: TaskQueryParams): TaskQueryParams => {
  const validatedParams: TaskQueryParams = { ...params };

  // Validar estado
  if (validatedParams.estado !== undefined) {
    if (!['pendiente', 'en progreso', 'completada'].includes(validatedParams.estado)) {
      delete validatedParams.estado;
    }
  }

  // Validar prioridad
  if (validatedParams.prioridad !== undefined) {
    if (!['baja', 'media', 'alta'].includes(validatedParams.prioridad)) {
      delete validatedParams.prioridad;
    }
  }

  // Validar IDs
  if (validatedParams.proyecto_id === '') {
    delete validatedParams.proyecto_id;
  }

  if (validatedParams.asignado_a === '') {
    delete validatedParams.asignado_a;
  }

  // Asegurar que pagina y por_pagina sean números válidos
  if (validatedParams.pagina !== undefined) {
    validatedParams.pagina = Math.max(1, validatedParams.pagina);
  }

  if (validatedParams.por_pagina !== undefined) {
    validatedParams.por_pagina = Math.min(100, Math.max(1, validatedParams.por_pagina));
  }

  return validatedParams;
};

/**
 * Valida y limpia parámetros de consulta para proyectos
 * @param params Parámetros originales
 * @returns Parámetros validados
 */
export const validateProjectQueryParams = (params: ProjectQueryParams): ProjectQueryParams => {
  const validatedParams: ProjectQueryParams = { ...params };

  // Validar estado
  if (validatedParams.estado !== undefined) {
    if (!['activo', 'completado', 'cancelado'].includes(validatedParams.estado)) {
      delete validatedParams.estado;
    }
  }

  // Asegurar que pagina y por_pagina sean números válidos
  if (validatedParams.pagina !== undefined) {
    validatedParams.pagina = Math.max(1, validatedParams.pagina);
  }

  if (validatedParams.por_pagina !== undefined) {
    validatedParams.por_pagina = Math.min(100, Math.max(1, validatedParams.por_pagina));
  }

  return validatedParams;
};

/**
 * Convierte un objeto de parámetros a string de query para URL
 * @param params Objeto de parámetros
 * @returns String de query para URL
 */
export const buildQueryString = (params: Record<string, any>): string => {
  const validParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  
  return validParams ? `?${validParams}` : '';
};
