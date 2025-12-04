
import React, { useState } from 'react';
import { Icon } from '../components/Icon';
import { LineChart } from '../components/LineChart';
import { DoughnutChart } from '../components/DoughnutChart';
import { FinanceFormModal } from '../components/FinanceFormModal';
import { InvoiceFormModal } from '../components/InvoiceFormModal';
import { InvoicePreviewModal } from '../components/InvoicePreviewModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import type { FinancialRecord, Project, TransactionType, TransactionStatus, Invoice } from '../types';

interface FinanceProps {
    financialRecords: FinancialRecord[];
    setFinancialRecords: React.Dispatch<React.SetStateAction<FinancialRecord[]>>;
    invoices: Invoice[];
    setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
    projects: Project[];
}

const KPICard: React.FC<{ title: string; value: string; icon: string; trend?: string; isPositive?: boolean; color: string }> = ({ title, value, icon, trend, isPositive, color }) => (
    <div className="bg-white dark:bg-card-dark p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{value}</p>
            {trend && (
                <div className={`flex items-center text-xs mt-2 font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    <Icon name={isPositive ? 'trending_up' : 'trending_down'} className="w-4 h-4 mr-1" />
                    {trend} vs mois dernier
                </div>
            )}
        </div>
        <div className={`p-4 rounded-full ${color} bg-opacity-10 dark:bg-opacity-20 text-opacity-100`}>
            <Icon name={icon} className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
        </div>
    </div>
);

const StatusBadge: React.FC<{ status: TransactionStatus | string }> = ({ status }) => {
    const colors: { [key: string]: string } = {
        Paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
        Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        Overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
        // Invoice specific
        Draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
        Sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    };
    const labels: { [key: string]: string } = {
        Paid: 'Payé', Pending: 'En attente', Overdue: 'En retard',
        Draft: 'Brouillon', Sent: 'Envoyée'
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors[status] || colors.Draft}`}>
            {labels[status] || status}
        </span>
    );
};

export const Finance: React.FC<FinanceProps> = ({ financialRecords, setFinancialRecords, invoices, setInvoices, projects }) => {
    const [activeTab, setActiveTab] = useState<'treasury' | 'invoices'>('treasury');
    const [filterProject, setFilterProject] = useState<string>('all');

    // Modals State
    const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    // Delete Confirmation State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'transaction' | 'invoice' } | null>(null);

    // --- TREASURY LOGIC ---
    const filteredRecords = financialRecords.filter(r => filterProject === 'all' || r.projectId === filterProject);

    const totalIncome = filteredRecords.filter(r => r.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = filteredRecords.filter(r => r.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const pendingInvoicesAmount = filteredRecords.filter(r => r.type === 'income' && r.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);

    const sortedRecords = [...filteredRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const monthlyData = sortedRecords.reduce((acc, record) => {
        const month = new Date(record.date).toLocaleString('fr-FR', { month: 'short' });
        if (!acc[month]) acc[month] = 0;
        if (record.type === 'income') acc[month] += record.amount;
        return acc;
    }, {} as Record<string, number>);
    const lineChartData = Object.entries(monthlyData).map(([label, value]) => ({ label, value }));

    const expenseCategories = filteredRecords
        .filter(r => r.type === 'expense')
        .reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
        }, {} as Record<string, number>);
    const categoryColors: Record<string, string> = { Material: '#3b82f6', Labor: '#ef4444', Subcontractor: '#f59e0b', Equipment: '#8b5cf6', Other: '#64748b' };
    const doughnutData = Object.entries(expenseCategories).map(([label, value]) => ({
        label,
        value,
        color: categoryColors[label] || '#cbd5e1'
    }));

    const handleAddTransaction = (recordData: Omit<FinancialRecord, 'id'>) => {
        setFinancialRecords(prev => [{ ...recordData, id: `fin-${Date.now()}` }, ...prev]);
    };

    const handleDeleteTransaction = (id: string) => {
        setItemToDelete({ id, type: 'transaction' });
        setIsDeleteModalOpen(true);
    };

    // --- INVOICE LOGIC ---
    const filteredInvoices = invoices.filter(i => filterProject === 'all' || i.projectId === filterProject);

    const handleCreateInvoice = (invoiceData: Omit<Invoice, 'id'>) => {
        const newInvoice = { ...invoiceData, id: `inv-${Date.now()}` };
        setInvoices(prev => [newInvoice, ...prev]);

        // Automatically create a financial record if needed, or just keep it separate.
        // For now, let's just add the invoice.
    };

    const handlePreviewInvoice = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setIsPreviewModalOpen(true);
    };

    const handleDeleteInvoice = (id: string) => {
        setItemToDelete({ id, type: 'invoice' });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;

        if (itemToDelete.type === 'transaction') {
            setFinancialRecords(prev => prev.filter(r => r.id !== itemToDelete.id));
        } else {
            setInvoices(prev => prev.filter(i => i.id !== itemToDelete.id));
        }
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };

    return (
        <>
            <FinanceFormModal
                isOpen={isFinanceModalOpen}
                onClose={() => setIsFinanceModalOpen(false)}
                onSubmit={handleAddTransaction}
                projects={projects}
            />

            <InvoiceFormModal
                isOpen={isInvoiceModalOpen}
                onClose={() => setIsInvoiceModalOpen(false)}
                onSubmit={handleCreateInvoice}
                projects={projects}
            />

            <InvoicePreviewModal
                isOpen={isPreviewModalOpen}
                onClose={() => setIsPreviewModalOpen(false)}
                invoice={selectedInvoice}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={itemToDelete?.type === 'transaction' ? "Supprimer la transaction" : "Supprimer la facture"}
                message={itemToDelete?.type === 'transaction'
                    ? "Êtes-vous sûr de vouloir supprimer cette transaction ? Cette action est irréversible."
                    : "Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible."}
                confirmLabel="Supprimer"
                cancelLabel="Annuler"
                isDangerous={true}
            />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Finance & Facturation</h1>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">Gérez votre trésorerie, vos dépenses et générez vos factures.</p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <select
                            value={filterProject}
                            onChange={(e) => setFilterProject(e.target.value)}
                            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full md:w-48 p-2.5"
                        >
                            <option value="all">Tous les projets</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="border-b border-slate-200 dark:border-slate-700">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('treasury')}
                            className={`flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'treasury' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                        >
                            <Icon name="banknotes" className="w-5 h-5" />
                            Trésorerie & Dépenses
                        </button>
                        <button
                            onClick={() => setActiveTab('invoices')}
                            className={`flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'invoices' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                        >
                            <Icon name="clipboard-list" className="w-5 h-5" />
                            Factures
                        </button>
                    </div>
                </div>

                {activeTab === 'treasury' ? (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Actions Bar Treasury */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsFinanceModalOpen(true)}
                                className="flex items-center justify-center bg-indigo-600 text-white font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
                            >
                                <Icon name="plus" className="w-5 h-5 mr-2" />
                                Ajouter Transaction
                            </button>
                        </div>

                        {/* KPIs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <KPICard title="Chiffre d'Affaires" value={`${totalIncome.toLocaleString('fr-FR')} FCFA`} icon="banknotes" trend="+12%" isPositive={true} color="bg-emerald-500" />
                            <KPICard title="Dépenses Totales" value={`${totalExpenses.toLocaleString('fr-FR')} FCFA`} icon="wallet" trend="+5%" isPositive={false} color="bg-red-500" />
                            <KPICard title="Marge Nette" value={`${netProfit.toLocaleString('fr-FR')} FCFA`} icon="chart-bar" trend="+8%" isPositive={true} color="bg-indigo-500" />
                            <KPICard title="En Attente" value={`${pendingInvoicesAmount.toLocaleString('fr-FR')} FCFA`} icon="clock" color="bg-amber-500" />
                        </div>

                        {/* Charts Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white dark:bg-card-dark p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Évolution du CA</h3>
                                <div className="h-72"><LineChart data={lineChartData.length > 0 ? lineChartData : [{ label: 'Jan', value: 0 }]} /></div>
                            </div>
                            <div className="bg-white dark:bg-card-dark p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Répartition Dépenses</h3>
                                <div className="flex justify-center py-4"><DoughnutChart data={doughnutData.length > 0 ? doughnutData : [{ label: 'Aucune', value: 1, color: '#e2e8f0' }]} /></div>
                            </div>
                        </div>

                        {/* Transactions Table */}
                        <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700"><h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Dernières Transactions</h3></div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-800">
                                        <tr>
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Date</th>
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Libellé</th>
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Projet</th>
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Catégorie</th>
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Montant</th>
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-center">Statut</th>
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {filteredRecords.length > 0 ? filteredRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                                            <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="p-4 text-slate-500">{new Date(record.date).toLocaleDateString('fr-FR')}</td>
                                                <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{record.description} <span className="block text-xs text-slate-400">{record.reference}</span></td>
                                                <td className="p-4 text-slate-600 dark:text-slate-300">{projects.find(p => p.id === record.projectId)?.name || '-'}</td>
                                                <td className="p-4 text-slate-600 dark:text-slate-300">{record.category}</td>
                                                <td className={`p-4 text-right font-bold ${record.type === 'income' ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-200'}`}>{record.type === 'income' ? '+' : '-'} {record.amount.toLocaleString('fr-FR')} FCFA</td>
                                                <td className="p-4 text-center"><StatusBadge status={record.status} /></td>
                                                <td className="p-4 text-right"><button onClick={() => handleDeleteTransaction(record.id)} className="text-slate-400 hover:text-red-600"><Icon name="trash" className="w-4 h-4" /></button></td>
                                            </tr>
                                        )) : <tr><td colSpan={7} className="p-8 text-center text-slate-500">Aucune transaction.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Actions Bar Invoice */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsInvoiceModalOpen(true)}
                                className="flex items-center justify-center bg-indigo-600 text-white font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
                            >
                                <Icon name="plus" className="w-5 h-5 mr-2" />
                                Créer Facture
                            </button>
                        </div>

                        {/* Invoices List */}
                        <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700"><h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Mes Factures</h3></div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-800">
                                        <tr>
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Numéro</th>
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Client</th>
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Projet</th>
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Date d'émission</th>
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Échéance</th>
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Montant TTC</th>
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-center">Statut</th>
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {filteredInvoices.length > 0 ? filteredInvoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(invoice => (
                                            <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="p-4 font-medium text-indigo-600 dark:text-indigo-400">{invoice.number}</td>
                                                <td className="p-4 text-slate-800 dark:text-slate-200">{invoice.clientName}</td>
                                                <td className="p-4 text-slate-600 dark:text-slate-300">{projects.find(p => p.id === invoice.projectId)?.name || '-'}</td>
                                                <td className="p-4 text-slate-500">{new Date(invoice.date).toLocaleDateString('fr-FR')}</td>
                                                <td className="p-4 text-slate-500">{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</td>
                                                <td className="p-4 text-right font-bold text-slate-800 dark:text-slate-200">{invoice.total.toLocaleString('fr-FR')} FCFA</td>
                                                <td className="p-4 text-center"><StatusBadge status={invoice.status} /></td>
                                                <td className="p-4 text-right flex justify-end gap-2">
                                                    <button onClick={() => handlePreviewInvoice(invoice)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors" title="Aperçu / Imprimer">
                                                        <Icon name="visibility" className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteInvoice(invoice.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors" title="Supprimer">
                                                        <Icon name="trash" className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : <tr><td colSpan={8} className="p-12 text-center text-slate-500">Aucune facture trouvée.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};
