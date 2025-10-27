import { General_InfoBlock } from '../../app_components/General_InfoBlock'
import { General_ContentSwitcher } from '../../app_components/General_ContentSwitcher';
import { SelectData, GeneralForm } from '../../app_components/GeneralForm';

import { APIConceptData, getConceptData, updateConceptData } from '../../api_module/ConceptsRequest';

import { CustomConcept } from './CustomConcept'
import { predefinedConcepts } from './concepts';
import { ObjectiveCard } from '../objectives/ObjectiveCard';

export interface ConceptsListProps {
  project_uid: string;
}

export const ConceptsList: React.FC<ConceptsListProps> = ({project_uid}) => {

  const objetivesOptions: SelectData[] = predefinedConcepts.map(objective => ({
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
        icon: "cogs",
        title: "Concept Predefiniti",
        startOpen: true,
        className: "p-3",
        contentElement: (<>
          <GeneralForm<APIConceptData, {project_uid: string}>
            mode="upsert"
            hideHeader
            params={{project_uid}}
            createBtnProps={{
              label: "Conferma Concepts",
              labelSaving: "Salvataggio in corso",
            }}
            fields={[
              {
                name: "list_concept_uid", label: "Seleziona Responsabile", required: true, grid: { md: 12 },
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
                      title='Definisci il Tuo Concept'
                      message="Hai un'idea creativa unica per il tuo stand? Descrivi qui il tuo concept personalizzato. Un concept ben definito aiuta a creare un'esperienza memorabile e coerente con i tuoi obiettivi."
                    />
                }]
              },
            ]}
            getData={getConceptData}
            createData={updateConceptData}
            updateData={updateConceptData}
          />
        </>)
      },
      {
        icon: "plus",
        title: "Concept Personalizzato",
        startOpen: false,
        className: "p-3",
        contentElement: (<CustomConcept />)
      },
    ]} />
  );
}
