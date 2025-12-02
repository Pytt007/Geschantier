
import React, { useState, useEffect } from 'react';
import type { Supplier } from '../types';
import { SupplierStatus } from '../types';

interface SupplierFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (supplierData: Omit<Supplier, 'id'> | Supplier) => void;
    supplierToEdit?: Supplier | null;
}

const initialFormData = {
    name: '',
    category: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    status: SupplierStatus.Active,
    rating: 3,
    lastOrderDate: '',
};

export const SupplierFormModal: React.FC<SupplierFormModalProps> = ({ isOpen, onClose, onSubmit, supplierToEdit }) => {
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (isOpen) {
            if (supplierToEdit) {
                setFormData({
                    name: supplierToEdit.name,
                    category: supplierToEdit.category,
                    contactName: supplierToEdit.contactName,
                    email: supplierToEdit.email,
                    phone: supplierToEdit.phone,
                    address: supplierToEdit.address,
                    status: supplierToEdit.status,
                    rating: supplierToEdit.rating,
                    lastOrderDate: supplierToEdit.lastOrderDate || '',
                });
            } else {
                setFormData(initialFormData);
            }
        }
    }, [supplierToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'rating' ? parseInt(value) : value 
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };
    
    const isEditing = !!supplierToEdit;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-card-dark rounded-xl shadow-2xl p-8 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                    {isEditing ? 'Modifier le fournisseur' : 'Ajouter un fournisseur'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nom de l'entreprise</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Catégorie</label>
                            <input type="text" name="category" id="category" value={formData.category} onChange={handleChange} placeholder="Ex: Matériaux, Location..." required className="mt-1 block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="contactName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nom du contact</label>
                            <input type="text" name="contactName" id="contactName" value={formData.contactName} onChange={handleChange} required className="mt-1 block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Téléphone</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Statut</label>
                            <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
                                <option value={SupplierStatus.Active}>Actif</option>
                                <option value={SupplierStatus.Inactive}>Inactif</option>
                                <option value={SupplierStatus.Blacklisted}>Bloqué</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Adresse</label>
                        <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} required className="mt-1 block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>

                    <div>
                        <label htmlFor="rating" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Note / Évaluation (1-5)</label>
                        <div className="flex items-center gap-4 mt-1">
                            <input 
                                type="range" 
                                name="rating" 
                                id="rating" 
                                min="1" 
                                max="5" 
                                step="1"
                                value={formData.rating} 
                                onChange={handleChange} 
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600" 
                            />
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 w-8">{formData.rating}/5</span>
                        </div>
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
