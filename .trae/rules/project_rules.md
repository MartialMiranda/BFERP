# Reglas de Proyecto

## 1. Organización y Estructura
- Todo nuevo módulo debe ubicarse en la carpeta correspondiente (`frontend` o `backend`) y seguir la estructura de carpetas ya definida.
- Los nombres de archivos y carpetas deben ser descriptivos y en minúsculas, usando guiones para separar palabras.

## 2. Control de Versiones
- Todas las contribuciones deben realizarse a través de ramas feature, bugfix o hotfix, nunca directamente en la rama principal.
- Los mensajes de commit deben ser claros y descriptivos, preferiblemente en español.
- Antes de fusionar una rama, asegúrate de que pase todas las pruebas y revisiones de código.

## 3. Estilo de Código
- Seguir las convenciones de estilo de JavaScript/TypeScript para el frontend y Node.js para el backend.
- Utilizar linters y formateadores automáticos (por ejemplo, ESLint y Prettier) antes de hacer commit.
- Mantener los comentarios actualizados y solo cuando sean necesarios para la comprensión del código.
- Tanto el backend como el frontend deben seguir las mejores prácticas SOLID y ser modulares.
- Cada archivo, tanto en backend como en frontend, no debe exceder estrictamente las 120 líneas de código para asegurar la legibilidad y mantenibilidad.

## 4. Buenas Prácticas de Desarrollo
- Implementar pruebas unitarias para nuevas funcionalidades y correcciones de errores.
- Documentar las funciones y clases públicas.
- No dejar código comentado ni funciones sin uso en el repositorio principal.

## 5. Seguridad y Acceso
- No exponer credenciales ni información sensible en el código fuente.
- Usar variables de entorno para configuraciones sensibles.
- Revisar los permisos de acceso a recursos y datos en cada endpoint.

## 6. Gestión de Proyectos
- Cada proyecto debe tener un responsable asignado.
- Las tareas deben estar correctamente asignadas y actualizadas en el sistema Kanban.
- Los recursos y equipos deben asociarse a proyectos existentes y validados.

## 7. Comunicación
- Toda comunicación relevante sobre el proyecto debe quedar registrada en los canales oficiales (por ejemplo, issues, pull requests o sistema de tickets).
- Las decisiones técnicas importantes deben documentarse en el repositorio.

---

Estas reglas buscan mantener la calidad, seguridad y organización del proyecto. Si tienes sugerencias o necesitas adaptar alguna regla, por favor comunícalo al responsable del proyecto.