
import React, { useState, useEffect } from 'react';
import type { Material } from '../types';
import { MaterialStatus } from '../types';
import { Icon } from './Icon';
import { Modal } from './Modal';

interface MaterialFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (materialData: Omit<Material, 'id'> | Material) => void;
    materialToEdit?: Material | null;
}

const initialFormData = {
    name: '',
    category: '',
    quantity: 1,
    status: MaterialStatus.Available,
    location: '',
    serialNumber: '',
    lastMaintenance: '',
    imageUrl: '',
};

export const MaterialFormModal: React.FC<MaterialFormModalProps> = ({ isOpen, onClose, onSubmit, materialToEdit }) => {
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (isOpen) {
            if (materialToEdit) {
                setFormData({
                    name: materialToEdit.name,
                    category: materialToEdit.category,
                    quantity: materialToEdit.quantity,
                    status: materialToEdit.status,
                    location: materialToEdit.location,
                    serialNumber: materialToEdit.serialNumber || '',
                    lastMaintenance: materialToEdit.lastMaintenance || '',
                    imageUrl: materialToEdit.imageUrl || '',
                });
            } else {
                setFormData(initialFormData);
            }
        }
    }, [materialToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' ? parseInt(value) || 0 : value
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    const isEditing = !!materialToEdit;

    return (

        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Modifier le matériel' : 'Ajouter du matériel'}
            maxWidth="2xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom de l'équipement</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-lg shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Catégorie</label>
                        <input type="text" name="category" id="category" value={formData.category} onChange={handleChange} placeholder="Ex: Engins, Outillage..." required className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-lg shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantité</label>
                        <input type="number" name="quantity" id="quantity" min="0" value={formData.quantity} onChange={handleChange} required className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-lg shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">État / Statut</label>
                        <select name="status" id="status" value={formData.status} onChange={handleChange} className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-lg shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500 transition-colors">
                            <option value={MaterialStatus.Available}>Disponible</option>
                            <option value={MaterialStatus.InUse}>Sur Chantier</option>
                            <option value={MaterialStatus.Maintenance}>En Maintenance</option>
                            <option value={MaterialStatus.Broken}>Hors Service</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Localisation actuelle</label>
                    <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} placeholder="Ex: Entrepôt A, Chantier Eiffel..." required className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-lg shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="serialNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Numéro de série (Optionnel)</label>
                        <input type="text" name="serialNumber" id="serialNumber" value={formData.serialNumber} onChange={handleChange} className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-lg shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                    </div>
                    <div>
                        <label htmlFor="lastMaintenance" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dernière maintenance</label>
                        <input type="date" name="lastMaintenance" id="lastMaintenance" value={formData.lastMaintenance} onChange={handleChange} className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-lg shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition-colors" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Photo de l'équipement</label>
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-800/50 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors overflow-hidden relative">
                            {formData.imageUrl ? (
                                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Icon name="upload" className="w-8 h-8 mb-3 text-slate-400" />
                                    <div className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium mb-2 shadow-sm hover:bg-indigo-700 transition-colors">
                                        Ajouter une photo
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG (MAX. 5MB)</p>
                                </div>
                            )}
                            <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                    </div>
                    {formData.imageUrl && (
                        <div className="flex justify-end mt-2">
                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))} className="text-xs font-medium text-red-600 hover:text-red-800 dark:text-red-400 transition-colors">Supprimer l'image</button>
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