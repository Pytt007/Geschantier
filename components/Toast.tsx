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
                return 'bg-white/90 dark:bg-slate-800/90 border-green-500/20 text-slate-800 dark:text-slate-100';
            case 'error':
                return 'bg-white/90 dark:bg-slate-800/90 border-red-500/20 text-slate-800 dark:text-slate-100';
            case 'warning':
                return 'bg-white/90 dark:bg-slate-800/90 border-amber-500/20 text-slate-800 dark:text-slate-100';
            case 'info':
            default:
                return 'bg-white/90 dark:bg-slate-800/90 border-indigo-500/20 text-slate-800 dark:text-slate-100';
        }
    };

    const getIconStyles = () => {
        switch (type) {
            case 'success': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
            case 'error': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
            case 'warning': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
            case 'info': default: return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400';
        }
    };

    const iconName = type === 'success' ? 'check' : type === 'error' ? 'report' : type === 'warning' ? 'shield' : 'briefcase';

    return (
        <div className={`flex items-center p-4 mb-3 rounded-xl shadow-xl backdrop-blur-md border animate-slideInRight w-full max-w-sm ${getStyles()}`}>
            <div className={`flex-shrink-0 mr-4 p-2 rounded-full ${getIconStyles()}`}>
                <Icon name={iconName} className="w-5 h-5" />
            </div>
            <div className="flex-1 text-sm font-medium leading-relaxed">{message}</div>
            <button
                onClick={() => onClose(id)}
                className="ml-4 p-1 -mr-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
                aria-label="Close notification"
            >
                <Icon name="x" className="w-4 h-4" />
            </button>
        </div>
    );
};
