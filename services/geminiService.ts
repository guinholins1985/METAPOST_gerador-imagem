import { GoogleGenAI, Modality } from "@google/genai";
import { ImageCategory } from '../types';

// Per guidelines, initialize with API_KEY from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const getMimeType = (fileName: string): string | null => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    default:
      return null;
  }
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error("Failed to read file as string."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
  const mimeType = getMimeType(file.name);
  if (!mimeType) {
    throw new Error('Unsupported image type.');
  }
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType },
  };
};

const getPromptForCategory = (category: ImageCategory): string => {
    const fidelityInstruction = "É CRUCIAL E OBRIGATÓRIO que o produto na imagem gerada seja uma réplica PERFEITA do produto na imagem fornecida. NÃO altere sua forma, cor, textura, logos ou quaisquer outros detalhes. O produto deve ser 100% fiel ao original.";

    switch (category) {
        case 'lifestyle':
            return `Crie uma fotografia de estilo de vida (lifestyle) realista e de alta qualidade usando este produto. A cena deve parecer autêntica, com o produto integrado naturalmente a um ambiente do dia a dia ou sendo usado por uma pessoa. ${fidelityInstruction}`;
        case 'product':
            return `Gere uma foto de produto limpa e profissional (mockup) deste item, apresentando-o sobre um pedestal ou superfície minimalista (mármore, concreto, madeira clara) com um fundo de cor neutra. A iluminação deve ser de estúdio, destacando os detalhes do produto. ${fidelityInstruction}`;
        case 'model':
            return `Crie uma imagem de estúdio moderna com um(a) modelo estiloso(a) interagindo com o produto de forma positiva e natural. O fundo deve ser de uma cor sólida e vibrante que complemente o produto. ${fidelityInstruction}`;
        case 'gif':
             return `Crie uma imagem estática que capture a energia e o movimento de um GIF animado. A cena deve ser dinâmica e chamativa, usando cores vibrantes, talvez com linhas de movimento ou um efeito de explosão de cores no fundo. ${fidelityInstruction}`;
        case 'angled_product':
             return `Gere uma foto de produto limpa e profissional (mockup) deste item, capturada de um ângulo dinâmico para mostrar a profundidade e os detalhes do produto. O item deve ser apresentado sobre uma superfície minimalista (mármore, concreto, madeira clara) com um fundo de cor neutra. A iluminação deve ser de estúdio, criando sombras suaves para realçar a forma do produto. ${fidelityInstruction}`;
        case 'story':
            return `Crie uma imagem de marketing atraente para stories do Instagram e WhatsApp. A imagem deve ser vibrante, chamar a atenção e ter um espaço claro para adicionar texto ou logos. O formato DEVE ser vertical (proporção 9:16). ${fidelityInstruction}`;
        case 'transparent_bg':
            return `Gere uma imagem de produto com fundo perfeitamente transparente. O formato de saída DEVE ser PNG. O produto deve estar completamente isolado, sem sombras ou reflexos no chão. ${fidelityInstruction}`;
        default:
            return `Gere uma imagem usando este produto. ${fidelityInstruction}`;
    }
}

export const generateImage = async (imageFile: File, category: ImageCategory): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  
  const imagePart = await fileToGenerativePart(imageFile);
  
  // For GIF inputs, we add a specific instruction for the model.
  const isGif = imageFile.type === 'image/gif';
  const gifInstruction = isGif ? 'A imagem de entrada é um GIF animado; por favor, selecione o quadro mais claro e representativo do produto para usar como base para a nova imagem.' : '';
  const prompt = `${gifInstruction} ${getPromptForCategory(category)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          imagePart,
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    throw new Error("Nenhuma imagem gerada na resposta.");

  } catch (error) {
    console.error("Erro ao gerar imagem com a API Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Falha ao gerar imagem: ${error.message}`);
    }
    throw new Error("Ocorreu um erro desconhecido ao gerar a imagem.");
  }
};