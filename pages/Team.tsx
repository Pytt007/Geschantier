
import React, { useState } from 'react';
import { Icon } from '../components/Icon';
import type { Team as TeamType, TeamMember, Project, Page } from '../types';
import { TeamFormModal } from '../components/TeamFormModal';

import { useToast } from '../contexts/ToastContext';
import { useConfirmation } from '../contexts/ConfirmationContext';

interface TeamProps {
    teams: TeamType[];
    setTeams: React.Dispatch<React.SetStateAction<TeamType[]>>;
    teamMembers: TeamMember[];
    projects: Project[];
    onNavigate: (page: Page) => void;
    onProjectSelect: (projectId: string) => void;
}

export const Team: React.FC<TeamProps> = ({ teams, setTeams, teamMembers, projects, onNavigate, onProjectSelect }) => {
    const { showToast } = useToast();
    const { requestConfirmation } = useConfirmation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [teamToEdit, setTeamToEdit] = useState<TeamType | null>(null);

    const handleOpenModal = (team?: TeamType) => {
        setTeamToEdit(team || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setTeamToEdit(null);
        setIsModalOpen(false);
    };

    const handleSubmit = (teamData: Omit<TeamType, 'id'> | TeamType) => {
        if ('id' in teamData) {
            setTeams(prev => prev.map(t => t.id === teamData.id ? teamData : t));
            showToast('Équipe mise à jour avec succès', 'success');
        } else {
            const newTeam: TeamType = {
                ...teamData,
                id: `team-${Date.now()}`,
            };
            setTeams(prev => [...prev, newTeam]);
            showToast('Nouvelle équipe créée avec succès', 'success');
        }
    };

    const handleDelete = (id: string) => {
        requestConfirmation(
            () => {
                setTeams(prev => prev.filter(t => t.id !== id));
                showToast('Équipe supprimée avec succès', 'success');
            },
            {
                title: "Supprimer l'équipe ?",
                message: "Êtes-vous sûr de vouloir supprimer cette équipe ?",
                isDangerous: true
            }
        );
    };

    const handleProjectClick = (projectId: string) => {
        onProjectSelect(projectId);
        onNavigate('Projects');
    };

    const getColorClass = (colorName: string) => {
        const colors: { [key: string]: string } = {
            indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
            emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
            amber: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
            rose: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800',
            sky: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800',
            violet: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800',
        };
        return colors[colorName] || colors['indigo'];
    };

    return (
        <>
            <TeamFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                teamToEdit={teamToEdit}
                teamMembers={teamMembers}
                projects={projects}
            />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Gestion des Équipes</h1>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">
                            Organisez vos membres en équipes et assignez-les à des chantiers.
                        </p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
                    >
                        <Icon name="plus" className="w-5 h-5 mr-2" />
                        Nouvelle Équipe
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {teams.map(team => {
                        const leader = teamMembers.find(m => m.id === team.leaderId);
                        const members = team.memberIds.map(id => teamMembers.find(m => m.id === id)).filter(Boolean) as TeamMember[];
                        const project = projects.find(p => p.id === team.projectId);
                        const colorClasses = getColorClass(team.color);

                        return (
                            <div key={team.id} className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden hover:shadow-md transition-all">
                                <div className={`px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center ${colorClasses.split(' ')[0].replace('/30', '/10')} bg-opacity-50`}>
                                    <div className="flex items-center gap-3">
                                        <span className={`p-2 rounded-lg ${colorClasses}`}>
                                            <Icon name="team" className="w-5 h-5" />
                                        </span>
                                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{team.name}</h3>
                                    </div>
                                    <div className="flex space-x-1">
                                        <button onClick={() => handleOpenModal(team)} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                            <Icon name="pencil" className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(team.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                            <Icon name="trash" className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Chef d'équipe */}
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Chef d'équipe</p>
                                        {leader ? (
                                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                                                <img src={leader.avatarUrl} alt={leader.name} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-700" />
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{leader.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{leader.role}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-400 italic">Aucun chef assigné</p>
                                        )}
                                    </div>

                                    {/* Membres */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Membres ({members.length})</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {members.length > 0 ? (
                                                members.map(member => (
                                                    <div key={member.id} className="relative group">
                                                        <img
                                                            src={member.avatarUrl}
                                                            alt={member.name}
                                                            className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-slate-600 cursor-help"
                                                            title={`${member.name} - ${member.role}`}
                                                        />
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-slate-400 italic">Aucun membre</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Chantier */}
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Chantier Assigné</p>
                                        <div
                                            onClick={() => project && handleProjectClick(project.id)}
                                            className={`p-3 rounded-lg border ${project ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors' : 'bg-slate-50 dark:bg-slate-800/50 border-dashed border-slate-300 dark:border-slate-700'}`}
                                        >
                                            {project ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-md">
                                                        <Icon name="briefcase" className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{project.name}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{project.address}</p>
                                                    </div>
                                                    <Icon name="arrowRight" className="w-4 h-4 text-slate-400 ml-auto" />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                    <Icon name="archive" className="w-4 h-4" />
                                                    <span className="text-sm italic">Aucun chantier assigné</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {teams.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white dark:bg-card-dark rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full mb-4">
                                <Icon name="team" className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Aucune équipe créée</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md text-center mt-1 mb-6">
                                Commencez par créer des équipes pour organiser vos collaborateurs et les assigner aux chantiers.
                            </p>
                            <button
                                onClick={() => handleOpenModal()}
                                className="flex items-center bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
                            >
                                <Icon name="plus" className="w-5 h-5 mr-2" />
                                Créer ma première équipe
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};