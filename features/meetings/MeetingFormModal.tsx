
import React, { useState, useEffect } from 'react';
import type { Meeting, NewMeetingData } from '../../types';

interface MeetingFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (meetingData: NewMeetingData | Meeting) => void;
    meetingToEdit: Meeting | null;
}

type FormData = Omit<NewMeetingData, 'id' | 'isDeleted'>;

export const MeetingFormModal: React.FC<MeetingFormModalProps> = ({ isOpen, onClose, onSave, meetingToEdit }) => {
    const [formData, setFormData] = useState<FormData>({ subject: '', officer: '', location: '', dateTime: '', notes: '' });
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

    useEffect(() => {
        setErrors({});
        if (meetingToEdit) {
            setFormData({ ...meetingToEdit });
        } else {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            setFormData({ subject: '', officer: '', location: '', dateTime: now.toISOString().slice(0, 16), notes: '' });
        }
    }, [meetingToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormData]) setErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const validateForm = () => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};
        if (!formData.subject.trim()) newErrors.subject = "O assunto é obrigatório.";
        if (!formData.officer.trim()) newErrors.officer = "O oficial é obrigatório.";
        if (!formData.location.trim()) newErrors.location = "O local é obrigatório.";
        if (!formData.dateTime) newErrors.dateTime = "Data e hora são obrigatórios.";
        return newErrors;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }
        const finalData = Object.fromEntries(
            Object.entries(formData).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
        ) as FormData;
        
        onSave(finalData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-lg m-4">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">{meetingToEdit ? 'Editar Reunião' : 'Nova Reunião'}</h2>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="grid grid-cols-1 gap-4">
                        {(['subject', 'officer', 'location'] as const).map(field => (
                            <div key={field}>
                                <input type="text" name={field} value={formData[field]} onChange={handleChange} placeholder={field.charAt(0).toUpperCase() + field.slice(1)} className={`w-full p-3 bg-gray-100 dark:bg-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200 ${errors[field] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                                {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
                            </div>
                        ))}
                        <div>
                            <input type="datetime-local" name="dateTime" value={formData.dateTime} onChange={handleChange} className={`w-full p-3 bg-gray-100 dark:bg-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200 ${errors.dateTime ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                            {errors.dateTime && <p className="text-red-500 text-xs mt-1">{errors.dateTime}</p>}
                        </div>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Observações" className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200" rows={3}></textarea>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancelar</button>
                        <button type="submit" className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
