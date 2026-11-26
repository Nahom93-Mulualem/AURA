export type PerfumeStatus = "available" | "sold_out" | "new";
export type PerfumeCategory = "women" | "men" | "unisex" | "feminine" | "masculine";

export type FragranceType =
  | "eau_de_parfum"
  | "eau_de_toilette"
  | "extrait_de_parfum"
  | "perfume_oil"
  | "bakhoor"
  | "body_splash";

export const CATEGORY_LABELS: Record<string, string> = {
  women: "Women",
  men: "Men",
  unisex: "Unisex",
  feminine: "Women",
  masculine: "Men",
};

export const FRAGRANCE_TYPE_LABELS: Record<FragranceType, string> = {
  eau_de_parfum: "Eau de Parfum",
  eau_de_toilette: "Eau de Toilette",
  extrait_de_parfum: "Extrait de Parfum",
  perfume_oil: "Perfume Oil",
  bakhoor: "Bakhoor",
  body_splash: "Body Splash",
};

export interface ScentNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Perfume {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  tagline: string;
  description: string;
  shortDescription?: string;
  price: number;
  sizeMl: number | string;
  category: PerfumeCategory;
  fragranceType?: FragranceType | string;
  status: PerfumeStatus;
  featured: boolean;
  notes: ScentNotes;
  images: string[];
  longevity?: string;
  bestSeason?: string;
  rating?: number;
}
