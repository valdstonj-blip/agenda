
import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { MoonIcon, SunIcon } from './Icons';

export const ThemeToggleButton: React.FC = () => {
    const [theme, toggleTheme] = useTheme();
    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-blue-500 transition-colors"
            aria-label={`Mudar para o modo ${theme === 'light' ? 'escuro' : 'claro'}`}
        >
            {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
        </button>
    );
};
