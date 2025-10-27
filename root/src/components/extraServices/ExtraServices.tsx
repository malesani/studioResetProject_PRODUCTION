import {
    MDBContainer,
    MDBBtn
} from 'mdb-react-ui-kit';

import { APICustTeamMemberInfo } from "../../api_module/CustomerTeamMemberRequest";
import { ServiceCategory } from './ServiceCategory'



/**
 * Tipi e dati di default delle categorie di servizi
 */
export type ServiceItem = {
    id: string;
    name: string;
    description: string;
};

export type ServiceCategoryType = {
    id: string;
    name: string;
    description: string;
    icon: string;
    services: ServiceItem[];
};

const defaultCategories: ServiceCategoryType[] = [
    {
        id: 'utilities',
        name: 'Allacci e Utenze',
        description: 'Servizi essenziali per il funzionamento dello stand',
        icon: 'plug',
        services: [
            {
                id: 'allaccio-elettrico-standard',
                name: 'Allaccio Elettrico Standard',
                description: 'Fornitura elettrica standard durante gli orari di manifestazione'
            },
            {
                id: 'allaccio-elettrico-24h',
                name: 'Allaccio Elettrico H24',
                description: 'Fornitura elettrica continua 24/7'
            },
            {
                id: 'allaccio-elettrico-380v',
                name: 'Allaccio Elettrico 380V',
                description: 'Fornitura elettrica trifase per macchinari industriali'
            },
            {
                id: 'allaccio-idrico',
                name: 'Allaccio Idrico',
                description: 'Fornitura acqua con carico e scarico'
            },
            {
                id: 'aria-compressa',
                name: 'Aria Compressa',
                description: 'Fornitura aria compressa per macchinari e attrezzature'
            },
            {
                id: 'internet',
                name: 'Connessione Internet',
                description: 'Connessione internet dedicata via cavo o Wi-Fi'
            }
        ]
    },
    {
        id: 'cleaning',
        name: 'Servizi di Pulizia',
        description: 'Servizi per la pulizia e il mantenimento dello stand',
        icon: 'tint',
        services: [
            {
                id: 'cleaning',
                name: 'Pulizia Stand',
                description: 'Servizio completo di pulizia dello stand'
            },
            {
                id: 'pulizia-giornaliera',
                name: 'Pulizia Giornaliera',
                description: 'Servizio di pulizia quotidiano durante la manifestazione'
            },
            {
                id: 'pulizia-specializzata',
                name: 'Pulizia Specializzata',
                description: 'Pulizia specifica per prodotti esposti o superfici delicate'
            }
        ]
    },
    {
        id: 'security',
        name: 'Sicurezza e Sorveglianza',
        description: 'Servizi per la sicurezza dello stand e dei prodotti esposti',
        icon: 'shield-alt',
        services: [
            {
                id: 'security',
                name: 'Personale di Sicurezza',
                description: 'Guardia di sicurezza dedicata durante gli orari di apertura'
            },
            {
                id: 'sorveglianza-notturna',
                name: 'Sorveglianza Notturna',
                description: 'Servizio di sorveglianza nelle ore di chiusura'
            },
            {
                id: 'sicurezza-prodotti',
                name: 'Sicurezza Prodotti',
                description: 'Protezione specifica per prodotti di valore o delicati'
            }
        ]
    },
    {
        id: 'staff',
        name: 'Personale e Assistenza',
        description: 'Personale qualificato per il vostro stand',
        icon: 'users',
        services: [
            {
                id: 'hostess',
                name: 'Hostess/Steward',
                description: 'Personale di accoglienza e assistenza visitatori'
            },
            {
                id: 'interprete',
                name: 'Interprete',
                description: 'Servizio di interpretariato per comunicazioni multilingua'
            },
            {
                id: 'assistenza-tecnica',
                name: 'Assistenza Tecnica',
                description: 'Personale tecnico per gestione apparecchiature e impianti'
            }
        ]
    },
    {
        id: 'multimedia',
        name: 'Servizi Multimediali',
        description: 'Servizi audio/video e documentazione',
        icon: 'film',
        services: [
            {
                id: 'servizio-fotografico',
                name: 'Servizio Fotografico',
                description: 'Documentazione fotografica professionale dello stand e degli eventi'
            },
            {
                id: 'servizio-video',
                name: 'Servizio Video',
                description: 'Riprese video professionali e montaggio'
            },
            {
                id: 'impianto-audio',
                name: 'Impianto Audio',
                description: 'Sistema audio per musica di sottofondo o presentazioni'
            }
        ]
    },
    {
        id: 'catering',
        name: 'Catering e Ristorazione',
        description: 'Servizi di ristorazione e caffetteria',
        icon: 'coffee',
        services: [
            {
                id: 'servizio-caffetteria',
                name: 'Servizio Caffetteria',
                description: 'Caffè, bevande e piccola pasticceria'
            },
            {
                id: 'servizio-pranzo',
                name: 'Servizio Pranzo',
                description: 'Pranzi e rinfreschi per ospiti e staff'
            },
            {
                id: 'open-bar',
                name: 'Open Bar',
                description: 'Servizio bar completo per eventi e ricevimenti'
            }
        ]
    }
];

/**
 * Props del componente controllato
 */
export interface ExtraServicesProps {
    teamMembers: APICustTeamMemberInfo[];
    /** Lista di service.id selezionati */
    selectedServices: string[];
    /** Callback al toggle di un id servizio */
    onToggleService: (serviceId: string) => void;
}

/**
 * ExtraServices: versione controlled e basata su MDB5
 */
export function ExtraServices({
    selectedServices,
    onToggleService,
    teamMembers
}: ExtraServicesProps) {
    return (
        <MDBContainer className="p-0">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center">
                    <h4 className="ms-2 h4 mb-0">Servizi Extra necessari</h4>
                </div>
                {/* <MDBBtn color="secondary">
                    Riepilogo
                </MDBBtn> */}
            </div>

            {defaultCategories.map((category) => (
                <div key={category.id} className="mb-4">
                    <ServiceCategory
                        teamMembers={teamMembers}
                        title={category.name}
                        description={category.description}
                        services={category.services}
                        selectedServices={selectedServices}
                        onToggleService={onToggleService}
                        icon={category.icon}
                    />
                </div>
            ))}

        </MDBContainer>
    );
}