
import React, { createContext, useState, useCallback, ReactNode } from 'react';
import type { GoogleSheetsSettings, ToastMessage, GoogleSheetsContextType, Meeting } from '../types';

const STORAGE_KEY = 'pm3_sheets_settings_v2';

export const GoogleSheetsContext = createContext<GoogleSheetsContextType | null>(null);

export const GoogleSheetsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<GoogleSheetsSettings>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : { scriptUrl: '' };
        } catch {
            return { scriptUrl: '' };
        }
    });

    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((message: string, type: 'success' | 'error') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const saveSettings = (newSettings: GoogleSheetsSettings) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        setSettings(newSettings);
    };

    const appendMeeting = useCallback(async (meeting: Meeting) => {
        if (!settings.scriptUrl) return;
        try {
            const response = await fetch(settings.scriptUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({
                    dateTime: new Date(meeting.dateTime).toLocaleString('pt-BR'),
                    subject: meeting.subject,
                    officer: meeting.officer,
                    location: meeting.location,
                    notes: meeting.notes,
                    status: 'Ativa',
                    id: meeting.id
                }),
                mode: 'cors',
            });
            const result = await response.json();
            if (result.status === 'success') {
                addToast("Reunião salva no Google Planilhas!", 'success');
            } else {
                throw new Error(result.message || 'Erro desconhecido no script.');
            }
        } catch (error) {
            console.error("Erro ao enviar para Google Apps Script:", error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            addToast(`Falha ao salvar na planilha: ${errorMessage}`, 'error');
        }
    }, [settings.scriptUrl, addToast]);

    const value: GoogleSheetsContextType = { settings, toasts, saveSettings, appendMeeting, addToast };

    return (
        <GoogleSheetsContext.Provider value={value}>
            {children}
        </GoogleSheetsContext.Provider>
    );
};
