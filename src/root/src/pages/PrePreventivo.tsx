import React, { useEffect, useState } from "react";
import {
    MDBCard,
    MDBCardBody,
    MDBCol,
    MDBContainer,
    MDBIcon,
    MDBRow,
    MDBInput,
    MDBProgress,
    MDBProgressBar,
    MDBBtn,
} from "mdb-react-ui-kit";

// ─────────────────────────────────────────────
// 🔹 Tipi di dati
// ─────────────────────────────────────────────
interface BudgetItem {
    descrizione: string;
    budget: number;
    costo: number;
}

interface SezioneBudget {
    id: string;
    titolo: string;
    items: BudgetItem[];
}




// ─────────────────────────────────────────────
// 🔹 Componente principale
// ─────────────────────────────────────────────
const PrePreventivo: React.FC = () => {



    const [budgetIniziale, setBudgetIniziale] = useState<number>(0);
    const [costoTotale, setCostoTotale] = useState<number>(0);
    const [sezioni, setSezioni] = useState<SezioneBudget[]>([]);

    const differenza = budgetIniziale - costoTotale;
    const percentuale = budgetIniziale
        ? ((costoTotale / budgetIniziale) * 100).toFixed(1)
        : 0;

    // ─────────────────────────────────────────────
    // Calcolo automatico costo totale in base a tutte le sezioni
    // ─────────────────────────────────────────────
    useEffect(() => {
        const totale = sezioni.reduce(
            (acc, s) => acc + s.items.reduce((a, i) => a + i.costo, 0),
            0
        );
        setCostoTotale(totale);
    }, [sezioni]);

    // ─────────────────────────────────────────────
    // Gestione sezioni e voci
    // ─────────────────────────────────────────────
    const aggiungiSezione = () => {
        const nuovaSezione: SezioneBudget = {
            id: `SEC-${Date.now()}`,
            titolo: `Nuova sezione ${sezioni.length + 1}`,
            items: [],
        };
        setSezioni((prev) => [...prev, nuovaSezione]);
    };

    const rimuoviSezione = (idSezione: string) => {
        setSezioni((prev) => prev.filter((s) => s.id !== idSezione));
    };

    const aggiungiItem = (idSezione: string) => {
        setSezioni((prev) =>
            prev.map((s) =>
                s.id === idSezione
                    ? {
                        ...s,
                        items: [
                            ...s.items,
                            { descrizione: "", budget: 0, costo: 0 },
                        ],
                    }
                    : s
            )
        );
    };

    const aggiornaItem = (
        idSezione: string,
        index: number,
        campo: keyof BudgetItem,
        valore: string
    ) => {
        setSezioni((prev) =>
            prev.map((s) =>
                s.id === idSezione
                    ? {
                        ...s,
                        items: s.items.map((item, i) =>
                            i === index
                                ? {
                                    ...item,
                                    [campo]:
                                        campo === "budget" || campo === "costo"
                                            ? Number(valore)
                                            : valore,
                                }
                                : item
                        ),
                    }
                    : s
            )
        );
    };

    const rimuoviItem = (idSezione: string, index: number) => {
        setSezioni((prev) =>
            prev.map((s) =>
                s.id === idSezione
                    ? { ...s, items: s.items.filter((_, i) => i !== index) }
                    : s
            )
        );
    };

    const calcolaTotale = (sezione: SezioneBudget) => {
        const budgetTot = sezione.items.reduce((a, i) => a + Number(i.budget || 0), 0);
        const costoTot = sezione.items.reduce((a, i) => a + Number(i.costo || 0), 0);
        return { budgetTot, costoTot, differenza: budgetTot - costoTot };
    };

    // ─────────────────────────────────────────────
    // RENDER COMPONENTE
    // ─────────────────────────────────────────────
    return (
        <MDBContainer className="py-4">
            {/* 🔹 HEADER */}
            <MDBRow className="mb-2">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h3 className="fw-bold">Calcola il Budget per il Preventivo</h3>
                        <p className="text-muted mb-0">
                            Gestisci il tuo budget iniziale e suddividi prodotti o servizi
                            specifici con calcoli automatici.
                        </p>
                    </div>
                </div>
            </MDBRow>

            {/* 💰 Riepilogo Budget */}
            {/* 💰 Riepilogo Budget */}
            <MDBCard className="border rounded-3 mb-3">
                <MDBCardBody>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="mb-0 d-flex align-items-center">
                            <MDBIcon fas icon="calculator" className="me-2 text-primary" />
                            Riepilogo del Budget
                        </h5>


                    </div>

                    <MDBRow className="align-items-center g-4">
                        {/* Budget totale iniziale */}
                        <MDBCol md="4">
                            <p className="text-muted mb-1">Budget Totale Iniziale</p>
                            <MDBInput
                                type="number"
                                min="0"
                                value={budgetIniziale}
                                onChange={(e) =>
                                    setBudgetIniziale(parseFloat(e.target.value) || 0)
                                }
                            />
                            <small className="text-muted">Inserisci il budget iniziale</small>
                        </MDBCol>

                        {/* Costo totale calcolato */}
                        <MDBCol md="4">
                            <MDBCard className="p-4 border bg-light">
                                <p className="text-muted mb-1">Costo Totale Calcolato</p>
                                <h5 className="fw-bold mb-0">{costoTotale.toFixed(2)} €</h5>
                                <small className="text-muted">Somma di tutte le sezioni</small>
                            </MDBCard>
                        </MDBCol>

                        {/* Differenza */}
                        <MDBCol md="4">
                            <MDBCard className="p-4 border bg-light">
                                <p className="text-muted mb-1">Differenza</p>
                                <h5
                                    className={`fw-bold ${differenza >= 0 ? "text-primary" : "text-danger"
                                        } mb-0`}
                                >
                                    {differenza >= 0 ? "+" : ""}
                                    {differenza.toFixed(2)} €
                                </h5>
                                <small className="text-muted">
                                    {differenza >= 0
                                        ? "In linea con il budget"
                                        : "Fuori budget"}
                                </small>
                            </MDBCard>
                        </MDBCol>
                    </MDBRow>

                    {/* Barra di avanzamento */}
                    <MDBRow className="mt-4">
                        <MDBCol>
                            <MDBProgress height="10" className="rounded-pill">
                                <MDBProgressBar
                                    width={Math.min(Number(percentuale), 100)}
                                    valuemin={0}
                                    valuemax={100}
                                    bgColor={differenza >= 0 ? "primary" : "danger"}
                                />
                            </MDBProgress>
                            <div className="d-flex justify-content-end mt-1">
                                <small className="text-primary">{percentuale}%</small>
                            </div>
                        </MDBCol>
                    </MDBRow>
                </MDBCardBody>
            </MDBCard>


            {/* 📘 SEZIONI DI BUDGET */}
            <MDBCard className="border rounded-3">
                <MDBCardBody>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="mb-0 d-flex align-items-center">
                            <MDBIcon fas icon="folder-open" className="me-2 text-primary" />
                            Voci di Budget
                        </h5>
                        <div className="d-flex gap-2">

                            <MDBBtn color="primary" onClick={aggiungiSezione}>
                                <MDBIcon fas icon="plus" className="me-2" />
                                Aggiungi sezione
                            </MDBBtn>
                            <MDBBtn
                                color="success"
                                onClick={() => {
                                    console.log("💾 Dati salvati:", { budgetIniziale, costoTotale, sezioni });
                                    alert("Pre-preventivo salvato con successo!");
                                }}
                            >
                                <MDBIcon fas icon="save" className="me-2" />
                                Salva
                            </MDBBtn>
                        </div>
                    </div>

                    {/* Sezioni dinamiche */}
                    {sezioni.length === 0 ? (
                        <div className="text-center text-muted py-5">
                            <MDBIcon far icon="folder-open" size="2x" className="mb-3" />
                            <p className="mb-0">Nessuna sezione creata</p>
                            <small>
                                Premi “Aggiungi sezione” per iniziare a definire le voci di
                                budget.
                            </small>
                        </div>
                    ) : (
                        sezioni.map((sezione) => {
                            const { budgetTot, costoTot, differenza } = calcolaTotale(sezione);
                            return (
                                <MDBCard key={sezione.id} className="mb-4 border">
                                    <MDBCardBody>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            {/* 🔤 Nome sezione editabile */}
                                            <div className="w-25">
                                                <MDBInput
                                                    value={sezione.titolo}
                                                    onChange={(e) =>
                                                        setSezioni((prev) =>
                                                            prev.map((s) =>
                                                                s.id === sezione.id ? { ...s, titolo: e.target.value } : s
                                                            )
                                                        )
                                                    }
                                                    label="Nome sezione"
                                                />
                                            </div>

                                            <div className="d-flex align-items-center gap-3">
                                                <div className="text-end">
                                                    <p className="mb-0 text-muted small">Budget</p>
                                                    <h6 className="fw-bold mb-0">{budgetTot.toFixed(2)} €</h6>
                                                </div>
                                                <div className="text-end">
                                                    <p className="mb-0 text-muted small">Costo</p>
                                                    <h6 className="fw-bold mb-0">{costoTot.toFixed(2)} €</h6>
                                                </div>
                                                <div className="text-end">
                                                    <p className="mb-0 text-muted small">Differenza</p>
                                                    <h6
                                                        className={`fw-bold mb-0 ${differenza >= 0 ? "text-success" : "text-danger"
                                                            }`}
                                                    >
                                                        {differenza.toFixed(2)} €
                                                    </h6>
                                                </div>
                                                <MDBBtn
                                                    color="link"
                                                    size="sm"
                                                    className="text-danger p-0"
                                                    title="Elimina sezione"
                                                    onClick={() => rimuoviSezione(sezione.id)}
                                                >
                                                    <MDBIcon fas icon="trash" />
                                                </MDBBtn>
                                            </div>
                                        </div>

                                        {/* Voci interne */}
                                        <div className="bg-light rounded-3">
                                            {sezione.items.map((item, index) => {
                                                const diffItem = item.budget - item.costo;
                                                return (
                                                    <div
                                                        key={index}
                                                        className="d-flex align-items-center justify-content-between border-bottom py-2 px-3"
                                                    >
                                                        <MDBCol md="4">
                                                            <MDBInput
                                                                label="Descrizione"
                                                                value={item.descrizione}
                                                                onChange={(e) =>
                                                                    aggiornaItem(
                                                                        sezione.id,
                                                                        index,
                                                                        "descrizione",
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        </MDBCol>

                                                        <MDBCol md="2">
                                                            <MDBInput
                                                                label="Budget"
                                                                type="number"
                                                                value={item.budget}
                                                                onChange={(e) =>
                                                                    aggiornaItem(
                                                                        sezione.id,
                                                                        index,
                                                                        "budget",
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        </MDBCol>

                                                        <MDBCol md="2">
                                                            <MDBInput
                                                                label="Costo"
                                                                type="number"
                                                                value={item.costo}
                                                                onChange={(e) =>
                                                                    aggiornaItem(
                                                                        sezione.id,
                                                                        index,
                                                                        "costo",
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        </MDBCol>

                                                        <MDBCol md="2" className="text-center">
                                                            <span
                                                                className={`fw-bold ${diffItem >= 0
                                                                    ? "text-success"
                                                                    : "text-danger"
                                                                    }`}
                                                            >
                                                                {diffItem.toFixed(2)} €
                                                            </span>
                                                        </MDBCol>

                                                        <MDBCol md="1" className="text-end">
                                                            <MDBBtn
                                                                color="link"
                                                                size="sm"
                                                                className="text-danger p-0"
                                                                onClick={() =>
                                                                    rimuoviItem(sezione.id, index)
                                                                }
                                                            >
                                                                <MDBIcon fas icon="trash" />
                                                            </MDBBtn>
                                                        </MDBCol>
                                                    </div>
                                                );
                                            })}
                                            <MDBBtn
                                                color="light"
                                                size="lg"
                                                block
                                                onClick={() => aggiungiItem(sezione.id)}
                                            >
                                                <MDBIcon fas icon="plus" className="me-2" />
                                                Aggiungi voce
                                            </MDBBtn>
                                        </div>
                                    </MDBCardBody>
                                </MDBCard>
                            );
                        })
                    )}
                </MDBCardBody>
            </MDBCard>

        </MDBContainer>
    );
};

export default PrePreventivo;
