
import React from 'react';
import { Icon } from './Icon';

interface HeaderProps {
  toggleSidebar: () => void;
  title: string;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, title, userName, userRole, userAvatar }) => {
  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-card-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="text-slate-600 dark:text-slate-300 md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <Icon name="menu" className="w-6 h-6" />
        </button>

        {/* Titre dynamique visible uniquement sur mobile */}
        <h1 className="text-lg font-bold text-slate-800 dark:text-white sm:hidden truncate max-w-[200px] animate-fadeIn">
          {title}
        </h1>

        {/* Recherche visible uniquement sur tablette/desktop */}
        <div className="relative hidden sm:block">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" placeholder="Rechercher..." className="bg-slate-100 dark:bg-slate-800 dark:text-white border border-transparent focus:bg-white dark:focus:bg-slate-700 focus:border-indigo-300 rounded-lg py-2 pl-10 pr-4 w-64 transition-all" />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative group">
          <div className="flex items-center cursor-pointer">
            <img className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-700 shadow-sm" src={userAvatar || "https://picsum.photos/seed/user/200"} alt="User avatar" />
            <div className="ml-3 hidden sm:block">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{userName || 'Utilisateur'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{userRole || 'Membre'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
