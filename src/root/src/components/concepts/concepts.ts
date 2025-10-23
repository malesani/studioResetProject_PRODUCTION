import { Objective } from '../objectives/constants';

export const predefinedConcepts: Objective[] = [
  {
    objetive_uid: 'brand-image',
    title: 'Rafforzare l\'immagine aziendale',
    description: 'Posizionare il brand come leader di settore o innovatore.',
    suggestions: [
      'Sviluppare un design dello stand distintivo e memorabile',
      'Utilizzare materiali e finiture premium',
      'Creare un\'esperienza immersiva per i visitatori',
      'Integrare tecnologie innovative nell\'allestimento',
      'Curare ogni dettaglio della brand identity'
    ],
    complexity: 'high',
    impact: 'high',
    icon: 'camera'           // shooting del brand
  },
  {
    objetive_uid: 'customer-engagement',
    title: 'Coinvolgimento Clienti',
    description: 'Massimizzare l\'interazione con i visitatori.',
    suggestions: [
      'Creare aree interattive e dimostrative',
      'Implementare tecnologie touch e multimedia',
      'Organizzare mini-eventi e presentazioni',
      'Predisporre spazi per il networking',
      'Sviluppare attività hands-on'
    ],
    complexity: 'medium',
    impact: 'high',
    icon: 'champagne-glasses'           // controlli/interazione
  },
  {
    objetive_uid: 'lead-generation',
    title: 'Generazione Lead',
    description: 'Raccolta contatti qualificati.',
    suggestions: [
      'Progettare aree dedicate alle consulenze',
      'Creare percorsi guidati nello stand',
      'Implementare sistemi di lead scanning',
      'Predisporre materiali informativi di valore',
      'Organizzare momenti di Q&A'
    ],
    complexity: 'medium',
    impact: 'high',
    icon: 'user-tie'               // “@” per contatti email/lead
  },
  {
    objetive_uid: 'product-launch',
    title: 'Lancio Prodotti',
    description: 'Presentazione efficace di nuovi prodotti/servizi.',
    suggestions: [
      'Creare un\'area dedicata alle novità',
      'Progettare display prodotto innovativi',
      'Implementare demo interattive',
      'Preparare presentazioni multimediali',
      'Sviluppare esperienze hands-on'
    ],
    complexity: 'high',
    impact: 'high',
    icon: 'rocket'  // simbolo di lancio verso l’alto
  },
  {
    objetive_uid: 'market-research',
    title: 'Ricerca di Mercato',
    description: 'Raccolta feedback e analisi del mercato.',
    suggestions: [
      'Predisporre aree per interviste',
      'Creare spazi per focus group',
      'Implementare sistemi di feedback digitale',
      'Organizzare sessioni di testing',
      'Preparare questionari interattivi'
    ],
    complexity: 'medium',
    impact: 'medium',
    icon: 'binoculars'       // osservazione e analisi
  },
  {
    objetive_uid: 'networking-hub',
    title: 'Hub di Networking',
    description: 'Facilitare connessioni B2B e partnership.',
    suggestions: [
      'Progettare aree lounge confortevoli',
      'Creare spazi per meeting riservati',
      'Predisporre zone networking informali',
      'Implementare sistemi di matchmaking',
      'Organizzare eventi di networking'
    ],
    complexity: 'medium',
    impact: 'high',
    icon: 'link'    // meeting e orari d’affari
  },
  {
    objetive_uid: 'brand-info',
    title: 'Brand Information',
    description: 'Informare su tecnologie e innovazioni.',
    suggestions: [
      'Sviluppare percorsi informativi interattivi',
      'Creare presentazioni multimediali',
      'Implementare totem informativi',
      'Predisporre materiale tecnico dettagliato',
      'Organizzare demo tecniche'
    ],
    complexity: 'medium',
    impact: 'medium',
    icon: 'circle-info'      // lettura di informazioni dettagliate
  },
  {
    objetive_uid: 'sales-boost',
    title: 'Incremento Vendite',
    description: 'Massimizzare le opportunità di vendita diretta.',
    suggestions: [
      'Creare aree per trattative commerciali',
      'Implementare sistemi di ordini digitali',
      'Predisporre offerte evento speciali',
      'Organizzare demo prodotto mirate',
      'Sviluppare percorsi di vendita guidati'
    ],
    complexity: 'high',
    impact: 'high',
    icon: 'chart-line'          // scansione e ordini digitali
  }
];
