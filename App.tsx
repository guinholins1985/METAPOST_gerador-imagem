import React, { useState, useEffect, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { GeneratedImageCard } from './components/GeneratedImageCard';
import { ImageModal } from './components/ImageModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { MegapostLogoIcon, DownloadIcon } from './components/icons';
import { generateImage } from './services/geminiService';
import { ImageCategory, GeneratedImages, LoadingStates } from './types';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImages>({
    lifestyle: null,
    product: null,
    model: null,
    gif: null,
    angled_product: null,
    story: null,
    transparent_bg: null,
  });
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    lifestyle: false,
    product: false,
    model: false,
    gif: false,
    angled_product: false,
    story: false,
    transparent_bg: false,
  });
  const [errorStates, setErrorStates] = useState<Record<ImageCategory, string | null>>({
    lifestyle: null,
    product: null,
    model: null,
    gif: null,
    angled_product: null,
    story: null,
    transparent_bg: null,
  });
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setIsApiKeyModalOpen(true);
    }
  }, []);

  const handleImageSelect = (file: File | null) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setSelectedFile(file);
    
    // Reset states when a new image is selected or cleared
    setGeneratedImages({ lifestyle: null, product: null, model: null, gif: null, angled_product: null, story: null, transparent_bg: null });
    setErrorStates({ lifestyle: null, product: null, model: null, gif: null, angled_product: null, story: null, transparent_bg: null });
    setProgress(0);

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };
  
  const isGenerating = Object.values(loadingStates).some(Boolean);
  const hasGeneratedImages = Object.values(generatedImages).some(img => img !== null);

  const triggerGeneration = useCallback(async (category: ImageCategory, file: File, onComplete: () => void) => {
    setLoadingStates(prev => ({ ...prev, [category]: true }));
    setErrorStates(prev => ({ ...prev, [category]: null }));
    setGeneratedImages(prev => ({...prev, [category]: null}));
    try {
      const imageUrl = await generateImage(file, category);
      setGeneratedImages(prev => ({ ...prev, [category]: imageUrl }));
    } catch (e) {
      // Fix: Type 'unknown' is not assignable to type 'string'. The catch clause variable `e` is of type `unknown` and must be type-checked before use.
      if (e instanceof Error) {
        setErrorStates(prev => ({ ...prev, [category]: e.message || 'Ocorreu um erro desconhecido' }));
      } else {
        setErrorStates(prev => ({ ...prev, [category]: 'Ocorreu um erro desconhecido' }));
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, [category]: false }));
      onComplete();
    }
  }, []);

  const handleGenerateClick = () => {
    if (selectedFile) {
      const categories: ImageCategory[] = ['lifestyle', 'product', 'angled_product', 'model', 'gif', 'story', 'transparent_bg'];
      let completedCount = 0;
      setProgress(0);

      const handleCompletion = () => {
        completedCount++;
        const newProgress = Math.round((completedCount / categories.length) * 100);
        setProgress(newProgress);
      };
      
      categories.forEach(category => {
        triggerGeneration(category, selectedFile, handleCompletion);
      });
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleRegenerate = (category: ImageCategory) => {
    if (selectedFile) {
      const onComplete = () => {};
      triggerGeneration(category, selectedFile, onComplete);
    }
  };
  
  const handleDownloadAll = () => {
    const titleMap: Record<string, string> = {
      lifestyle: 'Lifestyle',
      product: 'Mockup do Produto',
      angled_product: 'Mockup com Ângulo',
      model: 'Com Modelo',
      gif: 'Cena Dinâmica (Estilo GIF)',
      story: 'Story (Insta e Whats)',
      transparent_bg: 'Sem Fundo (PNG)',
    };

    Object.entries(generatedImages).forEach(([category, imageUrl]) => {
      if (imageUrl) {
        const link = document.createElement('a');
        link.href = imageUrl;
        const fileName = titleMap[category as ImageCategory] || category;
        link.download = `megapost_${fileName.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  };

  const categories: ImageCategory[] = ['lifestyle', 'product', 'angled_product', 'model', 'gif', 'story', 'transparent_bg'];

  return (
    <div className="bg-slate-50 min-h-full font-sans text-slate-900">
      <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} />
      <ImageModal imageUrl={zoomedImageUrl} onClose={() => setZoomedImageUrl(null)} />

      <header className="py-4 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 flex items-center justify-center">
            <MegapostLogoIcon className="h-8 w-auto text-violet-600" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 mb-4 leading-tight max-w-3xl mx-auto">
            Crie Conteúdo de <span className="text-violet-600">Marketing em Segundos</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Faça upload de uma imagem ou cole um link de produto. Nossa IA analisará e gerará textos de alta conversão para todas as suas necessidades.
          </p>
        </div>

        <div className="max-w-xl mx-auto mt-8 md:mt-14">
          <ImageUploader 
            onImageSelect={handleImageSelect} 
            previewUrl={previewUrl}
            isGenerating={isGenerating} 
          />
          {selectedFile && !isGenerating && (
            <div className="mt-6 text-center animate-fade-in">
              <button
                onClick={handleGenerateClick}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 font-bold text-white bg-violet-600 rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-violet-500/30"
              >
                Carregar Imagens
              </button>
            </div>
          )}
        </div>

        {isGenerating && (
          <div className="max-w-xl mx-auto mt-6 animate-fade-in">
              <div className="relative h-4 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                      className="absolute top-0 left-0 h-full bg-violet-600 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                  ></div>
              </div>
              <p className="text-center text-sm font-medium text-violet-700 mt-2">{progress > 0 && progress < 100 ? 'Gerando...' : 'Concluído!'} {progress}%</p>
          </div>
        )}
        
        {(isGenerating || hasGeneratedImages) && (
          <div className="mt-12 md:mt-20">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10 text-center">
                <h2 className="text-3xl font-bold text-slate-900">Resultados Gerados</h2>
                {hasGeneratedImages && !isGenerating && (
                    <button
                        onClick={handleDownloadAll}
                        className="inline-flex items-center justify-center px-5 py-2 font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-violet-500/30"
                    >
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        Baixar Todas
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {categories.map((cat) => (
                <GeneratedImageCard
                  key={cat}
                  category={cat}
                  imageUrl={generatedImages[cat]}
                  isLoading={loadingStates[cat]}
                  error={errorStates[cat]}
                  onRegenerate={() => handleRegenerate(cat)}
                  onZoom={() => generatedImages[cat] && setZoomedImageUrl(generatedImages[cat])}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="py-8 mt-16 border-t border-slate-200">
          <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
              <p>&copy; {new Date().getFullYear()} Megapost. Impulsionado por Google Gemini.</p>
          </div>
      </footer>
    </div>
  );
};

export default App;