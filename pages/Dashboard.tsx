
import React from 'react';
import type { Page, Project } from '../types';
import { ProjectStatus, TaskStatus } from '../types';
import { Icon } from '../components/Icon';
import { LineChart } from '../components/LineChart';
import { DoughnutChart } from '../components/DoughnutChart';


interface DashboardProps {
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    onNavigate: (page: Page) => void;
    onNewProject: () => void;
    userName?: string;
}

const StatCard: React.FC<{ title: string; value: string; percentage: string; isPositive: boolean; icon: string; iconBg: string }> = ({ title, value, percentage, isPositive, icon, iconBg }) => (
    <div className="bg-white dark:bg-card-dark p-5 rounded-xl shadow-sm flex justify-between items-center">
        <div>
            <p className="text-sm font-medium text-slate-500 dark:text-text-secondary-dark">{title}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-text-primary-dark mt-1">{value}</p>
            <div className={`flex items-center text-sm mt-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                <Icon name={isPositive ? 'arrowUp' : 'arrowDown'} className="w-4 h-4 mr-1" />
                <span>{percentage} vs mois dernier</span>
            </div>
        </div>
        <div className={`p-3 rounded-lg ${iconBg}`}>
            <Icon name={icon} className="w-7 h-7 text-white" />
        </div>
    </div>
);


export const Dashboard: React.FC<DashboardProps> = ({ projects, onNavigate, onNewProject, userName }) => {
    const inProgressProjects = projects.filter(p => p.status === ProjectStatus.InProgress).length;
    const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
    const tasksToDo = projects.flatMap(p => p.tasks).filter(t => t.status === TaskStatus.ToDo).length;
    const completedTasks = projects.flatMap(p => p.tasks).filter(t => t.status === TaskStatus.Done).length;

    const upcomingTasks = projects
        .flatMap(p => p.tasks.map(task => ({ ...task, projectName: p.name })))
        .filter(t => t.status !== TaskStatus.Done)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);

    const performanceData = [
        { label: 'Jan', value: 15 }, { label: 'Fév', value: 25 },
        { label: 'Mar', value: 40 }, { label: 'Avr', value: 35 },
        { label: 'Mai', value: 50 }, { label: 'Juin', value: 70 },
        { label: 'Juil', value: 65 },
    ];

    const statusCounts = projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
    }, {} as Record<ProjectStatus, number>);

    const statusColors: Record<ProjectStatus, string> = {
        [ProjectStatus.InProgress]: '#3b82f6', // sky-500 from Tailwind
        [ProjectStatus.Completed]: '#22c55e', // green-500 from Tailwind
        [ProjectStatus.Planning]: '#f59e0b', // amber-500 from Tailwind
        [ProjectStatus.OnHold]: '#64748b', // slate-500 from Tailwind
    };

    const doughnutData = (Object.keys(ProjectStatus) as Array<keyof typeof ProjectStatus>)
        .map(key => ProjectStatus[key])
        .filter(status => statusCounts[status] > 0)
        .map(status => ({
            label: status,
            value: statusCounts[status],
            color: statusColors[status] || '#9ca3af',
        }));

    // Formatage intelligent du budget pour FCFA (Milliards vs Millions)
    const formatBudget = (amount: number) => {
        if (amount >= 1000000000) {
            return `${(amount / 1000000000).toFixed(1)} Mrd FCFA`;
        }
        return `${(amount / 1000000).toFixed(1)} M FCFA`;
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Tableau de Bord</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Bienvenue, <span className="font-semibold text-indigo-600 dark:text-indigo-400">{userName || 'Utilisateur'}</span> ! Voici un aperçu de vos chantiers.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Projets en cours" value={String(inProgressProjects)} percentage="+5.2%" isPositive={true} icon="briefcase" iconBg="bg-sky-500" />
                <StatCard title="Budget Total" value={formatBudget(totalBudget)} percentage="+12.5%" isPositive={true} icon="cash" iconBg="bg-emerald-500" />
                <StatCard title="Tâches à faire" value={String(tasksToDo)} percentage="-2.1%" isPositive={false} icon="clipboard-list" iconBg="bg-amber-500" />
                <StatCard title="Tâches terminées" value={String(completedTasks)} percentage="+8.0%" isPositive={true} icon="team" iconBg="bg-indigo-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-card-dark p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Performance des Chantiers</h3>
                    <div className="h-80">
                        <LineChart data={performanceData} />
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-white dark:bg-card-dark p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Actions Rapides</h3>
                        <div className="space-y-3">
                            <button onClick={onNewProject} className="w-full text-left flex items-center bg-indigo-600 text-white font-semibold px-4 py-3 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"><Icon name="plus" className="w-5 h-5 mr-3" /> Nouveau Projet</button>
                            <button onClick={() => onNavigate('DailyReportGenerator')} className="w-full text-left flex items-center bg-pink-600 text-white font-semibold px-4 py-3 rounded-lg shadow-sm hover:bg-pink-700 transition-colors"><Icon name="report" className="w-5 h-5 mr-3" /> Générer un Rapport</button>
                            <button onClick={() => onNavigate('RiskAnalysis')} className="w-full text-left flex items-center bg-amber-500 text-white font-semibold px-4 py-3 rounded-lg shadow-sm hover:bg-amber-600 transition-colors"><Icon name="shield" className="w-5 h-5 mr-3" /> Analyser un Risque</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-card-dark p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Statut des Projets</h3>
                    <div className="flex flex-col md:flex-row items-center justify-start gap-6">
                        <div className="flex-shrink-0">
                            <DoughnutChart data={doughnutData} />
                        </div>
                        <div className="w-full space-y-2 text-sm">
                            {doughnutData.map(item => (
                                <div key={item.label} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                                        <span className="text-slate-600 dark:text-slate-400">{item.label}:</span>
                                    </div>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 ml-auto">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-card-dark p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Tâches à Venir</h3>
                    <div className="space-y-3">
                        {upcomingTasks.length > 0 ? upcomingTasks.map(task => (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <div>
                                    <p className="font-medium text-slate-700 dark:text-slate-300">{task.title}</p>

                                    <p className="text-xs text-slate-500 dark:text-slate-400">{task.projectName}</p>
                                </div>
                                <p className="text-sm font-semibold text-indigo-600">{new Date(task.dueDate).toLocaleDateString('fr-FR')}</p>
                            </div>
                        )) : <p className="text-slate-500 dark:text-slate-400 text-center py-4">Aucune tâche à venir.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};
