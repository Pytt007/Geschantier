
import React, { useState } from 'react';
import type { Material as MaterialType } from '../types';
import { MaterialStatus } from '../types';
import { Icon } from '../components/Icon';
import { MaterialFormModal } from '../components/MaterialFormModal';

interface MaterialProps {
  materials: MaterialType[];
  setMaterials: React.Dispatch<React.SetStateAction<MaterialType[]>>;
}

const getStatusColor = (status: MaterialStatus) => {
    switch (status) {
        case MaterialStatus.Available: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case MaterialStatus.InUse: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        case MaterialStatus.Maintenance: return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
        case MaterialStatus.Broken: return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export const Material: React.FC<MaterialProps> = ({ materials, setMaterials }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState<MaterialType | null>(null);

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = 
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (material.serialNumber && material.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'All' || material.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (material?: MaterialType) => {
    setMaterialToEdit(material || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setMaterialToEdit(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (materialData: Omit<MaterialType, 'id'> | MaterialType) => {
    if ('id' in materialData) {
        // Update
        setMaterials(prev => prev.map(m => m.id === materialData.id ? materialData : m));
    } else {
        // Create
        const newMaterial: MaterialType = {
            ...materialData,
            id: `mat-${Date.now()}`,
        };
        setMaterials(prev => [newMaterial, ...prev]);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet équipement de l'inventaire ?")) {
        setMaterials(prev => prev.filter(m => m.id !== id));
    }
  };

  // Stats rapides
  const totalItems = materials.reduce((acc, curr) => acc + curr.quantity, 0);
  const maintenanceItems = materials.filter(m => m.status === MaterialStatus.Maintenance).length;
  const availableItems = materials.filter(m => m.status === MaterialStatus.Available).length;

  return (
    <>
      <MaterialFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        materialToEdit={materialToEdit}
      />

      <div className="space-y-6">
        {/* Header & Stats */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Gestion du Matériel & Stock</h1>
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                    Suivi de l'inventaire, localisation des équipements et maintenance.
                </p>
            </div>
            <div className="flex gap-4 text-sm">
                <div className="bg-white dark:bg-card-dark px-4 py-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                    <span className="block text-slate-500 dark:text-slate-400 text-xs">Total Pièces</span>
                    <span className="font-bold text-lg text-slate-800 dark:text-slate-200">{totalItems}</span>
                </div>
                <div className="bg-white dark:bg-card-dark px-4 py-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                    <span className="block text-slate-500 dark:text-slate-400 text-xs">Disponibles</span>
                    <span className="font-bold text-lg text-green-600 dark:text-green-400">{availableItems}</span>
                </div>
                <div className="bg-white dark:bg-card-dark px-4 py-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                    <span className="block text-slate-500 dark:text-slate-400 text-xs">En Maintenance</span>
                    <span className="font-bold text-lg text-amber-600 dark:text-amber-400">{maintenanceItems}</span>
                </div>
            </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon name="search" className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Rechercher équipement..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full sm:w-64 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:text-white"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                >
                    <option value="All">Tous les statuts</option>
                    {Object.values(MaterialStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
            <button 
                onClick={() => handleOpenModal()}
                className="w-full md:w-auto flex items-center justify-center bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
            >
                <Icon name="plus" className="w-5 h-5 mr-2" />
                Ajouter Matériel
            </button>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMaterials.map(material => (
                <div key={material.id} className="bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all group border border-slate-100 dark:border-slate-700/50">
                    <div className="relative h-48 bg-slate-200 dark:bg-slate-700">
                        {material.imageUrl ? (
                            <img src={material.imageUrl} alt={material.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Icon name="archive" className="w-16 h-16 text-slate-400" />
                            </div>
                        )}
                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-black/50 p-1 rounded-lg backdrop-blur-sm">
                             <button onClick={() => handleOpenModal(material)} className="p-1.5 text-slate-700 dark:text-slate-200 hover:text-indigo-600">
                                <Icon name="pencil" className="w-4 h-4" />
                            </button>
                             <button onClick={() => handleDelete(material.id)} className="p-1.5 text-slate-700 dark:text-slate-200 hover:text-red-600">
                                <Icon name="trash" className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="absolute bottom-3 left-3">
                             <span className={`px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm ${getStatusColor(material.status)}`}>
                                {material.status}
                            </span>
                        </div>
                    </div>
                    
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">{material.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{material.category}</p>
                            </div>
                            <div className="text-right">
                                <span className="block text-2xl font-bold text-slate-800 dark:text-slate-200">{material.quantity}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">en stock</span>
                            </div>
                        </div>

                        <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                     <span className="material-symbols-outlined text-base">pin_drop</span> Localisation
                                </span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">{material.location}</span>
                            </div>
                            {material.serialNumber && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                         <span className="material-symbols-outlined text-base">barcode</span> N° Série
                                    </span>
                                    <span className="font-mono text-slate-600 dark:text-slate-400 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                        {material.serialNumber}
                                    </span>
                                </div>
                            )}
                             {material.lastMaintenance && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                         <span className="material-symbols-outlined text-base">build</span> Maintenance
                                    </span>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{new Date(material.lastMaintenance).toLocaleDateString('fr-FR')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            
            {filteredMaterials.length === 0 && (
                <div className="col-span-full py-12 text-center bg-white dark:bg-card-dark rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="search" className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Aucun matériel trouvé</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Essayez de modifier vos filtres ou ajoutez un nouvel équipement.</p>
                </div>
            )}
        </div>
      </div>
    </>
  );
};
