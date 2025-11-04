import React, { useRef, useState } from 'react';
import { DownloadIcon, RefreshIcon, ZoomInIcon } from './icons';

interface GeneratedImageCardProps {
  category: string;
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  onRegenerate: () => void;
  onZoom: () => void;
}

const SkeletonLoader: React.FC = () => (
  <div className="relative w-full h-full overflow-hidden rounded-2xl bg-slate-200">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-slate-100 to-transparent animate-shimmer" />
  </div>
);

export const GeneratedImageCard: React.FC<GeneratedImageCardProps> = ({
  category,
  imageUrl,
  isLoading,
  error,
  onRegenerate,
  onZoom,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('rotateX(0deg) rotateY(0deg)');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !glowRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - left;
    const mouseY = e.clientY - top;
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    const rotateX = ((mouseY - centerY) / centerY) * -8; // Max rotation 8deg
    const rotateY = ((mouseX - centerX) / centerX) * 8;
    
    setTransform(`rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);

    glowRef.current.style.left = `${mouseX}px`;
    glowRef.current.style.top = `${mouseY}px`;
  };

  const handleMouseLeave = () => {
    setTransform('rotateX(0deg) rotateY(0deg)');
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${category.replace(/\s+/g, '_').toLowerCase()}_image.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const titleMap: Record<string, string> = {
    lifestyle: 'Lifestyle',
    product: 'Mockup do Produto',
    angled_product: 'Mockup com Ângulo',
    model: 'Com Modelo',
    gif: 'Cena Dinâmica (Estilo GIF)',
    story: 'Story (Insta/Whats)',
    transparent_bg: 'Sem Fundo (PNG)',
  }
  const title = titleMap[category] || category;

  return (
    <div className="w-full animate-fade-in">
      <h3 className="text-lg font-semibold text-slate-800 mb-3 text-center sm:text-left">{title}</h3>
      <div 
        className="perspective-container w-full aspect-square"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          ref={cardRef} 
          style={{ transform }}
          className={`relative group w-full h-full rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-lg card-3d ${category === 'transparent_bg' && imageUrl ? 'bg-[url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAC1JREFUOE9jZGBgEGHAD97/n4EhmHHNn/8z88fMn7EHYPFAGk9C2A02AwBX/Q8A/M3TzQAAAABJRU5ErkJggg==)] bg-repeat' : ''}`}
        >
          <div ref={glowRef} className="card-glow">
             <div className="card-glow-effect" />
          </div>
          {isLoading && <SkeletonLoader />}
          
          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center w-full h-full text-center text-red-600 p-4 bg-red-50">
              <p className="font-semibold text-red-700">Falha na Geração</p>
              <p className="text-sm">{error}</p>
              <button
                onClick={onRegenerate}
                className="mt-4 p-2 rounded-full bg-red-500/20 text-red-600 hover:bg-red-500/30 transition-colors"
                title="Regenerar"
              >
                <RefreshIcon className="w-6 h-6" />
              </button>
            </div>
          )}

          {!isLoading && !error && imageUrl && (
            <>
              <img src={imageUrl} alt={`Imagem gerada de ${category}`} className={`w-full h-full ${category === 'transparent_bg' ? 'object-contain' : 'object-cover'}`} />
              <div className="absolute inset-0 flex items-center justify-center space-x-2 sm:space-x-4 bg-black bg-opacity-0 sm:group-hover:bg-black/40 transition-all duration-300">
                <button
                  onClick={onRegenerate}
                  className="p-2 sm:p-3 rounded-full bg-white/80 backdrop-blur-md text-slate-800 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100"
                  title="Regenerar"
                >
                  <RefreshIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={onZoom}
                  className="p-2 sm:p-3 rounded-full bg-white/80 backdrop-blur-md text-slate-800 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 delay-75"
                  title="Zoom"
                >
                  <ZoomInIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 sm:p-3 rounded-full bg-white/80 backdrop-blur-md text-slate-800 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 delay-150"
                  title="Baixar"
                >
                  <DownloadIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};