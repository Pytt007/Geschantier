
import React from 'react';
import type { Page } from '../types';
import { Icon } from './Icon';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const NavLink: React.FC<{
  page: Page;
  label: string;
  icon: string;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isCollapsed: boolean;
}> = ({ page, label, icon, currentPage, setCurrentPage, isCollapsed }) => {
  const isActive = currentPage === page;
  return (
    <button
      onClick={() => setCurrentPage(page)}
      title={isCollapsed ? label : undefined}
      className={`flex items-center w-full py-2.5 text-sm font-medium transition-colors duration-200 ease-in-out rounded-lg ${
        isActive
          ? 'bg-indigo-600 text-white'
          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      } ${isCollapsed ? 'justify-center' : 'px-3'}`}
    >
      <Icon name={icon} className={`w-5 h-5 shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
      {!isCollapsed && <span className="truncate">{label}</span>}
    </button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isOpen, setOpen, isCollapsed, setCollapsed }) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div className={`fixed inset-0 bg-black bg-opacity-60 z-20 md:hidden ${isOpen ? 'block' : 'hidden'}`} onClick={() => setOpen(false)}></div>
      
      {/* Sidebar */}
      <aside className={`absolute md:relative z-30 md:z-auto flex flex-col h-screen bg-slate-900 text-white transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} md:translate-x-0 ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}>
        
        {/* Header */}
        <div className={`flex items-center h-20 ${isCollapsed ? 'justify-center' : 'justify-between px-4'}`}>
            {!isCollapsed && <h2 className="text-2xl font-bold text-white">ChronoChantier</h2>}
            {isCollapsed && <Icon name="briefcase" className="w-7 h-7 text-white" />}
            <button onClick={() => setOpen(false)} className="md:hidden text-white">
                <Icon name="close" />
            </button>
        </div>
        
        {/* Navigation */}
        <nav className={`flex-1 space-y-2 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-4'}`}>
            <NavLink page="Dashboard" label="Tableau de Bord" icon="dashboard" currentPage={currentPage} setCurrentPage={setCurrentPage} isCollapsed={isCollapsed} />
            <NavLink page="Projects" label="Projets" icon="projects" currentPage={currentPage} setCurrentPage={setCurrentPage} isCollapsed={isCollapsed} />
            <NavLink page="Planning" label="Planning" icon="calendar" currentPage={currentPage} setCurrentPage={setCurrentPage} isCollapsed={isCollapsed} />
            <NavLink page="Team" label="Équipe" icon="team" currentPage={currentPage} setCurrentPage={setCurrentPage} isCollapsed={isCollapsed} />
            <NavLink page="Members" label="Membres" icon="users" currentPage={currentPage} setCurrentPage={setCurrentPage} isCollapsed={isCollapsed} />

            <div className="pt-6 mt-4 border-t border-slate-700">
                {!isCollapsed && <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Gestion</p>}
                <div className="space-y-2">
                    <NavLink page="Finance" label="Finance" icon="wallet" currentPage={currentPage} setCurrentPage={setCurrentPage} isCollapsed={isCollapsed} />
                    <NavLink page="Clocking" label="Pointage" icon="clock" currentPage={currentPage} setCurrentPage={setCurrentPage} isCollapsed={isCollapsed} />
                    <NavLink page="Material" label="Matériel" icon="archive" currentPage={currentPage} setCurrentPage={setCurrentPage} isCollapsed={isCollapsed} />
                    <NavLink page="Suppliers" label="Fournisseurs" icon="users" currentPage={currentPage} setCurrentPage={setCurrentPage} isCollapsed={isCollapsed} />
                </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-700">
                {!isCollapsed && <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Outils & Rapports</p>}
                <div className="space-y-2">
                    <NavLink page="Reports" label="Rapports" icon="chart-bar" currentPage={currentPage} setCurrentPage={setCurrentPage} isCollapsed={isCollapsed} />
                    <NavLink page="DailyReportGenerator" label="Générateur Rapport" icon="report" currentPage={currentPage} setCurrentPage={setCurrentPage} isCollapsed={isCollapsed} />
                    <NavLink page="RiskAnalysis" label="Analyse de Risques" icon="shield" currentPage={currentPage} setCurrentPage={setCurrentPage} isCollapsed={isCollapsed} />
                </div>
            </div>
        </nav>
        
        {/* Footer */}
        <div className={`py-6 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          <div className="space-y-2 border-t border-slate-700 pt-4">
            <NavLink page="Settings" label="Paramètres" icon="cog" currentPage={currentPage} setCurrentPage={setCurrentPage} isCollapsed={isCollapsed} />
            <button
                onClick={() => setCollapsed(!isCollapsed)}
                className="hidden md:flex items-center w-full p-3 text-sm font-medium transition-colors duration-200 ease-in-out rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                <Icon name={isCollapsed ? 'arrowRight' : 'arrowLeft'} className={`w-5 h-5 shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                {!isCollapsed && <span className="truncate">Réduire</span>}
            </button>
          </div>

          {!isCollapsed && (
            <div className="mt-4">
                <div className="p-4 bg-slate-800 rounded-lg text-center">
                    <p className="text-sm text-slate-300">Besoin d'aide ?</p>
                    <a href="#" className="text-sm font-semibold text-white hover:underline">Contactez le Support</a>
                </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};