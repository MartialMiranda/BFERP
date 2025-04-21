import { useState, useEffect, useCallback } from 'react';
import { Project } from '@/types/project';
import { projectService } from '@/services/projectService';

type SelectOption = {
  value: string;
  label: string;
};

export const useTaskOptions = () => {
  // Estado para opciones de selección
  const [projectOptions, setProjectOptions] = useState<SelectOption[]>([]);
  const [userOptions, setUserOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Cargar proyectos para el selector
   */
  const loadProjects = useCallback(async () => {
    try {
      const response = await projectService.getProjects({ pagina: 1, por_pagina: 100 });
      const options = response.proyectos.map((project: Project) => ({
        value: project.id,
        label: project.nombre,
      }));
      setProjectOptions(options);
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  }, []);

  /**
   * Cargar usuarios para el selector
   */
  const loadUsers = useCallback(async () => {
    try {
      // Implementar cuando el servicio de usuarios esté disponible
      // Por ahora, usamos datos de ejemplo
      setUserOptions([
        { value: '1', label: 'Admin' },
        { value: '2', label: 'Juan Pérez' },
        { value: '3', label: 'María López' },
      ]);
      setLoading(false);
    } catch (err) {
      console.error('Error loading users:', err);
      setLoading(false);
    }
  }, []);

  /**
   * Efecto para cargar datos iniciales
   */
  useEffect(() => {
    loadProjects();
    loadUsers();
  }, [loadProjects, loadUsers]);

  return {
    projectOptions,
    userOptions,
    loading,
    loadProjects,
    loadUsers
  };
};
