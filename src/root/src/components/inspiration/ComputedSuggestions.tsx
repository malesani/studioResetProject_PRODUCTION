import React, { useState, useEffect } from 'react';
import {
    MDBIcon,
    MDBBtn,
    MDBBadge,
    MDBRow,
    MDBCol,
    MDBCard,
    MDBCardBody,
    MDBCardTitle,
    MDBCardText,
    MDBCardHeader
} from 'mdb-react-ui-kit'

import { useIsMobile } from "../../app_components/ResponsiveModule";
import { useFormAlert } from '../../app_components/GeneralAlert';
import { General_InfoBlock } from '../../app_components/General_InfoBlock';

import { questions, QstSection } from './costants';
import { APIAnswerData, getAnswersData } from '../../api_module/InspirationsRequest';

import { getStyleSuggestions, StyleSuggestion } from '../inspiration/computeResults/styleSuggestions';

interface ValidationResult {
    question_uid: string;
    exists: boolean;
    valid: boolean;
    answer_uid?: string;
}

interface ComputedSuggestionsProps {
    project_uid: string;
    onReturnToQuestions?: () => void;
};

export const ComputedSuggestions: React.FC<ComputedSuggestionsProps> = (props) => {
    const isTablet = useIsMobile(992);
    const isMobile = useIsMobile(768);

    const {
        project_uid,
        onReturnToQuestions = (() => { })
    } = props;

    const [loading, setLoading] = useState(false);
    const [answersMap, setAnswersMap] = useState<Record<string, string>>({});
    const [styleSuggestion, setStyleSuggestion] = useState<StyleSuggestion | null>(null);

    const { showAlertSuccess, showAlertError, showAlertWarning, showAlertLoading, hideAlert, FormAlert } = useFormAlert();


    const previewHeight = isMobile ? '4rem' : '6rem';

    // 1) fetch delle risposte
    useEffect(() => {
        let isMounted = true;
        async function fetchAnswers() {
            setLoading(true);
            try {
                const resp = await getAnswersData({ project_uid });
                if (resp.response.success && resp.response.data) {
                    if (isMounted) {
                        setAnswersMap(resp.response.data);
                    }
                } else {
                    showAlertError('Fetch fallito:' + resp.response.message);
                }
            } catch (err) {
                showAlertError('Errore nella richiesta: ' + err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        fetchAnswers();
        return () => { isMounted = false; };
    }, [project_uid]);

    // Calcola lo StyleSuggestion non appena ho tutte le risposte
    useEffect(() => {
        // se mancano risposte, non calcolare
        const allAnswered = questions.every(q => answersMap[q.question_uid]);
        if (allAnswered) {
            setStyleSuggestion(getStyleSuggestions(answersMap));
        }
    }, [answersMap]);

    // 2) costruisco la mappa question_uid → [answer_uid,…]
    const questionsAnswersMap: Record<string, string[]> = React.useMemo(
        () =>
            questions.reduce((acc, section) => {
                acc[section.question_uid] = section.options.map(o => o.answer_uid);
                return acc;
            }, {} as Record<string, string[]>),
        []
    );

    // 3) per ciascuna sezione verifico esistenza e validità
    const validationResults: ValidationResult[] = questions.map(section => {
        const answer_uid = answersMap[section.question_uid];
        const exists = answer_uid !== undefined;
        const valid = exists && questionsAnswersMap[section.question_uid].includes(answer_uid);
        return { question_uid: section.question_uid, exists, valid, answer_uid };
    });

    // 4) estraggo mancanti e non validi
    const missing = validationResults.filter(r => !r.exists);
    const invalid = validationResults.filter(r => r.exists && !r.valid);

    // 5) side-effect per gli alert di warning/errore a valle della validazione
    useEffect(() => {
        if (loading) return;       // non mostriamo finché carica
        if (missing.length > 0) {
            showAlertError(
                'Mancano risposte per: ' + missing.map(r => r.question_uid).join(', ')
            );
        } else if (invalid.length > 0) {
            showAlertWarning(
                'Risposte non valide per: ' + invalid.map(r => r.question_uid).join(', ')
            );
        } else {
            showAlertSuccess('Tutte le risposte sono valide!');
        }
        // non mettiamo hideAlert qui, vogliamo che l’utente veda il messaggio
    }, [missing.length, invalid.length]);

    if (loading) {
        return (
            <MDBRow className="d-flex flex-row flex-nowrap justify-content-center align-items-center pt-4 gap-3">
                <h4 className='w-auto m-0'>Caricamento risposte…</h4>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading…</span>
                </div>
            </MDBRow>
        );
    }

    return (
        <>
            {/** Blocco di riepilogo risposte */}
            <div className="d-flex justify-content-between align-items-center py-2">
                <div className="d-flex flex-nowrap align-items-center"><MDBIcon fas icon="list-ul" size="lg" className="me-3" /><h4 className="m-0">Riepilogo Risposte</h4></div>
                <MDBBtn color="primary" onClick={onReturnToQuestions}>
                    Torna al Quiz
                </MDBBtn>
            </div>

            <FormAlert />

            <MDBRow className="g-4">
                {validationResults.map(r => {
                    const section = questions.find(s => s.question_uid === r.question_uid)!;

                    const answerText = r.answer_uid
                        ? section.options.find(o => o.answer_uid === r.answer_uid)!.label
                        : '—';

                    return (
                        <MDBCol key={r.question_uid} md="4">
                            <MDBCard className="h-100 shadow-sm">
                                <MDBCardBody className="d-flex flex-column p-3">
                                    <MDBCardText flexGrow={1}>
                                        <MDBIcon fas icon={r.valid ? section.icon : "times-circle"} size='lg' className="me-2" />
                                        {r.exists && r.valid
                                            ? <><b className="me-3">{section.title}</b><span>{answerText}</span></>
                                            : (r.exists
                                                ? <span className="text-warning">Risposta non valida</span>
                                                : <span className="text-danger">Nessuna risposta</span>
                                            )
                                        }
                                    </MDBCardText>
                                </MDBCardBody>
                            </MDBCard>
                        </MDBCol>
                    );
                })}
            </MDBRow>
            {/** Blocco di riepilogo risposte */}

            {/** Blocco Suggerimenti */}
            {styleSuggestion && (
                <>
                    <hr></hr>

                    <h4 className="mb-3"><MDBIcon fas icon="paint-brush" className="me-2" />Consigli per il tuo stile</h4>

                    <General_InfoBlock
                        presetMode='info'
                        icon=''
                        className='mb-3'
                        message={styleSuggestion.styleDescription}
                    />

                    {/* Palette colori */}
                    {styleSuggestion.colorDescription.length > 0 && <MDBCard className="mb-3 shadow">
                        <MDBCardHeader>
                            <MDBCardTitle><MDBIcon fas icon="palette" className="me-2" />Colori</MDBCardTitle>
                            <MDBCardText><em>{styleSuggestion.colorDescription}</em></MDBCardText>
                        </MDBCardHeader>
                        <MDBCardBody className="d-flex flex-column">
                            {/* Anteprima dei colori */}
                            <div
                                className="d-flex overflow-hidden rounded mb-3"
                                style={{ height: previewHeight }}
                            >
                                {styleSuggestion.colors.map(c => (
                                    <div className="flex-fill d-flex flex-column flex-nowrap">
                                        <small className="mt-1">{c.name}</small>
                                        <div
                                            key={c.hex}
                                            className="flex-fill"
                                            style={{ backgroundColor: c.hex }}
                                        />
                                        <small key={c.hex} className="text-muted">
                                            {c.hex}
                                        </small>
                                    </div>
                                ))}
                            </div>
                        </MDBCardBody>
                    </MDBCard>}

                    {/* Materiali */}
                    {
                        styleSuggestion.materials.length > 0 && <MDBCard className="mb-3 shadow">
                            <MDBCardHeader>
                                <MDBCardTitle><MDBIcon fas icon="cubes" className="me-2" />Materiali</MDBCardTitle>
                            </MDBCardHeader>
                            <MDBCardBody>
                                <MDBRow className="g-4">
                                    {styleSuggestion.materials.map(m => (
                                        <MDBCol key={m.name} md="4">
                                            <MDBCard className="h-100 shadow-sm">
                                                <MDBCardHeader flexGrow={1}>
                                                    <b className="me-3">{m.name}</b>
                                                </MDBCardHeader>
                                                <MDBCardBody className="d-flex flex-column p-3">
                                                    <MDBCardText flexGrow={1}>
                                                        <span>{m.description}</span>
                                                    </MDBCardText>
                                                </MDBCardBody>
                                            </MDBCard>
                                        </MDBCol>
                                    ))}
                                </MDBRow>
                            </MDBCardBody>
                        </MDBCard>
                    }

                    {/* Tecniche */}
                    {
                        styleSuggestion.technicalSuggestions.length > 0 && <MDBCard className="mb-3 shadow">
                            <MDBCardHeader>
                                <MDBCardTitle><MDBIcon fas icon="tools" className="me-2" />Suggerimenti Tecnici</MDBCardTitle>
                            </MDBCardHeader>
                            <MDBCardBody>
                                <ul className="m-0">
                                    {styleSuggestion.technicalSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </MDBCardBody>
                        </MDBCard>
                    }


                    {/* Layout */}
                    {
                        styleSuggestion.layoutSuggestions.length > 0 && <MDBCard className="mb-3 shadow">
                            <MDBCardHeader>
                                <MDBCardTitle><MDBIcon fas icon="th-large" className="me-2" />Layout</MDBCardTitle>
                            </MDBCardHeader>
                            <MDBCardBody>
                                <ul className="m-0">
                                    {styleSuggestion.layoutSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </MDBCardBody>
                        </MDBCard>
                    }


                </>
            )}
            {/** Blocco Suggerimenti */}
        </>
    );
};
