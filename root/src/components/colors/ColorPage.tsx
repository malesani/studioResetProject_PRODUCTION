import React, { useState } from 'react';
import {
    MDBCard,
    MDBTabs,
    MDBTabsItem,
    MDBTabsLink,
    MDBTabsContent,
    MDBTabsPane,
    MDBCardHeader,
    MDBCardBody,
    MDBIcon,
    MDBCollapse,

} from 'mdb-react-ui-kit';

import { General_ContentSwitcher, ContentConfig } from '../../app_components/General_ContentSwitcher';

import { ColorPalettes } from './ColorPalettes';
import { PantoneColors } from './PantoneColors';
import { CustomColors } from './CustomColorPalette';
import { RALColors } from './RALColors';


export const ColorPage: React.FC = () => {
    const [justifyActive, setJustifyActive] = useState('tab1');

    const handleJustifyClick = (value: string) => {
        if (value === justifyActive) {
            return;
        }

        setJustifyActive(value);
    };

    // ---------------------------------------------------
    // GESTIONE COLOR PANTONE
    // ---------------------------------------------------
    const [pantoneColors, setPantoneColors] = useState<string[]>([]);

    const addPantone = (code: string) => setPantoneColors(prev => [...prev, code]);
    const removePantone = (i: number) =>
        setPantoneColors(prev => prev.filter((_, idx) => idx !== i));

    // ---------------------------------------------------
    // GESTIONE COLOR PALETTES
    // ---------------------------------------------------
    const [selectedPalettes, setSelectedPalettes] = useState<string[]>([]);
    const togglePalette = (id: string) => {
        setSelectedPalettes(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };
    const clearSelection = () => {
        setSelectedPalettes([]);
    };


    // ---------------------------------------------------
    // GESTIONE CUSTOM COLORS
    // ---------------------------------------------------
    const [customColors, setCustomColors] = useState<string[]>([]);
    const addColor = (hex: string) => {
        setCustomColors(prev => [...prev, hex]);
    };
    const removeColor = (index: number) => {
        setCustomColors(prev => prev.filter((_, i) => i !== index));
    };

    // ---------------------------------------------------
    // GESTIONE COLOR RAL
    // ---------------------------------------------------
    // Stato locale per i RAL selezionati
    const [selectedRAL, setSelectedRAL] = useState<string[]>([]);

    // Funzione per aggiungere/rimuovere un colore RAL dallo stato
    const toggleRAL = (id: string) => {
        setSelectedRAL(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // Configurazione delle sezioni dell’accordion
    const contents: ContentConfig[] = [
        {
            icon: 'palette',
            title: 'Palette Predefinite',
            startOpen: true,
            contentElement: (
                <MDBCardBody className="p-2 pb-0">
                    <ColorPalettes
                        selectedPalettes={selectedPalettes}
                        togglePalette={togglePalette}
                        clearSelection={clearSelection}
                    />
                </MDBCardBody>
            ),
        },
        {
            icon: 'edit',
            title: 'Colori Personalizzati',
            startOpen: false,
            contentElement: (
                <MDBCardBody className="p-4 pb-0">
                    <CustomColors
                        customColors={customColors}
                        addColor={addColor}
                        removeColor={removeColor}
                    />
                </MDBCardBody>
            ),
        },
        {
            icon: 'object-group',
            title: 'Colori RAL',
            startOpen: false,
            contentElement: (
                <MDBCardBody className="p-2 pb-0">
                    <RALColors
                        selectedRAL={selectedRAL}
                        toggleRAL={toggleRAL}
                    />
                </MDBCardBody>
            ),
        },
        {
            icon: 'tint',
            title: 'Colori Pantone',
            startOpen: false,
            contentElement: (
                <MDBCardBody className="p-2 pb-0">
                    <PantoneColors
                        pantoneColors={pantoneColors}
                        addColor={addPantone}
                        removeColor={removePantone}
                        maxColors={5}
                    />
                </MDBCardBody>
            ),
        },
    ];

    return (<>
        <MDBCardHeader className="p-1 mb-0">
            <MDBTabs justify className='mb-3'>
                <MDBTabsItem>
                    <MDBTabsLink onClick={() => handleJustifyClick('tab1')} active={justifyActive === 'tab1'}>
                        Palette Predefinite
                    </MDBTabsLink>
                </MDBTabsItem>
                <MDBTabsItem>
                    <MDBTabsLink onClick={() => handleJustifyClick('tab2')} active={justifyActive === 'tab2'}>
                        Colori Personalizzati
                    </MDBTabsLink>
                </MDBTabsItem>
                <MDBTabsItem>
                    <MDBTabsLink onClick={() => handleJustifyClick('tab3')} active={justifyActive === 'tab3'}>
                        Colori RAL
                    </MDBTabsLink>
                </MDBTabsItem>
                <MDBTabsItem>
                    <MDBTabsLink onClick={() => handleJustifyClick('tab4')} active={justifyActive === 'tab4'}>
                        Colori Pantone
                    </MDBTabsLink>
                </MDBTabsItem>
            </MDBTabs>
        </MDBCardHeader>

        <MDBCardBody className="p-3">
            <MDBTabsContent>
                <MDBTabsPane open={justifyActive === 'tab1'}>
                    <MDBCard className="p-2 pb-0">
                        <ColorPalettes
                            selectedPalettes={selectedPalettes}
                            togglePalette={togglePalette}
                            clearSelection={clearSelection}
                        />
                    </MDBCard>
                </MDBTabsPane>
                <MDBTabsPane open={justifyActive === 'tab2'}>
                    <MDBCard className="p-4 pb-0">
                        <CustomColors
                            customColors={customColors}
                            addColor={addColor}
                            removeColor={removeColor}
                        />
                    </MDBCard>
                </MDBTabsPane>
                <MDBTabsPane open={justifyActive === 'tab3'}>
                    <MDBCard className="p-2 pb-0">
                        <RALColors
                            selectedRAL={selectedRAL}
                            toggleRAL={toggleRAL}
                        />
                    </MDBCard>
                </MDBTabsPane>
                <MDBTabsPane open={justifyActive === 'tab4'}>
                    <MDBCard className="p-2 pb-0">
                        <PantoneColors
                            pantoneColors={pantoneColors}
                            addColor={addPantone}
                            removeColor={removePantone}
                            maxColors={5}
                        />
                    </MDBCard>
                </MDBTabsPane>
            </MDBTabsContent>
        </MDBCardBody>
    </>);
};
