import React, { createContext, useContext, useState, useCallback } from 'react';
import { ConfirmationModal } from '../components/ConfirmationModal';

interface ConfirmationOptions {
    title: string;
    message: string;
    isDangerous?: boolean;
    confirmLabel?: string;
    cancelLabel?: string;
}

interface ConfirmationContextType {
    requestConfirmation: (action: () => void, options: ConfirmationOptions) => void;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export const ConfirmationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<() => void>(() => { });
    const [options, setOptions] = useState<ConfirmationOptions>({
        title: '',
        message: '',
        isDangerous: false,
    });

    const requestConfirmation = useCallback((action: () => void, options: ConfirmationOptions) => {
        setConfirmAction(() => action);
        setOptions(options);
        setIsOpen(true);
    }, []);

    const handleConfirm = () => {
        confirmAction();
        setIsOpen(false);
    };

    return (
        <ConfirmationContext.Provider value={{ requestConfirmation }}>
            {children}
            <ConfirmationModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onConfirm={handleConfirm}
                title={options.title}
                message={options.message}
                isDangerous={options.isDangerous}
                confirmLabel={options.confirmLabel}
                cancelLabel={options.cancelLabel}
            />
        </ConfirmationContext.Provider>
    );
};

export const useConfirmation = () => {
    const context = useContext(ConfirmationContext);
    if (context === undefined) {
        throw new Error('useConfirmation must be used within a ConfirmationProvider');
    }
    return context;
};
