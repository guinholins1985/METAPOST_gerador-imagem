import React from 'react';
import { CloseIcon } from './icons';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-70 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in">
      <div className="relative bg-white rounded-lg p-8 shadow-2xl max-w-md w-full text-center">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
          title="Fechar"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Chave de API não encontrada</h2>
        <p className="text-slate-600 mb-6">
          A chave da API Gemini está faltando. Por favor, garanta que a variável de ambiente 
          <code className="bg-slate-100 text-slate-800 rounded px-1.5 py-1 mx-1 font-mono text-sm">API_KEY</code>
          esteja configurada corretamente para usar esta aplicação.
        </p>
        <a
          href="https://ai.google.dev/gemini-api/docs/api-key"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-violet-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-violet-700 transition-colors"
        >
          Como Obter uma Chave de API
        </a>
      </div>
    </div>
  );
};