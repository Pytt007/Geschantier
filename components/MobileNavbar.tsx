
import React from 'react';
import { Icon } from './Icon';
import type { Page } from '../types';

interface MobileNavbarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}

export const MobileNavbar: React.FC<MobileNavbarProps> = ({ currentPage, setCurrentPage }) => {
    const navItems: { page: Page; label: string; icon: string }[] = [
        { page: 'Dashboard', label: 'Accueil', icon: 'dashboard' },
        { page: 'Projects', label: 'Projets', icon: 'projects' },
        { page: 'Finance', label: 'Finance', icon: 'wallet' },
        { page: 'Settings', label: 'Paramètres', icon: 'cog' },
    ];

    return (
        <div 
            className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-card-dark/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 z-50 transition-all duration-300"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => {
                    const isActive = currentPage === item.page;
                    return (
                        <button
                            key={item.page}
                            onClick={() => setCurrentPage(item.page)}
                            className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 group ${
                                isActive 
                                    ? 'text-indigo-600 dark:text-indigo-400' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            {isActive && (
                                <span className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-b-full shadow-[0_2px_8px_rgba(79,70,229,0.4)] animate-fadeIn"></span>
                            )}
                            
                            <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 -translate-y-1' : 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800'}`}>
                                <Icon name={item.icon} className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                            </div>
                            <span className={`text-[10px] font-medium transition-all ${isActive ? 'font-bold' : ''}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
