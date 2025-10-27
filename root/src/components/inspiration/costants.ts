export interface QstOption {
    answer_uid: string;
    label: string;
    description?: string;
    multiple?: boolean;
    maxSelections?: number;
};

export interface QstSection {
    question_uid: string;
    icon?: string;
    name: string;
    title: string;
    description?: string;
    multiple?: boolean;
    maxSelections?: number;
    options: QstOption[]
}

export const questions: QstSection[] = [
    {
        question_uid: 'brand_identity',
        icon: 'id-card',
        name: 'Brand Identity',
        title: 'Quale aspetto della tua identità aziendale vuoi enfatizzare?',
        description: 'Scegli l\'elemento chiave che meglio rappresenta il tuo brand',
        options: [
            {
                answer_uid: 'innovation',
                label: 'Innovazione Tecnologica',
                description: 'Focus su avanguardia e soluzioni innovative'
            },
            {
                answer_uid: 'tradition',
                label: 'Tradizione e Storia',
                description: 'Enfasi su esperienza e valori consolidati'
            },
            {
                answer_uid: 'sustainability',
                label: 'Sostenibilità',
                description: 'Impegno ambientale e responsabilità sociale'
            },
            {
                answer_uid: 'quality',
                label: 'Qualità e Precisione',
                description: 'Eccellenza e attenzione ai dettagli'
            },
            {
                answer_uid: 'creativity',
                label: 'Creatività e Design',
                description: 'Focus su estetica e originalità'
            },
            {
                answer_uid: 'reliability',
                label: 'Affidabilità',
                description: 'Solidità e professionalità'
            },
            {
                answer_uid: 'dynamism',
                label: 'Dinamismo',
                description: 'Energia e capacità di adattamento'
            },
            {
                answer_uid: 'exclusivity',
                label: 'Esclusività',
                description: 'Unicità e prestigio'
            }
        ]
    },
    {
        question_uid: 'atmosphere',
        icon: 'photo-film',
        name: 'Atmosfera',
        title: 'Che atmosfera vuoi creare nel tuo stand?',
        description: 'Seleziona l\'ambiente che desideri far vivere ai visitatori',
        options: [
            {
                answer_uid: 'tech_lab',
                label: 'Laboratorio High-Tech',
                description: 'Ambiente futuristico e tecnologico'
            },
            {
                answer_uid: 'luxury_lounge',
                label: 'Lounge di Lusso',
                description: 'Spazio elegante e raffinato'
            },
            {
                answer_uid: 'eco_space',
                label: 'Spazio Eco-friendly',
                description: 'Ambiente naturale e sostenibile'
            },
            {
                answer_uid: 'creative_hub',
                label: 'Hub Creativo',
                description: 'Spazio dinamico e artistico'
            },
            {
                answer_uid: 'professional_office',
                label: 'Ufficio Professionale',
                description: 'Ambiente corporate e funzionale'
            },
            {
                answer_uid: 'industrial_loft',
                label: 'Loft Industriale',
                description: 'Stile urban e contemporaneo'
            },
            {
                answer_uid: 'minimal_gallery',
                label: 'Galleria Minimalista',
                description: 'Spazio essenziale e moderno'
            },
            {
                answer_uid: 'experiential_space',
                label: 'Spazio Esperienziale',
                description: 'Ambiente immersivo e coinvolgente'
            }
        ]
    },
    {
        question_uid: 'lighting',
        icon: 'lightbulb',
        name: 'Illuminazione',
        title: 'Che tipo di illuminazione preferisci?',
        description: 'Scegli lo stile di illuminazione più adatto',
        options: [
            {
                answer_uid: 'dramatic',
                label: 'Drammatica',
                description: 'Contrasti forti e giochi di luce'
            },
            {
                answer_uid: 'soft',
                label: 'Soffusa',
                description: 'Illuminazione delicata e avvolgente'
            },
            {
                answer_uid: 'natural',
                label: 'Naturale',
                description: 'Luce che simula quella diurna'
            },
            {
                answer_uid: 'dynamic',
                label: 'Dinamica',
                description: 'Illuminazione interattiva e variabile'
            },
            {
                answer_uid: 'accent',
                label: 'Accent',
                description: 'Focus su elementi specifici'
            },
            {
                answer_uid: 'architectural',
                label: 'Architettonica',
                description: 'Integrata nella struttura'
            },
            {
                answer_uid: 'minimal',
                label: 'Minimalista',
                description: 'Essenziale e funzionale'
            },
            {
                answer_uid: 'theatrical',
                label: 'Teatrale',
                description: 'Effetti scenografici'
            }
        ]
    },
    {
        question_uid: 'materials',
        icon: 'cubes',
        name: 'Materiali',
        title: 'Quali materiali preferisci?',
        description: 'Seleziona i materiali predominanti',
        options: [
            {
                answer_uid: 'wood_natural',
                label: 'Legno e Materiali Naturali',
                description: 'Calore e autenticità'
            },
            {
                answer_uid: 'metal_glass',
                label: 'Metallo e Vetro',
                description: 'Modernità e trasparenza'
            },
            {
                answer_uid: 'stone_concrete',
                label: 'Pietra e Cemento',
                description: 'Solidità e carattere'
            },
            {
                answer_uid: 'fabric_soft',
                label: 'Tessuti e Materiali Morbidi',
                description: 'Comfort e accoglienza'
            },
            {
                answer_uid: 'composite_tech',
                label: 'Compositi e High-tech',
                description: 'Innovazione e prestazioni'
            },
            {
                answer_uid: 'eco_sustainable',
                label: 'Materiali Sostenibili',
                description: 'Rispetto ambientale'
            },
            {
                answer_uid: 'luxury_precious',
                label: 'Materiali Pregiati',
                description: 'Lusso ed esclusività'
            },
            {
                answer_uid: 'mixed_materials',
                label: 'Mix di Materiali',
                description: 'Contrasti e varietà'
            }
        ]
    },
    {
        question_uid: 'layout',
        icon: 'columns',
        name: 'Layout',
        title: 'Che tipo di layout preferisci?',
        description: 'Scegli l\'organizzazione dello spazio',
        options: [
            {
                answer_uid: 'open_fluid',
                label: 'Open Space Fluido',
                description: 'Spazio aperto e dinamico'
            },
            {
                answer_uid: 'zones_defined',
                label: 'Zone Definite',
                description: 'Aree tematiche separate'
            },
            {
                answer_uid: 'central_focus',
                label: 'Focus Centrale',
                description: 'Elemento centrale dominante'
            },
            {
                answer_uid: 'path_guided',
                label: 'Percorso Guidato',
                description: 'Esperienza sequenziale'
            },
            {
                answer_uid: 'modular_flex',
                label: 'Modulare Flessibile',
                description: 'Spazi riconfigurabili'
            },
            {
                answer_uid: 'multi_level',
                label: 'Multi Livello',
                description: 'Sviluppo verticale'
            },
            {
                answer_uid: 'minimal_clean',
                label: 'Minimalista',
                description: 'Layout essenziale'
            },
            {
                answer_uid: 'immersive_360',
                label: 'Immersivo 360°',
                description: 'Esperienza avvolgente'
            }
        ]
    },
    {
        question_uid: 'technology',
        icon: 'microchip',
        name: 'Tecnologia',
        title: 'Che livello di tecnologia vuoi integrare?',
        description: 'Scegli il grado di integrazione tecnologica',
        options: [
            {
                answer_uid: 'high_interactive',
                label: 'Alta Interattività',
                description: 'Tecnologie immersive e interattive'
            },
            {
                answer_uid: 'medium_support',
                label: 'Supporto Multimediale',
                description: 'Display e contenuti digitali'
            },
            {
                answer_uid: 'low_essential',
                label: 'Essenziale',
                description: 'Solo elementi necessari'
            },
            {
                answer_uid: 'smart_automated',
                label: 'Automazione Smart',
                description: 'Sistemi automatizzati'
            },
            {
                answer_uid: 'ar_vr',
                label: 'AR/VR',
                description: 'Realtà aumentata e virtuale'
            },
            {
                answer_uid: 'projection_mapping',
                label: 'Projection Mapping',
                description: 'Proiezioni architetturali'
            },
            {
                answer_uid: 'touch_interactive',
                label: 'Touch Screen',
                description: 'Interfacce touch'
            },
            {
                answer_uid: 'iot_sensors',
                label: 'IoT e Sensori',
                description: 'Ambiente connesso'
            }
        ]
    },
    {
        question_uid: 'experience',
        icon: 'handshake',
        name: 'Experience',
        title: 'Che tipo di esperienza vuoi offrire?',
        description: 'Seleziona l\'esperienza principale per i visitatori',
        options: [
            {
                answer_uid: 'interactive_demo',
                label: 'Demo Interattive',
                description: 'Prove prodotto e interazioni'
            },
            {
                answer_uid: 'emotional_journey',
                label: 'Percorso Emozionale',
                description: 'Storytelling coinvolgente'
            },
            {
                answer_uid: 'learning_edu',
                label: 'Educativo',
                description: 'Focus su formazione'
            },
            {
                answer_uid: 'social_networking',
                label: 'Networking',
                description: 'Facilitare connessioni'
            },
            {
                answer_uid: 'entertainment',
                label: 'Intrattenimento',
                description: 'Elementi ludici e show'
            },
            {
                answer_uid: 'relaxation',
                label: 'Relax',
                description: 'Comfort e tranquillità'
            },
            {
                answer_uid: 'vip_exclusive',
                label: 'VIP Experience',
                description: 'Esclusività e privacy'
            },
            {
                answer_uid: 'hybrid_mixed',
                label: 'Ibrida',
                description: 'Mix di esperienze'
            }
        ]
    }
];