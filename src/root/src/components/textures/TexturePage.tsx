import React, { useState } from 'react';


// import { TextureSummary } from './TextureSummary';

import { TextureSelector } from './TextureSelector';

export const TexturePage: React.FC = () => {

    // ---------------------------------------------------
    // GESTIONE TEXTURES
    // ---------------------------------------------------
    const [selectedTextures, setSelectedTextures] = useState<string[]>([]);

    // Funzione per aggiungere/rimuovere una texture dall'array
    const toggleTexture = (id: string) => {
        setSelectedTextures(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    const [showOpt, setShowOpt] = useState(false);

    return (<>
        {/* texture selezzionate */}
        {/* <TextureSummary
            selectedTextures={selectedTextures} toggleTexture={toggleTexture}
        /> */}

        <TextureSelector
            selectedTextures={selectedTextures} toggleTexture={toggleTexture}
        />
    </>);
};
