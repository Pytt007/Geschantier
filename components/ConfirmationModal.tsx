import React from 'react';
import { Icon } from './Icon';
import { Modal } from './Modal';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDangerous?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirmer',
    cancelLabel = 'Annuler',
    isDangerous = false,
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm" showCloseButton={false}>
            <div className="flex flex-col items-center text-center">
                <div className={`p-4 rounded-full mb-4 ${isDangerous ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
                    <Icon name={isDangerous ? 'trash' : 'shield'} className="w-8 h-8" />
                </div>

                <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                    {message}
                </p>

                <div className="flex w-full gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-medium transition-colors"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40 ${isDangerous
                            ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20 hover:shadow-red-500/40'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
