import React, { useRef, useState, useMemo } from 'react';
import { General_ContentSwitcher, ContentConfig } from '../../app_components/General_ContentSwitcher';
import { SectionForm } from './SectionForm';
import { questions } from './costants';

import { ComputedSuggestions } from '../inspiration/ComputedSuggestions';

export const InspirationForm: React.FC<{ project_uid: string }> = ({ project_uid }) => {
  // 1) Stato array dei flag
  const [loadingFlags, setLoadingFlags] = useState<boolean[]>(
    questions.map(() => false)
  );

  // 2) Factory di callback, una per ogni idx
  const onLoadingChanges = useMemo(
    () =>
      questions.map((_, idx) => (load: boolean) => {
        setLoadingFlags(flags => {
          const next = [...flags];
          next[idx] = load;
          return next;
        });
      }),
    []
  );

  /** GESTIONE RIEPILOGO DOMANDE */
  const [stepperCompleted, setSteperCompleted] = useState(false);
  const submitFnsRef = useRef<(() => Promise<boolean>)[]>([]);

  if (submitFnsRef.current.length === 0) {
    submitFnsRef.current = questions.map(() => async () => true);
  }

  const contents = useMemo<ContentConfig[]>(() =>
    questions.map((section, idx) => ({
      icon: section.icon,
      title: section.name,
      startOpen: idx === 0,
      builContentFn: () => ({
        triggerSubmit: () => submitFnsRef.current[idx](),
        loadingFlag: loadingFlags[idx],
        contentElement: (
          <SectionForm
            project_uid={project_uid}
            section={section}
            onRegisterSubmit={fn => {
              submitFnsRef.current[idx] = fn;
            }}
            onLoadingChange={(loadState) => (onLoadingChanges[idx](loadState))}
          />
        )
      })
    })),
    [project_uid]
  ) as ContentConfig[];

  return (
    <>
      {stepperCompleted ? (
        <ComputedSuggestions
          project_uid={project_uid}
          onReturnToQuestions={() => setSteperCompleted(false)}
        />
      ) : (
        <General_ContentSwitcher
          switchMode="stepper"
          contents={contents}
          loadingFlags={loadingFlags}
          properties={{
            className: 'mt-4',
            onCompleteSteps: () => setSteperCompleted(true)
          }}
        />
      )}
    </>
  );
};