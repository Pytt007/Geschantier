
import React, { useState, useMemo, useEffect } from 'react';
import type { Project, Task, TeamMember } from '../types';
import { TaskStatus } from '../types';
import { Icon } from '../components/Icon';

interface PlanningProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  teamMembers: TeamMember[];
}

// --- CONSTANTES & TYPES LOCAUX ---

type Category = 'Meeting' | 'Team' | 'Planning' | 'Work' | 'Review' | 'Other';

const categories: { id: Category; label: string; color: string }[] = [
    { id: 'Meeting', label: 'Meeting', color: 'bg-indigo-500' },
    { id: 'Team', label: 'Team', color: 'bg-emerald-500' },
    { id: 'Planning', label: 'Planning', color: 'bg-violet-600' },
    { id: 'Work', label: 'System Work', color: 'bg-amber-500' },
    { id: 'Review', label: 'Review', color: 'bg-rose-500' },
    { id: 'Other', label: 'Other', color: 'bg-slate-500' },
];

// --- UTILITAIRES ---

const getMonthDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    let startPadding = firstDay.getDay() - 1;
    if (startPadding === -1) startPadding = 6;

    for (let i = startPadding; i > 0; i--) {
        const d = new Date(year, month, 1 - i);
        days.push({ date: d, isCurrentMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const d = new Date(year, month, i);
        days.push({ date: d, isCurrentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, month + 1, i);
        days.push({ date: d, isCurrentMonth: false });
    }
    return days;
};

// --- COMPOSANT MODALE ---

const EventModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date;
    taskToEdit?: Task | null;
    projects: Project[];
    onSave: (taskData: Partial<Task> & { projectId?: string }) => void;
    teamMembers: TeamMember[];
}> = ({ isOpen, onClose, selectedDate, taskToEdit, projects, onSave, teamMembers }) => {
    const [formData, setFormData] = useState({
        title: '',
        dueDate: '',
        startTime: '09:00',
        endTime: '10:00',
        projectId: '',
        category: 'Meeting' as Category,
        location: 'www.google.com/meet/230xdp...',
        description: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (taskToEdit) {
                setFormData({
                    title: taskToEdit.title,
                    dueDate: taskToEdit.dueDate,
                    startTime: taskToEdit.startTime || '09:00',
                    endTime: taskToEdit.endTime || '10:00',
                    projectId: projects.find(p => p.tasks.some(t => t.id === taskToEdit.id))?.id || '',
                    category: (taskToEdit.category as Category) || 'Meeting',
                    location: taskToEdit.location || '',
                    description: taskToEdit.description || ''
                });
            } else {
                setFormData({
                    title: '',
                    dueDate: selectedDate.toISOString().split('T')[0],
                    startTime: '09:00',
                    endTime: '10:00',
                    projectId: projects[0]?.id || '',
                    category: 'Meeting',
                    location: 'www.google.com/meet/230xdp...',
                    description: ''
                });
            }
        }
    }, [isOpen, taskToEdit, selectedDate, projects]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const formattedDisplayDate = new Date(formData.dueDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white dark:bg-card-dark w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="p-6 space-y-5">
                    <div className="flex justify-between items-start">
                        <input 
                            type="text" 
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            placeholder="Titre de l'événement"
                            className="text-xl font-bold text-slate-800 dark:text-white bg-transparent border-none focus:ring-0 p-0 w-full placeholder-slate-400 dark:placeholder-slate-500"
                            autoFocus
                        />
                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><Icon name="pencil" className="w-4 h-4" /></button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center text-slate-600 dark:text-slate-300">
                            <Icon name="calendar" className="w-5 h-5 mr-3 text-slate-400" />
                            <span className="font-medium capitalize">{formattedDisplayDate}</span>
                        </div>
                        <div className="flex items-center gap-3 pl-8">
                            <div className="relative">
                                <input 
                                    type="time" 
                                    value={formData.startTime}
                                    onChange={e => setFormData({...formData, startTime: e.target.value})}
                                    className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-1 px-2 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <span className="text-slate-400">-</span>
                            <div className="relative">
                                <input 
                                    type="time" 
                                    value={formData.endTime}
                                    onChange={e => setFormData({...formData, endTime: e.target.value})}
                                    className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-1 px-2 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center text-slate-600 dark:text-slate-300">
                        <Icon name="pin_drop" className="w-5 h-5 mr-3 text-slate-400" />
                        <input 
                            type="text"
                            value={formData.location}
                            onChange={e => setFormData({...formData, location: e.target.value})}
                            placeholder="Lieu ou lien visio"
                            className="bg-transparent border-none focus:ring-0 p-0 text-sm w-full text-indigo-500 underline truncate placeholder-slate-400"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setFormData({...formData, category: cat.id})}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                    formData.category === cat.id 
                                        ? `${cat.color} text-white shadow-md scale-105` 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                    
                    <div className="pt-2">
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Projet</label>
                         <select 
                            value={formData.projectId}
                            onChange={e => setFormData({...formData, projectId: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:ring-indigo-500"
                         >
                             {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                         </select>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex -space-x-2">
                            {teamMembers.slice(0, 3).map(m => (
                                <img key={m.id} src={m.avatarUrl} alt={m.name} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 object-cover" />
                            ))}
                            {teamMembers.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                                    +{Math.max(0, teamMembers.length - 3)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                    <button 
                        onClick={handleSubmit}
                        className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center"
                    >
                        {taskToEdit ? 'Enregistrer' : 'Ajouter'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

export const Planning: React.FC<PlanningProps> = ({ projects, setProjects, teamMembers }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(projects.map(p => p.id));
    const [showFilters, setShowFilters] = useState(false);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [modalDate, setModalDate] = useState(new Date());

    // --- DATA PREPARATION ---

    const allTasks = useMemo(() => {
        return projects.flatMap((project, idx) => {
            return project.tasks.map(task => ({
                ...task,
                projectId: project.id,
                projectName: project.name,
            }));
        });
    }, [projects]);

    const visibleTasks = useMemo(() => 
        allTasks.filter(t => selectedProjectIds.includes(t.projectId)), 
    [allTasks, selectedProjectIds]);

    // --- NAVIGATION ---

    const handlePrev = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setCurrentDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentDate(newDate);
    };

    // --- ACTIONS ---

    const handleCellClick = (date: Date) => {
        setModalDate(date);
        setTaskToEdit(null);
        setIsModalOpen(true);
    };

    const handleTaskClick = (task: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setTaskToEdit(task);
        setModalDate(new Date(task.dueDate));
        setIsModalOpen(true);
    };

    const handleSaveTask = (taskData: Partial<Task> & { projectId?: string }) => {
        setProjects(prevProjects => {
            const newProjects = [...prevProjects];
            const targetProjectId = taskData.projectId || (taskToEdit && projects.find(proj => proj.tasks.find(t => t.id === taskToEdit.id))?.id);
            const projectIndex = newProjects.findIndex(p => p.id === targetProjectId);
            
            if (projectIndex === -1) return prevProjects;

            const project = { ...newProjects[projectIndex] };
            
            if (taskToEdit) {
                project.tasks = project.tasks.map(t => t.id === taskToEdit.id ? { ...t, ...taskData } : t);
            } else {
                const newTask: Task = {
                    id: `task-${Date.now()}`,
                    title: taskData.title || 'Nouvel événement',
                    assignedTo: 'Moi', 
                    status: TaskStatus.ToDo,
                    dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
                    startTime: taskData.startTime,
                    endTime: taskData.endTime,
                    category: taskData.category,
                    description: taskData.description,
                    location: taskData.location
                };
                project.tasks = [...project.tasks, newTask];
            }
            newProjects[projectIndex] = project;
            return newProjects;
        });
    };

    const monthDays = getMonthDays(currentDate.getFullYear(), currentDate.getMonth());

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] font-display overflow-hidden">
            
            <EventModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedDate={modalDate}
                taskToEdit={taskToEdit}
                projects={projects}
                onSave={handleSaveTask}
                teamMembers={teamMembers}
            />

            {/* Header Section */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Planning</h1>
                    
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 ml-2">
                        <button onClick={handlePrev} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 transition-colors">
                            <Icon name="arrowLeft" className="w-4 h-4" />
                        </button>
                        <span className="px-3 text-sm font-bold capitalize text-slate-800 dark:text-slate-200 min-w-[120px] text-center">
                            {currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={handleNext} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 transition-colors">
                            <Icon name="arrowRight" className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Project Filter Dropdown */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showFilters ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                        >
                            <Icon name="filter" className="w-4 h-4 mr-2" />
                            Projets
                        </button>
                        
                        {showFilters && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowFilters(false)}></div>
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-card-dark rounded-xl shadow-xl border border-slate-100 dark:border-slate-700/50 z-20 p-2 animate-fadeIn">
                                    <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                                        {projects.map(p => {
                                            const isChecked = selectedProjectIds.includes(p.id);
                                            return (
                                                <button 
                                                    key={p.id} 
                                                    className="flex items-center gap-3 w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors" 
                                                    onClick={() => setSelectedProjectIds(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id])}
                                                >
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isChecked ? `bg-indigo-600 border-indigo-600 text-white` : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'}`}>
                                                        {isChecked && <Icon name="check" className="w-3 h-3" />}
                                                    </div>
                                                    <span className={`text-xs truncate ${isChecked ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>{p.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => { setTaskToEdit(null); setIsModalOpen(true); }}
                        className="flex items-center justify-center bg-indigo-600 text-white font-semibold px-3 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors text-sm"
                    >
                        <Icon name="plus" className="w-4 h-4 mr-2" />
                        Événement
                    </button>
                </div>
            </div>

            {/* Month Grid - Seamless, No Card Background */}
            <div className="flex-1 grid grid-cols-7 grid-rows-[auto_repeat(6,1fr)] border-t border-l border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-card-dark">
                
                {/* Headers */}
                {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(d => (
                    <div key={d} className="py-2 text-center font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 text-xs uppercase tracking-wide border-r border-b border-slate-200 dark:border-slate-700">
                        {d}
                    </div>
                ))}

                {/* Days */}
                {monthDays.map((d, i) => {
                    const isToday = d.date.toDateString() === new Date().toDateString();
                    const dayTasks = visibleTasks.filter(t => t.dueDate === d.date.toISOString().split('T')[0]);
                    
                    return (
                        <div 
                            key={i} 
                            onClick={() => handleCellClick(d.date)}
                            className={`
                                relative p-1 transition-colors cursor-pointer group flex flex-col gap-1 border-r border-b border-slate-200 dark:border-slate-700
                                ${!d.isCurrentMonth ? 'bg-slate-50/50 dark:bg-slate-800/50 text-slate-400' : 'bg-white dark:bg-card-dark hover:bg-slate-50 dark:hover:bg-slate-800'}
                            `}
                        >
                            <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium mb-1 ${isToday ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-300'}`}>
                                {d.date.getDate()}
                            </div>
                            
                            <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                                {dayTasks.slice(0, 5).map(task => {
                                    const categoryColor = categories.find(c => c.id === task.category)?.color || 'bg-slate-500';
                                    return (
                                        <div key={task.id} onClick={(e) => handleTaskClick(task, e)} className="flex items-center gap-1.5 px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${categoryColor}`}></div>
                                            <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate leading-tight">{task.title}</span>
                                        </div>
                                    );
                                })}
                                {dayTasks.length > 5 && (
                                    <span className="text-[9px] text-slate-400 pl-2 font-medium">+{dayTasks.length - 5} autres</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
