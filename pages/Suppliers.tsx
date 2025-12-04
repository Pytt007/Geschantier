import React, { useState } from 'react';
import type { Supplier } from '../types';
import { SupplierStatus } from '../types';
import { Icon } from '../components/Icon';
import { ConfirmationModal } from '../components/ConfirmationModal';

import { SupplierFormModal } from '../components/SupplierFormModal';

interface SuppliersProps {
    suppliers: Supplier[];
    setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
}

const getStatusColor = (status: SupplierStatus) => {
    switch (status) {
        case SupplierStatus.Active: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
        case SupplierStatus.Inactive: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600';
        case SupplierStatus.Blacklisted: return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
        default: return 'bg-slate-100 text-slate-800';
    }
};

const RatingStars: React.FC<{ rating: number }> = ({ rating }) => {
    return (
        <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
                <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: `'FILL' ${i < rating ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}>
                    star
                </span>
            ))}
        </div>
    );
};

export const Suppliers: React.FC<SuppliersProps> = ({ suppliers, setSuppliers }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);

    // Calcul des catégories uniques pour le filtre
    const categories = Array.from(new Set(suppliers.map(s => s.category)));

    const filteredSuppliers = suppliers.filter(supplier => {
        const matchesSearch =
            supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory ? supplier.category === filterCategory : true;
        return matchesSearch && matchesCategory;
    });

    const handleOpenModal = (supplier?: Supplier) => {
        setSupplierToEdit(supplier || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSupplierToEdit(null);
        setIsModalOpen(false);
    };

    const handleSubmit = (supplierData: Omit<Supplier, 'id'> | Supplier) => {
        if ('id' in supplierData) {
            // Update
            setSuppliers(prev => prev.map(s => s.id === supplierData.id ? supplierData : s));
        } else {
            // Create
            const newSupplier: Supplier = {
                ...supplierData,
                id: `sup-${Date.now()}`,
            };
            setSuppliers(prev => [newSupplier, ...prev]);
        }
    };

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);

    // ... (existing code)

    const handleDelete = (id: string) => {
        setSupplierToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (supplierToDelete) {
            setSuppliers(prev => prev.filter(s => s.id !== supplierToDelete));
            setSupplierToDelete(null);
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <>
            <SupplierFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                supplierToEdit={supplierToEdit}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Supprimer le fournisseur"
                message="Êtes-vous sûr de vouloir supprimer ce fournisseur ? Cette action est irréversible."
                confirmLabel="Supprimer"
                cancelLabel="Annuler"
                isDangerous={true}
            />

            <div className="space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Gestion des Fournisseurs</h1>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">
                            Gérez votre carnet d'adresses, suivez les contrats et évaluez vos partenaires.
                        </p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center bg-indigo-600 text-white font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
                    >
                        <Icon name="plus" className="w-5 h-5 mr-2" />
                        Nouveau Fournisseur
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm">
                    <div className="relative col-span-1 md:col-span-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon name="search" className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher par nom, contact ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg leading-5 bg-slate-50 dark:bg-slate-800 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out sm:text-sm"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg bg-slate-50 dark:bg-slate-800 dark:text-white"
                        >
                            <option value="">Toutes les catégories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Suppliers List */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredSuppliers.length > 0 ? (
                        filteredSuppliers.map(supplier => (
                            <div key={supplier.id} className="bg-white dark:bg-card-dark rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-slate-100 dark:border-slate-700/50 flex flex-col h-full">
                                {/* Card Header */}
                                <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{supplier.name}</h3>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">{supplier.category}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(supplier.status)}`}>
                                            {supplier.status}
                                        </span>
                                        <RatingStars rating={supplier.rating} />
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-5 flex-1 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 p-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-full text-indigo-600 dark:text-indigo-400 shrink-0">
                                            <Icon name="users" className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Contact</p>
                                            <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{supplier.contactName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-emerald-600 dark:text-emerald-400 shrink-0">
                                            <Icon name="phone" className="w-4 h-4" />
                                            {/* Using a generic phone icon or similar */}
                                            <span className="material-symbols-outlined text-base">call</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Coordonnées</p>
                                            <p className="text-sm text-slate-700 dark:text-slate-200"><a href={`tel:${supplier.phone}`} className="hover:underline">{supplier.phone}</a></p>
                                            <p className="text-sm text-slate-700 dark:text-slate-200"><a href={`mailto:${supplier.email}`} className="hover:underline">{supplier.email}</a></p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 p-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-full text-amber-600 dark:text-amber-400 shrink-0">
                                            <span className="material-symbols-outlined text-base">pin_drop</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Adresse</p>
                                            <p className="text-sm text-slate-700 dark:text-slate-200">{supplier.address}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-3 flex justify-between items-center border-t border-slate-100 dark:border-slate-700">
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                        Dernière commande: <span className="font-medium">{supplier.lastOrderDate ? new Date(supplier.lastOrderDate).toLocaleDateString('fr-FR') : '-'}</span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button onClick={() => handleOpenModal(supplier)} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors" title="Modifier">
                                            <Icon name="pencil" className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(supplier.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Supprimer">
                                            <Icon name="trash" className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-1 md:col-span-2 xl:col-span-3 flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-card-dark rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full mb-4">
                                <Icon name="search" className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Aucun fournisseur trouvé</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md mt-1">
                                Essayez de modifier vos critères de recherche ou ajoutez un nouveau fournisseur.
                            </p>
                            <button
                                onClick={() => { setSearchTerm(''); setFilterCategory(''); }}
                                className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                Effacer les filtres
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};