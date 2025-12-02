import React, { useState } from 'react';
import type { TeamMember, Team, Project, Page } from '../types';
import { TeamMemberFormModal } from '../components/TeamMemberFormModal';
import { Icon } from '../components/Icon';

import { useToast } from '../contexts/ToastContext';
import { useConfirmation } from '../contexts/ConfirmationContext';

interface TeamMemberCardProps {
    member: TeamMember;
    teams: Team[];
    projects: Project[];
    onEdit: (member: TeamMember) => void;
    onDelete: (memberId: string) => void;
    onNavigate: (page: Page) => void;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, teams, projects, onEdit, onDelete, onNavigate }) => {
    // Find teams this member belongs to
    const memberTeams = teams.filter(t => t.memberIds.includes(member.id) || t.leaderId === member.id);

    return (
        <div className="bg-white dark:bg-card-dark text-center p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 relative group flex flex-col h-full">
            <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(member)} className="p-1.5 bg-slate-200 dark:bg-slate-700 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300" aria-label={`Modifier ${member.name}`}>
                    <Icon name="pencil" className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(member.id)} className="p-1.5 bg-slate-200 dark:bg-slate-700 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300" aria-label={`Supprimer ${member.name}`}>
                    <Icon name="trash" className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1">
                <img className="w-24 h-24 mx-auto rounded-full object-cover ring-4 ring-indigo-100 dark:ring-indigo-500/20" src={member.avatarUrl} alt={member.name} />
                <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-200">{member.name}</h3>
                <p className="text-indigo-600 dark:text-indigo-400 font-medium">{member.role}</p>

                <div className="mt-4 space-y-2">
                    {memberTeams.length > 0 ? (
                        <div className="flex flex-wrap justify-center gap-2">
                            {memberTeams.map(team => (
                                <span
                                    key={team.id}
                                    onClick={() => onNavigate('Team')}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    title={`Équipe: ${team.name}`}
                                >
                                    <Icon name="team" className="w-3 h-3 mr-1" />
                                    {team.name}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic">Aucune équipe assignée</p>
                    )}
                </div>
            </div>

            <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <p className="truncate flex items-center justify-center gap-2">
                    <Icon name="mail" className="w-4 h-4 text-slate-400" />
                    <a href={`mailto:${member.email}`} className="hover:text-indigo-700 dark:hover:text-indigo-400">{member.email}</a>
                </p>
                <p className="truncate flex items-center justify-center gap-2">
                    <Icon name="phone" className="w-4 h-4 text-slate-400" />
                    <a href={`tel:${member.phone}`} className="hover:text-indigo-700 dark:hover:text-indigo-400">{member.phone}</a>
                </p>
            </div>
        </div>
    );
};

interface MembersProps {
    teamMembers: TeamMember[];
    setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
    teams: Team[];
    projects: Project[];
    onNavigate: (page: Page) => void;
}

export const Members: React.FC<MembersProps> = ({ teamMembers, setTeamMembers, teams, projects, onNavigate }) => {
    const { showToast } = useToast();
    const { requestConfirmation } = useConfirmation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null);

    const handleOpenModal = (member?: TeamMember) => {
        setMemberToEdit(member || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setMemberToEdit(null);
        setIsModalOpen(false);
    };

    const handleSubmit = (memberData: Omit<TeamMember, 'id'> | TeamMember) => {
        if ('id' in memberData) {
            // Update
            setTeamMembers(prev => prev.map(m => m.id === memberData.id ? memberData : m));
            showToast('Membre mis à jour avec succès', 'success');
        } else {
            // Create
            const newMember: TeamMember = {
                ...memberData,
                id: `tm-${Date.now()}`,
            };
            setTeamMembers(prev => [newMember, ...prev]);
            showToast('Nouveau membre ajouté avec succès', 'success');
        }
    };

    const handleDelete = (memberId: string) => {
        requestConfirmation(
            () => {
                setTeamMembers(prev => prev.filter(m => m.id !== memberId));
                showToast('Membre supprimé avec succès', 'success');
            },
            {
                title: "Supprimer le membre ?",
                message: "Êtes-vous sûr de vouloir supprimer ce membre ?",
                isDangerous: true
            }
        );
    };

    return (
        <>
            <TeamMemberFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                memberToEdit={memberToEdit}
            />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Gestion des Membres</h1>
                        <p className="mt-1 text-slate-600 dark:text-slate-400 max-w-2xl">
                            Ajoutez, modifiez et supprimez les membres de votre organisation.
                        </p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
                    >
                        <Icon name="plus" className="w-5 h-5 mr-2" />
                        Nouveau Membre
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {teamMembers.map(member => (
                        <TeamMemberCard
                            key={member.id}
                            member={member}
                            teams={teams}
                            projects={projects}
                            onEdit={() => handleOpenModal(member)}
                            onDelete={() => handleDelete(member.id)}
                            onNavigate={onNavigate}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};