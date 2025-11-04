import React, { useState } from 'react';
import { CloseIcon, DownloadIcon, CopyIcon, CheckIcon } from './icons';

interface ImageModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  const [copied, setCopied] = useState(false);
  
  if (!imageUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `megapost_generated_image.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleCopy = async () => {
    if (!imageUrl || copied) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2s
    } catch (err) {
      console.error('Falha ao copiar a imagem: ', err);
      alert('Seu navegador não suporta copiar imagens desta forma.');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900 bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative bg-white border border-slate-200 rounded-lg shadow-2xl max-w-4xl max-h-[90vh] p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={imageUrl} alt="Visualização ampliada" className="object-contain w-full h-full max-h-[calc(90vh-4rem)] rounded-md" />
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          title="Fechar"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
        <div className="absolute bottom-4 right-4 flex gap-2">
           <button
            onClick={handleCopy}
            className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-violet-600 text-white hover:bg-violet-700 disabled:bg-green-600 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
            title={copied ? "Copiado!" : "Copiar Imagem"}
            disabled={copied}
          >
            {copied ? (
              <CheckIcon className="w-6 h-6 sm:w-7 sm:h-7" />
            ) : (
              <CopyIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
          <button
            onClick={handleDownload}
            className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-lg"
            title="Baixar"
          >
            <DownloadIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};