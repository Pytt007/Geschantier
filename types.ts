
export type Page = 'Dashboard' | 'Projects' | 'Planning' | 'DailyReportGenerator' | 'RiskAnalysis' | 'Team' | 'Members' | 'Material' | 'Suppliers' | 'Clocking' | 'Settings' | 'Reports' | 'Finance';

export enum TaskStatus {
  ToDo = 'À Faire',
  InProgress = 'En Cours',
  Done = 'Terminé',
}

export interface Task {
  id: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  status: TaskStatus;
  // Nouveaux champs pour le planning avancé
  startTime?: string; // Format "HH:mm"
  endTime?: string;   // Format "HH:mm"
  category?: 'Meeting' | 'Work' | 'Review' | 'Other' | 'Team' | 'Planning';
  description?: string;
  location?: string; // Lien Meet ou salle
}

export enum ProjectStatus {
    Planning = 'Planification',
    InProgress = 'En Cours',
    Completed = 'Terminé',
    OnHold = 'En Attente',
}

export interface DailyLog {
    id: string;
    date: string;
    notes: string;
    author: string;
}

export interface Document {
    id: string;
    name: string;
    type: 'pdf' | 'image' | 'other';
    url: string;
    uploadedAt: string;
    size?: string;
}


export interface Project {
  id: string;
  name: string;
  address: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  manager: string;
  budget: number;
  featuredImage?: string; // Image de mise en avant
  tasks: Task[];
  dailyLogs: DailyLog[];
  documents: Document[];
}

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    avatarUrl: string;
}

export interface Team {
    id: string;
    name: string;
    leaderId: string; // Référence à TeamMember
    memberIds: string[]; // Références à TeamMember
    projectId?: string; // Référence à Project (Chantier assigné)
    color: string;
}

export interface ClockingEntry {
    id: string;
    memberId: string;
    date: string; // Format YYYY-MM-DD
    startTime?: string; // Format HH:mm
    endTime?: string; // Format HH:mm
    status: 'present' | 'absent' | 'completed';
}

export enum SupplierStatus {
    Active = 'Actif',
    Inactive = 'Inactif',
    Blacklisted = 'Bloqué',
}

export interface Supplier {
    id: string;
    name: string;
    category: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
    status: SupplierStatus;
    rating: number; // 1 to 5
    lastOrderDate?: string;
}

export enum MaterialStatus {
    Available = 'Disponible',
    InUse = 'Sur Chantier',
    Maintenance = 'En Maintenance',
    Broken = 'Hors Service',
}

export interface Material {
    id: string;
    name: string;
    category: string;
    quantity: number;
    status: MaterialStatus;
    location: string; // Entrepôt ou nom du chantier
    serialNumber?: string;
    lastMaintenance?: string;
    imageUrl?: string;
}

// --- FINANCE TYPES ---

export type TransactionType = 'expense' | 'income';
export type TransactionCategory = 'Material' | 'Labor' | 'Subcontractor' | 'Equipment' | 'Invoice' | 'Other';
export type TransactionStatus = 'Paid' | 'Pending' | 'Overdue';

export interface FinancialRecord {
    id: string;
    projectId: string; // Link to a project
    date: string;
    description: string;
    amount: number;
    type: TransactionType;
    category: TransactionCategory;
    status: TransactionStatus;
    reference?: string; // Invoice number etc.
}

// --- INVOICE TYPES ---

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Invoice {
    id: string;
    number: string; // e.g., INV-2024-001
    date: string;
    dueDate: string;
    projectId: string;
    clientName: string;
    clientAddress: string;
    items: InvoiceItem[];
    subtotal: number;
    taxRate: number; // Percentage (e.g., 20 for 20%)
    taxAmount: number;
    total: number;
    status: InvoiceStatus;
    notes?: string;
}