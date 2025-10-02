
import React from 'react';
import type { ToastMessage } from '../types';

interface ToastProps {
    toast: ToastMessage;
}

const Toast: React.FC<ToastProps> = ({ toast }) => {
    const baseClasses = "max-w-xs w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden";
    const typeClasses = { success: "border-l-4 border-green-500", error: "border-l-4 border-red-500" };
    const iconClasses = { success: "text-green-500", error: "text-red-500" };
    
    const Icon = () => (
        <svg className={`h-6 w-6 ${iconClasses[toast.type]}`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            {toast.type === 'success' ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />}
        </svg>
    );

    return (
        <div className={`${baseClasses} ${typeClasses[toast.type]}`}>
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0"><Icon /></div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{toast.type === 'success' ? 'Sucesso!' : 'Erro!'}</p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{toast.message}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


interface ToastContainerProps {
    toasts: ToastMessage[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => (
    <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50">
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
            {toasts.map((toast) => <Toast key={toast.id} toast={toast} />)}
        </div>
    </div>
);
