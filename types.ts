export type ImageCategory = 'lifestyle' | 'product' | 'model' | 'gif' | 'angled_product' | 'story' | 'transparent_bg';

export interface GeneratedImages {
  lifestyle: string | null;
  product: string | null;
  model: string | null;
  gif: string | null;
  angled_product: string | null;
  story: string | null;
  transparent_bg: string | null;
}

export interface LoadingStates {
  lifestyle: boolean;
  product: boolean;
  model: boolean;
  gif: boolean;
  angled_product: boolean;
  story: boolean;
  transparent_bg: boolean;
}