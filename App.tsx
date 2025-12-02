
import React, { useState } from 'react';
import { ProjectFormModal } from './components/ProjectFormModal';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileNavbar } from './components/MobileNavbar';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { Planning } from './pages/Planning';
import { ProjectDetail } from './pages/ProjectDetail';
import { DailyReportGenerator } from './pages/DailyReportGenerator';
import { RiskAnalysis } from './pages/RiskAnalysis';
import { Team } from './pages/Team';
import { Members } from './pages/Members';
import { Clocking } from './pages/Clocking';
import { Material } from './pages/Material';
import { Suppliers } from './pages/Suppliers';
import { Settings } from './pages/Settings';
import { Reports } from './pages/Reports';
import { Finance } from './pages/Finance';
import type { Page, Project, TeamMember, Supplier, Material as MaterialType, Team as TeamType, ClockingEntry, FinancialRecord, Invoice } from './types';
import { initialProjects, initialTeamMembers, initialSuppliers, initialMaterials, initialTeams, initialClockingEntries, initialFinancialRecords, initialInvoices, currentUser } from './constants';

import { ToastProvider, useToast } from './contexts/ToastContext';
import { ConfirmationProvider, useConfirmation } from './contexts/ConfirmationContext';

// Inner App Component to use Toast and Confirmation Hooks
const AppContent: React.FC = () => {
  const { showToast } = useToast();
  const { requestConfirmation } = useConfirmation();
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [teams, setTeams] = useState<TeamType[]>(initialTeams);
  const [clockingEntries, setClockingEntries] = useState<ClockingEntry[]>(initialClockingEntries);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [materials, setMaterials] = useState<MaterialType[]>(initialMaterials);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>(initialFinancialRecords);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentPage('Projects'); // Ensure we switch to Projects context if not already
  };

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
  };

  // Wrapper pour gérer la sélection de page et réinitialiser la sélection de projet
  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    setSelectedProjectId(null);
  };

  // Project Modal Handlers
  const handleOpenProjectModal = (project?: Project) => {
    setProjectToEdit(project || null);
    setIsProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setProjectToEdit(null);
    setIsProjectModalOpen(false);
  };

  const handleSubmitProject = (projectData: Omit<Project, 'id' | 'tasks' | 'dailyLogs' | 'documents'> | Project) => {
    if ('id' in projectData) {
      // Update
      setProjects(prev => prev.map(p => p.id === projectData.id ? projectData : p));
      showToast('Projet mis à jour avec succès', 'success');
    } else {
      // Create
      const newProject: Project = {
        ...projectData,
        id: `proj-${Date.now()}`,
        tasks: [],
        dailyLogs: [],
        documents: [],
      };
      setProjects(prev => [newProject, ...prev]);
      showToast('Nouveau projet créé avec succès', 'success');
    }
    handleCloseProjectModal();
  };

  const handleDeleteProject = (projectId: string) => {
    requestConfirmation(
      () => {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        showToast('Projet supprimé avec succès', 'success');
        if (selectedProjectId === projectId) {
          setSelectedProjectId(null);
        }
      },
      {
        title: "Supprimer le projet ?",
        message: "Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible et supprimera toutes les données associées.",
        isDangerous: true
      }
    );
  };

  // Calcul du titre dynamique pour le Header
  const getHeaderTitle = () => {
    if (currentPage === 'Projects' && selectedProjectId) {
      const project = projects.find(p => p.id === selectedProjectId);
      return project?.name || 'Détails Projet';
    }

    switch (currentPage) {
      case 'Dashboard': return 'Tableau de Bord';
      case 'Projects': return 'Mes Projets';
      case 'Planning': return 'Planning';
      case 'Team': return 'Équipes';
      case 'Members': return 'Membres';
      case 'Finance': return 'Finance';
      case 'Clocking': return 'Pointage';
      case 'Material': return 'Matériel';
      case 'Suppliers': return 'Fournisseurs';
      case 'Reports': return 'Rapports';
      case 'DailyReportGenerator': return 'Rapport Quotidien';
      case 'RiskAnalysis': return 'Analyse Risques';
      case 'Settings': return 'Paramètres';
      default: return 'ChronoChantier';
    }
  };

  const renderContent = () => {
    if (selectedProjectId && currentPage === 'Projects') {
      const project = projects.find(p => p.id === selectedProjectId);
      if (project) {
        return (
          <ProjectDetail
            project={project}
            onBack={handleBackToProjects}
            setProjects={setProjects}
            teams={teams}
            setTeams={setTeams}
            teamMembers={teamMembers}
            onEditProject={() => handleOpenProjectModal(project)}
            onDeleteProject={() => handleDeleteProject(project.id)}
            onNavigate={handlePageChange}
          />
        );
      } else {
        setSelectedProjectId(null); // Fallback if project deleted
      }
    }

    switch (currentPage) {
      case 'Dashboard':
        return (
          <Dashboard
            projects={projects}
            setProjects={setProjects}
            onNavigate={handlePageChange}
            onNewProject={() => handleOpenProjectModal()}
          />
        );
      case 'Projects':
        return (
          <Projects
            projects={projects}
            setProjects={setProjects}
            onProjectSelect={handleProjectSelect}
            onNewProject={() => handleOpenProjectModal()}
            onEditProject={handleOpenProjectModal}
            onDeleteProject={handleDeleteProject}
          />
        );
      case 'Planning':
        return <Planning projects={projects} setProjects={setProjects} teamMembers={teamMembers} />;
      case 'DailyReportGenerator':
        return <DailyReportGenerator />;
      case 'RiskAnalysis':
        return <RiskAnalysis />;
      case 'Team':
        return (
          <Team
            teams={teams}
            setTeams={setTeams}
            teamMembers={teamMembers}
            projects={projects}
            onNavigate={handlePageChange}
            onProjectSelect={handleProjectSelect}
          />
        );
      case 'Members':
        return (
          <Members
            teamMembers={teamMembers}
            setTeamMembers={setTeamMembers}
            teams={teams}
            projects={projects}
            onNavigate={handlePageChange}
          />
        );
      case 'Clocking':
        return <Clocking teamMembers={teamMembers} clockingEntries={clockingEntries} setClockingEntries={setClockingEntries} />;
      case 'Material':
        return <Material materials={materials} setMaterials={setMaterials} />;
      case 'Suppliers':
        return <Suppliers suppliers={suppliers} setSuppliers={setSuppliers} />;
      case 'Settings':
        return <Settings />;
      case 'Reports':
        return <Reports />;
      case 'Finance':
        return <Finance
          financialRecords={financialRecords}
          setFinancialRecords={setFinancialRecords}
          invoices={invoices}
          setInvoices={setInvoices}
          projects={projects}
        />;
      default:
        return (
          <Dashboard
            projects={projects}
            setProjects={setProjects}
            onNavigate={handlePageChange}
            onNewProject={() => handleOpenProjectModal()}
          />
        );
    }
  };

  return (
    // Utilisation de supports-[height:100dvh] pour corriger la hauteur sur mobile (Safari/Chrome)
    <div className="flex h-screen supports-[height:100dvh]:h-[100dvh] bg-slate-100 dark:bg-background-dark overflow-hidden font-display text-slate-900 dark:text-white">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={handlePageChange}
        isOpen={sidebarOpen}
        setOpen={setSidebarOpen}
        isCollapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 relative">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={getHeaderTitle()}
          userName={currentUser.name}
          userRole={currentUser.role}
          userAvatar={currentUser.avatarUrl}
        />

        {/* Augmentation significative du padding-bottom (pb-32) sur mobile pour garantir que le contenu ne soit pas caché par la navbar */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 dark:bg-background-dark p-4 md:p-6 pb-32 md:pb-6 transition-colors scroll-smooth">
          <div className="container mx-auto max-w-7xl min-h-full">
            {renderContent()}
          </div>
        </main>

        <MobileNavbar currentPage={currentPage} setCurrentPage={handlePageChange} />

        {/* Global Modals */}
        <ProjectFormModal
          isOpen={isProjectModalOpen}
          onClose={handleCloseProjectModal}
          onSubmit={handleSubmitProject}
          projectToEdit={projectToEdit}
          teamMembers={teamMembers}
        />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <ConfirmationProvider>
        <AppContent />
      </ConfirmationProvider>
    </ToastProvider>
  );
};

export default App;
