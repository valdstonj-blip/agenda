
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useMeetings } from '../../hooks/useMeetings';
import { useTheme } from '../../hooks/useTheme';
import type { Meeting, NewMeetingData } from '../../types';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { MeetingFormModal } from '../meetings/MeetingFormModal';
import { PlusIcon, EditIcon, TrashIcon, CalendarDaysIcon, UserIcon } from '../../components/Icons';

// Sub-component: Calendar
const Calendar: React.FC<{ selectedDate: Date; onDateSelect: (date: Date) => void; meetingDates: string[] }> = ({ selectedDate, onDateSelect, meetingDates }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const firstDayOfMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), [currentDate]);
  const daysInMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(), [currentDate]);
  const startingDay = firstDayOfMonth.getDay();
  const today = new Date();
  const meetingDaysInMonth = useMemo(() => new Set(meetingDates.map(d => new Date(d).toDateString())), [meetingDates]);
  const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg text-gray-800 dark:text-gray-200">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">&lt;</button>
        <h2 className="text-lg font-semibold">{MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {DAY_NAMES.map(day => <div key={day} className="font-medium text-gray-500 dark:text-gray-400">{day}</div>)}
        {Array.from({ length: startingDay }).map((_, i) => <div key={`empty-${i}`}></div>)}
        {Array.from({ length: daysInMonth }).map((_, day) => {
          const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day + 1);
          const isSelected = isSameDay(dayDate, selectedDate);
          const isToday = isSameDay(dayDate, today);
          const hasMeeting = meetingDaysInMonth.has(dayDate.toDateString());
          return (
            <div key={day} className="relative">
              <button
                onClick={() => onDateSelect(dayDate)}
                className={`w-10 h-10 rounded-full transition-colors flex items-center justify-center
                  ${isSelected ? 'bg-blue-600 text-white' : ''}
                  ${!isSelected && isToday ? 'bg-blue-100 dark:bg-blue-900' : ''}
                  ${!isSelected ? 'hover:bg-gray-200 dark:hover:bg-gray-700' : ''}
                `}
              >{day + 1}</button>
              {hasMeeting && <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-600'}`}></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Sub-component: StatCard
const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; color: string }> = ({ icon, title, value, color }) => (
    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md flex items-center">
        <div className={`p-3 rounded-full mr-4 ${color}`}>{icon}</div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
    </div>
);

// Sub-component: BarChart
const BarChart: React.FC<{ chartData: { labels: string[], data: number[] }; title: string }> = ({ chartData, title }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<any>(null); // Using any for Chart.js instance
    const [theme] = useTheme(); 
    useEffect(() => {
        if (!canvasRef.current || !(window as any).Chart) return;
        const textColor = theme === 'dark' ? '#E5E7EB' : '#374151';
        const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        if (chartRef.current) chartRef.current.destroy();
        chartRef.current = new (window as any).Chart(canvasRef.current.getContext('2d'), {
            type: 'bar',
            data: { labels: chartData.labels, datasets: [{ label: 'Nº de Reuniões', data: chartData.data, backgroundColor: 'rgba(59, 130, 246, 0.5)', borderColor: 'rgba(59, 130, 246, 1)', borderWidth: 1 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: textColor } }, title: { display: true, text: title, color: textColor, font: { size: 16 } } }, scales: { y: { beginAtZero: true, ticks: { color: textColor, stepSize: 1 }, grid: { color: gridColor } }, x: { ticks: { color: textColor }, grid: { color: gridColor } } } }
        });
        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, [chartData, title, theme]);
    return <canvas ref={canvasRef}></canvas>;
};

// Sub-component: DashboardStats
const DashboardStats: React.FC<{ meetings: Meeting[] }> = ({ meetings }) => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const getISODateString = (date: Date) => date.toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(getISODateString(firstDayOfMonth));
    const [endDate, setEndDate] = useState(getISODateString(today));

    const stats = useMemo(() => {
        const start = new Date(startDate); start.setUTCHours(0, 0, 0, 0);
        const end = new Date(endDate); end.setUTCHours(23, 59, 59, 999);
        const filtered = meetings.filter(m => { const d = new Date(m.dateTime); return d >= start && d <= end && !m.isDeleted; });
        const officerCounts = filtered.reduce((acc, m) => { const o = m.officer.trim() || 'N/E'; acc[o] = (acc[o] || 0) + 1; return acc; }, {} as Record<string, number>);
        const topOfficer = Object.entries(officerCounts).sort((a, b) => b[1] - a[1])[0];
        const sortedOfficerCounts = Object.entries(officerCounts).sort((a, b) => b[1] - a[1]);
        return {
            totalMeetings: filtered.length,
            topOfficer: topOfficer ? `${topOfficer[0]} (${topOfficer[1]})` : 'N/A',
            officerChartData: { labels: sortedOfficerCounts.map(e => e[0]), data: sortedOfficerCounts.map(e => e[1]) }
        };
    }, [meetings, startDate, endDate]);

    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Estatísticas</h2>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {(['startDate', 'endDate'] as const).map(field => (
                    <div key={field}>
                        <label htmlFor={field} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{field === 'startDate' ? 'Data de Início' : 'Data de Fim'}</label>
                        <input type="date" id={field} value={field === 'startDate' ? startDate : endDate} onChange={e => (field === 'startDate' ? setStartDate(e.target.value) : setEndDate(e.target.value))} className="mt-1 block w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 dark:text-gray-200"/>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard icon={<CalendarDaysIcon className="w-6 h-6 text-white"/>} title="Total de Reuniões" value={stats.totalMeetings} color="bg-blue-500" />
                <StatCard icon={<UserIcon className="w-6 h-6 text-white"/>} title="Oficial com Mais Reuniões" value={stats.topOfficer} color="bg-green-500" />
            </div>
            <div className="mt-8 h-80 relative"><BarChart chartData={stats.officerChartData} title="Reuniões por Oficial" /></div>
        </div>
    );
};


// Main component: DashboardPage
export const DashboardPage: React.FC = () => {
    const { meetings, addMeeting, updateMeeting, archiveMeeting } = useMeetings();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [meetingToEdit, setMeetingToEdit] = useState<Meeting | null>(null);
    const [meetingToArchive, setMeetingToArchive] = useState<Meeting | null>(null);
    const filteredMeetings = useMemo(() => meetings.filter(m => new Date(m.dateTime).toDateString() === selectedDate.toDateString() && !m.isDeleted), [meetings, selectedDate]);
    const meetingDates = useMemo(() => meetings.filter(m => !m.isDeleted).map(m => m.dateTime), [meetings]);
    
    const handleSaveMeeting = (meetingData: NewMeetingData | Meeting) => {
        if (meetingToEdit) {
            updateMeeting({ ...meetingToEdit, ...meetingData });
        } else {
            addMeeting(meetingData as NewMeetingData);
        }
    };
    const openEditModal = (meeting: Meeting) => { setMeetingToEdit(meeting); setIsModalOpen(true); };
    const openNewModal = () => { setMeetingToEdit(null); setIsModalOpen(true); };
    const handleConfirmArchive = () => { if (meetingToArchive) { archiveMeeting(meetingToArchive.id); setMeetingToArchive(null); } };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1"><Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} meetingDates={meetingDates}/></div>
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg flex flex-col">
                     <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Reuniões para {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</h2>
                        <button onClick={openNewModal} className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow"><PlusIcon className="w-5 h-5"/><span>Nova</span></button>
                    </div>
                    <div className="relative flex-1 min-h-0">
                       <div className="absolute inset-0 overflow-y-auto pr-2">
                            {filteredMeetings.length > 0 ? (
                                <ul className="space-y-4">
                                    {filteredMeetings.map(m => (
                                        <li key={m.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{m.subject}</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300"><span className="font-semibold">Horário:</span> {new Date(m.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300"><span className="font-semibold">Local:</span> {m.location}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300"><span className="font-semibold">Responsável:</span> {m.officer}</p>
                                                    {m.notes && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">"{m.notes}"</p>}
                                                </div>
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button onClick={() => openEditModal(m)} className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"><EditIcon className="w-5 h-5"/></button>
                                                    <button onClick={() => setMeetingToArchive(m)} className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 transition-colors"><TrashIcon className="w-5 h-5"/></button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="flex items-center justify-center h-full"><p className="text-gray-500 dark:text-gray-400">Nenhuma reunião agendada.</p></div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-8"><DashboardStats meetings={meetings} /></div>
            <MeetingFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveMeeting} meetingToEdit={meetingToEdit} />
            <ConfirmationModal isOpen={!!meetingToArchive} onClose={() => setMeetingToArchive(null)} onConfirm={handleConfirmArchive} title="Confirmar Arquivamento" message="Esta reunião será arquivada e escondida, mas permanecerá visível em 'Todas as Reuniões'. Continuar?" confirmButtonText="Arquivar"/>
        </div>
    );
};
