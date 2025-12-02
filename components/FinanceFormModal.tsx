
import React, { useState, useEffect } from 'react';
import type { FinancialRecord, Project, TransactionType, TransactionCategory, TransactionStatus } from '../types';

interface FinanceFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (recordData: Omit<FinancialRecord, 'id'>) => void;
    projects: Project[];
}

const initialFormData: Omit<FinancialRecord, 'id'> = {
    projectId: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    type: 'expense',
    category: 'Material',
    status: 'Pending',
    reference: ''
};

export const FinanceFormModal: React.FC<FinanceFormModalProps> = ({ isOpen, onClose, onSubmit, projects }) => {
    const [formData, setFormData] = useState(initialFormData);

    // Reset form on close or open
    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormData);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'amount' ? parseFloat(value) || 0 : value 
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-card-dark rounded-xl shadow-2xl p-8 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                    Ajouter une Transaction
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Type de transaction</label>
                            <select name="type" id="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="expense">Dépense</option>
                                <option value="income">Revenu / Facture</option>
                            </select>
                        </div>
                        <div>
                             <label htmlFor="projectId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Projet concerné</label>
                             <select name="projectId" id="projectId" value={formData.projectId} onChange={handleChange} required className="mt-1 block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="">Sélectionner un projet</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Libellé / Description</label>
                            <input type="text" name="description" id="description" value={formData.description} onChange={handleChange} required placeholder="Ex: Achat ciment" className="mt-1 block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="reference" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Référence (Facultatif)</label>
                            <input type="text" name="reference" id="reference" value={formData.reference} onChange={handleChange} placeholder="N° Facture" className="mt-1 block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Montant (FCFA)</label>
                            <input type="number" name="amount" id="amount" step="0.01" value={formData.amount} onChange={handleChange} required className="mt-1 block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Catégorie</label>
                            <select name="category" id="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="Material">Matériaux</option>
                                <option value="Labor">Main d'œuvre</option>
                                <option value="Subcontractor">Sous-traitance</option>
                                <option value="Equipment">Équipement</option>
                                <option value="Invoice">Facturation Client</option>
                                <option value="Other">Autre</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
                            <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Statut de paiement</label>
                        <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="Pending">En attente</option>
                            <option value="Paid">Payé</option>
                            <option value="Overdue">En retard</option>
                        </select>
                    </div>

                    <div className="flex justify-end pt-6 space-x-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold">Annuler</button>
                        <button type="submit" className="px-6 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-semibold">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
