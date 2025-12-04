
import React, { useState, useMemo } from 'react';
import type { Project } from '../types';
import { ProjectStatus } from '../types';
import { Icon } from '../components/Icon';

interface ProjectsProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  onProjectSelect: (projectId: string) => void;
  onNewProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectCard: React.FC<{ project: Project; onClick: () => void; onDelete: (e: React.MouseEvent) => void }> = ({ project, onClick, onDelete }) => {
  const getStatusClass = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.InProgress: return { bg: 'bg-sky-100 dark:bg-sky-900/50', text: 'text-sky-800 dark:text-sky-300', border: 'border-sky-500' };
      case ProjectStatus.Completed: return { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-300', border: 'border-green-500' };
      case ProjectStatus.Planning: return { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-800 dark:text-yellow-300', border: 'border-yellow-500' };
      case ProjectStatus.OnHold: return { bg: 'bg-slate-100 dark:bg-slate-700/50', text: 'text-slate-800 dark:text-slate-300', border: 'border-slate-500' };
      default: return { bg: 'bg-gray-100 dark:bg-gray-700/50', text: 'text-gray-800 dark:text-gray-300', border: 'border-gray-500' };
    }
  };

  const statusClasses = getStatusClass(project.status);
  const progress = project.status === ProjectStatus.Completed ? 100 : (project.tasks.filter(t => t.status === 'Terminé').length / (project.tasks.length || 1)) * 100;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(e);
  };

  return (
    <div className="group relative bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image de couverture */}
      <div className="h-48 w-full relative bg-slate-200 dark:bg-slate-700 overflow-hidden">
        {project.featuredImage ? (
          <img src={project.featuredImage} alt={project.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <Icon name="briefcase" className="w-16 h-16 opacity-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

        <button onClick={handleDelete} className="absolute top-2 right-2 p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10" aria-label="Supprimer le projet">
          <Icon name="trash" className="w-4 h-4" />
        </button>

        <span className={`absolute top-3 left-3 px-3 py-1 text-xs font-bold rounded-full shadow-sm backdrop-blur-md ${statusClasses.bg} ${statusClasses.text}`}>
          {project.status}
        </span>
      </div>

      <button onClick={onClick} className="w-full text-left p-5">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">{project.name}</h3>
        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-3">
          <Icon name="pin_drop" className="w-4 h-4 mr-1" />
          <span className="truncate">{project.address}</span>
        </div>

        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300 mb-4">
          <div className="flex justify-between">
            <span className="text-slate-400">Manager:</span>
            <span className="font-medium">{project.manager}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Fin:</span>
            <span className="font-medium">{new Date(project.endDate).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Progression</span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
            <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </button>
    </div>
  );
};

export const Projects: React.FC<ProjectsProps> = ({ projects, setProjects, onProjectSelect, onNewProject, onEditProject, onDeleteProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>('All');

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.manager.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  const handleDelete = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    onDeleteProject(projectId);
  };

  const handleEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditProject(project);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Gestion des Projets</h1>
          <button
            onClick={onNewProject}
            className="flex items-center bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Icon name="plus" className="w-5 h-5 mr-2" />
            Nouveau Projet
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50">
          <div className="flex-1 relative">
            <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'All')}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white"
            >
              <option value="All">Tous les statuts</option>
              <option value={ProjectStatus.Planning}>Planification</option>
              <option value={ProjectStatus.InProgress}>En Cours</option>
              <option value={ProjectStatus.OnHold}>En Attente</option>
              <option value={ProjectStatus.Completed}>Terminé</option>
            </select>
          </div>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <div key={project.id} className="relative group">
                <ProjectCard project={project} onClick={() => onProjectSelect(project.id)} onDelete={(e) => handleDelete(e, project.id)} />
                <button
                  onClick={(e) => handleEdit(project, e)}
                  className="absolute top-2 right-10 p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-indigo-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  aria-label="Modifier le projet"
                >
                  <Icon name="pencil" className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-card-dark rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <Icon name="search" className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Aucun projet trouvé</h3>
            <p className="text-slate-500 dark:text-slate-400">Essayez de modifier vos critères de recherche.</p>
          </div>
        )}
      </div>
    </>
  );
};
