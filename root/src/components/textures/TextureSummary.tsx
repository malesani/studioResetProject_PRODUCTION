import React from 'react';
import { textures } from './textures';
import {
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBCardImage,
  MDBRow,
  MDBCol,
  MDBBtn,
  MDBBadge,
  MDBIcon
} from 'mdb-react-ui-kit';
import { useIsMobile } from "../../app_components/ResponsiveModule";

import { TextureSelectorProps } from './TextureSelector';

export function TextureSummary({ selectedTextures, toggleTexture }: TextureSelectorProps) {
  if (selectedTextures.length === 0) return null;
  const isTablet = useIsMobile(992);
  const isMobile = useIsMobile(768);


  return (
    <MDBRow className="mt-3">
      <h4>Texture e Materiali selezionati</h4>
      <h4 className="text-muted mb-2">
        Selezione di texture e materiali selezionati per lo stand
      </h4>

      <MDBRow className="g-3">
        {selectedTextures.map(textureId => {
          const texture = textures.find(t => t.id === textureId);
          if (!texture) return null;

          return (
            <MDBCol key={texture.id} md="12">
              <MDBCard className={"d-flex flex-row align-items-start gap-3 p-3 " + (isMobile && "flex-wrap")}>
                {!isMobile ? <div style={{ flexShrink: 0, width: '8rem', height: '8rem' }}>
                  <img
                    src={texture.imageUrl}
                    alt={texture.name}
                    className="img-fluid rounded"
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                </div> :
                  <MDBCardImage
                    src={texture.imageUrl}
                    alt={texture.name}
                    className="w-100 rounded-top"
                    style={{ aspectRatio: '3', objectFit: 'cover' }}
                  />}

                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="fw-medium m-0">{texture.name}</h5>
                    <MDBBtn floating={isTablet} rounded={!isTablet} size='sm' color="secondary" onClick={() => toggleTexture(texture.id)}>
                      <MDBIcon fas icon='trash-alt' />
                      {!isTablet && <span className="ms-2">Rimuovi</span>}
                    </MDBBtn>
                  </div>
                  <p className="text-muted small mb-2">{texture.description}</p>
                  <div className="d-flex flex-wrap gap-2">
                    {texture.materials.map((material, index) => (
                      <MDBBadge
                        key={index}
                        color="secondary"
                        className="py-1 px-2 text-dark"
                      >
                        {material}
                      </MDBBadge>
                    ))}
                  </div>
                </div>
              </MDBCard>
            </MDBCol>
          );
        })}
      </MDBRow>
    </MDBRow>
  );
}
