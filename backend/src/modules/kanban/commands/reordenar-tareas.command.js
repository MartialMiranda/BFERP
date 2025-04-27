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
 * Reordena las tareas en una columna según el array de IDs proporcionado
 * @param {string} columnaId - ID de la columna
 * @param {string[]} orderedIds - Array de IDs de tareas en el orden deseado
 * @param {string} usuarioId - ID del usuario que solicita la operación
 * @returns {Promise<object>} - Resultado de la operación
 */
async function execute(columnaId, orderedIds, usuarioId) {
  logger.info(`Reordenando tareas de columna ${columnaId} por usuario: ${usuarioId}`);

  // Verificar acceso al proyecto de la columna
  const acceso = await db.oneOrNone(
    `
      SELECT 1
      FROM proyectos p
      LEFT JOIN proyecto_equipos pe ON pe.proyecto_id = p.id
      LEFT JOIN equipos e ON pe.equipo_id = e.id
      LEFT JOIN equipo_usuarios eu ON eu.equipo_id = e.id
      JOIN kanban_columnas kc ON kc.proyecto_id = p.id
      WHERE kc.id = $1 AND (p.creado_por = $2 OR eu.usuario_id = $2)
      LIMIT 1
    `,
    [columnaId, usuarioId]
  );
  if (!acceso) {
    logger.warn(`Usuario ${usuarioId} sin permisos para reordenar columna ${columnaId}`);
    throw new Error('Sin permisos para reordenar tareas de esta columna');
  }

  // Transacción para reordenar en un solo paso
  await db.tx(async t => {
    await t.none(
      `
        WITH nueva_orden AS (
          SELECT id, ord AS posicion
          FROM unnest($2::uuid[]) WITH ORDINALITY AS u(id, ord)
          ORDER BY ord
        )
        UPDATE kanban_tareas kt
        SET posicion = n.posicion
        FROM nueva_orden n
        WHERE kt.id = n.id AND kt.columna_id = $1
      `,
      [columnaId, orderedIds]
    );
  });

  logger.info(`Tareas en columna ${columnaId} reordenadas exitosamente`);
  return { success: true };
}

module.exports = { execute };
