import React, { useState, useEffect } from 'react';
import type { ClockingEntry, TeamMember } from '../types';
import { Icon } from './Icon';
import { Modal } from './Modal';

interface ClockingFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (entryData: Omit<ClockingEntry, 'id'> | ClockingEntry) => void;
    entryToEdit?: ClockingEntry | null;
    teamMembers: TeamMember[];
}

const initialFormData = {
    memberId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    status: 'present' as 'present' | 'absent' | 'completed',
};

export const ClockingFormModal: React.FC<ClockingFormModalProps> = ({ isOpen, onClose, onSubmit, entryToEdit, teamMembers }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [isFormValid, setIsFormValid] = useState(false);
    const isEditing = !!entryToEdit;

    useEffect(() => {
        if (isOpen) {
            if (entryToEdit) {
                setFormData({
                    memberId: entryToEdit.memberId,
                    date: entryToEdit.date,
                    startTime: entryToEdit.startTime || '',
                    endTime: entryToEdit.endTime || '',
                    status: entryToEdit.status,
                });
            } else {
                setFormData({
                    ...initialFormData,
                    date: new Date().toISOString().split('T')[0],
                });
            }
        }
    }, [entryToEdit, isOpen]);

    useEffect(() => {
        const { memberId, date, startTime } = formData;
        // Basic validation: needs member, date, and at least start time if present/completed
        const isValid = !!(memberId && date && (formData.status === 'absent' || startTime));
        setIsFormValid(isValid);
    }, [formData]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isFormValid) {
            if (isEditing && entryToEdit) {
                onSubmit({ ...entryToEdit, ...formData });
            } else {
                onSubmit(formData);
            }
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Modifier le pointage' : 'Ajouter un pointage'}
            maxWidth="md"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="memberId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Membre</label>
                    <select
                        name="memberId"
                        id="memberId"
                        value={formData.memberId}
                        onChange={handleChange}
                        required
                        className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-lg shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        disabled={isEditing} // Prevent changing member on edit if desired, or allow it. Usually better to allow.
                    >
                        <option value="">Sélectionner un membre</option>
                        {teamMembers.map(member => (
                            <option key={member.id} value={member.id}>{member.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                    <div className="relative">
                        <input
                            type="date"
                            name="date"
                            id="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-lg shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500 pr-10 appearance-none [&::-webkit-calendar-picker-indicator]:hidden transition-colors"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <Icon name="calendar" className="h-5 w-5 text-slate-400" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startTime" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Heure d'arrivée</label>
                        <input
                            type="time"
                            name="startTime"
                            id="startTime"
                            value={formData.startTime}
                            onChange={handleChange}
                            className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-lg shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label htmlFor="endTime" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Heure de départ</label>
                        <input
                            type="time"
                            name="endTime"
                            id="endTime"
                            value={formData.endTime}
                            onChange={handleChange}
                            className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-lg shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Statut</label>
                    <select
                        name="status"
                        id="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-lg shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    >
                        <option value="present">Présent</option>
                        <option value="completed">Terminé</option>
                        <option value="absent">Absent</option>
                    </select>
                </div>

                <div className="flex justify-end pt-6 space-x-3">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold transition-colors">Annuler</button>
                    <button type="submit" disabled={!isFormValid} className="px-5 py-2.5 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 font-semibold disabled:bg-slate-400 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40">
                        {isEditing ? 'Sauvegarder' : 'Ajouter'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
