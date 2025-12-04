
import React, { useState } from 'react';
import { Spinner } from '../components/Spinner';
import { Icon } from '../components/Icon';
import ReactMarkdown from 'react-markdown';
import { initialProjects } from '../constants';

// Utilitaires pour la gestion des dates (YYYY-MM-DD)
const isDateBefore = (d1: string, d2: string) => d1 < d2;
const isDateBetween = (target: string, start: string, end: string) => target > start && target < end;

const CalendarWidget: React.FC<{
    startDate: string;
    endDate: string;
    onRangeSelect: (start: string, end: string) => void
}> = ({ startDate, endDate, onRangeSelect }) => {
    // État pour la navigation du calendrier (mois affiché)
    const [viewDate, setViewDate] = useState(startDate ? new Date(startDate) : new Date());

    const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    const monthName = viewDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

    const year = viewDate.getFullYear();
    const monthIdx = viewDate.getMonth();

    // Génération de la grille du calendrier
    const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (y: number, m: number) => (new Date(y, m, 1).getDay() + 6) % 7;

    const daysInMonth = getDaysInMonth(year, monthIdx);
    const startDay = getFirstDayOfMonth(year, monthIdx);

    const grid = [];

    // Padding mois précédent
    const prevMonthDays = getDaysInMonth(year, monthIdx - 1);
    for (let i = startDay - 1; i >= 0; i--) {
        grid.push({ day: prevMonthDays - i, currentMonth: false, date: '' });
    }

    // Jours du mois courant
    for (let i = 1; i <= daysInMonth; i++) {
        // Construction manuelle de la chaîne YYYY-MM-DD locale pour éviter les décalages UTC
        const localDateStr = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        grid.push({ day: i, currentMonth: true, date: localDateStr });
    }

    // Padding mois suivant pour compléter 6 lignes (42 cases)
    const remaining = 42 - grid.length;
    for (let i = 1; i <= remaining; i++) {
        grid.push({ day: i, currentMonth: false, date: '' });
    }

    const handlePrevMonth = () => setViewDate(new Date(year, monthIdx - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(year, monthIdx + 1, 1));

    const handleDayClick = (date: string) => {
        if (startDate && endDate && startDate !== endDate) {
            // Si une plage complète existe déjà, on recommence une nouvelle sélection
            onRangeSelect(date, date);
        } else if (startDate && startDate === endDate) {
            // Si une seule date est sélectionnée (début == fin)
            if (isDateBefore(date, startDate)) {
                // Si on clique avant le début, ça devient le nouveau début
                onRangeSelect(date, startDate);
            } else {
                // Sinon ça devient la fin
                onRangeSelect(startDate, date);
            }
        } else {
            // Cas initial ou reset
            onRangeSelect(date, date);
        }
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors">
                    <Icon name="arrowLeft" className="w-5 h-5" />
                </button>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 capitalize">{monthName}</p>
                <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors">
                    <Icon name="arrowRight" className="w-5 h-5" />
                </button>
            </div>
            <div className="grid grid-cols-7 text-center text-xs text-slate-400 dark:text-slate-500 mb-2">
                {days.map((d, i) => <div key={i} className="h-8 flex items-center justify-center font-semibold">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 text-center text-sm gap-y-1">
                {grid.map(({ day, currentMonth, date }, index) => {
                    if (!currentMonth) {
                        return (
                            <div key={index} className="h-8 flex items-center justify-center w-full text-slate-300 dark:text-slate-600">
                                <span className="w-8 h-8 flex items-center justify-center">{day}</span>
                            </div>
                        );
                    }

                    const isStart = startDate === date;
                    const isEnd = endDate === date;
                    const inRange = startDate && endDate && isDateBetween(date, startDate, endDate);
                    const isSelected = isStart || isEnd;

                    // Styles conditionnels pour la plage
                    let wrapperClass = "h-8 flex items-center justify-center w-full relative";

                    // Fond de la plage (entre début et fin)
                    if (inRange) wrapperClass += " bg-indigo-100 dark:bg-indigo-900/30";
                    if (isStart && endDate && startDate !== endDate) wrapperClass += " bg-gradient-to-r from-transparent to-indigo-100 dark:to-indigo-900/30 rounded-l-full";
                    if (isEnd && startDate && startDate !== endDate) wrapperClass += " bg-gradient-to-l from-transparent to-indigo-100 dark:to-indigo-900/30 rounded-r-full";
                    // Si start et end sont adjacents, ajuster les arrondis visuels
                    if (inRange && !isStart && !isEnd) wrapperClass += ""; // Déjà géré par bg-indigo-100

                    const textColor = 'text-slate-700 dark:text-slate-300';

                    let btnClass = `w-8 h-8 rounded-full transition-all duration-200 relative z-10 ${textColor} `;
                    if (isSelected) {
                        btnClass = `w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold shadow-sm z-10`;
                    } else if (!inRange) {
                        btnClass += " hover:bg-slate-100 dark:hover:bg-slate-700";
                    }

                    return (
                        <div key={index} className={wrapperClass}>
                            {/* Background fill fix for start/end caps */}
                            {isStart && endDate && startDate !== endDate && <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-indigo-100 dark:bg-indigo-900/30 z-0"></div>}
                            {isEnd && startDate && startDate !== endDate && <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-indigo-100 dark:bg-indigo-900/30 z-0"></div>}

                            <button
                                onClick={() => handleDayClick(date)}
                                className={btnClass}
                            >
                                {day}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const KpiPlaceholder: React.FC<{ label: string, value: string, color?: string }> = ({ label, value, color = "text-slate-800 dark:text-slate-200" }) => (
    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
);

export const DailyReportGenerator: React.FC = () => {
    const [reportContent, setReportContent] = useState('');
    // État pour la plage de dates (initialisé à aujourd'hui pour les deux)
    const todayStr = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(todayStr);
    const [endDate, setEndDate] = useState(todayStr);

    const [selectedProjectId, setSelectedProjectId] = useState(initialProjects[0]?.id || '');
    const [reportType, setReportType] = useState('Avancement');

    const handleDownload = () => {
        if (!reportContent) return;
        const blob = new Blob([reportContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Rapport_${reportType}_${startDate}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleRangeSelect = (start: string, end: string) => {
        setStartDate(start);
        setEndDate(end);
    };

    const currentProjectName = initialProjects.find(p => p.id === selectedProjectId)?.name || "Projet";

    const formatDateDisplay = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Génération de Rapports</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Configurez et visualisez les rapports de vos projets.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Settings & Calendar */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* Settings Card */}
                    <div className="p-6 bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">
                            Paramètres du Rapport
                        </h2>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 pb-2">Sélection du Projet</label>
                                <div className="relative">
                                    <select
                                        value={selectedProjectId}
                                        onChange={(e) => setSelectedProjectId(e.target.value)}
                                        className="w-full h-12 pl-4 pr-10 rounded-lg text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none font-medium"
                                    >
                                        <option key="default" value="" disabled>Choisir un projet</option>
                                        {initialProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        <Icon name="arrowDown" className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 pb-2">Type de Rapport</label>
                                <div className="relative">
                                    <select
                                        value={reportType}
                                        onChange={(e) => setReportType(e.target.value)}
                                        className="w-full h-12 pl-4 pr-10 rounded-lg text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none font-medium"
                                    >
                                        <option value="Avancement">Rapport d'avancement</option>
                                        <option value="Incidents">Rapport d'incidents</option>
                                        <option value="Financier">Point financier</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        <Icon name="arrowDown" className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center pb-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Contenu du Rapport (Markdown)</label>
                                </div>
                                <textarea
                                    rows={10}
                                    value={reportContent}
                                    onChange={(e) => setReportContent(e.target.value)}
                                    placeholder="# Titre du rapport&#10;&#10;## Avancement&#10;- Tâche A terminée&#10;- Tâche B en cours"
                                    className="w-full p-3 rounded-lg text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Calendar Card */}
                    <div className="p-6 bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Plage de Dates</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Sélectionnez une date de début et une date de fin.</p>
                        <CalendarWidget startDate={startDate} endDate={endDate} onRangeSelect={handleRangeSelect} />
                    </div>
                </div>

                {/* Right Column: Preview */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="p-6 bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 min-h-[600px] flex flex-col">

                        {/* Preview Header */}
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                                    {reportType} - {currentProjectName}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                                    {startDate === endDate
                                        ? formatDateDisplay(startDate)
                                        : `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`
                                    }
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDownload}
                                    disabled={!reportContent}
                                    className="flex items-center justify-center h-10 px-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Icon name="archive" className="w-4 h-4 mr-2" />
                                    <span>Exporter</span>
                                </button>
                            </div>
                        </div>

                        {/* Optional KPI Placeholders for visual consistency with design */}
                        {reportContent && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                <KpiPlaceholder label="Avancement Global" value="En Cours" color="text-sky-600 dark:text-sky-400" />
                                <KpiPlaceholder label="Jours Couverts" value={String(Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)} />
                                <KpiPlaceholder label="Statut" value="Conforme" color="text-green-600 dark:text-green-400" />
                            </div>
                        )}

                        {/* Markdown Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {reportContent ? (
                                <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
                                    <ReactMarkdown>{reportContent}</ReactMarkdown>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 p-8">
                                    <div className="bg-white dark:bg-slate-700 p-4 rounded-full mb-4 shadow-sm">
                                        <Icon name="report" className="w-12 h-12 text-indigo-300 dark:text-indigo-400 opacity-50" />
                                    </div>
                                    <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">Aucun rapport généré</p>
                                    <p className="text-sm max-w-sm text-center mt-2">
                                        Rédigez le contenu du rapport à gauche pour voir l'aperçu.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
