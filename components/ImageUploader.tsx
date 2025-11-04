import React, { useState, useCallback } from 'react';
import { UploadIcon, LinkIcon } from './icons';

interface ImageUploaderProps {
  onImageSelect: (file: File | null) => void;
  previewUrl: string | null;
  isGenerating: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, previewUrl, isGenerating }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImageSelect(e.dataTransfer.files[0]);
    }
  }, [onImageSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImageSelect(e.target.files[0]);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl || isUrlLoading || isGenerating) return;

    setIsUrlLoading(true);
    setUrlError(null);

    try {
        new URL(imageUrl);

        const response = await fetch(imageUrl);

        if (!response.ok) {
            throw new Error(`Falha ao buscar a imagem. Status: ${response.status}`);
        }
        
        const blob = await response.blob();
        
        if (!blob.type.startsWith('image/')) {
            throw new Error('O URL não aponta para um tipo de imagem válido.');
        }

        const fileName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1) || 'image.jpg';
        const imageFile = new File([blob], fileName, { type: blob.type });
        onImageSelect(imageFile);
        setImageUrl('');
    } catch (error: any) {
        console.error("Erro ao buscar imagem do URL:", error);
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
             setUrlError('Não foi possível carregar a imagem. Pode ser um problema de CORS ou rede.');
        } else {
             setUrlError(error.message || 'URL inválido ou a imagem não pôde ser acessada.');
        }
    } finally {
        setIsUrlLoading(false);
    }
  };

  return (
    <div className="w-full">
      <label
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        htmlFor="image-upload"
        className={`relative flex flex-col items-center justify-center w-full h-56 sm:h-64 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer transition-all duration-300 bg-white shadow-sm
          ${isDragging ? 'border-violet-400 bg-violet-50 scale-105' : 'hover:border-slate-400 hover:bg-slate-50'}
          ${(isGenerating || isUrlLoading) ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Pré-visualização do produto" className="object-contain w-full h-full rounded-2xl p-2" />
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
            <UploadIcon className="w-10 h-10 mb-3 text-slate-400" />
            <p className="mb-2 text-sm"><span className="font-semibold text-violet-600">Clique para enviar</span> ou arraste e solte</p>
            <p className="text-xs">PNG, JPG, WEBP ou GIF</p>
          </div>
        )}
        <input id="image-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp, image/gif" disabled={isGenerating || isUrlLoading} />
      </label>

      <div className="relative flex items-center my-6">
        <div className="flex-grow border-t border-slate-300"></div>
        <span className="flex-shrink mx-4 text-sm font-medium text-slate-500">OU</span>
        <div className="flex-grow border-t border-slate-300"></div>
      </div>

      <form onSubmit={handleUrlSubmit} className="space-y-2">
        <div className="flex items-center space-x-2">
           <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={isGenerating || isUrlLoading}
            placeholder="Cole o URL da imagem ou do marketplace"
            className="flex-grow px-4 py-2 text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-shadow disabled:bg-slate-100"
            aria-label="URL da imagem"
            />
            <button
                type="submit"
                disabled={!imageUrl || isUrlLoading || isGenerating}
                className="flex items-center justify-center px-4 py-2 font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              {isUrlLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
              ) : (
                  <LinkIcon className="w-5 h-5" />
              )}
                <span className="ml-2">{isUrlLoading ? 'Carregando...' : 'Usar URL'}</span>
            </button>
        </div>
        {urlError && <p className="text-sm text-red-600 mt-2">{urlError}</p>}
      </form>
    </div>
  );
};
