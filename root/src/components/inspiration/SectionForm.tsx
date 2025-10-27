import React, { useCallback } from 'react';
import { requestResponse } from '../../hooks/RequestFunction';

import { General_InfoBlock } from '../../app_components/General_InfoBlock';
import { GeneralForm } from '../../app_components/GeneralForm';
import { QstSection } from './costants';

import { APIAnswerData, getAnswerData, updateAnswerData } from '../../api_module/InspirationsRequest'

interface SectionFormProps {
  project_uid: string;
  section: QstSection;
  onRegisterSubmit?: (submitFn: () => Promise<boolean>) => void;
  onNewMessage?: (response: requestResponse) => void;
  onLoadingChange?: (loadingState: boolean) => void;
}

export const SectionForm: React.FC<SectionFormProps> = ({ project_uid, section, onRegisterSubmit, onNewMessage, onLoadingChange }) => {
  // 1) preparo i dati per la select
  const question_uid = section.question_uid;
  const selectData = section.options.map(opt => ({
    value: opt.answer_uid,
    text: opt.label,
    secondaryText: opt.description
  }));

  // 4) wrapper per essere sicuri di non perdere la referenza
  const handleRegister = useCallback((fn: () => Promise<boolean>) => {
    onRegisterSubmit?.(fn);
  }, [onRegisterSubmit]);

  return (
    <GeneralForm<APIAnswerData, { project_uid: string; question_uid: string; }>
      mode="upsert"
      hideHeader
      disableSubmit={true}
      registerSubmit={handleRegister}
      createBtnProps={{ label: 'Prosegui', labelSaving: 'Salvataggio' }}
      onNewMessage={onNewMessage}
      onChangeGetDataState={(loadState) => { 
        onLoadingChange?.(loadState); 
      }}
      alertProps={{ position: { success: "top-right" } }}
      fields={[
        {
          name: 'answer_uid',
          label: '',
          required: true,
          grid: { md: 12 },
          type: 'selectbox',
          customElementKey: 'cards',
          options: selectData,
          properties: {
            multiple: section.multiple ?? false,
            showSummaryPills: false,
            hideChoseSomething: true,
            gridConfig: { md: 2, xl: 3, xxl: 4 }
          },
          extraElements: [
            {
              position: 'before',
              grid: { md: 12 },
              element: (
                <General_InfoBlock
                  presetMode="info"
                  icon=""
                  title={section.title}
                  message={section.description}
                />
              )
            }
          ]
        }
      ]}
      params={{ project_uid, question_uid }}
      getData={getAnswerData}
      createData={updateAnswerData}
      updateData={updateAnswerData}
    />
  );
};
