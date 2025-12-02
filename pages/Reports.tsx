
import React from 'react';
import { Icon } from '../components/Icon';

const KpiCard: React.FC<{ title: string; value: string; change?: string; changeColor?: string }> = ({ title, value, change, changeColor }) => (
    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{value}</p>
            {change && <p className={`text-sm font-semibold ${changeColor}`}>{change}</p>}
        </div>
    </div>
);

const Calendar: React.FC = () => {
    const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    const dates = [
        ...Array.from({ length: 6 }, (_, i) => ({ day: 25 + i, currentMonth: false })),
        ...Array.from({ length: 24 }, (_, i) => ({ day: 1 + i, currentMonth: true })),
    ];
    const selectedStart = 5;
    const selectedEnd = 11;

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
                <button className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                    <Icon name="arrowLeft" className="w-5 h-5" />
                </button>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">octobre 2023</p>
                <button className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                    <Icon name="arrowRight" className="w-5 h-5" />
                </button>
            </div>
            <div className="grid grid-cols-7 text-center text-xs text-slate-500 dark:text-slate-400">
                {days.map((d, i) => <div key={i} className="h-8 flex items-center justify-center font-bold">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 text-center text-sm">
                {dates.map(({ day, currentMonth }, index) => {
                    const isSelected = currentMonth && day >= selectedStart && day <= selectedEnd;
                    const isStart = currentMonth && day === selectedStart;
                    const isEnd = currentMonth && day === selectedEnd;
                    const isBetween = currentMonth && day > selectedStart && day < selectedEnd;
                    const textColor = currentMonth ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500';

                    return (
                        <div key={index} className={`h-8 flex items-center justify-center ${isBetween ? 'bg-indigo-100 dark:bg-indigo-500/20' : ''} ${isStart ? 'rounded-l-full bg-indigo-100 dark:bg-indigo-500/20' : ''} ${isEnd ? 'rounded-r-full bg-indigo-100 dark:bg-indigo-500/20' : ''}`}>
                            <button className={`w-8 h-8 rounded-full ${textColor} ${isSelected ? 'font-semibold' : ''} ${isStart || isEnd ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                                {day}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ReportTableRow: React.FC<{ task: string, status: string, responsible: string, budget: string, statusColor: string }> = ({ task, status, responsible, budget, statusColor }) => (
    <tr className="border-b border-slate-200 dark:border-slate-700">
        <td className="p-3 font-medium text-slate-700 dark:text-slate-300">{task}</td>
        <td className="p-3"><span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>{status}</span></td>
        <td className="p-3 text-slate-600 dark:text-slate-400">{responsible}</td>
        <td className="p-3 text-right text-slate-600 dark:text-slate-400">{budget}</td>
    </tr>
);


export const Reports: React.FC = () => {
    return (
        <div className="space-y-8">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Génération de Rapports</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Configurez et visualisez les rapports de vos projets.</p>
                </div>
                <button className="flex items-center justify-center h-11 px-6 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
                    <Icon name="plus" className="w-5 h-5 mr-2" />
                    <span>Générer un Rapport</span>
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="p-6 bg-white dark:bg-card-dark rounded-xl shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Paramètres du Rapport</h2>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label htmlFor="project-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 pb-2">Sélection du Projet</label>
                                <select id="project-select" className="w-full h-12 px-4 rounded-lg text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                                    <option>Rénovation Tour Administrative</option>
                                    <option>Construction Siège "Le Futur"</option>
                                    <option>Extension du Musée National</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="report-type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 pb-2">Type de Rapport</label>
                                <select id="report-type" className="w-full h-12 px-4 rounded-lg text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                                    <option>Rapport d'avancement</option>
                                    <option>Rapport des coûts</option>
                                    <option>Rapport de performance</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white dark:bg-card-dark rounded-xl shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Plage de Dates</h2>
                        <Calendar />
                    </div>
                </div>

                {/* Report Preview */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="p-6 bg-white dark:bg-card-dark rounded-xl shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4 mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Rapport d'avancement - Tour Administrative</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">05 Octobre - 11 Octobre 2023</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="flex items-center justify-center h-10 px-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                    <Icon name="users" className="w-4 h-4 mr-2" />
                                    <span>Partager</span>
                                </button>
                                <button className="flex items-center justify-center h-10 px-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                    <Icon name="archive" className="w-4 h-4 mr-2" />
                                    <span>Exporter PDF</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <KpiCard title="Avancement Global" value="76%" />
                            <KpiCard title="Coûts Totals" value="82,4 M FCFA" />
                            <KpiCard title="Respect du Budget" value="+3.2%" changeColor="text-green-500" />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Tâche</th>
                                        <th className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Statut</th>
                                        <th className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Responsable</th>
                                        <th className="p-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Budget vs Réel</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <ReportTableRow task="Fondations et Gros Œuvre" status="Terminé" responsible="A. Koné" budget="29,5 M / 27,8 M" statusColor="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300" />
                                    <ReportTableRow task="Plomberie et Électricité" status="En cours" responsible="M. Traoré" budget="19,6 M / 18,3 M" statusColor="bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300" />
                                    <ReportTableRow task="Finitions intérieures" status="À venir" responsible="D. Nguema" budget="32,7 M / -" statusColor="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300" />
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
