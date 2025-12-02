
import React, { useState, useEffect } from 'react';
import type { Project, TeamMember } from '../types';
import { ProjectStatus } from '../types';
import { Icon } from './Icon';

interface ProjectFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (projectData: Omit<Project, 'id' | 'tasks' | 'dailyLogs' | 'documents'> | Project) => void;
    projectToEdit?: Project | null;
    teamMembers: TeamMember[];
}

const initialFormData = {
    name: '',
    address: '',
    manager: '',
    budget: 0,
    startDate: '',
    endDate: '',
    status: ProjectStatus.Planning,
    featuredImage: '',
};

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({ isOpen, onClose, onSubmit, projectToEdit, teamMembers }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [isFormValid, setIsFormValid] = useState(false);
    const isEditing = !!projectToEdit;

    useEffect(() => {
        if (isOpen) {
            if (projectToEdit) {
                const { tasks, dailyLogs, documents, id, ...editableData } = projectToEdit;
                setFormData({ ...initialFormData, ...editableData });
            } else {
                setFormData(initialFormData);
            }
        }
    }, [projectToEdit, isOpen]);

    useEffect(() => {
        const { name, address, manager, startDate, endDate } = formData;
        const budget = Number(formData.budget);
        setIsFormValid(!!(name && address && manager && startDate && endDate && budget > 0));
    }, [formData]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'budget' ? parseFloat(value) || 0 : value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, featuredImage: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isFormValid) {
            if (isEditing && projectToEdit) {
                onSubmit({ ...projectToEdit, ...formData });
            } else {
                onSubmit(formData);
            }
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-card-dark rounded-xl shadow-2xl p-8 w-full max-w-2xl transform transition-all max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">{isEditing ? 'Modifier le projet' : 'Créer un nouveau projet'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Featured Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Image de mise en avant</label>
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="featured-image-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors overflow-hidden relative">
                                {formData.featuredImage ? (
                                    <img src={formData.featuredImage} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Icon name="camera" className="w-8 h-8 mb-2 text-slate-400" />
                                        <p className="text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">Ajouter une photo</span></p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG (MAX. 5MB)</p>
                                    </div>
                                )}
                                <input id="featured-image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        </div>
                        {formData.featuredImage && (
                            <div className="flex justify-end mt-1">
                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))} className="text-xs text-red-600 hover:text-red-800 dark:text-red-400">Supprimer l'image</button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nom du projet</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="manager" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Chef de projet</label>
                            <select name="manager" id="manager" value={formData.manager} onChange={handleChange} required className="mt-1 block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="">Sélectionner un chef de projet</option>
                                {teamMembers.map(member => (
                                    <option key={member.id} value={member.name}>{member.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Adresse du chantier</label>
                        <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} required className="mt-1 block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="budget" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Budget (FCFA)</label>
                            <input type="number" name="budget" id="budget" value={formData.budget || ''} onChange={handleChange} required min="1" className="mt-1 block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Statut</label>
                            <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
                                <option value={ProjectStatus.Planning}>Planification</option>
                                <option value={ProjectStatus.InProgress}>En Cours</option>
                                <option value={ProjectStatus.OnHold}>En Attente</option>
                                <option value={ProjectStatus.Completed}>Terminé</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Date de début</label>
                            <div className="relative mt-1">
                                <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleChange} required className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 pr-10 appearance-none [&::-webkit-calendar-picker-indicator]:hidden" />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <Icon name="calendar" className="h-5 w-5 text-slate-400" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Date de fin</label>
                            <div className="relative mt-1">
                                <input type="date" name="endDate" id="endDate" value={formData.endDate} onChange={handleChange} required className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 pr-10 appearance-none [&::-webkit-calendar-picker-indicator]:hidden" />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <Icon name="calendar" className="h-5 w-5 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end pt-6 space-x-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold">Annuler</button>
                        <button type="submit" disabled={!isFormValid} className="px-6 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-semibold disabled:bg-slate-400 disabled:cursor-not-allowed">{isEditing ? 'Sauvegarder' : 'Créer le projet'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
