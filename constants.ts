
import type { Project, TeamMember, Supplier, Material, Team, ClockingEntry, FinancialRecord, Invoice } from './types';
import { ProjectStatus, TaskStatus, SupplierStatus, MaterialStatus } from './types';

export const initialProjects: Project[] = [
    {
        id: 'proj-1',
        name: 'Rénovation Tour Administrative',
        address: 'Plateau, Abidjan, Côte d\'Ivoire',
        startDate: '2024-08-01',
        endDate: '2025-06-30',
        status: ProjectStatus.InProgress,
        manager: 'Amadou Koné',
        budget: 32750000000, // ~50M EUR
        featuredImage: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?q=80&w=800&auto=format&fit=crop',
        tasks: [
            { id: 'task-1-1', title: 'Peinture Façade Nord', assignedTo: 'Équipe A', dueDate: '2024-09-15', status: TaskStatus.InProgress },
            { id: 'task-1-2', title: 'Remplacement des ascenseurs', assignedTo: 'CFAO Technologies', dueDate: '2025-03-01', status: TaskStatus.ToDo },
            { id: 'task-1-3', title: 'Vérification structurelle', assignedTo: 'Bureau Veritas', dueDate: '2024-08-20', status: TaskStatus.Done },
        ],
        dailyLogs: [],
        documents: [
            { id: 'doc-1', name: 'Plan de structure.pdf', type: 'pdf', url: '#', uploadedAt: '2024-08-01', size: '2.4 MB' },
            { id: 'img-1', name: 'Vue aérienne chantier', type: 'image', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=400&auto=format&fit=crop', uploadedAt: '2024-08-05' }
        ],
    },
    {
        id: 'proj-2',
        name: 'Construction Siège "Le Futur"',
        address: 'Diamniadio, Dakar, Sénégal',
        startDate: '2024-09-01',
        endDate: '2026-12-31',
        status: ProjectStatus.Planning,
        manager: 'Fatou Diop',
        budget: 78600000000, // ~120M EUR
        featuredImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop',
        tasks: [
            { id: 'task-2-1', title: 'Obtention permis de construire', assignedTo: 'Service Juridique', dueDate: '2024-08-30', status: TaskStatus.Done },
            { id: 'task-2-2', title: 'Terrassement', assignedTo: 'GTM Terrassement', dueDate: '2024-10-30', status: TaskStatus.ToDo },
        ],
        dailyLogs: [],
        documents: [],
    },
    {
        id: 'proj-3',
        name: 'Extension du Musée National',
        address: 'Yaoundé, Cameroun',
        startDate: '2023-01-10',
        endDate: '2024-07-20',
        status: ProjectStatus.Completed,
        manager: 'Jean-Paul Biya',
        budget: 58950000000, // ~90M EUR
        featuredImage: 'https://images.unsplash.com/photo-1558696715-1416a6c52b14?q=80&w=800&auto=format&fit=crop',
        tasks: [],
        dailyLogs: [],
        documents: [],
    },
];

export const initialTeamMembers: TeamMember[] = [
    { id: 'tm-1', name: 'Alice Kouassi', role: 'Chef de projet', email: 'alice.k@example.com', phone: '+225 07 12 34 56 78', avatarUrl: 'https://picsum.photos/seed/alice/200' },
    { id: 'tm-2', name: 'Moussa Traoré', role: 'Conducteur de travaux', email: 'moussa.t@example.com', phone: '+225 05 23 45 67 89', avatarUrl: 'https://picsum.photos/seed/bob/200' },
    { id: 'tm-3', name: 'Carole Petit', role: 'Architecte', email: 'carole.p@example.com', phone: '+225 01 34 56 78 90', avatarUrl: 'https://picsum.photos/seed/carole/200' },
    { id: 'tm-4', name: 'David Nguema', role: 'Ingénieur structure', email: 'david.n@example.com', phone: '+225 07 45 67 89 01', avatarUrl: 'https://picsum.photos/seed/david/200' },
    { id: 'tm-5', name: 'Eve Moreau', role: 'Responsable HSE', email: 'eve.m@example.com', phone: '+225 05 56 78 90 12', avatarUrl: 'https://picsum.photos/seed/eve/200' },
];

export const initialTeams: Team[] = [
    {
        id: 'team-1',
        name: 'Équipe Alpha',
        leaderId: 'tm-2',
        memberIds: ['tm-4', 'tm-5'],
        projectId: 'proj-1',
        color: 'indigo'
    },
    {
        id: 'team-2',
        name: 'Équipe Conception',
        leaderId: 'tm-3',
        memberIds: ['tm-1'],
        projectId: 'proj-2',
        color: 'emerald'
    }
];

export const initialClockingEntries: ClockingEntry[] = [
    { id: 'clk-1', memberId: 'tm-1', date: new Date().toISOString().split('T')[0], startTime: '07:55', status: 'present' },
    { id: 'clk-2', memberId: 'tm-2', date: new Date().toISOString().split('T')[0], startTime: '08:00', status: 'present' },
    { id: 'clk-3', memberId: 'tm-4', date: new Date().toISOString().split('T')[0], startTime: '08:15', endTime: '17:00', status: 'completed' },
];

export const initialSuppliers: Supplier[] = [
    {
        id: 'sup-1',
        name: 'Béton Express Ivoire',
        category: 'Matériaux de construction',
        contactName: 'Jean Kaboré',
        email: 'contact@betonexpress.ci',
        phone: '+225 27 21 22 23 24',
        address: 'Zone Industrielle Yopougon, Abidjan',
        status: SupplierStatus.Active,
        rating: 5,
        lastOrderDate: '2023-10-15'
    },
    {
        id: 'sup-2',
        name: 'LocaMat Afrique',
        category: 'Location Équipement',
        contactName: 'Sophie Diarra',
        email: 'sophie@locamatafrique.com',
        phone: '+225 27 22 33 44 55',
        address: 'Boulevard de Marseille, Abidjan',
        status: SupplierStatus.Active,
        rating: 4,
        lastOrderDate: '2023-09-28'
    },
    {
        id: 'sup-3',
        name: 'ElecSoluces',
        category: 'Sous-traitant Électricité',
        contactName: 'Marc Touré',
        email: 'marc@elecsoluces.ci',
        phone: '+225 07 11 22 33 44',
        address: 'Marcory Zone 4, Abidjan',
        status: SupplierStatus.Inactive,
        rating: 3,
        lastOrderDate: '2023-05-10'
    },
    {
        id: 'sup-4',
        name: 'Sécurité Totale',
        category: 'Services & Sécurité',
        contactName: 'Paul Gardien',
        email: 'contact@securitetotale.ci',
        phone: '+225 27 23 45 67 89',
        address: 'Adjamé, Abidjan',
        status: SupplierStatus.Blacklisted,
        rating: 1,
        lastOrderDate: '2022-11-05'
    }
];

export const initialMaterials: Material[] = [
    {
        id: 'mat-1',
        name: 'Pelleteuse Caterpillar 320',
        category: 'Engins Lourds',
        quantity: 2,
        status: MaterialStatus.InUse,
        location: 'Tour Administrative',
        serialNumber: 'CAT-320-XC98',
        lastMaintenance: '2023-09-10',
        imageUrl: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f138?auto=format&fit=crop&q=80&w=200'
    },
    {
        id: 'mat-2',
        name: 'Marteau-piqueur Hilti TE 3000',
        category: 'Outillage',
        quantity: 5,
        status: MaterialStatus.Available,
        location: 'Entrepôt Central Vridi',
        serialNumber: 'HLT-TE3000-554',
        lastMaintenance: '2023-10-01',
        imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=200'
    },
    {
        id: 'mat-3',
        name: 'Échafaudage Multidirectionnel',
        category: 'Sécurité & Accès',
        quantity: 150,
        status: MaterialStatus.InUse,
        location: 'Musée National',
        serialNumber: 'ECH-MULTI-001',
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=200'
    },
    {
        id: 'mat-4',
        name: 'Groupe Électrogène 100kVA',
        category: 'Énergie',
        quantity: 1,
        status: MaterialStatus.Maintenance,
        location: 'Atelier Maintenance',
        serialNumber: 'GEN-100K-POWER',
        lastMaintenance: '2023-11-15',
        imageUrl: 'https://images.unsplash.com/photo-1565619624098-e659eb5a8943?auto=format&fit=crop&q=80&w=200'
    },
    {
        id: 'mat-5',
        name: 'Kit Casques & Gilets (Lot de 10)',
        category: 'EPI',
        quantity: 20,
        status: MaterialStatus.Available,
        location: 'Entrepôt Central Vridi',
        imageUrl: 'https://images.unsplash.com/photo-1523677665006-53692542a68e?auto=format&fit=crop&q=80&w=200'
    }
];

export const initialFinancialRecords: FinancialRecord[] = [
    { id: 'fin-1', projectId: 'proj-1', date: '2024-08-05', description: 'Acompte Client #1', amount: 325000000, type: 'income', category: 'Invoice', status: 'Paid', reference: 'FAC-2024-001' },
    { id: 'fin-2', projectId: 'proj-1', date: '2024-08-10', description: 'Achat Peinture Industrielle', amount: 9800000, type: 'expense', category: 'Material', status: 'Paid', reference: 'EXP-MAT-884' },
    { id: 'fin-3', projectId: 'proj-1', date: '2024-08-15', description: 'Location Grue 1 semaine', amount: 2950000, type: 'expense', category: 'Equipment', status: 'Paid', reference: 'EXP-LOC-221' },
    { id: 'fin-4', projectId: 'proj-1', date: '2024-09-01', description: 'Facture intermédiaire #2', amount: 163750000, type: 'income', category: 'Invoice', status: 'Pending', reference: 'FAC-2024-002' },
    { id: 'fin-5', projectId: 'proj-2', date: '2024-09-02', description: 'Étude de sol', amount: 5500000, type: 'expense', category: 'Subcontractor', status: 'Paid', reference: 'EXP-SUB-112' },
    { id: 'fin-6', projectId: 'proj-2', date: '2024-09-05', description: 'Acompte Démarrage', amount: 786000000, type: 'income', category: 'Invoice', status: 'Paid', reference: 'FAC-2024-003' },
    { id: 'fin-7', projectId: 'proj-3', date: '2023-06-15', description: 'Solde Final', amount: 98250000, type: 'income', category: 'Invoice', status: 'Overdue', reference: 'FAC-2023-099' },
];

export const initialInvoices: Invoice[] = [
    {
        id: 'inv-1',
        number: 'FAC-2024-001',
        date: '2024-08-05',
        dueDate: '2024-09-05',
        projectId: 'proj-1',
        clientName: 'Ministère de la Construction',
        clientAddress: 'Cité Administrative, Abidjan',
        items: [
            { id: 'item-1', description: 'Acompte démarrage chantier (20%)', quantity: 1, unitPrice: 270833333, total: 270833333 }
        ],
        subtotal: 270833333,
        taxRate: 18, // TVA 18% UEMOA
        taxAmount: 48750000,
        total: 319583333,
        status: 'Paid',
        notes: 'Virement reçu le 10/08/2024'
    },
    {
        id: 'inv-2',
        number: 'FAC-2024-002',
        date: '2024-09-01',
        dueDate: '2024-10-01',
        projectId: 'proj-1',
        clientName: 'Ministère de la Construction',
        clientAddress: 'Cité Administrative, Abidjan',
        items: [
            { id: 'item-2', description: 'Avancement Phase 1 - Peinture', quantity: 1, unitPrice: 138771186, total: 138771186 }
        ],
        subtotal: 138771186,
        taxRate: 18,
        taxAmount: 24978813,
        total: 163750000,
        status: 'Sent',
    }
];

export const currentUser = {
    id: 'user-1',
    name: 'M. Dubois',
    role: 'Admin',
    email: 'admin@chronochantier.com',
    avatarUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=200&h=200'
};
