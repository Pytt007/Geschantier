import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';

type SettingsPage = 'profile' | 'security' | 'notifications' | 'appearance' | 'integrations';

const SettingsSidebar: React.FC<{
    currentPage: SettingsPage;
    setPage: (page: SettingsPage) => void;
}> = ({ currentPage, setPage }) => {
    
    const NavItem: React.FC<{ page: SettingsPage; label: string; icon: string }> = ({ page, label, icon }) => {
        const isActive = currentPage === page;
        return (
            <button
                onClick={() => setPage(page)}
                className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                        ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
            >
                <Icon name={icon} className={`w-5 h-5 mr-3 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{label}</span>
            </button>
        );
    };

    return (
        <aside className="w-full md:w-64 lg:w-72 flex-shrink-0">
            <div className="p-4 bg-white dark:bg-card-dark rounded-xl shadow-sm">
                <nav className="space-y-1">
                    <NavItem page="profile" label="Mon Profil" icon="users" />
                    <NavItem page="security" label="Sécurité" icon="shield" />
                    <NavItem page="notifications" label="Notifications" icon="report" />
                    <NavItem page="appearance" label="Apparence" icon="cog" />
                    <NavItem page="integrations" label="Intégrations" icon="archive" />
                </nav>
            </div>
        </aside>
    );
};

const SettingsCard: React.FC<{ title: string; description?: string; children: React.ReactNode, footer?: React.ReactNode }> = ({ title, description, children, footer }) => (
    <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm">
        <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            {description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>}
        </div>
        <div className="p-6 pt-0">
            {children}
        </div>
        {footer && <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-b-xl border-t border-slate-200 dark:border-slate-700">{footer}</div>}
    </div>
);

const FormRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 md:col-span-1">{label}</label>
        <div className="md:col-span-2">
            {children}
        </div>
    </div>
);

const SettingsInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input
        {...props}
        className="block w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400"
    />
);

const SettingsButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }> = ({ children, variant = 'primary', ...props }) => {
    const baseClasses = "px-4 py-2 rounded-lg font-semibold text-sm transition-colors";
    const variantClasses = variant === 'primary' 
        ? "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-400"
        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600";

    return <button className={`${baseClasses} ${variantClasses}`} {...props}>{children}</button>
}

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
    <button
        type="button"
        className={`${
            checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
        } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        onClick={() => onChange(!checked)}
    >
        <span
            className={`${
                checked ? 'translate-x-6' : 'translate-x-1'
            } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
        />
    </button>
);


// Sub-pages for settings
const ProfileSettings: React.FC = () => (
    <div className="space-y-6">
        <SettingsCard
            title="Photo de profil"
            description="Mettez à jour votre photo de profil. L'image doit être d'au moins 200x200px."
        >
            <div className="flex items-center space-x-4">
                <img className="h-16 w-16 rounded-full object-cover" src="https://picsum.photos/seed/user/200" alt="User avatar" />
                <div className="flex space-x-2">
                    <SettingsButton variant="secondary">Changer</SettingsButton>
                    <SettingsButton variant="secondary">Supprimer</SettingsButton>
                </div>
            </div>
        </SettingsCard>
        <SettingsCard
            title="Informations personnelles"
            description="Modifiez vos informations personnelles ici."
        >
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <FormRow label="Nom complet">
                    <SettingsInput type="text" defaultValue="M. Dubois" />
                </FormRow>
                <FormRow label="Poste">
                    <SettingsInput type="text" defaultValue="Admin" />
                </FormRow>
                 <FormRow label="Numéro de téléphone">
                    <SettingsInput type="tel" defaultValue="06 12 34 56 78" />
                </FormRow>
                <FormRow label="À propos de moi">
                    <textarea className="block w-full bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white border border-slate-300 rounded-md shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" rows={4} defaultValue="Administrateur principal de ChronoChantier, en charge de la supervision des projets et de la gestion des équipes."></textarea>
                </FormRow>
                <div className="flex justify-end pt-2">
                    <SettingsButton type="submit">Sauvegarder</SettingsButton>
                </div>
            </form>
        </SettingsCard>
    </div>
);

const SecuritySettings: React.FC = () => (
    <div className="space-y-6">
        <SettingsCard
            title="Changer l'adresse e-mail"
            description="Votre adresse e-mail est utilisée pour la connexion et les notifications."
        >
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <FormRow label="Adresse e-mail actuelle">
                    <SettingsInput type="email" defaultValue="admin.dubois@example.com" disabled />
                </FormRow>
                <FormRow label="Nouvelle adresse e-mail">
                     <SettingsInput type="email" placeholder="nouvel.email@example.com" />
                </FormRow>
                <div className="flex justify-end pt-2">
                    <SettingsButton type="submit">Mettre à jour l'e-mail</SettingsButton>
                </div>
            </form>
        </SettingsCard>
        <SettingsCard
            title="Changer le mot de passe"
            description="Il est recommandé d'utiliser un mot de passe fort que vous n'utilisez nulle part ailleurs."
        >
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <FormRow label="Mot de passe actuel">
                    <SettingsInput type="password" />
                </FormRow>
                <FormRow label="Nouveau mot de passe">
                    <SettingsInput type="password" />
                </FormRow>
                <FormRow label="Confirmer le nouveau mot de passe">
                    <SettingsInput type="password" />
                </FormRow>
                <div className="flex justify-end pt-2">
                    <SettingsButton type="submit">Changer le mot de passe</SettingsButton>
                </div>
            </form>
        </SettingsCard>
    </div>
);

const NotificationSettings: React.FC = () => {
    const [prefs, setPrefs] = useState({
        email: {
            all: true,
            projectUpdates: true,
            newTasks: true,
            weeklyReports: false
        },
        push: {
            all: true,
            mentions: true,
            directMessages: true
        }
    });

    const handleEmailChange = (key: keyof typeof prefs.email, value: boolean) => {
        setPrefs(p => ({
            ...p,
            email: { ...p.email, [key]: value }
        }));
    };
    
    return (
        <div className="space-y-6">
            <SettingsCard title="Notifications par E-mail">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-800 dark:text-slate-200">Tout activer/désactiver</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Activer ou désactiver toutes les notifications par e-mail.</p>
                        </div>
                        <ToggleSwitch checked={prefs.email.all} onChange={(val) => handleEmailChange('all', val)} />
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 my-4"></div>
                    <label className="flex items-center space-x-3">
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:bg-slate-700 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500" checked={prefs.email.projectUpdates} onChange={(e) => handleEmailChange('projectUpdates', e.target.checked)} />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Mises à jour de projet</span>
                    </label>
                    <label className="flex items-center space-x-3">
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:bg-slate-700 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500" checked={prefs.email.newTasks} onChange={(e) => handleEmailChange('newTasks', e.target.checked)} />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Nouvelles tâches assignées</span>
                    </label>
                    <label className="flex items-center space-x-3">
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:bg-slate-700 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500" checked={prefs.email.weeklyReports} onChange={(e) => handleEmailChange('weeklyReports', e.target.checked)} />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Rapports hebdomadaires</span>
                    </label>
                </div>
            </SettingsCard>
        </div>
    )
};

const AppearanceSettings: React.FC = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    const ThemeOption: React.FC<{ value: string; label: string; icon: string }> = ({ value, label, icon }) => (
        <button
            onClick={() => setTheme(value)}
            className={`w-full p-4 border-2 rounded-lg flex flex-col items-center justify-center space-y-2 transition-colors ${
                theme === value ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/20' : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
            }`}
        >
            <Icon name={icon} className={`w-10 h-10 ${theme === value ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
            <span className={`font-semibold ${theme === value ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>{label}</span>
        </button>
    );

    return (
        <SettingsCard title="Thème de l'application" description="Choisissez comment ChronoChantier s'affiche pour vous.">
            <div className="grid grid-cols-2 gap-4">
                <ThemeOption value="light" label="Clair" icon="sun" />
                <ThemeOption value="dark" label="Sombre" icon="moon" />
            </div>
        </SettingsCard>
    );
};

const IntegrationsSettings: React.FC = () => {
    const [integrations, setIntegrations] = useState({
        slack: true,
        googleCalendar: false,
        zapier: false,
    });

    const IntegrationRow: React.FC<{ id: keyof typeof integrations; name: string; description: string; logo: string }> = ({ id, name, description, logo }) => (
         <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
            <div className="flex items-center">
                <img src={logo} alt={`${name} logo`} className="w-10 h-10 mr-4"/>
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
                </div>
            </div>
            <ToggleSwitch checked={integrations[id]} onChange={(val) => setIntegrations(p => ({...p, [id]: val}))} />
        </div>
    );
    
    return (
        <SettingsCard title="Intégrations" description="Connectez ChronoChantier à vos outils préférés.">
             <div className="border border-slate-200 dark:border-slate-700 rounded-lg">
                <IntegrationRow id="slack" name="Slack" description="Recevez les notifications de projet dans vos canaux Slack." logo="https://a.slack-edge.com/80588/marketing/img/meta/slack_hash_256.png" />
                <IntegrationRow id="googleCalendar" name="Google Calendar" description="Synchronisez les échéances de vos tâches avec votre calendrier." logo="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" />
                <IntegrationRow id="zapier" name="Zapier" description="Automatisez des milliers de workflows." logo="https://cdn.zappy.app/9a850421e2333d3c1e7a839a7a1b637f.png" />
            </div>
        </SettingsCard>
    )
}

export const Settings: React.FC = () => {
  const [activePage, setActivePage] = useState<SettingsPage>('profile');

  const renderContent = () => {
    switch (activePage) {
        case 'profile':
            return <ProfileSettings />;
        case 'security':
            return <SecuritySettings />;
        case 'notifications':
             return <NotificationSettings />;
        case 'appearance':
             return <AppearanceSettings />;
        case 'integrations':
             return <IntegrationsSettings />;
        default:
            return null;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Paramètres</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <SettingsSidebar currentPage={activePage} setPage={setActivePage} />
        <main className="flex-1">
            {renderContent()}
        </main>
      </div>
    </div>
  );
};