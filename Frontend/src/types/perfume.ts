export type PerfumeStatus = "available" | "sold_out" | "new";
export type PerfumeCategory = "unisex" | "feminine" | "masculine";

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
  price: number;
  sizeMl: number;
  category: PerfumeCategory;
  status: PerfumeStatus;
  featured: boolean;
  notes: ScentNotes;
  images: string[];
  longevity?: string;
  bestSeason?: string;
  rating?: number;
}
