export interface Objective {
  objetive_uid: string;
  icon?: string;
  title: string;
  description: string;
  suggestions: string[];
  complexity: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
}

export const predefinedObjectives: Objective[] = [
  {
    objetive_uid: 'brand-image',
    title: 'Rafforzare l\'immagine aziendale',
    description: 'Posizionare il brand come leader di settore o innovatore.',
    suggestions: [
      'Creare un\'area esperienziale interattiva',
      'Utilizzare materiali premium per l\'allestimento',
      'Preparare presentazioni di case study di successo',
      'Organizzare dimostrazioni dal vivo',
      'Curare ogni dettaglio della comunicazione visiva'
    ],
    complexity: 'high',
    impact: 'high',
    icon: 'camera'
  },
  {
    objetive_uid: 'brand-awareness',
    title: 'Aumentare la notorietà',
    description: 'Far conoscere il marchio a un pubblico più ampio.',
    suggestions: [
      'Pianificare attività social media durante l\'evento',
      'Creare contenuti condivisibili e instagrammabili',
      'Organizzare eventi collaterali coinvolgenti',
      'Implementare una strategia di PR efficace',
      'Utilizzare influencer di settore'
    ],
    complexity: 'medium',
    impact: 'high',
    icon: 'bullhorn'
  },
  {
    objetive_uid: 'values-mission',
    title: 'Comunicare valori e mission',
    description: 'Trasmettere i principi e gli ideali del brand.',
    suggestions: [
      'Creare una narrazione coinvolgente',
      'Utilizzare elementi visivi che riflettono i valori',
      'Preparare materiale informativo mirato',
      'Formare lo staff sui messaggi chiave',
      'Organizzare presentazioni dedicate'
    ],
    complexity: 'medium',
    impact: 'medium',
    icon: 'anchor'
  },
  {
    objetive_uid: 'new-products',
    title: 'Lanciare nuovi prodotti',
    description: 'Presentare novità e innovazioni al mercato.',
    suggestions: [
      'Creare un\'area demo dedicata',
      'Preparare materiale tecnico dettagliato',
      'Organizzare presentazioni esclusive',
      'Predisporre sample e omaggi',
      'Pianificare follow-up post evento'
    ],
    complexity: 'high',
    impact: 'high',
    icon: 'box-open'
  },
  {
    objetive_uid: 'competitive-advantage',
    title: 'Distinguersi dalla concorrenza',
    description: 'Evidenziare i vantaggi competitivi unici.',
    suggestions: [
      'Analizzare i competitor presenti',
      'Evidenziare i punti di forza distintivi',
      'Creare confronti indiretti efficaci',
      'Preparare argomentazioni convincenti',
      'Formare lo staff sulle obiezioni'
    ],
    complexity: 'high',
    impact: 'high',
    icon: 'trophy'
  },
  {
    objetive_uid: 'lead-generation',
    title: 'Generare contatti qualificati',
    description: 'Raccogliere lead per sviluppi commerciali futuri.',
    suggestions: [
      'Implementare un sistema di lead tracking',
      'Creare contenuti di valore da scambiare',
      'Organizzare momenti di networking',
      'Preparare offerte esclusive',
      'Pianificare il follow-up immediato'
    ],
    complexity: 'medium',
    impact: 'high',
    icon: 'at'
  },
  {
    objetive_uid: 'market-expansion',
    title: 'Espandere il mercato',
    description: 'Entrare in nuovi segmenti o aree geografiche.',
    suggestions: [
      'Analizzare il nuovo mercato target',
      'Adattare la comunicazione al nuovo pubblico',
      'Preparare materiale multilingua',
      'Identificare partner locali',
      'Pianificare la strategia di ingresso'
    ],
    complexity: 'high',
    impact: 'high',
    icon: 'atlas'
  },
  {
    objetive_uid: 'business-deals',
    title: 'Concludere accordi commerciali',
    description: 'Facilitare la firma di contratti o partnership.',
    suggestions: [
      'Preparare documentazione contrattuale',
      'Allestire area riservata per meeting',
      'Organizzare agenda appuntamenti',
      'Preparare presentazioni personalizzate',
      'Definire offerte evento specifiche'
    ],
    complexity: 'medium',
    impact: 'high',
    icon: 'user-tie'
  },
  {
    objetive_uid: 'customer-loyalty',
    title: 'Fidelizzare i clienti',
    description: 'Rafforzare le relazioni con i clienti esistenti.',
    suggestions: [
      'Creare momenti esclusivi per clienti VIP',
      'Preparare omaggi personalizzati',
      'Organizzare eventi dedicati',
      'Raccogliere feedback diretto',
      'Presentare anteprime e novità'
    ],
    complexity: 'medium',
    impact: 'medium',
    icon: 'award'
  },
  {
    objetive_uid: 'media-visibility',
    title: 'Aumentare visibilità mediatica',
    description: 'Ottenere copertura su stampa e social media.',
    suggestions: [
      'Preparare press kit completo',
      'Organizzare conferenza stampa',
      'Creare photo opportunity',
      'Pianificare social media coverage',
      'Coinvolgere influencer e media'
    ],
    complexity: 'high',
    impact: 'medium',
    icon: 'broadcast-tower'
  },
  {
    objetive_uid: 'sustainability',
    title: 'Promuovere sostenibilità',
    description: 'Comunicare l\'impegno ambientale e sociale.',
    suggestions: [
      'Utilizzare materiali eco-sostenibili',
      'Evidenziare certificazioni green',
      'Organizzare iniziative sostenibili',
      'Comunicare impatto ambientale',
      'Coinvolgere stakeholder ESG'
    ],
    complexity: 'medium',
    impact: 'medium',
    icon: 'solar-panel'
  },
  {
    objetive_uid: 'international-presence',
    title: 'Presenza internazionale',
    description: 'Rafforzare il posizionamento globale.',
    suggestions: [
      'Preparare materiale multilingua',
      'Formare staff internazionale',
      'Evidenziare presenza globale',
      'Organizzare eventi satellite',
      'Coinvolgere partner internazionali'
    ],
    complexity: 'high',
    impact: 'high',
    icon: 'flag'
  },
  {
    objetive_uid: 'innovation-leadership',
    title: 'Leadership nell\'innovazione',
    description: 'Posizionarsi come leader tecnologico.',
    suggestions: [
      'Presentare innovazioni esclusive',
      'Creare demo interattive',
      'Organizzare workshop tecnici',
      'Evidenziare investimenti R&D',
      'Mostrare roadmap tecnologica'
    ],
    complexity: 'high',
    impact: 'high',
    icon: 'atom'
  },
  {
    objetive_uid: 'market-research',
    title: 'Ricerca di mercato',
    description: 'Raccogliere insights e feedback dal mercato.',
    suggestions: [
      'Preparare questionari mirati',
      'Organizzare focus group',
      'Raccogliere feedback strutturati',
      'Analizzare comportamenti visitatori',
      'Documentare interazioni key'
    ],
    complexity: 'medium',
    impact: 'medium',
    icon: 'binoculars'
  }
];