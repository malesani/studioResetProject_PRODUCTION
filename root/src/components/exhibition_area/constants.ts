export type StandTypeKeys = "isola" | "angolo" | "penisola" | "lineare";

export interface StandType {
  value: StandTypeKeys;
  name: string;
  description: string;
  visibility: string;
  traffic: string;
}

export const standTypesInfo: StandType[] = [  
  {
    value: "lineare",
    name: "Stand Lineare",
    description: "Un lato aperto - Soluzione base",
    visibility: "90°",
    traffic: "Base"
  },
  {
    value: "angolo",
    name: "Stand ad Angolo",
    description: "Due lati aperti - Ottima visibilità",
    visibility: "180°",
    traffic: "Buono"
  },
  {
    value: "penisola",
    name: "Stand a Penisola",
    description: "Tre lati aperti - Visibilità elevata",
    visibility: "270°",
    traffic: "Molto Buono"
  },
  {
    value: "isola",
    name: "Stand ad Isola",
    description: "Quattro lati aperti - Massima visibilità",
    visibility: "360°",
    traffic: "Eccellente"
  }
];

export type PlatformTypeKeys = "ground" | "double-layer" | "raised" | "technical";

export interface PlatformType {
  value: PlatformTypeKeys;
  name: string;
  description: string;
}

export const platformTypeInfo: PlatformType[] = [
  { value: 'ground', name: 'A Terra', description: 'Direttamente sul pavimento' },
  { value: 'double-layer', name: 'Doppio Strato', description: 'Altezza 3.6 cm' },
  { value: 'raised', name: 'Rialzata', description: 'Altezza 10 cm' },
  { value: 'technical', name: 'Pedana Tecnica', description: 'Altezza 13 cm per passaggio cavi e tubature' },
];

export type HeightTypeKeys = "low" | "medium" | "high" | "extra";

export interface HeightType {
  value: HeightTypeKeys;
  name: string;
  description: string;
}

export const heightTypesInfo: HeightType[] = [
  { value: "low", name: "2.5m", description: "Base" }, 
  { value: "medium", name: "3.5m", description: "Standard" }, 
  { value: "high", name: "5m", description: "Premium" }, 
  { value: "extra", name: "6m+", description: "Luxury" }, 
];

export type SuspendedElementKeys = "american" | "ceiling";

export interface SuspendedElement {
  value: SuspendedElementKeys;
  name: string;
  description: string;
  icon?: string;
}

export const SuspendedElementsInfo: SuspendedElement[] = [
  { value: "american", icon: "lightbulb", name: "Americana Sospesa", description: "Sistema di illuminazione professionale sospeso per una migliore distribuzione della luce." }, 
  { value: "ceiling", icon: "layer-group", name: "Plafone Sospeso", description: "Copertura sospesa per nascondere impianti e creare un effetto scenografico" }, 
];