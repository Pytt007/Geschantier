
import React, { useState, useEffect } from 'react';
import type { TeamMember } from '../types';
import { Icon } from './Icon';
import { Modal } from './Modal';

interface TeamMemberFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (memberData: Omit<TeamMember, 'id'> | TeamMember) => void;
    memberToEdit?: TeamMember | null;
}

const initialFormData = {
    name: '',
    role: '',
    email: '',
    phone: '',
    avatarUrl: '',
};

export const TeamMemberFormModal: React.FC<TeamMemberFormModalProps> = ({ isOpen, onClose, onSubmit, memberToEdit }) => {
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (isOpen) {
            if (memberToEdit) {
                setFormData(memberToEdit);
            } else {
                setFormData(initialFormData);
            }
        }
    }, [memberToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    const isEditing = !!memberToEdit;

    return (

        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Modifier le membre' : 'Ajouter un membre'}
            maxWidth="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom complet</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-lg shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rôle</label>
                        <input type="text" name="role" id="role" value={formData.role} onChange={handleChange} required className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-lg shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Téléphone</label>
                        <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-lg shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Photo de profil</label>
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="avatar-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-800/50 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors overflow-hidden relative">
                            {formData.avatarUrl ? (
                                <img src={formData.avatarUrl} alt="Preview" className="h-full object-contain" />
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Icon name="camera" className="w-8 h-8 mb-2 text-slate-400" />
                                    <p className="text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">Télécharger une photo</span></p>
                                </div>
                            )}
                            <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                    </div>
                    {formData.avatarUrl && (
                        <div className="flex justify-end mt-2">
                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, avatarUrl: '' }))} className="text-xs font-medium text-red-600 hover:text-red-800 dark:text-red-400 transition-colors">Supprimer la photo</button>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-6 space-x-3">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold transition-colors">Annuler</button>
                    <button type="submit" className="px-5 py-2.5 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 font-semibold shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40">{isEditing ? 'Sauvegarder' : 'Ajouter'}</button>
                </div>
            </form>
        </Modal>
    );
};
