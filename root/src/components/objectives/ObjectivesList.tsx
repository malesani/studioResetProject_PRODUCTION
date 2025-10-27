import { General_InfoBlock } from '../../app_components/General_InfoBlock'
import { General_ContentSwitcher } from '../../app_components/General_ContentSwitcher';
import { SelectData, GeneralForm } from '../../app_components/GeneralForm';

import { APIObjectiveData, getObjectiveData, updateObjectiveData } from '../../api_module/ObjectivesRequest';


import { CustomObjective } from './CustomObjective'
import { predefinedObjectives } from './objectives';
import { ObjectiveCard } from './ObjectiveCard';

export interface ObjectivesListProps {
  project_uid: string;
}

export const ObjectivesList: React.FC<ObjectivesListProps> = ({project_uid}) => {

  const objetivesOptions: SelectData[] = predefinedObjectives.map(objective => ({
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

  return (<General_ContentSwitcher
    switchMode="tabs"
    properties={{
      pills: false,
    }}
    contents={
      [
        {
          icon: "bullseye",
          title: "Obiettivi Predefiniti",
          startOpen: true,
          className: "p-3",
          contentElement: (<>
            <GeneralForm<APIObjectiveData, { project_uid: string }>
              mode="upsert"
              hideHeader
              createBtnProps={{
                label: "Salva Obbiettivi",
                labelSaving: "Salvataggio in corso",
              }}
              params={{project_uid}}
              fields={[
                {
                  name: "list_objective_uid", label: "Seleziona Responsabile", required: true, grid: { md: 12 },
                  type: "selectbox", customElementKey: "cards", options: objetivesOptions,
                  properties: {
                    multiple: true,
                    showSummaryPills: true,
                    hideChoseSomething: true,
                    gridConfig: {
                      md: 2,
                      xl: 3,
                      xxl: 4
                    }
                  },
                  extraElements: [{
                    position: "before",
                    grid: { md: 12 },
                    element:
                      <General_InfoBlock
                        presetMode='info'
                        icon=''
                        title="Cosa ti aspetti?"
                        message='Che obiettivi ti poni per questo evento?'
                      />
                  },
                  ]
                },
              ]}

              getData={getObjectiveData}
              createData={updateObjectiveData}
              updateData={updateObjectiveData}
            />
          </>)
        },
        {
          icon: "plus",
          title: "Crea il tuo Obiettivo",
          className: "p-3",
          contentElement: (<CustomObjective />)
        },
      ]} />
  );
}
