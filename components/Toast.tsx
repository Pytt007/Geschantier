import React, { useEffect } from 'react';
import { Icon } from './Icon';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
    onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 3000, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const getStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-white dark:bg-card-dark border-l-4 border-l-green-500 text-slate-800 dark:text-slate-100 border-y border-r border-slate-100 dark:border-slate-700';
            case 'error':
                return 'bg-white dark:bg-card-dark border-l-4 border-l-red-500 text-slate-800 dark:text-slate-100 border-y border-r border-slate-100 dark:border-slate-700';
            case 'warning':
                return 'bg-white dark:bg-card-dark border-l-4 border-l-amber-500 text-slate-800 dark:text-slate-100 border-y border-r border-slate-100 dark:border-slate-700';
            case 'info':
            default:
                return 'bg-white dark:bg-card-dark border-l-4 border-l-indigo-500 text-slate-800 dark:text-slate-100 border-y border-r border-slate-100 dark:border-slate-700';
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'success': return 'text-green-500';
            case 'error': return 'text-red-500';
            case 'warning': return 'text-amber-500';
            case 'info': default: return 'text-indigo-500';
        }
    };

    const iconName = type === 'success' ? 'check' : type === 'error' ? 'report' : type === 'warning' ? 'shield' : 'briefcase';

    return (
        <div className={`flex items-center p-4 mb-3 rounded-r-lg shadow-lg w-full max-w-sm animate-slideInRight ${getStyles()}`}>
            <div className={`flex-shrink-0 mr-3 ${getIconColor()}`}>
                <Icon name={iconName} className="w-6 h-6" />
            </div>
            <div className="flex-1 text-sm font-medium">{message}</div>
            <button onClick={() => onClose(id)} className="ml-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <span className="text-xl">&times;</span>
            </button>
        </div>
    );
};
