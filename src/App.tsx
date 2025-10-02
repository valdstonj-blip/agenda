import React, { useContext } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { AllMeetingsPage } from './features/meetings/AllMeetingsPage';
import { OfficerConsultationPage } from './features/meetings/OfficerConsultationPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { ToastContainer } from './components/Toast';
import { GoogleSheetsContext } from './contexts/GoogleSheetsContext';
import type { GoogleSheetsContextType } from './types';
import { useTheme } from './hooks/useTheme';

const Header: React.FC = () => {
    // A chamada para useTheme é mantida para que o tema light/dark continue funcionando
    // com base nas preferências do sistema, mas o botão de alternância é removido.
    useTheme();

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between gap-2 py-4 md:flex-row md:gap-0 md:h-16">
                    <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100 sm:text-xl text-center md:text-left">Agenda PM/3</h1>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                        <NavLink to="/" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${ isActive ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>Painel</NavLink>
                        <NavLink to="/all" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${ isActive ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>Todas</NavLink>
                        <NavLink to="/consultation" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${ isActive ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>Consulta</NavLink>
                        <NavLink to="/settings" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${ isActive ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>Config</NavLink>
                    </div>
                </div>
            </nav>
        </header>
    );
};


const App: React.FC = () => {
    const context = useContext(GoogleSheetsContext);
    
    if (!context) {
        // Isso previne um erro caso o contexto ainda não esteja disponível.
        return <div>Carregando...</div>;
    }

    const { toasts } = context as GoogleSheetsContextType;
    
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Header />
            <main>
                <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/all" element={<AllMeetingsPage />} />
                    <Route path="/consultation" element={<OfficerConsultationPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Routes>
            </main>
            <ToastContainer toasts={toasts} />
        </div>
    );
};

export default App;