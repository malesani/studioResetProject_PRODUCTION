import {
  adjustColorBrightness,
  adjustColorSaturation
} from './util_colors';

export interface StyleSuggestion {
  colors: Array<{ hex: string; name: string }>;
  colorDescription: string;
  materials: Array<{ name: string; description: string }>;
  styleDescription: string;
  layoutSuggestions: string[];
  technicalSuggestions: string[];
}

export function getStyleSuggestions(answers: Record<string, string>): StyleSuggestion {
  const brandIdentity = answers['brand_identity'];
  const atmosphere = answers['atmosphere'];
  const lighting = answers['lighting'];
  const materials = answers['materials'];
  const layout = answers['layout'];
  const technology = answers['technology'];
  const experience = answers['experience'];

  // Generate base color palette based on brand identity and atmosphere
  const colors = generateColorPalette(brandIdentity, atmosphere);
  
  // Generate material suggestions based on multiple factors
  const materialSuggestions = generateMaterialSuggestions(materials, atmosphere, experience);
  
  // Generate layout suggestions
  const layoutSuggestions = generateLayoutSuggestions(layout, experience, technology);
  
  // Generate technical suggestions
  const technicalSuggestions = generateTechnicalSuggestions(technology, lighting, experience);
  
  // Generate comprehensive style description
  const styleDescription = generateStyleDescription({
    brandIdentity,
    atmosphere,
    lighting,
    layout,
    technology,
    experience
  });

  return {
    colors,
    colorDescription: generateColorDescription(colors, atmosphere),
    materials: materialSuggestions,
    styleDescription,
    layoutSuggestions,
    technicalSuggestions
  };
}

function generateColorPalette(brandIdentity: string, atmosphere: string): Array<{ hex: string; name: string }> {
  const brandPalettes: Record<string, Array<{ hex: string; name: string }>> = {
    'innovation': [
      { hex: '#0070FF', name: 'Blu Innovazione' },
      { hex: '#00D1FF', name: 'Ciano Tech' },
      { hex: '#FFFFFF', name: 'Bianco Puro' },
      { hex: '#1A1A1A', name: 'Nero Tech' }
    ],
    'tradition': [
      { hex: '#8B4513', name: 'Marrone Tradizione' },
      { hex: '#DAA520', name: 'Oro Antico' },
      { hex: '#F5F5DC', name: 'Beige Classico' },
      { hex: '#2F4F4F', name: 'Verde Scuro' }
    ],
    'sustainability': [
      { hex: '#2E7D32', name: 'Verde Sostenibile' },
      { hex: '#81C784', name: 'Verde Natura' },
      { hex: '#C8E6C9', name: 'Verde Chiaro' },
      { hex: '#F1F8E9', name: 'Bianco Naturale' }
    ],
    'quality': [
      { hex: '#1A237E', name: 'Blu Premium' },
      { hex: '#C0B283', name: 'Oro Qualità' },
      { hex: '#F5F5F5', name: 'Grigio Raffinato' },
      { hex: '#000000', name: 'Nero Elegante' }
    ],
    'creativity': [
      { hex: '#FF4081', name: 'Rosa Creativo' },
      { hex: '#7C4DFF', name: 'Viola Design' },
      { hex: '#00BCD4', name: 'Azzurro Ispirazione' },
      { hex: '#FFFFFF', name: 'Bianco Canvas' }
    ],
    'reliability': [
      { hex: '#1565C0', name: 'Blu Affidabile' },
      { hex: '#455A64', name: 'Grigio Professionale' },
      { hex: '#90A4AE', name: 'Grigio Chiaro' },
      { hex: '#ECEFF1', name: 'Bianco Ghiaccio' }
    ],
    'dynamism': [
      { hex: '#F44336', name: 'Rosso Dinamico' },
      { hex: '#FF9800', name: 'Arancione Energia' },
      { hex: '#FFC107', name: 'Giallo Vivace' },
      { hex: '#212121', name: 'Nero Contrasto' }
    ],
    'exclusivity': [
      { hex: '#212121', name: 'Nero Lusso' },
      { hex: '#CFB53B', name: 'Oro Esclusivo' },
      { hex: '#8B0000', name: 'Bordeaux' },
      { hex: '#F5F5F5', name: 'Bianco Prestigio' }
    ]
  };

  const basePalette = brandPalettes[brandIdentity] || brandPalettes['innovation'];
  
  // Modify colors based on atmosphere
  const atmosphereModifiers: Record<string, (colors: typeof basePalette) => typeof basePalette> = {
    'tech_lab': (colors) => colors.map(c => ({ ...c, hex: adjustColorBrightness(c.hex, -10) })),
    'luxury_lounge': (colors) => colors.map(c => ({ ...c, hex: adjustColorSaturation(c.hex, 10) })),
    'eco_space': (colors) => colors.map(c => ({ ...c, hex: adjustColorSaturation(c.hex, -20) })),
    'creative_hub': (colors) => colors.map(c => ({ ...c, hex: adjustColorBrightness(c.hex, 10) })),
    'professional_office': (colors) => colors.map(c => ({ ...c, hex: adjustColorSaturation(c.hex, -10) })),
    'industrial_loft': (colors) => colors.map(c => ({ ...c, hex: adjustColorBrightness(c.hex, -20) })),
    'minimal_gallery': (colors) => colors.map(c => ({ ...c, hex: adjustColorSaturation(c.hex, -30) })),
    'experiential_space': (colors) => colors.map(c => ({ ...c, hex: adjustColorBrightness(c.hex, 20) }))
  };

  return atmosphereModifiers[atmosphere]?.(basePalette) || basePalette;
}

function generateMaterialSuggestions(
  materials: string,
  atmosphere: string,
  experience: string
): Array<{ name: string; description: string }> {
  const baseMaterials: Record<string, Array<{ name: string; description: string }>> = {
    'wood_natural': [
      { name: 'Legno Massello', description: 'Superfici naturali e autentiche' },
      { name: 'Bambù', description: 'Materiale sostenibile e resistente' },
      { name: 'Sughero', description: 'Texture naturale e fonoassorbente' }
    ],
    'metal_glass': [
      { name: 'Acciaio Inox', description: 'Finiture moderne e riflettenti' },
      { name: 'Vetro Temperato', description: 'Trasparenze e leggerezza' },
      { name: 'Alluminio', description: 'Strutture leggere e versatili' }
    ],
    'stone_concrete': [
      { name: 'Pietra Naturale', description: 'Eleganza senza tempo' },
      { name: 'Cemento Levigato', description: 'Look industriale raffinato' },
      { name: 'Marmo', description: 'Lusso e prestigio' }
    ],
    'fabric_soft': [
      { name: 'Tessuti Tecnici', description: 'Comfort e funzionalità' },
      { name: 'Velluto', description: 'Eleganza e morbidezza' },
      { name: 'Feltro', description: 'Texture accogliente e fonoassorbente' }
    ],
    'composite_tech': [
      { name: 'Fibra di Carbonio', description: 'Alta tecnologia e leggerezza' },
      { name: 'Corian', description: 'Superfici high-tech personalizzabili' },
      { name: 'Materiali Compositi', description: 'Prestazioni e versatilità' }
    ],
    'eco_sustainable': [
      { name: 'Materiali Riciclati', description: 'Sostenibilità e innovazione' },
      { name: 'Bioplastiche', description: 'Alternative eco-friendly' },
      { name: 'Legno Certificato', description: 'Gestione forestale responsabile' }
    ],
    'luxury_precious': [
      { name: 'Ottone', description: 'Finiture metalliche pregiate' },
      { name: 'Pelle', description: 'Rivestimenti di lusso' },
      { name: 'Onice', description: 'Pietre semi-preziose retroilluminate' }
    ],
    'mixed_materials': [
      { name: 'Mix di Materiali', description: 'Contrasti e texture diverse' },
      { name: 'Materiali Ibridi', description: 'Innovazione e tradizione' },
      { name: 'Finiture Multiple', description: 'Ricchezza visiva e tattile' }
    ]
  };

  const selectedMaterials = baseMaterials[materials] || baseMaterials['mixed_materials'];

  // Modifica i materiali in base all'atmosfera e all'esperienza
  return selectedMaterials.map(material => {
    let modifiedDescription = material.description;

    if (atmosphere === 'tech_lab') {
      modifiedDescription += ' con finiture high-tech';
    } else if (atmosphere === 'luxury_lounge') {
      modifiedDescription += ' con trattamenti premium';
    }

    if (experience === 'interactive_demo') {
      modifiedDescription += ' integrati con elementi interattivi';
    }

    return {
      name: material.name,
      description: modifiedDescription
    };
  });
}

function generateLayoutSuggestions(layout: string, experience: string, technology: string): string[] {
  const baseLayouts: Record<string, string[]> = {
    'open_fluid': [
      'Crea zone fluide senza barriere visive',
      'Utilizza elementi mobili per definire gli spazi',
      'Mantieni ampi passaggi per il flusso dei visitatori'
    ],
    'zones_defined': [
      'Definisci chiaramente le diverse aree funzionali',
      'Usa elementi divisori semitrasparenti',
      'Crea percorsi intuitivi tra le zone'
    ],
    'central_focus': [
      'Progetta un elemento centrale dominante',
      'Organizza gli spazi in modo radiale',
      'Bilancia gli elementi secondari intorno al focus'
    ],
    'path_guided': [
      'Crea un percorso narrativo chiaro',
      'Usa la segnaletica per guidare i visitatori',
      'Integra punti di interesse lungo il percorso'
    ],
    'modular_flex': [
      'Progetta elementi modulari riconfigurabili',
      'Prevedi sistemi di pareti mobili',
      'Crea spazi multifunzionali adattabili'
    ],
    'multi_level': [
      'Sfrutta lo sviluppo verticale dello spazio',
      'Crea connessioni visive tra i livelli',
      'Integra scale e collegamenti suggestivi'
    ],
    'minimal_clean': [
      'Mantieni gli spazi essenziali e ordinati',
      'Usa arredi minimal e funzionali',
      'Evita elementi decorativi superflui'
    ],
    'immersive_360': [
      'Crea un ambiente avvolgente a 360°',
      'Integra elementi multimediali immersivi',
      'Progetta punti di vista multipli'
    ]
  };

  let suggestions = baseLayouts[layout] || [];

  // Aggiungi suggerimenti basati sull'esperienza
  if (experience === 'interactive_demo') {
    suggestions.push('Prevedi spazi per dimostrazioni interattive');
    suggestions.push('Integra aree per il coinvolgimento dei visitatori');
  }

  // Aggiungi suggerimenti basati sulla tecnologia
  if (technology === 'high_interactive') {
    suggestions.push('Integra zone per installazioni tecnologiche');
    suggestions.push('Prevedi punti di interazione digitale');
  }

  return suggestions;
}

function generateTechnicalSuggestions(technology: string, lighting: string, experience: string): string[] {
  const baseTech: Record<string, string[]> = {
    'high_interactive': [
      'Integra schermi touch interattivi',
      'Implementa sistemi di gesture control',
      'Prevedi connettività avanzata'
    ],
    'medium_support': [
      'Installa display informativi',
      'Predisponi sistemi audio localizzati',
      'Integra contenuti multimediali'
    ],
    'low_essential': [
      'Mantieni sistemi tecnici essenziali',
      'Usa tecnologia discreta e funzionale',
      'Prevedi backup per sistemi critici'
    ],
    'smart_automated': [
      'Implementa controlli automatizzati',
      'Integra sensori ambientali',
      'Prevedi sistemi di gestione smart'
    ]
  };

  let suggestions = baseTech[technology] || [];

  // Aggiungi suggerimenti per l'illuminazione
  const lightingSuggestions: Record<string, string[]> = {
    'dramatic': ['Implementa sistemi DMX per effetti dinamici', 'Prevedi illuminazione scenografica'],
    'soft': ['Usa diffusori e sistemi indiretti', 'Integra controlli dimming'],
    'natural': ['Simula la luce naturale con LED specifici', 'Prevedi variazioni durante il giorno'],
    'dynamic': ['Implementa sistemi di illuminazione interattiva', 'Programma scenari luminosi']
  };

  suggestions = [...suggestions, ...(lightingSuggestions[lighting] || [])];

  // Aggiungi suggerimenti basati sull'esperienza
  if (experience === 'interactive_demo') {
    suggestions.push('Integra sistemi di feedback in tempo reale');
    suggestions.push('Prevedi interfacce utente intuitive');
  }

  return suggestions;
}

function generateStyleDescription(params: {
  brandIdentity: string;
  atmosphere: string;
  lighting: string;
  layout: string;
  technology: string;
  experience: string;
}): string {
  const descriptions: string[] = [];

  // Brand Identity
  const brandDescriptions: Record<string, string> = {
    'innovation': 'Uno stile all\'avanguardia che comunica innovazione',
    'tradition': 'Un ambiente che valorizza la tradizione e l\'heritage',
    'sustainability': 'Uno spazio che esprime l\'impegno sostenibile',
    'quality': 'Un design che enfatizza la qualità superiore',
    'creativity': 'Un\'atmosfera che stimola la creatività',
    'reliability': 'Uno stand che comunica affidabilità e solidità',
    'dynamism': 'Un ambiente dinamico e energetico',
    'exclusivity': 'Uno spazio che trasmette esclusività e prestigio'
  };
  descriptions.push(brandDescriptions[params.brandIdentity] || '');

  // Atmosphere
  const atmosphereDescriptions: Record<string, string> = {
    'tech_lab': 'caratterizzato da un\'atmosfera high-tech e innovativa',
    'luxury_lounge': 'con un\'elegante atmosfera lounge',
    'eco_space': 'immerso in un\'atmosfera naturale e sostenibile',
    'creative_hub': 'che stimola la creatività e l\'ispirazione',
    'professional_office': 'dall\'atmosfera professionale e funzionale',
    'industrial_loft': 'con un carattere industrial-chic',
    'minimal_gallery': 'dalla purezza minimalista',
    'experiential_space': 'che offre un\'esperienza immersiva'
  };
  descriptions.push(atmosphereDescriptions[params.atmosphere] || '');

  // Combine all descriptions
  return descriptions.filter(Boolean).join(', ') + '.';
}

function generateColorDescription(colors: Array<{ hex: string; name: string }>, atmosphere: string): string {
  const atmosphereDescriptions: Record<string, string> = {
    'tech_lab': 'Una palette moderna e tecnologica che enfatizza precisione e innovazione',
    'luxury_lounge': 'Colori ricchi e sofisticati che creano un\'atmosfera di lusso ed eleganza',
    'eco_space': 'Tonalità naturali e rilassanti che richiamano sostenibilità e benessere',
    'creative_hub': 'Colori vivaci e stimolanti che incoraggiano la creatività',
    'professional_office': 'Una palette professionale che comunica serietà e competenza',
    'industrial_loft': 'Toni industriali e urbani che creano un\'atmosfera contemporanea',
    'minimal_gallery': 'Colori essenziali che enfatizzano la purezza del design',
    'experiential_space': 'Una combinazione dinamica che intensifica l\'esperienza immersiva'
  };

  return atmosphereDescriptions[atmosphere] || 'Una palette bilanciata che si adatta alle esigenze del brand';
}
