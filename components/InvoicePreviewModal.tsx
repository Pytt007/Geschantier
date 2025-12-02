
import React from 'react';
import type { Invoice } from '../types';
import { Icon } from './Icon';

interface InvoicePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: Invoice | null;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({ isOpen, onClose, invoice }) => {
    if (!isOpen || !invoice) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex justify-center items-center p-4 print:p-0 print:bg-white print:static print:z-auto">
            
            {/* Toolbar (Hidden on Print) */}
            <div className="absolute top-4 right-4 flex space-x-4 print:hidden">
                <button onClick={handlePrint} className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors font-medium">
                    <Icon name="printer" className="w-5 h-5 mr-2" /> Imprimer / PDF
                </button>
                <button onClick={onClose} className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors">
                    <Icon name="close" className="w-6 h-6" />
                </button>
            </div>

            {/* A4 Paper Container */}
            <div className="bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] p-[20mm] shadow-2xl overflow-y-auto max-h-[90vh] print:shadow-none print:max-h-none print:w-full print:max-w-none print:overflow-visible rounded-sm">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">FACTURE</h1>
                        <p className="text-slate-500 font-medium">#{invoice.number}</p>
                        <div className="mt-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                                invoice.status === 'Paid' ? 'bg-green-100 text-green-800 border-green-200' :
                                invoice.status === 'Sent' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                invoice.status === 'Overdue' ? 'bg-red-100 text-red-800 border-red-200' :
                                'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                                {invoice.status === 'Paid' ? 'Payée' : invoice.status === 'Sent' ? 'Envoyée' : invoice.status === 'Overdue' ? 'En Retard' : 'Brouillon'}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-indigo-600 text-white font-bold text-xl p-4 rounded-lg mb-2 inline-block">
                            ChronoChantier
                        </div>
                        <p className="text-sm text-slate-600">Zone Industrielle</p>
                        <p className="text-sm text-slate-600">Abidjan, Côte d'Ivoire</p>
                        <p className="text-sm text-slate-600">contact@chronochantier.ci</p>
                        <p className="text-sm text-slate-600">+225 27 21 22 23 24</p>
                    </div>
                </div>

                {/* Client & Dates */}
                <div className="flex justify-between mb-12">
                    <div className="w-1/2">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Facturé à</h3>
                        <p className="font-bold text-lg text-slate-900">{invoice.clientName}</p>
                        <p className="text-slate-600 whitespace-pre-line">{invoice.clientAddress}</p>
                    </div>
                    <div className="w-1/3 text-right">
                        <div className="mb-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Date d'émission</h3>
                            <p className="font-medium text-slate-900">{new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Date d'échéance</h3>
                            <p className="font-medium text-slate-900">{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-12">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-200">
                                <th className="py-3 text-sm font-bold text-slate-600 uppercase tracking-wider">Description</th>
                                <th className="py-3 text-right text-sm font-bold text-slate-600 uppercase tracking-wider">Qté</th>
                                <th className="py-3 text-right text-sm font-bold text-slate-600 uppercase tracking-wider">Prix Unit.</th>
                                <th className="py-3 text-right text-sm font-bold text-slate-600 uppercase tracking-wider">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item) => (
                                <tr key={item.id} className="border-b border-slate-100">
                                    <td className="py-4 text-slate-800 font-medium">{item.description}</td>
                                    <td className="py-4 text-right text-slate-600">{item.quantity}</td>
                                    <td className="py-4 text-right text-slate-600">{item.unitPrice.toLocaleString('fr-FR')} FCFA</td>
                                    <td className="py-4 text-right text-slate-900 font-bold">{item.total.toLocaleString('fr-FR')} FCFA</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-12">
                    <div className="w-1/2 md:w-1/3 space-y-3">
                        <div className="flex justify-between text-slate-600">
                            <span>Sous-total</span>
                            <span>{invoice.subtotal.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>TVA ({invoice.taxRate}%)</span>
                            <span>{invoice.taxAmount.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                        <div className="flex justify-between text-slate-900 font-bold text-xl pt-3 border-t-2 border-slate-900">
                            <span>Total TTC</span>
                            <span>{invoice.total.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                    </div>
                </div>

                {/* Footer Notes */}
                {invoice.notes && (
                    <div className="border-t border-slate-200 pt-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Notes & Conditions</h3>
                        <p className="text-sm text-slate-600">{invoice.notes}</p>
                    </div>
                )}
                
                <div className="mt-12 text-center text-xs text-slate-400 print:fixed print:bottom-10 print:left-0 print:w-full">
                    <p>ChronoChantier SAS - Capital de 100 000 000 FCFA - RCCM CI-ABJ-2023-B-12345 - Abidjan</p>
                </div>

            </div>
            
            {/* Print Styles Injection */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:visible, .print\\:visible * {
                        visibility: visible;
                    }
                    .bg-black {
                        background: none !important;
                    }
                    /* Ensure the modal content takes full page */
                    .fixed {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        margin: 0;
                        padding: 0;
                        background: white;
                    }
                }
            `}</style>
        </div>
    );
};
