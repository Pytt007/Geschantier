import React, { useState, useEffect } from 'react';
import type { Task } from '../types';
import { TaskStatus } from '../types';
import { Icon } from './Icon';

interface TaskFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (taskData: Omit<Task, 'id'> | Task) => void;
    taskToEdit?: Task | null;
}

const initialFormData = {
    title: '',
    assignedTo: '',
    dueDate: '',
    status: TaskStatus.ToDo,
};

export const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, onSubmit, taskToEdit }) => {
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (isOpen) {
            if (taskToEdit) {
                setFormData(taskToEdit);
            } else {
                setFormData(initialFormData);
            }
        }
    }, [taskToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };
    
    const isEditing = !!taskToEdit;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-card-dark rounded-xl shadow-2xl p-8 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">{isEditing ? 'Modifier la tâche' : 'Ajouter une tâche'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Titre de la tâche</label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="assignedTo" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Assigné à</label>
                            <input type="text" name="assignedTo" id="assignedTo" value={formData.assignedTo} onChange={handleChange} required className="mt-1 block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Échéance</label>
                            <div className="relative mt-1">
                                <input type="date" name="dueDate" id="dueDate" value={formData.dueDate} onChange={handleChange} required className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 pr-10 appearance-none [&::-webkit-calendar-picker-indicator]:hidden" />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <Icon name="calendar" className="h-5 w-5 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Statut</label>
                        <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
                            <option value={TaskStatus.ToDo}>À Faire</option>
                            <option value={TaskStatus.InProgress}>En Cours</option>
                            <option value={TaskStatus.Done}>Terminé</option>
                        </select>
                    </div>
                     <div className="flex justify-end pt-6 space-x-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold">Annuler</button>
                        <button type="submit" className="px-6 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-semibold">{isEditing ? 'Sauvegarder' : 'Ajouter'}</button>
                     </div>
                </form>
            </div>
        </div>
    );
};