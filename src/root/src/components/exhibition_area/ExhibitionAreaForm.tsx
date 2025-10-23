import { useState } from 'react';
import {
  MDBCard,
  MDBCardHeader,
  MDBCardBody,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBBtn,
  MDBIcon,
} from 'mdb-react-ui-kit';

import { GeneralForm, SelectData } from "../../app_components/GeneralForm";

import { standTypesInfo, StandTypeKeys } from './constants';
import { platformTypeInfo, PlatformTypeKeys } from './constants';
import { heightTypesInfo, HeightTypeKeys } from './constants';
import { SuspendedElementsInfo, SuspendedElementKeys } from './constants';

import { StandTypeCard } from './StandTypeCard';
import { MaxHeightResume } from './MaxHeightResume';

import ExhibitionAreaRecap from './ExibitionAreaRecap';

type ExhibitionAreaInfo = {
  surface_mq: number;
  obstacles: boolean;
  obstacles_info: string;
  standType: StandTypeKeys;
  platformType: PlatformTypeKeys;
  maxHeight: HeightTypeKeys;
  suspendedElements: SuspendedElementKeys[];
  files: FileList;
};

export function ExhibitionAreaForm() {
  const [viewRecap, setViewRecap] = useState(false);
  const [exibitionAreaData, setExibitionAreaData] = useState<ExhibitionAreaInfo>();


  async function uploadExhibitionAreaInfoInfo(payload: ExhibitionAreaInfo) {
    setExibitionAreaData(payload);
    setViewRecap(true);
    return {
      data: payload,
      response: { success: true, message: 'File caricati con successo!' }
    };
  }

  const standTypesOptions: SelectData[] = standTypesInfo.map(standType => ({
    value: standType.value,
    text: standType.name,
    secondaryText: standType.description,
    renderCard: ({ isSelected, onSelect }) => (
      <StandTypeCard
        standType={standType}
        isSelected={isSelected}
        onSelect={onSelect}
      />
    )
  }));

  const platformTypeOptions: SelectData[] = platformTypeInfo.map(platformType => ({
    value: platformType.value,
    text: platformType.name,
    secondaryText: platformType.description
  }));

  const maxHeightOptions: SelectData[] = heightTypesInfo.map(platformType => ({
    value: platformType.value,
    text: platformType.name,
    secondaryText: platformType.description
  }));

  const suspendedElementOptions: SelectData[] = SuspendedElementsInfo.map(suspendedElement => ({
    value: suspendedElement.value,
    text: suspendedElement.name,
    secondaryText: suspendedElement.description,
    icon: suspendedElement.icon,
  }));

  return (<>

    {viewRecap ? <ExhibitionAreaRecap data={exibitionAreaData} onEdit={() => { setViewRecap(false); }} />
      : <>
        <MDBCard className="px-4">
          <GeneralForm<ExhibitionAreaInfo>
            mode="upsert"
            title="Informazioni Area Espositiva"
            icon="sticky-note"
            className="pt-3"
            hideHeader={false}
            fields={[
              {
                name: "surface_mq",
                label: "Superficie espositiva mq",
                required: true,
                type: "number",
                grid: { md: 12 },
              },
              {
                name: "obstacles",
                label: "Presenza di colonne o impedimenti",
                required: false,
                type: "checkbox",
                grid: { md: 12 },
              },
              {
                name: "obstacles_info",
                label: "Dettagli impedimenti",
                required: true,
                type: "text_area",
                grid: { md: 12 },
                visible: (formData) => { return formData.obstacles; },
              },
              {
                name: "standType",
                label: "Tipologia Superficie",
                required: true,
                type: "selectbox",
                customElementKey: "cards",
                properties: {
                  gridConfig: { sm: 2, xl: 4 },
                  hideLabel: false,
                  hideChoseSomething: true,
                  showSummaryPills: false
                },
                options: standTypesOptions,
                grid: { md: 12 },
                hrBefore: true,
                hrAfter: true,
              },
              {
                name: "platformType",
                label: "Tipologia Pedana",
                required: true,
                type: "selectbox",
                customElementKey: "cards",
                properties: {
                  gridConfig: { sm: 2, xl: 4 },
                  hideLabel: false,
                  hideChoseSomething: true,
                  showSummaryPills: false
                },
                options: platformTypeOptions,
                grid: { md: 12 },
                hrAfter: true,
              },
              {
                name: "maxHeight",
                label: "Altezza Massima",
                required: true,
                type: "selectbox",
                customElementKey: "cards",
                properties: {
                  gridConfig: { sm: 2, xl: 4 },
                  hideLabel: false,
                  hideChoseSomething: true,
                  showSummaryPills: false
                },
                options: maxHeightOptions,
                grid: { md: 12 },
                extraElements: [
                  {
                    position: 'after',
                    grid: { md: 12 },
                    element: (formData: ExhibitionAreaInfo) => (
                      <MaxHeightResume maxHeight={formData.maxHeight} />
                    )
                  }
                ],
                hrAfter: true,
              },
              {
                name: "suspendedElements",
                label: "Elementi Sospesi",
                labelClass: "fw-bold",
                required: false,
                type: "selectbox",
                customElementKey: "cards",
                properties: {
                  multiple: true,
                  gridConfig: { md: 2 },
                  hideLabel: false,
                  hideChoseSomething: true,
                },
                options: suspendedElementOptions,
                grid: { md: 12 },
              },
            ]}
            response={exibitionAreaData ? { "success": true, "message": "Dati caricati con successo" } : { "success": false, "message": "Dati non presenti" }}
            data={exibitionAreaData as ExhibitionAreaInfo}
            createData={uploadExhibitionAreaInfoInfo}
            updateData={uploadExhibitionAreaInfoInfo}
            onSuccess={(created) => {
              console.log('Caricato:', created);
            }}
          />
        </MDBCard>
      </>}
  </>);
}
