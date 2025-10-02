import { useState, useContext } from 'react';
import type { Meeting, NewMeetingData, GoogleSheetsContextType } from '../types';
import { GoogleSheetsContext } from '../contexts/GoogleSheetsContext';

const STORAGE_KEY = 'pm3_meetings_app_data';

const loadMeetingsFromStorage = (): Meeting[] => {
    try {
        const storedMeetings = localStorage.getItem(STORAGE_KEY);
        const parsedMeetings: Meeting[] = storedMeetings ? JSON.parse(storedMeetings) : [];
        return [...parsedMeetings].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    } catch (error) {
        console.error("Falha ao carregar reuniões:", error);
        return [];
    }
};

const saveMeetingsToStorage = (meetings: Meeting[]) => {
    try {
        const sortedMeetings = [...meetings].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedMeetings));
    } catch (error) {
        console.error("Falha ao salvar reuniões:", error);
    }
};

export const useMeetings = () => {
    const [meetings, setMeetings] = useState<Meeting[]>(loadMeetingsFromStorage);
    const googleSheetsContext = useContext(GoogleSheetsContext);
    const appendMeetingToSheet = googleSheetsContext?.appendMeeting;

    const addMeeting = (meetingData: NewMeetingData) => {
        const newMeeting: Meeting = { ...meetingData, id: crypto.randomUUID(), isDeleted: false };
        setMeetings(prev => {
            const updated = [...prev, newMeeting];
            saveMeetingsToStorage(updated);
            return updated;
        });
        if (appendMeetingToSheet) appendMeetingToSheet(newMeeting);
    };

    const updateMeeting = (updatedMeeting: Meeting) => {
        setMeetings(prev => {
            const updated = prev.map(m => (m.id === updatedMeeting.id ? updatedMeeting : m));
            saveMeetingsToStorage(updated);
            return updated;
        });
    };

    const archiveMeeting = (id: string) => {
        setMeetings(prev => {
            const updated = prev.map(m => m.id === id ? { ...m, isDeleted: true } : m);
            saveMeetingsToStorage(updated);
            return updated;
        });
    };

    const deleteMeetingPermanently = (id: string) => {
        setMeetings(prev => {
            const updated = prev.filter(m => m.id !== id);
            saveMeetingsToStorage(updated);
            return updated;
        });
    };

    const clearAllMeetings = () => {
        setMeetings(() => {
            saveMeetingsToStorage([]);
            return [];
        });
    };

    return { meetings, addMeeting, updateMeeting, archiveMeeting, clearAllMeetings, deleteMeetingPermanently };
};