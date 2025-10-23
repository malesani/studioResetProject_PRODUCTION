import { General_InfoBlock } from '../../app_components/General_InfoBlock'
import { General_ContentSwitcher } from '../../app_components/General_ContentSwitcher';
import { SelectData, GeneralForm } from '../../app_components/GeneralForm';

import { APIDesignData, getDesignData, updateDesignData } from '../../api_module/DesignRequest';

import { CustomDesign } from './CustomDesign'
import { predefinedDesign } from './design';
import { ObjectiveCard } from '../objectives/ObjectiveCard';


export interface DesignListProps {
  project_uid: string;
}

export const DesignList: React.FC<DesignListProps> = ({project_uid}) => {

  const objetivesOptions: SelectData[] = predefinedDesign.map(objective => ({
    value: objective.objetive_uid,
    text: objective.title,
    renderCard: ({ isSelected, onSelect }) => (
      <ObjectiveCard
        objective={objective}
        isSelected={isSelected}
        onSelect={onSelect}
      />
    )
  }));

  return (<General_ContentSwitcher switchMode='tabs' properties={{pills: false}} contents={
    [
      {
        icon: "pencil-ruler",
        title: "Design Predefiniti",
        startOpen: true,
        className: "p-3",
        contentElement: (<>
          <GeneralForm<APIDesignData, {project_uid: string}>
            mode="upsert"
            hideHeader
            params={{project_uid}}
            createBtnProps={{
              label: "Conferma Design",
              labelSaving: "Salvataggio in corso",
            }}
            fields={[
              {
                name: "list_design_uid", label: "Seleziona Responsabile", required: true, grid: { md: 12 },
                type: "selectbox", customElementKey: "cards", options: objetivesOptions,
                properties: {
                  multiple: true,
                  hideChoseSomething: true,
                },
                extraElements: [{
                  position: "before",
                  grid: { md: 12 },
                  element:
                    <General_InfoBlock
                      blockMode='alert'
                      presetMode='info'
                      icon='lightbulb'
                      badgeIcon={true}
                      title='Definisci il Tuo Design'
                      message="Hai un'idea creativa unica per il tuo stand? Descrivi qui il tuo design personalizzato. Un design ben definito aiuta a creare un'esperienza memorabile e coerente con i tuoi obiettivi."
                    />
                }]
              },
            ]}
            getData={getDesignData}
            createData={updateDesignData}
            updateData={updateDesignData}
          />
        </>)
      },
      {
        icon: "plus",
        title: "Design Personalizzato",
        startOpen: false,
        className: "p-3",
        contentElement: (<CustomDesign />)
      },
    ]} />
  );
}
