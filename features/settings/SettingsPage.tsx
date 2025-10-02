
import React, { useState, useEffect, useContext } from 'react';
import { GoogleSheetsContext } from '../../contexts/GoogleSheetsContext';
import type { GoogleSheetsContextType } from '../../types';
import { SettingsIcon } from '../../components/Icons';

export const SettingsPage: React.FC = () => {
    const context = useContext(GoogleSheetsContext) as GoogleSheetsContextType;
    const { settings, saveSettings } = context;
    const [localSettings, setLocalSettings] = useState(settings);
    const [copied, setCopied] = useState(false);
    const SCRIPT_CODE = `function doPost(e) { try { var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet(); if (sheet.getLastRow() === 0) { sheet.appendRow(["Data e Hora", "Assunto", "Oficial", "Local", "Observações", "Status", "ID"]); } var data = JSON.parse(e.postData.contents); sheet.appendRow([data.dateTime, data.subject, data.officer, data.location, data.notes, data.status, data.id]); return ContentService.createTextOutput(JSON.stringify({ "status": "success" })).setMimeType(ContentService.MimeType.JSON); } catch (error) { return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.message })).setMimeType(ContentService.MimeType.JSON); } }`;

    useEffect(() => { setLocalSettings(settings); }, [settings]);
    const handleCopy = () => { navigator.clipboard.writeText(SCRIPT_CODE); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    const handleSave = () => { saveSettings(localSettings); context.addToast('Configurações salvas!', 'success'); };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-3"><SettingsIcon className="w-6 h-6"/>Integração com Google Planilhas</h1>
                    <p className="text-gray-600 dark:text-gray-300">Siga as instruções para salvar novas reuniões automaticamente em uma Planilha Google.</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Passo 1: Crie o Script</h2>
                     <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
                        <li>Crie uma Planilha em <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">sheets.new</a>.</li>
                        <li>Vá em <strong>Extensões &gt; Apps Script</strong>.</li>
                        <li>Apague o código de exemplo e cole o script abaixo.</li>
                        <div className="my-4">
                            <pre className="bg-gray-900 text-gray-200 p-4 rounded-md text-xs overflow-x-auto"><code>{SCRIPT_CODE}</code></pre>
                            <button onClick={handleCopy} className="mt-2 py-1 px-3 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600">{copied ? 'Copiado!' : 'Copiar'}</button>
                        </div>
                        <li>Clique em <strong>Implantar &gt; Nova implantação</strong>.</li>
                        <li>No ícone ⚙️, selecione <strong>App da Web</strong>.</li>
                        <li>Em "Quem pode acessar", selecione <strong>Qualquer pessoa</strong>.</li>
                        <li>Clique em <strong>Implantar</strong> e autorize.</li>
                        <li>Copie a <strong>URL do app da Web</strong> e cole no campo abaixo.</li>
                    </ol>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Passo 2: Salve a URL</h2>
                    <input type="text" value={localSettings.scriptUrl} onChange={e => setLocalSettings({ scriptUrl: e.target.value })} placeholder="Cole a URL aqui" className="mt-1 block w-full p-2 bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200"/>
                    <div className="flex justify-end mt-6">
                        <button onClick={handleSave} className="py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salvar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
