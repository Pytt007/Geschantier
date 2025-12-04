import React, { useState, useRef } from 'react';
import type { Project, Task, Document, Team, TeamMember, Page } from '../types';
import { ProjectStatus, TaskStatus } from '../types';
import { Icon } from '../components/Icon';
import { TaskFormModal } from '../components/TaskFormModal';
import { ReportGenerationModal } from '../components/ReportGenerationModal';
import { useToast } from '../contexts/ToastContext';
import { useConfirmation } from '../contexts/ConfirmationContext';

interface ProjectDetailProps {
    project: Project;
    onBack: () => void;
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    teams: Team[];
    setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
    teamMembers: TeamMember[];
    onEditProject: () => void;
    onDeleteProject: () => void;
    onNavigate: (page: Page) => void;
}

// --- Modal d'assignation d'équipe ---
const TeamAssignmentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    teams: Team[];
    currentTeamId?: string;
    onAssign: (teamId: string) => void;
}> = ({ isOpen, onClose, teams, currentTeamId, onAssign }) => {
    const [selectedTeamId, setSelectedTeamId] = useState(currentTeamId || '');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedTeamId) {
            onAssign(selectedTeamId);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-card-dark rounded-xl shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Assigner une équipe</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Choisir une équipe</label>
                        <select
                            value={selectedTeamId}
                            onChange={(e) => setSelectedTeamId(e.target.value)}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        >
                            <option value="">-- Sélectionner --</option>
                            {teams.map(team => (
                                <option key={team.id} value={team.id}>
                                    {team.name} {team.projectId && team.projectId !== currentTeamId ? '(Déjà assignée)' : ''}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-2">
                            Note : Si l'équipe sélectionnée est déjà sur un autre chantier, elle sera déplacée sur celui-ci.
                        </p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Annuler</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Assigner</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const getStatusClass = (status: ProjectStatus) => {
    switch (status) {
        case ProjectStatus.InProgress: return { bg: 'bg-sky-100 dark:bg-sky-900/50', text: 'text-sky-800 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800' };
        case ProjectStatus.Completed: return { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-300', border: 'border-green-200 dark:border-green-800' };
        case ProjectStatus.Planning: return { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' };
        case ProjectStatus.OnHold: return { bg: 'bg-slate-100 dark:bg-slate-700/50', text: 'text-slate-800 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-600' };
        default: return { bg: 'bg-gray-100 dark:bg-gray-700/50', text: 'text-gray-800 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-600' };
    }
};

const getTaskStatusClass = (status: TaskStatus) => {
    switch (status) {
        case TaskStatus.Done: return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800';
        case TaskStatus.InProgress: return 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800';
        case TaskStatus.ToDo: return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
        default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
};

const InfoCard: React.FC<{ label: string, value: React.ReactNode, icon: string, subtext?: string }> = ({ label, value, icon, subtext }) => (
    <div className="bg-white dark:bg-card-dark p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-start gap-4 hover:shadow-md transition-shadow">
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg shrink-0 text-indigo-600 dark:text-indigo-400">
            <Icon name={icon} className="w-6 h-6" />
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{value}</p>
            {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
    </div>
);

const TaskRow: React.FC<{ task: Task, onEdit: () => void, onDelete: () => void }> = ({ task, onEdit, onDelete }) => (
    <div className="group flex items-center justify-between p-4 bg-white dark:bg-card-dark border border-slate-100 dark:border-slate-700 rounded-xl hover:shadow-md transition-all mb-3">
        <div className="flex items-center gap-4 min-w-0">
            <div className={`w-2 h-12 rounded-full shrink-0 ${task.status === TaskStatus.Done ? 'bg-green-500' :
                task.status === TaskStatus.InProgress ? 'bg-sky-500' : 'bg-slate-300'
                }`}></div>
            <div className="min-w-0">
                <h4 className="font-semibold text-slate-800 dark:text-slate-100 truncate pr-4">{task.title}</h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                        <Icon name="calendar" className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="flex items-center gap-1">
                        <Icon name="users" className="w-3 h-3" />
                        {task.assignedTo}
                    </span>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-4 ml-4 shrink-0">
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${getTaskStatusClass(task.status)}`}>
                {task.status}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onEdit} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                    <Icon name="pencil" className="w-4 h-4" />
                </button>
                <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Icon name="trash" className="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
);

const TeamCard: React.FC<{ team: Team, members: TeamMember[], leader?: TeamMember, onUnassign: () => void, onChangeTeam: () => void, onNavigate: (page: Page) => void }> = ({ team, members, leader, onUnassign, onChangeTeam, onNavigate }) => {
    return (
        <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-700 pb-6">
                <div
                    className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => onNavigate('Team')}
                >
                    <div className={`p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400`}>
                        <Icon name="team" className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            {team.name}
                            <Icon name="arrowRight" className="w-4 h-4 text-slate-400" />
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Équipe assignée au chantier</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onChangeTeam}
                        className="flex items-center px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        <Icon name="pencil" className="w-4 h-4 mr-2" />
                        Changer
                    </button>
                    <button
                        onClick={onUnassign}
                        className="flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 transition-colors"
                    >
                        <Icon name="logout" className="w-4 h-4 mr-2" />
                        Retirer
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Chef d'équipe */}
                <div>
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Chef d'équipe</h4>
                    {leader ? (
                        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                            <img src={leader.avatarUrl} alt={leader.name} className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-600" />
                            <div>
                                <p className="font-bold text-slate-800 dark:text-slate-200">{leader.name}</p>
                                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{leader.role}</p>
                                <div className="flex gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1"><Icon name="phone" className="w-3 h-3" /> {leader.phone}</span>
                                    <span className="flex items-center gap-1"><Icon name="mail" className="w-3 h-3" /> {leader.email}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 italic">Aucun chef désigné</p>
                    )}
                </div>

                {/* Liste des membres */}
                <div>
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Membres ({members.length})</h4>
                    {members.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {members.map(member => (
                                <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                    <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-slate-200">{member.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{member.role}</p>
                                    </div>
                                    <div className="ml-auto flex gap-2">
                                        <a href={`tel:${member.phone}`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-colors">
                                            <span className="material-symbols-outlined text-lg">call</span>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 italic">Aucun membre dans cette équipe.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack, setProjects, teams, setTeams, teamMembers, onEditProject, onDeleteProject, onNavigate }) => {
    const { showToast } = useToast();
    const { requestConfirmation } = useConfirmation();
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'team' | 'documents' | 'reports'>('overview');
    const [isTaskModalOpen, setTaskModalOpen] = useState(false);
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [isReportModalOpen, setReportModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const statusClasses = getStatusClass(project.status);

    // Calcul de la progression
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(t => t.status === TaskStatus.Done).length;
    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // Trouver l'équipe assignée
    const assignedTeam = teams.find(t => t.projectId === project.id);
    const teamLeader = assignedTeam ? teamMembers.find(m => m.id === assignedTeam.leaderId) : undefined;
    const teamMembersList = assignedTeam
        ? assignedTeam.memberIds.map(id => teamMembers.find(m => m.id === id)).filter(Boolean) as TeamMember[]
        : [];

    // --- GESTION DES ÉQUIPES ---

    const handleAssignTeam = (teamId: string) => {
        setTeams(prevTeams => prevTeams.map(team => {
            // 1. Si l'équipe était déjà sur CE projet, on ne fait rien (ou on le garde)
            if (team.id === teamId) {
                return { ...team, projectId: project.id };
            }
            // 2. Si une autre équipe était sur CE projet, on la désassigne
            if (team.projectId === project.id) {
                return { ...team, projectId: undefined };
            }
            return team;
        }));
        showToast('Équipe assignée avec succès', 'success');
    };

    const handleUnassignTeam = () => {
        if (!assignedTeam) return;
        requestConfirmation(
            () => {
                setTeams(prevTeams => prevTeams.map(team => {
                    if (team.id === assignedTeam.id) {
                        return { ...team, projectId: undefined };
                    }
                    return team;
                }));
                showToast('Équipe retirée du chantier', 'success');
            },
            {
                title: "Retirer l'équipe ?",
                message: `Voulez-vous vraiment retirer l'équipe "${assignedTeam.name}" de ce chantier ?`,
                isDangerous: true
            }
        );
    };

    // --- FIN GESTION ÉQUIPES ---

    const handleUpdateProject = (updatedProjectData: Project) => {
        setProjects(prev => prev.map(p => p.id === updatedProjectData.id ? updatedProjectData : p));
    };

    const handleTaskModalOpen = (task?: Task) => {
        setTaskToEdit(task || null);
        setTaskModalOpen(true);
    };

    const handleTaskSubmit = (taskData: Omit<Task, 'id'> | Task) => {
        let updatedTasks: Task[];
        if ('id' in taskData) {
            updatedTasks = project.tasks.map(t => t.id === taskData.id ? taskData : t);
            showToast('Tâche mise à jour', 'success');
        } else {
            const newTask: Task = { ...taskData, id: `task-${Date.now()}` };
            updatedTasks = [...project.tasks, newTask];
            showToast('Tâche créée', 'success');
        }
        handleUpdateProject({ ...project, tasks: updatedTasks });
    };

    const handleTaskDelete = (taskId: string) => {
        requestConfirmation(
            () => {
                const updatedTasks = project.tasks.filter(t => t.id !== taskId);
                handleUpdateProject({ ...project, tasks: updatedTasks });
                showToast('Tâche supprimée', 'success');
            },
            {
                title: "Supprimer la tâche ?",
                message: "Êtes-vous sûr de vouloir supprimer cette tâche ?",
                isDangerous: true
            }
        );
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                const isImage = file.type.startsWith('image/');
                const newDoc: Document = {
                    id: `doc-${Date.now()}`,
                    name: file.name,
                    type: isImage ? 'image' : 'pdf',
                    url: reader.result as string,
                    uploadedAt: new Date().toISOString().split('T')[0],
                    size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
                };

                handleUpdateProject({
                    ...project,
                    documents: [...project.documents, newDoc]
                });
                showToast('Fichier ajouté avec succès', 'success');
            };

            reader.readAsDataURL(file);
        }
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDeleteDocument = (docId: string) => {
        requestConfirmation(
            () => {
                handleUpdateProject({
                    ...project,
                    documents: project.documents.filter(d => d.id !== docId)
                });
                showToast('Fichier supprimé', 'success');
            },
            {
                title: "Supprimer le fichier ?",
                message: "Voulez-vous vraiment supprimer ce fichier ?",
                isDangerous: true
            }
        );
    };

    const handleSaveReport = (document: Document) => {
        handleUpdateProject({
            ...project,
            documents: [...project.documents, document]
        });
        showToast('Rapport enregistré avec succès', 'success');
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Project Progress & Status Banner */}
                        <div className="bg-white dark:bg-card-dark p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Progression du chantier</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Basé sur les tâches terminées</p>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${statusClasses.bg} ${statusClasses.text} ${statusClasses.border}`}>
                                    {project.status}
                                </span>
                            </div>

                            <div className="relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                    <div>
                                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200 dark:text-indigo-300 dark:bg-indigo-900/50">
                                            Avancement
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold inline-block text-indigo-600 dark:text-indigo-400">
                                            {progress}%
                                        </span>
                                    </div>
                                </div>
                                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-200 dark:bg-slate-700">
                                    <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-500"></div>
                                </div>
                            </div>
                        </div>

                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <InfoCard
                                label="Chef de Projet"
                                value={project.manager}
                                icon="users"
                                subtext="Responsable principal"
                            />
                            <InfoCard
                                label="Budget Alloué"
                                value={`${project.budget.toLocaleString('fr-FR')} FCFA`}
                                icon="cash"
                                subtext="Budget total prévisionnel"
                            />
                            <InfoCard
                                label="Date de début"
                                value={new Date(project.startDate).toLocaleDateString('fr-FR')}
                                icon="calendar"
                            />
                            <InfoCard
                                label="Date de fin"
                                value={new Date(project.endDate).toLocaleDateString('fr-FR')}
                                icon="calendar"
                                subtext={new Date() > new Date(project.endDate) ? 'En retard' : 'Dans les délais'}
                            />
                        </div>
                    </div>
                );
            case 'tasks':
                return (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex justify-between items-center bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Tâches du projet</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{project.tasks.length} tâches au total • {project.tasks.filter(t => t.status === 'Terminé').length} terminées</p>
                            </div>
                            <button
                                onClick={() => handleTaskModalOpen()}
                                className="flex items-center bg-indigo-600 text-white font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
                            >
                                <Icon name="plus" className="w-5 h-5 mr-2" />
                                Ajouter une Tâche
                            </button>
                        </div>

                        <div className="space-y-1">
                            {project.tasks.length > 0 ? (
                                project.tasks.map(task => (
                                    <TaskRow
                                        key={task.id}
                                        task={task}
                                        onEdit={() => handleTaskModalOpen(task)}
                                        onDelete={() => handleTaskDelete(task.id)}
                                    />
                                ))
                            ) : (
                                <div className="bg-white dark:bg-card-dark p-12 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Icon name="clipboard-list" className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Aucune tâche</h3>
                                    <p className="text-slate-500 dark:text-slate-400 mt-1 mb-6">Commencez par ajouter des tâches à ce projet.</p>
                                    <button
                                        onClick={() => handleTaskModalOpen()}
                                        className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                                    >
                                        Créer une première tâche
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'team':
                return (
                    <div className="space-y-6 animate-fadeIn">
                        {assignedTeam ? (
                            <TeamCard
                                team={assignedTeam}
                                members={teamMembersList}
                                leader={teamLeader}
                                onUnassign={handleUnassignTeam}
                                onChangeTeam={() => setAssignModalOpen(true)}
                                onNavigate={onNavigate}
                            />
                        ) : (
                            <div className="bg-white dark:bg-card-dark p-12 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Icon name="team" className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Aucune équipe assignée</h3>
                                <p className="text-slate-500 dark:text-slate-400 mt-1 mb-6">
                                    Assignez une équipe pour gérer ce chantier.
                                </p>
                                <button
                                    onClick={() => setAssignModalOpen(true)}
                                    className="inline-flex items-center bg-indigo-600 text-white font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
                                >
                                    <Icon name="plus" className="w-5 h-5 mr-2" />
                                    Assigner une équipe
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'documents':
                const images = project.documents.filter(d => d.type === 'image');
                const files = project.documents.filter(d => d.type !== 'image');

                return (
                    <div className="space-y-8 animate-fadeIn">
                        {/* Header Section */}
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Documents & Photos</h3>
                            <div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    accept="image/*,application/pdf"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center"
                                >
                                    <Icon name="upload" className="w-5 h-5 mr-2" />
                                    Ajouter un fichier
                                </button>
                            </div>
                        </div>

                        {/* Gallery Section */}
                        <div>
                            <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Galerie Photos ({images.length})</h4>
                            {images.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {images.map(img => (
                                        <div key={img.id} className="group relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                                            <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <a href={img.url} target="_blank" rel="noreferrer" className="p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/40">
                                                    <Icon name="visibility" className="w-5 h-5" />
                                                </a>
                                                <button onClick={() => handleDeleteDocument(img.id)} className="p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-red-500/60">
                                                    <Icon name="trash" className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                                <p className="text-xs text-white truncate">{img.name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-center text-slate-500 dark:text-slate-400">
                                    Aucune photo disponible
                                </div>
                            )}
                        </div>

                        {/* Files Section */}
                        <div>
                            <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Fichiers ({files.length})</h4>
                            <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                                {files.length > 0 ? (
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                                            <tr>
                                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Nom</th>
                                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Date d'ajout</th>
                                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Taille</th>
                                                <th className="p-4 text-right font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {files.map(file => (
                                                <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                    <td className="p-4 flex items-center gap-3">
                                                        <Icon name="report" className="w-5 h-5 text-red-500" />
                                                        <span className="text-slate-800 dark:text-slate-200 font-medium">{file.name}</span>
                                                    </td>
                                                    <td className="p-4 text-slate-500 dark:text-slate-400">{new Date(file.uploadedAt).toLocaleDateString('fr-FR')}</td>
                                                    <td className="p-4 text-slate-500 dark:text-slate-400">{file.size || '-'}</td>
                                                    <td className="p-4 text-right">
                                                        <button onClick={() => handleDeleteDocument(file.id)} className="text-slate-400 hover:text-red-600 transition-colors">
                                                            <Icon name="trash" className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                        Aucun document PDF ou autre.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'reports':
                const reports = project.documents.filter(d => d.name.startsWith('Rapport_') || d.name.includes('.md'));

                return (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex justify-between items-center bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Rapports du projet</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{reports.length} rapports générés</p>
                            </div>
                            <button
                                onClick={() => setReportModalOpen(true)}
                                className="flex items-center bg-indigo-600 text-white font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
                            >
                                <Icon name="plus" className="w-5 h-5 mr-2" />
                                Nouveau Rapport
                            </button>
                        </div>

                        {reports.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {reports.map(report => (
                                    <div key={report.id} className="bg-white dark:bg-card-dark p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                                                <Icon name="report" className="w-6 h-6" />
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <a
                                                    href={report.url}
                                                    download={report.name}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                                    title="Télécharger"
                                                >
                                                    <Icon name="archive" className="w-4 h-4" />
                                                </a>
                                                <button
                                                    onClick={() => handleDeleteDocument(report.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Icon name="trash" className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1 truncate" title={report.name}>
                                            {report.name.replace('.md', '').replace(/_/g, ' ')}
                                        </h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                            Généré le {new Date(report.uploadedAt).toLocaleDateString('fr-FR')}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-3">
                                            <span>{report.size}</span>
                                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300">Markdown</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-card-dark p-12 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Icon name="report" className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Aucun rapport</h3>
                                <p className="text-slate-500 dark:text-slate-400 mt-1 mb-6">Générez votre premier rapport de chantier.</p>
                                <button
                                    onClick={() => setReportModalOpen(true)}
                                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                                >
                                    Créer un rapport maintenant
                                </button>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <TaskFormModal
                isOpen={isTaskModalOpen}
                onClose={() => setTaskModalOpen(false)}
                onSubmit={handleTaskSubmit}
                taskToEdit={taskToEdit}
            />
            <TeamAssignmentModal
                isOpen={isAssignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                teams={teams}
                currentTeamId={assignedTeam?.id}
                onAssign={handleAssignTeam}
            />
            <ReportGenerationModal
                isOpen={isReportModalOpen}
                onClose={() => setReportModalOpen(false)}
                project={project}
                onSave={handleSaveReport}
            />

            <div className="space-y-6 h-full flex flex-col">
                {/* Header Area */}
                <div className="relative rounded-2xl overflow-hidden shadow-md bg-white dark:bg-card-dark">
                    {/* Featured Image Banner */}
                    <div className="h-48 md:h-64 w-full bg-slate-200 dark:bg-slate-700 relative">
                        {project.featuredImage ? (
                            <img src={project.featuredImage} alt={project.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600">
                                <Icon name="briefcase" className="w-20 h-20 text-white/20" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                        <div className="absolute top-4 left-4">
                            <button
                                onClick={onBack}
                                className="p-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white hover:bg-white/40 transition-all"
                            >
                                <Icon name="arrowLeft" className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 shadow-sm">{project.name}</h1>
                                    <div className="flex items-center text-slate-200 text-sm">
                                        <Icon name="pin_drop" className="w-4 h-4 mr-1" />
                                        {project.address}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={onEditProject}
                                        className="flex items-center bg-white/20 backdrop-blur-md text-white font-medium px-4 py-2 rounded-lg border border-white/30 hover:bg-white/30 transition-colors"
                                    >
                                        <Icon name="pencil" className="w-4 h-4 mr-2" />
                                        Modifier
                                    </button>
                                    <button
                                        onClick={onDeleteProject}
                                        className="flex items-center bg-red-500/80 backdrop-blur-md text-white font-medium px-4 py-2 rounded-lg hover:bg-red-600/80 transition-colors"
                                    >
                                        <Icon name="trash" className="w-4 h-4 mr-2" />
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="border-b border-slate-200 dark:border-slate-700">
                    <div className="flex space-x-8 overflow-x-auto">
                        {[
                            { id: 'overview', label: "Vue d'ensemble", icon: 'dashboard' },
                            { id: 'tasks', label: 'Tâches', icon: 'clipboard-list' },
                            { id: 'team', label: 'Équipe', icon: 'team' },
                            { id: 'documents', label: 'Documents', icon: 'archive' },
                            { id: 'reports', label: 'Rapports', icon: 'report' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                                    flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                                    ${activeTab === tab.id
                                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:border-slate-300'
                                    }
                                `}
                            >
                                <Icon name={tab.icon} className={`w-4 h-4 ${activeTab === tab.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-h-[400px]">
                    {renderTabContent()}
                </div>
            </div>
        </>
    );
};
