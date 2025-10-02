import React, { useState } from 'react';
import { useMeetings } from '../../hooks/useMeetings';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { PrintIcon, FileDownIcon, AlertTriangleIcon, InfoIcon, TrashIcon } from '../../components/Icons';
import type { Meeting } from '../../types';

export const AllMeetingsPage: React.FC = () => {
    const { meetings, clearAllMeetings, deleteMeetingPermanently } = useMeetings();
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);
    const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);

    const exportToPDF = () => {
        const doc = new (window as any).jspdf.jsPDF();
        (doc as any).autoTable({
            head: [['Data/Hora', 'Assunto', 'Oficial', 'Local', 'Obs', 'Status']],
            body: meetings.map(m => [ new Date(m.dateTime).toLocaleString('pt-BR'), m.subject, m.officer, m.location, m.notes, m.isDeleted ? 'Excluída' : 'Ativa' ]),
        });
        doc.save('todas_reunioes.pdf');
    };
    const exportToCSV = () => {
        const headers = ['Data', 'Hora', 'Assunto', 'Oficial', 'Local', 'Obs', 'Status'];
        const rows = meetings.map(m => {
            const date = new Date(m.dateTime);
            const rowData = [ date.toLocaleDateString('pt-BR'), date.toLocaleTimeString('pt-BR'), m.subject, m.officer, m.location, m.notes, m.isDeleted ? 'Excluída' : 'Ativa' ];
            return rowData.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
        });
        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'todas_reunioes.csv';
        link.click();
    };
    const handleConfirmClear = () => { clearAllMeetings(); setIsClearModalOpen(false); };
    const handleConfirmPermanentDelete = () => { if(meetingToDelete) { deleteMeetingPermanently(meetingToDelete.id); setMeetingToDelete(null); }};

    return (
        <>
            <div className="printable-area container mx-auto p-4 md:p-8 h-[calc(100vh-64px)]">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg h-full flex flex-col">
                    <div className="flex-shrink-0">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 sm:mb-0">Todas as Reuniões (Arquivo)</h1>
                            <div id="print-hide" className="flex flex-wrap items-center gap-2">
                                <button onClick={() => window.print()} className="flex items-center gap-2 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors shadow"><PrintIcon className="w-5 h-5"/><span>Imprimir</span></button>
                                <button onClick={exportToPDF} className="flex items-center gap-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors shadow"><FileDownIcon className="w-5 h-5"/><span>PDF</span></button>
                                <button onClick={exportToCSV} className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors shadow"><FileDownIcon className="w-5 h-5"/><span>CSV</span></button>
                                <button onClick={() => setIsClearModalOpen(true)} className="flex items-center gap-2 bg-red-800 text-white py-2 px-4 rounded-lg hover:bg-red-900 transition-colors shadow"><AlertTriangleIcon className="w-5 h-5"/><span>Limpar</span></button>
                            </div>
                        </div>
                        <div id="print-info" className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/50 border-l-4 border-blue-400 text-blue-800 dark:text-blue-200 flex items-start gap-3 rounded-r-lg">
                            <InfoIcon className="w-5 h-5 flex-shrink-0 pt-0.5" />
                            <div><h3 className="font-bold">Dica de Impressão:</h3><p className="text-sm">Se o botão Imprimir falhar, use o atalho <strong>Ctrl + P</strong> (ou <strong>Cmd + P</strong> no Mac).</p></div>
                        </div>
                    </div>
                    <div className="table-print-wrapper flex-1 overflow-y-auto min-h-0">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3">Data/Hora</th><th className="px-6 py-3">Assunto</th><th className="px-6 py-3">Oficial</th><th className="px-6 py-3">Local</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {meetings.length > 0 ? meetings.map(m => (
                                    <tr key={m.id} className={`bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-opacity ${m.isDeleted ? 'opacity-50' : ''}`}>
                                        <td className={`px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap ${m.isDeleted ? 'line-through' : ''}`}>{new Date(m.dateTime).toLocaleString('pt-BR')}</td>
                                        <td className={`px-6 py-4 ${m.isDeleted ? 'line-through' : ''}`}>{m.subject}</td>
                                        <td className={`px-6 py-4 ${m.isDeleted ? 'line-through' : ''}`}>{m.officer}</td>
                                        <td className={`px-6 py-4 ${m.isDeleted ? 'line-through' : ''}`}>{m.location}</td>
                                        <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${m.isDeleted ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'}`}>{m.isDeleted ? 'Arquivada' : 'Ativa'}</span></td>
                                        <td className="px-6 py-4">{m.isDeleted && (<button onClick={() => setMeetingToDelete(m)} className="p-2 text-gray-500 hover:text-red-700" title="Excluir"><TrashIcon className="w-5 h-5"/></button>)}</td>
                                    </tr>
                                )) : (<tr><td colSpan={6} className="text-center py-10">Nenhuma reunião encontrada.</td></tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>
                <style>{`@media print { body { background-color: white !important; } header, #print-hide, #print-info { display: none !important; } main, .printable-area { padding: 0 !important; margin: 0 !important; box-shadow: none !important; border: none !important; } .table-print-wrapper { overflow: visible !important; height: auto !important; } table { width: 100% !important; font-size: 10pt !important; } th, td { border: 1px solid #ccc !important; padding: 8px !important; color: black !important; } thead { background-color: #f2f2f2 !important; } tr { page-break-inside: avoid; } }`}</style>
            </div>
            <ConfirmationModal isOpen={isClearModalOpen} onClose={() => setIsClearModalOpen(false)} onConfirm={handleConfirmClear} title="Limpar Todos os Dados" message="Certeza? TODOS os dados serão apagados permanentemente." confirmButtonText="Limpar Tudo"/>
            <ConfirmationModal isOpen={!!meetingToDelete} onClose={() => setMeetingToDelete(null)} onConfirm={handleConfirmPermanentDelete} title="Excluir Permanentemente" message="Certeza? Esta ação não pode ser desfeita."/>
        </>
    );
};