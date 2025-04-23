/**
 * Consulta para obtener proyectos
 * Siguiendo el patrón CQRS para separar operaciones de lectura
 */
const { db } = require('../../../config/database');
const winston = require('winston');

// Configuración del logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

/**
 * Obtiene todos los proyectos a los que tiene acceso un usuario
 * @param {string} usuarioId - ID del usuario
 * @param {Object} filtros - Filtros para la consulta
 * @returns {Promise<Array>} - Lista de proyectos
 */
async function execute(usuarioId, filtros = {}) {
  try {
    logger.info(`Consultando proyectos para usuario: ${usuarioId}`);
    
    // Construir la consulta base - Volvemos a una consulta más simple que sabemos que funciona
    let query = `
      SELECT p.*, 
         u.nombre as creador_nombre,
         COUNT(t.id) as total_tareas,
         COUNT(CASE WHEN t.estado = 'completada' THEN 1 END) as tareas_completadas
      FROM proyectos p
      LEFT JOIN usuarios u ON p.creado_por = u.id
      LEFT JOIN tareas t ON t.proyecto_id = p.id
      LEFT JOIN equipo_usuarios eu ON eu.usuario_id = $1
      LEFT JOIN equipos e ON e.id = eu.equipo_id
      WHERE (p.creado_por = $1 OR eu.usuario_id = $1)
    `;
    
    const queryParams = [usuarioId];
    let paramCount = 2;
    
    // Aplicar filtros
    const whereClauses = [];
    
    // Filtro por estado
    if (filtros.estado) {
      whereClauses.push(`p.estado = $${paramCount++}`);
      queryParams.push(filtros.estado);
    }
    
    // Filtro por nombre (búsqueda parcial)
    if (filtros.nombre) {
      whereClauses.push(`p.nombre ILIKE $${paramCount++}`);
      queryParams.push(`%${filtros.nombre}%`);
    }
    
    // Filtro por fecha de inicio (rango)
    if (filtros.fecha_inicio_desde) {
      whereClauses.push(`p.fecha_inicio >= $${paramCount++}`);
      queryParams.push(filtros.fecha_inicio_desde);
    }
    
    if (filtros.fecha_inicio_hasta) {
      whereClauses.push(`p.fecha_inicio <= $${paramCount++}`);
      queryParams.push(filtros.fecha_inicio_hasta);
    }
    
    // Filtro por fecha de fin (rango)
    if (filtros.fecha_fin_desde) {
      whereClauses.push(`p.fecha_fin >= $${paramCount++}`);
      queryParams.push(filtros.fecha_fin_desde);
    }
    
    if (filtros.fecha_fin_hasta) {
      whereClauses.push(`p.fecha_fin <= $${paramCount++}`);
      queryParams.push(filtros.fecha_fin_hasta);
    }
    
    // Añadir cláusulas WHERE adicionales si hay filtros
    if (whereClauses.length > 0) {
      query += ` AND ${whereClauses.join(' AND ')}`;
      logger.info(`Filtros aplicados: ${whereClauses.join(' AND ')}`);
    }
    
    // Agrupamos por ID del proyecto para contar tareas correctamente
    query += ` GROUP BY p.id, u.nombre`;
    
    // Añadir ordenamiento
    query += ` ORDER BY `;
    
    if (filtros.ordenar_por) {
      // Validar los campos permitidos para ordenar
      const camposValidos = ['nombre', 'fecha_inicio', 'fecha_fin', 'estado', 'creado_en'];
      let campoOrden = 'p.creado_en'; // Valor por defecto
      
      if (camposValidos.includes(filtros.ordenar_por)) {
        campoOrden = `p.${filtros.ordenar_por}`;
      }
      
      // Validar el orden (asc/desc)
      const direccion = (filtros.orden && filtros.orden.toLowerCase() === 'asc') ? 'ASC' : 'DESC';
      
      logger.info(`Ordenando por: ${campoOrden} ${direccion}`);
      query += `${campoOrden} ${direccion}`;
    } else {
      query += 'p.creado_en DESC';
    }
    
    // Paginación
    const pagina = filtros.pagina || 1;
    const porPagina = filtros.por_pagina || 10;
    const offset = (pagina - 1) * porPagina;
    
    // Para depurar, registramos la consulta completa
    logger.info(`Consulta SQL: ${query}`);
    logger.info(`Parámetros: ${JSON.stringify(queryParams)}`);
    
    query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    queryParams.push(porPagina, offset);
    
    // Ejecutar la consulta
    const proyectos = await db.manyOrNone(query, queryParams);
    
    // Consulta para obtener el total de proyectos (para la paginación)
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) 
      FROM proyectos p
      LEFT JOIN equipo_usuarios eu ON eu.usuario_id = $1
      LEFT JOIN equipos e ON e.id = eu.equipo_id
      WHERE p.creado_por = $1 OR eu.usuario_id = $1
    `;
    
    // Aplicar los mismos filtros a la consulta de conteo
    if (whereClauses.length > 0) {
      countQuery += ` AND ${whereClauses.join(' AND ')}`;
    }
    
    const countParams = queryParams.slice(0, paramCount - 2); // Excluir parámetros de LIMIT y OFFSET
    
    // Para depurar, registramos la consulta de conteo
    logger.info(`Consulta de conteo: ${countQuery}`);
    logger.info(`Parámetros de conteo: ${JSON.stringify(countParams)}`);
    const totalCount = await db.one(countQuery, countParams);
    
    logger.info(`Proyectos encontrados: ${proyectos.length}, Total: ${totalCount.count}`);
    
    // Para cada proyecto, obtener información adicional
    let proyectosConDetalles = await Promise.all(proyectos.map(async (proyecto) => {
      // Obtener los equipos del proyecto
      const equipos = await db.manyOrNone(`
        SELECT DISTINCT e.*, COUNT(eu.id) as total_miembros
        FROM equipos e
        JOIN equipo_usuarios eu ON eu.equipo_id = e.id
        LEFT JOIN tareas t ON t.proyecto_id = $1
        WHERE e.id IN (
          SELECT equipo_id 
          FROM equipo_usuarios 
          WHERE equipo_id = e.id
        )
        GROUP BY e.id
      `, [proyecto.id]);
      
      // Calcular el progreso del proyecto basado en tareas completadas
      const progreso = proyecto.total_tareas > 0 ? 
        Math.round((proyecto.tareas_completadas / proyecto.total_tareas) * 100) : 0;
      
      return {
        ...proyecto,
        equipos,
        progreso
      };
    }));

    // Filtro por progreso (min y max) - Aplicamos esto después de obtener todos los datos
    // ya que el progreso se calcula en memoria y no en la base de datos
    if (filtros.progreso_min !== undefined) {
      const minProgreso = parseInt(filtros.progreso_min);
      logger.info(`Filtrando proyectos con progreso >= ${minProgreso}%`);
      proyectosConDetalles = proyectosConDetalles.filter(p => p.progreso >= minProgreso);
    }
    if (filtros.progreso_max !== undefined) {
      const maxProgreso = parseInt(filtros.progreso_max);
      logger.info(`Filtrando proyectos con progreso <= ${maxProgreso}%`);
      proyectosConDetalles = proyectosConDetalles.filter(p => p.progreso <= maxProgreso);
    }

    return {
      proyectos: proyectosConDetalles,
      paginacion: {
        total: parseInt(totalCount.count),
        pagina: pagina,
        por_pagina: porPagina,
        total_paginas: Math.ceil(parseInt(totalCount.count) / porPagina)
      }
    };
  } catch (error) {
    logger.error(`Error al obtener proyectos: ${error.message}`);
    throw error;
  }
}

module.exports = { execute };
