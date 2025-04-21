/**
 * Re-exportar el cliente API desde lib/axios.ts para evitar duplicación
 */
import apiClient from '../lib/axios';
        
// Exportación por defecto
export default apiClient;

// Exportación nombrada
export { apiClient };
