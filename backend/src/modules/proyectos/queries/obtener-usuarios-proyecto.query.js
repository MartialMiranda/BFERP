/**
 * Consulta para obtener usuarios de un proyecto específico
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
 * Obtiene los usuarios asignados a un proyecto
 * @param {string} proyectoId - ID del proyecto
 * @param {string} usuarioId - ID del usuario que solicita
 * @returns {Promise<Array>} - Usuarios del proyecto
 */
async function execute(proyectoId, usuarioId) {
  try {
    logger.info(`Consultando usuarios del proyecto ID: ${proyectoId} para usuario: ${usuarioId}`);

    // Verificar que el usuario tiene acceso al proyecto
    const tieneAcceso = await db.oneOrNone(`
      SELECT 1 FROM proyectos p
      LEFT JOIN equipo_usuarios eu ON eu.usuario_id = $2
      LEFT JOIN proyecto_equipos pe ON pe.equipo_id = eu.equipo_id
      WHERE p.id = $1 AND (p.creado_por = $2 OR eu.usuario_id = $2)
      LIMIT 1
    `, [proyectoId, usuarioId]);

    if (!tieneAcceso) {
      logger.warn(`Usuario ${usuarioId} sin acceso al proyecto ${proyectoId}`);
      throw new Error('Proyecto no encontrado o sin permisos para acceder');
    }

    // Obtener usuarios del proyecto
    const usuarios = await db.manyOrNone(`
      SELECT DISTINCT u.id, u.nombre, u.email
      FROM usuarios u
      JOIN equipo_usuarios eu ON u.id = eu.usuario_id
      JOIN proyecto_equipos pe ON pe.equipo_id = eu.equipo_id
      WHERE pe.proyecto_id = $1
    `, [proyectoId]);

    return usuarios;
  } catch (error) {
    logger.error(`Error al obtener usuarios del proyecto: ${error.message}`);
    throw error;
  }
}

module.exports = { execute };
