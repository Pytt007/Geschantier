
import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from '../components/Icon';
import type { TeamMember, ClockingEntry } from '../types';

interface ClockingProps {
    teamMembers: TeamMember[];
    clockingEntries: ClockingEntry[];
    setClockingEntries: React.Dispatch<React.SetStateAction<ClockingEntry[]>>;
}

const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const calculateDuration = (start: string, end: string) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (diffMinutes < 0) return '0h 00m';
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
};

// Helpers pour le formatage des dates de groupe
const getWeekLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    // Ajustement pour avoir lundi comme premier jour
    const diffToMon = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date);
    monday.setDate(diffToMon);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const start = monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const end = sunday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

    return `Semaine du ${start} au ${end}`;
};

const getMonthLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
};

import { ConfirmationModal } from '../components/ConfirmationModal';
import { ClockingFormModal } from '../components/ClockingFormModal';

export const Clocking: React.FC<ClockingProps> = ({ teamMembers, clockingEntries, setClockingEntries }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [formattedDate, setFormattedDate] = useState('');
    const [viewMode, setViewMode] = useState<'daily' | 'history'>('daily');
    const [historyGroup, setHistoryGroup] = useState<'weekly' | 'monthly'>('weekly');
    const [selectedHistoryDate, setSelectedHistoryDate] = useState<string | null>(null);

    // Reset Modal State
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [memberToReset, setMemberToReset] = useState<string | null>(null);

    // Delete Confirmation State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

    // CRUD Modal State
    const [isClockingModalOpen, setIsClockingModalOpen] = useState(false);
    const [entryToEdit, setEntryToEdit] = useState<ClockingEntry | null>(null);

    useEffect(() => {
        setFormattedDate(currentDate.toISOString().split('T')[0]);
    }, [currentDate]);

    const handlePrevDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 1);
        setCurrentDate(newDate);
    };

    const handleNextDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 1);
        setCurrentDate(newDate);
    };

    const handleClockIn = (memberId: string) => {
        const currentTime = getCurrentTime();
        const newEntry: ClockingEntry = {
            id: `clk-${Date.now()}`,
            memberId,
            date: formattedDate,
            startTime: currentTime,
            status: 'present'
        };
        setClockingEntries(prev => [...prev, newEntry]);
    };

    const handleClockOut = (memberId: string, entryId: string) => {
        const currentTime = getCurrentTime();
        setClockingEntries(prev => prev.map(entry =>
            entry.id === entryId
                ? { ...entry, endTime: currentTime, status: 'completed' }
                : entry
        ));
    };

    const handleReset = (memberId: string) => {
        setMemberToReset(memberId);
        setIsResetModalOpen(true);
    };

    const confirmReset = () => {
        if (memberToReset) {
            setClockingEntries(prev => prev.filter(entry => !(entry.memberId === memberToReset && entry.date === formattedDate)));
            setMemberToReset(null);
            setIsResetModalOpen(false);
        }
    };

    const handleNewEntry = () => {
        setEntryToEdit(null);
        setIsClockingModalOpen(true);
    };

    const handleEditEntry = (entry: ClockingEntry) => {
        setEntryToEdit(entry);
        setIsClockingModalOpen(true);
    };

    const handleDeleteEntry = (entryId: string) => {
        setEntryToDelete(entryId);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteEntry = () => {
        if (entryToDelete) {
            setClockingEntries(prev => prev.filter(e => e.id !== entryToDelete));
            setIsDeleteModalOpen(false);
            setEntryToDelete(null);
        }
    };

    const handleSaveEntry = (entryData: Omit<ClockingEntry, 'id'> | ClockingEntry) => {
        if ('id' in entryData) {
            // Update
            setClockingEntries(prev => prev.map(e => e.id === entryData.id ? entryData : e));
        } else {
            // Create
            const newEntry: ClockingEntry = {
                ...entryData,
                id: `clk-${Date.now()}`,
            };
            setClockingEntries(prev => [...prev, newEntry]);
        }
        setIsClockingModalOpen(false);
    };

    const getMember = (id: string) => teamMembers.find(m => m.id === id);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    // Stats du jour courant (Vue Journalière)
    const dayEntries = clockingEntries.filter(entry => entry.date === formattedDate);
    const presentCount = dayEntries.filter(e => e.status === 'present').length;
    const completedCount = dayEntries.filter(e => e.status === 'completed').length;
    const absentCount = teamMembers.length - (presentCount + completedCount);

    // ------------------------------------------------------------------------
    // LOGIQUE HISTORIQUE
    // ------------------------------------------------------------------------

    // 1. Organiser les entrées par date (YYYY-MM-DD)
    const historyByDate = useMemo(() => {
        const map: Record<string, ClockingEntry[]> = {};
        clockingEntries.forEach(entry => {
            if (!map[entry.date]) map[entry.date] = [];
            map[entry.date].push(entry);
        });
        return map;
    }, [clockingEntries]);

    // 2. Grouper les dates uniques par Semaine ou Mois
    const groupedHistoryDates = useMemo(() => {
        const groups: Record<string, string[]> = {}; // Label -> [YYYY-MM-DD, YYYY-MM-DD]
        const uniqueDates = Object.keys(historyByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        uniqueDates.forEach(dateStr => {
            const label = historyGroup === 'weekly' ? getWeekLabel(dateStr) : getMonthLabel(dateStr);
            if (!groups[label]) {
                groups[label] = [];
            }
            groups[label].push(dateStr);
        });

        return groups;
    }, [historyByDate, historyGroup]);

    // Rendu de la vue détaillée d'une journée spécifique dans l'historique
    const renderHistoryDetail = () => {
        if (!selectedHistoryDate) return null;

        const entries = historyByDate[selectedHistoryDate] || [];
        const totalMembers = teamMembers.length;
        const presentMembers = entries.length;
        const presenceRate = Math.round((presentMembers / totalMembers) * 100);

        return (
            <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setSelectedHistoryDate(null)}
                        className="flex items-center text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
                    >
                        <Icon name="arrowLeft" className="w-5 h-5 mr-2" />
                        Retour à la liste
                    </button>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 capitalize">
                        {new Date(selectedHistoryDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </h2>
                </div>

                {/* Stats Rapides du jour historique */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Taux de Présence</p>
                            <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{presenceRate}%</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Icon name="chart-pie" className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Effectif Présent</p>
                            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{presentMembers} / {totalMembers}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Icon name="users" className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Liste détaillée */}
                <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Membre</th>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Heure Arrivée</th>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Heure Départ</th>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Durée</th>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Statut</th>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {entries.map(entry => {
                                const member = getMember(entry.memberId);
                                return (
                                    <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {member && (
                                                    member.avatarUrl ? (
                                                        <img src={member.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{getInitials(member.name)}</span>
                                                        </div>
                                                    )
                                                )}
                                                <div>
                                                    <p className="font-medium text-slate-800 dark:text-slate-200">{member?.name || 'Inconnu'}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{member?.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono text-slate-600 dark:text-slate-400">{entry.startTime || '-'}</td>
                                        <td className="p-4 font-mono text-slate-600 dark:text-slate-400">{entry.endTime || '-'}</td>
                                        <td className="p-4 font-medium text-indigo-600 dark:text-indigo-400">
                                            {entry.startTime && entry.endTime ? calculateDuration(entry.startTime, entry.endTime) : '-'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${entry.status === 'completed' ? 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800' :
                                                'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
                                                }`}>
                                                {entry.status === 'completed' ? 'Terminé' : 'Présent'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditEntry(entry)}
                                                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Icon name="pencil" className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteEntry(entry.id)}
                                                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Icon name="trash" className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <ConfirmationModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onConfirm={confirmReset}
                title="Réinitialiser le pointage"
                message="Êtes-vous sûr de vouloir réinitialiser le pointage de ce membre pour aujourd'hui ? Cette action est irréversible."
                confirmLabel="Réinitialiser"
                cancelLabel="Annuler"
                isDangerous={true}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteEntry}
                title="Supprimer le pointage"
                message="Êtes-vous sûr de vouloir supprimer ce pointage ? Cette action est irréversible."
                confirmLabel="Supprimer"
                cancelLabel="Annuler"
                isDangerous={true}
            />

            <ClockingFormModal
                isOpen={isClockingModalOpen}
                onClose={() => setIsClockingModalOpen(false)}
                onSubmit={handleSaveEntry}
                entryToEdit={entryToEdit}
                teamMembers={teamMembers}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Suivi de Pointage</h1>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">
                        Gérez les présences et les heures de travail de vos équipes.
                    </p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg self-start md:self-auto">
                    <button
                        onClick={() => setViewMode('daily')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'daily' ? 'bg-white dark:bg-card-dark shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        Journalier
                    </button>
                    <button
                        onClick={() => setViewMode('history')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'history' ? 'bg-white dark:bg-card-dark shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        Historique
                    </button>
                </div>
            </div>

            {viewMode === 'daily' ? (
                <>
                    {/* Date Navigation & Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Date Nav */}
                        <div className="lg:col-span-1 bg-white dark:bg-card-dark p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-2">
                                <button onClick={handlePrevDay} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400">
                                    <Icon name="arrowLeft" className="w-5 h-5" />
                                </button>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 capitalize">
                                    {currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </h2>
                                <button onClick={handleNextDay} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400">
                                    <Icon name="arrowRight" className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="text-center">
                                <button
                                    onClick={() => setCurrentDate(new Date())}
                                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    Revenir à aujourd'hui
                                </button>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Présents</p>
                                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{presentCount}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <Icon name="check" className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Terminés</p>
                                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{completedCount}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <Icon name="checkDouble" className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Absents</p>
                                    <p className="text-2xl font-bold text-slate-600 dark:text-slate-300">{absentCount}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                    <Icon name="close" className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {teamMembers.map(member => {
                            const entry = dayEntries.find(e => e.memberId === member.id);
                            const isPresent = entry?.status === 'present';
                            const isCompleted = entry?.status === 'completed';
                            const isAbsent = !entry;

                            return (
                                <div key={member.id} className={`
                                    relative overflow-hidden rounded-xl shadow-sm transition-all border
                                    ${isPresent ? 'bg-white dark:bg-card-dark border-emerald-200 dark:border-emerald-800 ring-1 ring-emerald-100 dark:ring-emerald-900' :
                                        isCompleted ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700' :
                                            'bg-white dark:bg-card-dark border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'}
                                `}>
                                    {/* Status Stripe */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isPresent ? 'bg-emerald-500' :
                                        isCompleted ? 'bg-indigo-500' :
                                            'bg-slate-300 dark:bg-slate-600'
                                        }`}></div>

                                    <div className="p-5 pl-6">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                {member.avatarUrl ? (
                                                    <img src={member.avatarUrl} alt={member.name} className={`w-12 h-12 rounded-full object-cover border-2 ${isPresent ? 'border-emerald-500' : 'border-transparent'}`} />
                                                ) : (
                                                    <div className={`w-12 h-12 rounded-full border-2 ${isPresent ? 'border-emerald-500' : 'border-transparent'} bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center`}>
                                                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{getInitials(member.name)}</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{member.name}</h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{member.role}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${isPresent ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' :
                                                    isCompleted ? 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800' :
                                                        'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'
                                                    }`}>
                                                    {isPresent ? 'Présent' : isCompleted ? 'Terminé' : 'Absent'}
                                                </div>
                                                {!isAbsent && (
                                                    <button
                                                        onClick={() => handleReset(member.id)}
                                                        className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                        title="Réinitialiser"
                                                    >
                                                        <Icon name="trash" className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-5 grid grid-cols-2 gap-3">
                                            {/* ... (existing time display) */}
                                            <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-center">
                                                <span className="block text-xs text-slate-500 dark:text-slate-400 uppercase">Début</span>
                                                <span className={`font-mono font-semibold ${entry?.startTime ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                                                    {entry?.startTime || '--:--'}
                                                </span>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-center">
                                                <span className="block text-xs text-slate-500 dark:text-slate-400 uppercase">Fin</span>
                                                <span className={`font-mono font-semibold ${entry?.endTime ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                                                    {entry?.endTime || '--:--'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-5">
                                            {isAbsent && (
                                                <button
                                                    onClick={() => handleClockIn(member.id)}
                                                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm transition-colors flex items-center justify-center"
                                                >
                                                    <Icon name="clock" className="w-5 h-5 mr-2" />
                                                    Pointer Arrivée
                                                </button>
                                            )}
                                            {isPresent && (
                                                <button
                                                    onClick={() => handleClockOut(member.id, entry!.id)}
                                                    className="w-full py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg font-semibold shadow-sm transition-colors flex items-center justify-center"
                                                >
                                                    <Icon name="logout" className="w-5 h-5 mr-2" />
                                                    Pointer Départ
                                                </button>
                                            )}
                                            {isCompleted && (
                                                <div className="w-full py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg font-medium text-center text-sm flex items-center justify-center border border-indigo-100 dark:border-indigo-800/50">
                                                    <span className="mr-2">Durée totale :</span>
                                                    <span className="font-bold">{calculateDuration(entry!.startTime!, entry!.endTime!)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                // ... (existing history view)
                // VUE HISTORIQUE
                <div className="space-y-6">
                    {selectedHistoryDate ? (
                        renderHistoryDetail()
                    ) : (
                        <>
                            {/* History Toolbar */}
                            <div className="flex items-center justify-between bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Grouper par :</span>
                                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                        <button
                                            onClick={() => setHistoryGroup('weekly')}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${historyGroup === 'weekly' ? 'bg-white dark:bg-card-dark shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}
                                        >
                                            Hebdomadaire
                                        </button>
                                        <button
                                            onClick={() => setHistoryGroup('monthly')}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${historyGroup === 'monthly' ? 'bg-white dark:bg-card-dark shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}
                                        >
                                            Mensuel
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={handleNewEntry}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center"
                                >
                                    <Icon name="plus" className="w-4 h-4 mr-2" />
                                    Ajouter un pointage
                                </button>
                            </div>

                            {/* Grouped Days List */}
                            {Object.keys(groupedHistoryDates).length > 0 ? (
                                Object.entries(groupedHistoryDates).map(([groupLabel, dates]) => (
                                    <div key={groupLabel} className="bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700 mb-6">
                                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                                            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center text-sm uppercase tracking-wide">
                                                <Icon name="calendar" className="w-5 h-5 mr-2 text-slate-500" />
                                                {groupLabel}
                                            </h3>
                                        </div>
                                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {(dates as string[]).map(dateStr => {
                                                const entries = historyByDate[dateStr] || [];
                                                const totalPresent = entries.length;
                                                const totalTeam = teamMembers.length;
                                                const displayDate = new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
                                                const isToday = dateStr === formattedDate;

                                                return (
                                                    <button
                                                        key={dateStr}
                                                        onClick={() => setSelectedHistoryDate(dateStr)}
                                                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isToday ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                                                {new Date(dateStr).getDate()}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{displayDate}</p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">{entries.length} pointages enregistrés</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-6">
                                                            <div className="text-right">
                                                                <span className="block text-xs text-slate-400 uppercase font-semibold">Présence</span>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-emerald-500"
                                                                            style={{ width: `${(totalPresent / totalTeam) * 100}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{totalPresent}/{totalTeam}</span>
                                                                </div>
                                                            </div>
                                                            <div className="p-2 rounded-full text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                                                                <Icon name="visibility" className="w-5 h-5" />
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm p-8 text-center border border-slate-200 dark:border-slate-700">
                                    <div className="bg-slate-50 dark:bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Icon name="search" className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400">Aucun historique de pointage disponible.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
