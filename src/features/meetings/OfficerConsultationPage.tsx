import React, { useState, useMemo } from 'react';
import { useMeetings } from '../../hooks/useMeetings';
import { FileDownIcon } from '../../components/Icons';

export const OfficerConsultationPage: React.FC = () => {
    const { meetings } = useMeetings();
    const [selectedOfficer, setSelectedOfficer] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const MONTHS = [{v:'1',l:'Jan'},{v:'2',l:'Fev'},{v:'3',l:'Mar'},{v:'4',l:'Abr'},{v:'5',l:'Mai'},{v:'6',l:'Jun'},{v:'7',l:'Jul'},{v:'8',l:'Ago'},{v:'9',l:'Set'},{v:'10',l:'Out'},{v:'11',l:'Nov'},{v:'12',l:'Dez'}];

    const activeMeetings = useMemo(() => meetings.filter(m => !m.isDeleted), [meetings]);

    const { uniqueOfficers, availableYears } = useMemo(() => {
        const officerSet = new Set<string>();
        const yearSet = new Set<string>();
        activeMeetings.forEach(m => {
            officerSet.add(m.officer);
            yearSet.add(String(new Date(m.dateTime).getFullYear()));
        });
        return {
            uniqueOfficers: Array.from(officerSet).sort(),
            availableYears: Array.from(yearSet).sort((a, b) => parseInt(b) - parseInt(a)),
        };
    }, [activeMeetings]);

    const filteredMeetings = useMemo(() => {
        if (!selectedOfficer) return [];
        return activeMeetings.filter(m => {
            const d = new Date(m.dateTime);
            const officerMatch = m.officer === selectedOfficer;
            const monthMatch = !selectedMonth || (d.getMonth() + 1) === parseInt(selectedMonth, 10);
            const yearMatch = !selectedYear || d.getFullYear() === parseInt(selectedYear, 10);
            return officerMatch && monthMatch && yearMatch;
        });
    }, [activeMeetings, selectedOfficer, selectedMonth, selectedYear]);
    
    const handleExportCardsToPDF = () => {
        const doc = new (window as any).jspdf.jsPDF();
        let y = 15;
        doc.setFontSize(18);
        doc.text(`Reuniões de ${selectedOfficer}`, 15, y); y += 15;
        filteredMeetings.forEach(m => {
            const d = new Date(m.dateTime);
            const cardHeight = 60 + (m.notes ? 10 : 0); // Dynamic height
            if (y + cardHeight > doc.internal.pageSize.getHeight() - 15) { doc.addPage(); y = 15; }
            doc.setDrawColor(220, 220, 220); doc.setFillColor(255, 255, 255);
            doc.roundedRect(15, y, 180, cardHeight, 3, 3, 'FD');
            doc.setFillColor(59, 130, 246); doc.rect(15, y, 2, cardHeight, 'F');
            let currentY = y + 10;
            doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(31, 41, 55);
            doc.text(m.subject, 20, currentY); currentY += 10;
            doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(75, 85, 99);
            doc.text(`Data: ${d.toLocaleDateString('pt-BR')} | Horário: ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, 20, currentY); currentY += 7;
            doc.text(`Local: ${m.location}`, 20, currentY); currentY += 7;
             if (m.notes) {
                 doc.setFont('helvetica', 'italic'); doc.setTextColor(107, 114, 128);
                 doc.text(`Obs: ${m.notes}`, 20, currentY);
            }
            y += cardHeight + 10;
        });
        doc.save(`reunioes_${selectedOfficer.replace(/\s/g, '_')}.pdf`);
    };
    
    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Consulta por Oficial</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <select value={selectedOfficer} onChange={e => setSelectedOfficer(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200"><option value="">-- Selecione Oficial --</option>{uniqueOfficers.map(o => <option key={o} value={o}>{o}</option>)}</select>
                    <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200"><option value="">-- Todos os Meses --</option>{MONTHS.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}</select>
                    <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200"><option value="">-- Todos os Anos --</option>{availableYears.map(y => <option key={y} value={y}>{y}</option>)}</select>
                    <button onClick={handleExportCardsToPDF} disabled={filteredMeetings.length === 0} className="flex items-center justify-center gap-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 shadow disabled:bg-gray-400"><FileDownIcon className="w-5 h-5"/><span>Salvar PDF</span></button>
                </div>
            </div>

            {selectedOfficer ? (
                filteredMeetings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMeetings.map(m => (
                           <div key={m.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">{m.subject}</h3>
                                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                                    <p><span className="font-semibold">Data:</span> {new Date(m.dateTime).toLocaleDateString('pt-BR')}</p>
                                    <p><span className="font-semibold">Horário:</span> {new Date(m.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                    <p><span className="font-semibold">Local:</span> {m.location}</p>
                                    {m.notes && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">"{m.notes}"</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (<div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg"><p className="text-gray-500 dark:text-gray-400">Nenhuma reunião encontrada para os filtros.</p></div>)
            ) : (<div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg"><p className="text-gray-500 dark:text-gray-400">Selecione um oficial para começar.</p></div>)}
        </div>
    );
};