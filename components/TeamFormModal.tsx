
import React, { useState, useEffect } from 'react';
import type { Team, TeamMember, Project } from '../types';
import { Icon } from './Icon';

interface TeamFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (teamData: Omit<Team, 'id'> | Team) => void;
    teamToEdit?: Team | null;
    teamMembers: TeamMember[];
    projects: Project[];
}

const initialFormData = {
    name: '',
    leaderId: '',
    memberIds: [] as string[],
    projectId: '',
    color: 'indigo'
};

const colors = [
    { name: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
    { name: 'Emerald', value: 'emerald', class: 'bg-emerald-500' },
    { name: 'Amber', value: 'amber', class: 'bg-amber-500' },
    { name: 'Rose', value: 'rose', class: 'bg-rose-500' },
    { name: 'Sky', value: 'sky', class: 'bg-sky-500' },
    { name: 'Violet', value: 'violet', class: 'bg-violet-500' },
];

export const TeamFormModal: React.FC<TeamFormModalProps> = ({ isOpen, onClose, onSubmit, teamToEdit, teamMembers, projects }) => {
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (isOpen) {
            if (teamToEdit) {
                setFormData({
                    name: teamToEdit.name,
                    leaderId: teamToEdit.leaderId,
                    memberIds: teamToEdit.memberIds,
                    projectId: teamToEdit.projectId || '',
                    color: teamToEdit.color
                });
            } else {
                setFormData(initialFormData);
            }
        }
    }, [teamToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMemberToggle = (memberId: string) => {
        setFormData(prev => {
            const currentMembers = prev.memberIds;
            if (currentMembers.includes(memberId)) {
                return { ...prev, memberIds: currentMembers.filter(id => id !== memberId) };
            } else {
                return { ...prev, memberIds: [...currentMembers, memberId] };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (teamToEdit) {
            onSubmit({ ...formData, id: teamToEdit.id });
        } else {
            onSubmit(formData);
        }
        onClose();
    };
    
    const isEditing = !!teamToEdit;

    // Filter out the leader from the selectable members list to avoid duplicates
    const selectableMembers = teamMembers.filter(m => m.id !== formData.leaderId);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-card-dark rounded-xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                    {isEditing ? "Modifier l'équipe" : 'Créer une nouvelle équipe'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nom de l'équipe</label>
                                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Ex: Équipe Alpha" />
                            </div>
                            
                            <div>
                                <label htmlFor="leaderId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Chef d'équipe</label>
                                <select name="leaderId" id="leaderId" value={formData.leaderId} onChange={handleChange} required className="mt-1 block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="">Sélectionner un chef</option>
                                    {teamMembers.map(member => (
                                        <option key={member.id} value={member.id}>{member.name} ({member.role})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="projectId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Chantier assigné</label>
                                <select name="projectId" id="projectId" value={formData.projectId} onChange={handleChange} className="mt-1 block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="">Aucun chantier</option>
                                    {projects.map(project => (
                                        <option key={project.id} value={project.id}>{project.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                             <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Couleur du badge</label>
                                <div className="flex gap-2">
                                    {colors.map(color => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => setFormData(prev => ({...prev, color: color.value}))}
                                            className={`w-8 h-8 rounded-full ${color.class} transition-transform ${formData.color === color.value ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Membres de l'équipe</label>
                            <div className="border border-slate-300 dark:border-slate-600 rounded-md max-h-60 overflow-y-auto bg-slate-50 dark:bg-slate-800/50">
                                {selectableMembers.length > 0 ? (
                                    selectableMembers.map(member => (
                                        <div key={member.id} className="flex items-center px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer" onClick={() => handleMemberToggle(member.id)}>
                                            <input 
                                                type="checkbox" 
                                                checked={formData.memberIds.includes(member.id)} 
                                                onChange={() => handleMemberToggle(member.id)}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                                            />
                                            <img src={member.avatarUrl} alt="" className="w-6 h-6 rounded-full ml-3 mr-2 object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{member.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{member.role}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="p-4 text-sm text-slate-500 text-center">Aucun autre membre disponible.</p>
                                )}
                            </div>
                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                {formData.memberIds.length} membre(s) sélectionné(s)
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 space-x-4 border-t border-slate-200 dark:border-slate-700">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold">Annuler</button>
                        <button type="submit" className="px-6 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-semibold">{isEditing ? 'Sauvegarder' : 'Créer'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
    