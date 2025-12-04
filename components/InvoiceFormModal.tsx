
import React, { useState, useEffect } from 'react';
import type { Invoice, InvoiceItem, Project, InvoiceStatus } from '../types';
import { Icon } from './Icon';
import { Modal } from './Modal';

interface InvoiceFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (invoiceData: Omit<Invoice, 'id'>) => void;
    projects: Project[];
}

const initialItem: InvoiceItem = {
    id: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    total: 0
};

const initialFormData: Omit<Invoice, 'id'> = {
    number: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    projectId: '',
    clientName: '',
    clientAddress: '',
    items: [],
    subtotal: 0,
    taxRate: 18, // Ajusté pour TVA UEMOA standard
    taxAmount: 0,
    total: 0,
    status: 'Draft',
    notes: ''
};

export const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({ isOpen, onClose, onSubmit, projects }) => {
    const [formData, setFormData] = useState(initialFormData);

    // Initialisation du numéro de facture et de la date d'échéance à l'ouverture
    useEffect(() => {
        if (isOpen) {
            const today = new Date();
            const nextMonth = new Date(today);
            nextMonth.setMonth(today.getMonth() + 1);

            setFormData({
                ...initialFormData,
                number: `FAC-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
                dueDate: nextMonth.toISOString().split('T')[0],
                items: [{ ...initialItem, id: `item-${Date.now()}` }]
            });
        }
    }, [isOpen]);

    // Calcul automatique des totaux quand items ou taxRate changent
    useEffect(() => {
        const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
        const taxAmount = (subtotal * formData.taxRate) / 100;
        const total = subtotal + taxAmount;

        setFormData(prev => ({
            ...prev,
            subtotal,
            taxAmount,
            total
        }));
    }, [formData.items, formData.taxRate]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'taxRate') ? parseFloat(value) || 0 : value
        }));
    };

    const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map(item => {
                if (item.id === id) {
                    const updatedItem = { ...item, [field]: value };
                    // Recalculate total for this item
                    if (field === 'quantity' || field === 'unitPrice') {
                        const qty = field === 'quantity' ? parseFloat(value) || 0 : item.quantity;
                        const price = field === 'unitPrice' ? parseFloat(value) || 0 : item.unitPrice;
                        updatedItem.total = qty * price;
                    }
                    return updatedItem;
                }
                return item;
            })
        }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { ...initialItem, id: `item-${Date.now()}` }]
        }));
    };

    const removeItem = (id: string) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Créer une Facture" maxWidth="4xl">
            <form onSubmit={handleSubmit} className="space-y-6 flex-1">
                {/* Top Section: Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">N° Facture</label>
                        <input type="text" name="number" value={formData.number} onChange={handleChange} className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-lg shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date d'émission</label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-lg shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date d'échéance</label>
                        <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-lg shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Projet associé</label>
                        <select name="projectId" value={formData.projectId} onChange={handleChange} required className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-lg shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500 transition-colors">
                            <option value="">Sélectionner un projet</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Statut</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-lg shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500 transition-colors">
                            <option value="Draft">Brouillon</option>
                            <option value="Sent">Envoyée</option>
                            <option value="Paid">Payée</option>
                            <option value="Overdue">En retard</option>
                        </select>
                    </div>
                </div>

                {/* Client Details */}
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-4 border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Informations Client</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Nom du Client</label>
                            <input type="text" name="clientName" value={formData.clientName} onChange={handleChange} required className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-lg shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Adresse</label>
                            <input type="text" name="clientAddress" value={formData.clientAddress} onChange={handleChange} required className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-lg shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">Détails de la facture</h3>
                        <button type="button" onClick={addItem} className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium flex items-center transition-colors">
                            <Icon name="plus" className="w-4 h-4 mr-1" /> Ajouter une ligne
                        </button>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300">
                                <tr>
                                    <th className="p-3 w-1/2 font-medium">Description</th>
                                    <th className="p-3 w-20 font-medium">Qté</th>
                                    <th className="p-3 w-32 font-medium">Prix Unit. (FCFA)</th>
                                    <th className="p-3 w-32 text-right font-medium">Total (FCFA)</th>
                                    <th className="p-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {formData.items.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-2">
                                            <input type="text" value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 outline-none dark:text-white p-1" placeholder="Description..." required />
                                        </td>
                                        <td className="p-2">
                                            <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 outline-none dark:text-white p-1" />
                                        </td>
                                        <td className="p-2">
                                            <input type="number" step="0.01" value={item.unitPrice} onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)} className="w-full bg-transparent border-b border-transparent focus:border-indigo-500 outline-none dark:text-white p-1" />
                                        </td>
                                        <td className="p-2 text-right font-medium text-slate-700 dark:text-slate-300">
                                            {item.total.toLocaleString('fr-FR')}
                                        </td>
                                        <td className="p-2 text-center">
                                            {formData.items.length > 1 && (
                                                <button type="button" onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                    <Icon name="trash" className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Totals & Footer */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-t border-slate-200 dark:border-slate-700 pt-6">
                    <div className="w-full md:w-1/2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes / Conditions</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-lg shadow-sm p-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors" placeholder="Ex: Paiement à 30 jours..."></textarea>
                    </div>
                    <div className="w-full md:w-1/3 space-y-3 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Sous-total</span>
                            <span>{formData.subtotal.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                            <span className="flex items-center">TVA (%)
                                <input type="number" name="taxRate" value={formData.taxRate} onChange={handleChange} className="w-16 ml-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1 text-xs focus:ring-indigo-500 focus:border-indigo-500" />
                            </span>
                            <span>{formData.taxAmount.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-slate-700">
                            <span>Total TTC</span>
                            <span>{formData.total.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 space-x-3">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold transition-colors">Annuler</button>
                    <button type="submit" className="px-5 py-2.5 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 font-semibold shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40">Générer la facture</button>
                </div>
            </form>
        </Modal>
    );
};
