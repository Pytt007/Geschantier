import React, { useEffect } from 'react';
import { Icon } from './Icon';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
    showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'md',
    showCloseButton = true,
}) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const getMaxWidthClass = () => {
        switch (maxWidth) {
            case 'sm': return 'max-w-sm';
            case 'md': return 'max-w-md';
            case 'lg': return 'max-w-lg';
            case 'xl': return 'max-w-xl';
            case '2xl': return 'max-w-2xl';
            case '3xl': return 'max-w-3xl';
            case '4xl': return 'max-w-4xl';
            case '5xl': return 'max-w-5xl';
            case 'full': return 'max-w-full mx-4';
            default: return 'max-w-md';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Content */}
            <div
                className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full ${getMaxWidthClass()} max-h-[90vh] flex flex-col animate-scaleIn overflow-hidden ring-1 ring-slate-900/5 dark:ring-slate-100/10`}
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl z-10">
                        {title && (
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                                {title}
                            </h3>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                aria-label="Close modal"
                            >
                                <Icon name="x" className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {children}
                </div>
            </div>
        </div>
    );
};
