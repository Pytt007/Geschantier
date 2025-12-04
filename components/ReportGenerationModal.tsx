import React, { useState } from 'react';
import { Modal } from './Modal';
import { Icon } from './Icon';
import { Spinner } from './Spinner';
import ReactMarkdown from 'react-markdown';
import type { Project, Document } from '../types';

// --- Calendar Widget (Internal) ---
const isDateBefore = (d1: string, d2: string) => d1 < d2;
const isDateBetween = (target: string, start: string, end: string) => target > start && target < end;

const CalendarWidget: React.FC<{
    startDate: string;
    endDate: string;
    onRangeSelect: (start: string, end: string) => void
}> = ({ startDate, endDate, onRangeSelect }) => {
    const [viewDate, setViewDate] = useState(startDate ? new Date(startDate) : new Date());

    const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    const monthName = viewDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

    const year = viewDate.getFullYear();
    const monthIdx = viewDate.getMonth();

    const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (y: number, m: number) => (new Date(y, m, 1).getDay() + 6) % 7;

    const daysInMonth = getDaysInMonth(year, monthIdx);
    const startDay = getFirstDayOfMonth(year, monthIdx);

    const grid = [];

    const prevMonthDays = getDaysInMonth(year, monthIdx - 1);
    for (let i = startDay - 1; i >= 0; i--) {
        grid.push({ day: prevMonthDays - i, currentMonth: false, date: '' });
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const localDateStr = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        grid.push({ day: i, currentMonth: true, date: localDateStr });
    }

    const remaining = 42 - grid.length;
    for (let i = 1; i <= remaining; i++) {
        grid.push({ day: i, currentMonth: false, date: '' });
    }

    const handlePrevMonth = () => setViewDate(new Date(year, monthIdx - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(year, monthIdx + 1, 1));

    const handleDayClick = (date: string) => {
        if (startDate && endDate && startDate !== endDate) {
            onRangeSelect(date, date);
        } else if (startDate && startDate === endDate) {
            if (isDateBefore(date, startDate)) {
                onRangeSelect(date, startDate);
            } else {
                onRangeSelect(startDate, date);
            }
        } else {
            onRangeSelect(date, date);
        }
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors">
                    <Icon name="arrowLeft" className="w-5 h-5" />
                </button>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 capitalize">{monthName}</p>
                <button type="button" onClick={handleNextMonth} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors">
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

                    let wrapperClass = "h-8 flex items-center justify-center w-full relative";

                    if (inRange) wrapperClass += " bg-indigo-100 dark:bg-indigo-900/30";
                    if (isStart && endDate && startDate !== endDate) wrapperClass += " bg-gradient-to-r from-transparent to-indigo-100 dark:to-indigo-900/30 rounded-l-full";
                    if (isEnd && startDate && startDate !== endDate) wrapperClass += " bg-gradient-to-l from-transparent to-indigo-100 dark:to-indigo-900/30 rounded-r-full";

                    const textColor = 'text-slate-700 dark:text-slate-300';

                    let btnClass = `w-8 h-8 rounded-full transition-all duration-200 relative z-10 ${textColor} `;
                    if (isSelected) {
                        btnClass = `w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold shadow-sm z-10`;
                    } else if (!inRange) {
                        btnClass += " hover:bg-slate-100 dark:hover:bg-slate-700";
                    }

                    return (
                        <div key={index} className={wrapperClass}>
                            {isStart && endDate && startDate !== endDate && <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-indigo-100 dark:bg-indigo-900/30 z-0"></div>}
                            {isEnd && startDate && startDate !== endDate && <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-indigo-100 dark:bg-indigo-900/30 z-0"></div>}

                            <button
                                type="button"
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

interface ReportGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project;
    onSave: (document: Document) => void;
}

export const ReportGenerationModal: React.FC<ReportGenerationModalProps> = ({ isOpen, onClose, project, onSave }) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(todayStr);
    const [endDate, setEndDate] = useState(todayStr);
    const [reportType, setReportType] = useState('Avancement');
    const [reportContent, setReportContent] = useState('');
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    const handleSave = () => {
        if (!reportContent) return;

        // Create a Blob from the report content
        const blob = new Blob([reportContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);

        const fileName = `Rapport_${reportType}_${startDate}_${project.name.replace(/\s+/g, '_')}.md`;

        const newDoc: Document = {
            id: `doc-${Date.now()}`,
            name: fileName,
            type: 'other',
            url: url,
            uploadedAt: new Date().toISOString().split('T')[0],
            size: `${(blob.size / 1024).toFixed(2)} KB`
        };

        onSave(newDoc);
        onClose();
    };

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

    const formatDateDisplay = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Créer un Rapport"
            maxWidth="4xl"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
                {/* Left Column: Configuration */}
                <div className="flex flex-col gap-6 overflow-y-auto pr-2">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Type de Rapport</label>
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="Avancement">Rapport d'avancement</option>
                                <option value="Incidents">Rapport d'incidents</option>
                                <option value="Financier">Point financier</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Période</label>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <CalendarWidget startDate={startDate} endDate={endDate} onRangeSelect={(s, e) => { setStartDate(s); setEndDate(e); }} />
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Contenu du Rapport (Markdown)</label>
                            <textarea
                                rows={8}
                                value={reportContent}
                                onChange={(e) => setReportContent(e.target.value)}
                                placeholder="# Titre du rapport&#10;&#10;## Avancement&#10;- Tâche A terminée&#10;- Tâche B en cours"
                                className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none flex-1"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Preview */}
                <div className="flex flex-col bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-card-dark">
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200">Aperçu</h3>
                            <p className="text-xs text-slate-500">
                                {startDate === endDate ? formatDateDisplay(startDate) : `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`}
                            </p>
                        </div>
                        {reportContent && (
                            <div className="flex gap-2">
                                <button onClick={handleDownload} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="Télécharger">
                                    <Icon name="archive" className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {reportContent ? (
                            <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                                <ReactMarkdown>{reportContent}</ReactMarkdown>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                <Icon name="report" className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-sm text-center">Rédigez votre rapport pour voir l'aperçu</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-card-dark flex justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors">
                            Fermer
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!reportContent}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                        >
                            Enregistrer dans le projet
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
