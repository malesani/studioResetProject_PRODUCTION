import { Objective } from '../objectives/constants';

export const predefinedDesign: Objective[] = [
  {
    objetive_uid: 'essential',
    title: 'Linee Essenziali',
    description: 'Uno stand minimalista con colori neutri e un layout ordinato.',
    suggestions: [
      'Utilizzo di linee pulite e geometriche',
      'Palette colori neutri e monocromatici',
      'Illuminazione funzionale e minimalista',
      'Materiali moderni e superfici lisce',
      'Layout aperto e ordinato'
    ],
    complexity: 'medium',
    impact: 'high',
    icon: 'border-top-left'
  },
  {
    objetive_uid: 'natural',
    title: 'Atmosfera Naturale',
    description: 'Design che integra elementi naturali e materiali sostenibili.',
    suggestions: [
      'Utilizzo di materiali eco-sostenibili',
      'Integrazione di elementi vegetali',
      'Illuminazione che simula la luce naturale',
      'Texture organiche e naturali',
      'Colori ispirati alla natura'
    ],
    complexity: 'medium',
    impact: 'high',
    icon: 'leaf'
  },
  {
    objetive_uid: 'high-tech',
    title: 'High-Tech',
    description: 'Design futuristico con elementi tecnologici integrati.',
    suggestions: [
      'Superfici interattive e display digitali',
      'Illuminazione LED dinamica',
      'Materiali high-tech e finiture metalliche',
      'Elementi di realtà aumentata',
      'Sistemi di controllo smart'
    ],
    complexity: 'high',
    impact: 'high',
    icon: 'microchip'
  },
  {
    objetive_uid: 'luxury',
    title: 'Lusso Contemporaneo',
    description: 'Design elegante con finiture di pregio e dettagli ricercati.',
    suggestions: [
      'Materiali pregiati e finiture lussuose',
      'Illuminazione scenografica',
      'Dettagli in metalli preziosi',
      'Arredi esclusivi e su misura',
      'Layout sofisticato ed elegante'
    ],
    complexity: 'high',
    impact: 'high',
    icon: 'gem'
  },
  {
    objetive_uid: 'interactive',
    title: 'Esperienza Interattiva',
    description: 'Design focalizzato sul coinvolgimento dei visitatori.',
    suggestions: [
      'Zone interattive e dimostrative',
      'Percorsi esperienziali guidati',
      'Tecnologie immersive',
      'Aree per workshop e presentazioni',
      'Elementi di gamification'
    ],
    complexity: 'high',
    impact: 'high',
    icon: 'hand-pointer'
  },
  {
    objetive_uid: 'modular',
    title: 'Sistema Modulare',
    description: 'Design flessibile e adattabile a diverse configurazioni.',
    suggestions: [
      'Elementi modulari riconfigurabili',
      'Sistemi di pareti mobili',
      'Arredi multifunzionali',
      'Strutture componibili',
      'Layout adattabile'
    ],
    complexity: 'medium',
    impact: 'medium',
    icon: 'cubes'
  },
  {
    objetive_uid: 'open-space',
    title: 'Open Space',
    description: 'Design aperto che favorisce il flusso dei visitatori.',
    suggestions: [
      'Layout aperto e fluido',
      'Zone tematiche ben definite',
      'Percorsi intuitivi',
      'Aree relax integrate',
      'Visibilità ottimizzata'
    ],
    complexity: 'medium',
    impact: 'high',
    icon: 'paper-plane'
  },
  {
    objetive_uid: 'theatrical',
    title: 'Teatrale',
    description: 'Design scenografico con forte impatto visivo.',
    suggestions: [
      'Elementi scenografici d\'impatto',
      'Illuminazione teatrale',
      'Effetti speciali integrati',
      'Punti focali drammatici',
      'Ambientazioni immersive'
    ],
    complexity: 'high',
    impact: 'high',
    icon: 'masks-theater'
  },
  {
    objetive_uid: 'urban',
    title: 'Stile Urban',
    description: 'Design ispirato all\'estetica urbana contemporanea.',
    suggestions: [
      'Elementi di street art e graffiti',
      'Materiali industriali e grezzi',
      'Illuminazione tipo warehouse',
      'Arredi dal design metropolitano',
      'Atmosfera underground'
    ],
    complexity: 'medium',
    impact: 'high',
    icon: 'city'
  }
];
