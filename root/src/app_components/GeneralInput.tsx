import React, { useRef, useEffect, useState, useMemo } from "react";
import {
  MDBInput,
  MDBTextArea,
  MDBCheckbox,
  MDBFile,
  MDBDatepicker,
} from "mdb-react-ui-kit";
import { MDBFileUpload } from 'mdb-react-file-upload';

import { RichEditor } from './RichEditor';

import { CustomSelect } from './CustomInputs/CustomSelect';
import { Selectbox_Cards } from './CustomInputs/Selectbox_Cards';

import {
  MDBSimpleSelect,
  FieldConfig,
  computeValidation
} from "./GeneralForm_Common";

export type InputOrTextAreaChangeEvent =
  | React.ChangeEvent<HTMLInputElement>
  | React.ChangeEvent<HTMLTextAreaElement>;

export interface GeneralInputProps<T> {
  field: FieldConfig<T>;                                            /** Configurazione del campo */
  formData: T;                                                      /** Stato corrente di tutti i dati del form */
  first?: boolean;                                                  /** Riferimento al primo input per autofocus */
  style?: React.CSSProperties | undefined;
  onChange: (name: keyof T, value: any, isValid: boolean, feedbackText?: string) => void;  /** Funzione esterna per gestire cambi e validazione */
}

export function GeneralInput<T extends Record<string, any>>(
  {
    field,
    formData,
    first = false,
    style,
    onChange
  }: GeneralInputProps<T>
) {
  const [isValid, setValidity] = useState(!field.required);
  const key = field.name as string;
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus sul primo campo
  useEffect(() => {
    if (first) inputRef.current?.focus();
  }, [first]);


  // Proprietà comuni a tutti i controlli
  const common = {
    ...field.properties,
    required: field.required,
    disabled: field.readOnly,
    readOnly: field.readOnly,
    ref: inputRef
  };

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    if (field.equalTo) {
      const myVal = (formData as any)[field.name];
      const otherVal = (formData as any)[field.equalTo];

      // only validate if both fields non-empty (opzionale)
      const isValid = myVal !== undefined && myVal !== ""
        ? myVal === otherVal
        : false;

      el.setCustomValidity(isValid ? "" : "INVALID");
    }

  }, [formData]);

  // Funzione di change che invoca il callback esterno
  const triggerChange = (e: InputOrTextAreaChangeEvent | null, val: any, isValid: boolean, feedbackText?: string) => {
    setValidity(isValid);
    e?.target.setCustomValidity(isValid ? "" : "INVALID");
    onChange(field.name, val, isValid, feedbackText);
  };


  // SETUP INPUT INFO
  let field_labelClass = field.labelClass ?? '';
  var field_label = field.label + (field.required ? ' *' : '');
  var label_class = (field.required ? ('fw-bold ') : field_labelClass);

  // Seleziona il controllo in base al tipo
  let control: React.ReactNode;
  switch (field.type) {
    case "text_area":
      control = (
        <MDBTextArea
          label={field_label}
          labelClass={label_class}
          value={(formData as any)[key] || ""}
          onChange={e => {
            const val = e.target.value;

            const computedValidation = computeValidation<T>(field, val, formData);
            const isValid = computedValidation.isValid;
            const feedbackText = computedValidation.feedbackText;

            triggerChange(e, val, isValid, feedbackText);
          }}
          style={style}
          rows={field.type === "text_area" ? 4 : undefined}
        />
      );
      break;

    case "checkbox":
      control = (
        <MDBCheckbox
          {...common}
          label={field_label}
          labelClass={label_class}
          checked={Boolean((formData as any)[key])}
          onChange={e => {
            const val = (e.target.checked ? 1 : 0) as unknown as T[typeof key];

            const computedValidation = computeValidation<T>(field, val, formData);
            const isValid = computedValidation.isValid;
            const feedbackText = computedValidation.feedbackText;

            triggerChange(e, val, isValid, feedbackText);
          }}
        />
      );
      break;

    case "date":
      control = (
        <MDBDatepicker
          {...common}
          label={field_label}
          labelClass={label_class}
          value={(formData as any)[key] || ""}
          onChange={(date: string) => {
            const computedValidation = computeValidation<T>(field, date, formData);
            const isValid = computedValidation.isValid;
            const feedbackText = computedValidation.feedbackText;

            triggerChange(null, date, isValid, feedbackText);
          }}
          inputStyle={style}
        />
      );
      break;

    case "file_input":
      control = (
        <div>
          <MDBFile
            {...common}
            label={field.label}
            onChange={e => {
              const file = e.target.files?.[0] ?? null;
              const filename = file ? file.name : "";

              const computedValidation = computeValidation<T>(field, file, formData);
              const isValid = computedValidation.isValid;
              const feedbackText = computedValidation.feedbackText;

              triggerChange(e, filename, isValid, feedbackText);
            }}
            style={style}
          />
        </div>
      );
      break;

    case "file_upload":
      control = (
        <MDBFileUpload
          {...common}
          label={field.label}
          className="rounded border border-secondary"
          onChange={(files) => {
            console.log("files", files);
            const filesVal = files ?? [];
            console.log("filesVal", filesVal);

            const computedValidation = computeValidation<T>(field, filesVal, formData);
            const isValid = computedValidation.isValid;
            const feedbackText = computedValidation.feedbackText;

            triggerChange(null, filesVal, isValid, feedbackText);
          }}
          style={style}
        />
      );
      break;

    case "selectbox":
      const isMulti = Boolean(field.properties?.multiple);
      const preventFirstSelection = field.properties?.preventFirstSelection !== false;

      const currentValue = (formData as any)[key] ?? (isMulti ? [] : undefined);

      const handleChange = (values: (string | number) | Array<string | number>) => {
        if (isMulti) {
          const selectedArray = Array.isArray(values) ? values : [values];
          const valArray = selectedArray.map(item =>
            typeof item === "object" && "value" in item
              ? (item as any).value
              : item
          );

          const computedValidation = computeValidation<T>(field, valArray, formData);
          const isValid = computedValidation.isValid;
          const feedbackText = computedValidation.feedbackText;

          triggerChange(null, valArray, isValid, feedbackText);
        } else {
          const raw = Array.isArray(values)
            ? values[0]
            : values;
          const val = raw && typeof raw === "object" && "value" in raw
            ? (raw as any).value
            : raw;

          const computedValidation = computeValidation<T>(field, val, formData);
          const isValid = computedValidation.isValid;
          const feedbackText = computedValidation.feedbackText;

          triggerChange(null, val, isValid, feedbackText);
        }
      };

      switch (field.customElementKey) {
        case "custom":
          control = (
            <CustomSelect
              {...common}
              label={field_label}
              labelClass={label_class}
              options={field.options || []}
              value={currentValue}
              isValid={isValid}
              onChange={handleChange}
              style={style}
            />
          );
          break;
        case "cards":
          control = (
            <Selectbox_Cards
              {...common}
              label={field_label}
              labelClass={label_class}
              options={field.options || []}
              value={currentValue}
              isValid={isValid}
              onChange={handleChange}
              style={style}
            />
          );
          break;

        default:
          const selectSearch = Boolean(field.properties?.search);
          const largeDataSearch = Boolean(field.properties?.largeDataSearch);
          const originalOptions = field.options || [];

          const [rawSearchTerm, setRawSearchTerm] = useState("");
          const [searchTerm, setSearchTerm] = useState("");

          // 2) debounce effect: reset timeout a ogni rawSearchTerm
          useEffect(() => {
            if (!largeDataSearch) return;
            const handler = window.setTimeout(() => {
              setSearchTerm(rawSearchTerm);
            }, 300); // 300ms di debounce

            return () => {
              window.clearTimeout(handler);
            };
          }, [rawSearchTerm, largeDataSearch]);

          useEffect(() => {
            if (!largeDataSearch) return;

            const inputListener = (e: Event) => {
              const target = e.target as HTMLInputElement;
              if (target.classList.contains("select-filter-input")) {
                setRawSearchTerm(target.value);
              }
            };

            document.addEventListener("input", inputListener, true);
            return () => {
              document.removeEventListener("input", inputListener, true);
            };
          }, [largeDataSearch]);

          const selectData = useMemo(() => {
            if (!largeDataSearch) {
              return originalOptions;
            }
            if (searchTerm.length === 0) {
              return [{ value: "", text: "" }];
            }

            const term = searchTerm.toLowerCase();

            // 1) filtro su text o value
            const matches = originalOptions
              .filter(opt => {
                const label = (opt.text ?? String(opt.value)).toString().toLowerCase();
                const valueStr = String(opt.value).toLowerCase();
                return label.includes(term) || valueStr.includes(term);
              })
              // 2) arricchisco per ordinamento
              .map(opt => ({
                ...opt,
                _label: (opt.text ?? String(opt.value)).toString(),
                _labelLower: (opt.text ?? String(opt.value)).toString().toLowerCase(),
                _valueLower: String(opt.value).toLowerCase(),
              }));

            // funzione per rimuovere caratteri iniziali non alfanumerici
            const stripLead = (s: string) => s.replace(/^[^a-z0-9]+/i, "");

            // 3) ordino per rank + alfabetico
            matches.sort((a, b) => {
              const rank = (o: typeof a) => {
                if (o._valueLower === term) return 0;
                if (o._labelLower.startsWith(term)) return 1;
                if (o._valueLower.startsWith(term)) return 2;
                return 3;
              };

              const ra = rank(a), rb = rank(b);
              if (ra !== rb) return ra - rb;

              // tie‑breaker: confronto senza caratteri iniziali strani
              return stripLead(a._labelLower).localeCompare(stripLead(b._labelLower));
            });

            // 4) limito e tolgo campi di servizio
            const filtered = matches.slice(0, 15).map(({ _label, _labelLower, _valueLower, ...opt }) => opt);

            if (filtered.length === 0) {
              // Se non c'è nulla, mostro un'unica voce disabilitata
              return [{ value: "", text: "Nessun risultato", disabled: true }];
            } else {
              return filtered;
            }


          }, [largeDataSearch, originalOptions, searchTerm]);

          control = (
            <MDBSimpleSelect
              {...common}
              search={selectSearch || largeDataSearch}
              preventFirstSelection={preventFirstSelection}
              label={field_label}
              labelClass={label_class}
              data={selectData}
              value={currentValue}
              onChange={handleChange}
              style={style}
            />
          );
          break;
      }
      break;

    case "richtext":
      control = (
        <RichEditor
          value={formData[key] || ''}
          onChange={html => {
            const val = html;

            const computedValidation = computeValidation<T>(field, val, formData);
            const isValid = computedValidation.isValid;
            const feedbackText = computedValidation.feedbackText;

            triggerChange(null, val, isValid, feedbackText);
          }}
        />
      );
      break;

    case "email":
      control = (
        <MDBInput
          {...common}
          type={"email"}
          label={field_label}
          labelClass={label_class}
          value={(formData as any)[key] || ""}
          onChange={e => {
            const val = e.target.value;

            const computedValidation = computeValidation<T>(field, val, formData);
            const isValid = computedValidation.isValid;
            const feedbackText = computedValidation.feedbackText;

            triggerChange(e, val, isValid, feedbackText);
          }}
          style={style}
        />
      );
      break;

    case "password":
      control = (
        <MDBInput
          {...common}
          type={"password"}
          label={field_label}
          labelClass={label_class}
          value={(formData as any)[key] || ""}
          onChange={e => {
            const val = e.target.value;

            const computedValidation = computeValidation<T>(field, val, formData);
            const isValid = computedValidation.isValid;
            const feedbackText = computedValidation.feedbackText;

            triggerChange(e, val, isValid, feedbackText);
          }}
          style={style}
        />
      );
      break;

    case "number":
      const defaultValue =
        field.properties?.defaultValue != null
          ? String(field.properties.defaultValue)
          : undefined;

      const minValue = field.properties?.minValue ?? null;
      const maxValue = field.properties?.maxValue ?? null;
      const stepValue = field.properties?.stepValue ?? null;

      control = (
        <MDBInput
          {...common}
          type={"number"}
          label={field_label}
          labelClass={label_class}
          value={
            (formData as any)[key] != null
              ? String((formData as any)[key])
              : defaultValue ?? ""
          }
          min={minValue ?? undefined}
          max={maxValue ?? undefined}
          step={stepValue ?? undefined}
          onChange={e => {
            const val = e.target.value;

            const computedValidation = computeValidation<T>(field, val, formData);
            const isValid = computedValidation.isValid;
            const feedbackText = computedValidation.feedbackText;

            triggerChange(e, val, isValid, feedbackText);
          }}
          onBlur={e => {
            let val = e.target.value;
            if (val !== "") {
              let num = Number(val);
              // se fuori bound lo clampi
              if (minValue !== null && num < minValue) num = minValue;
              if (maxValue !== null && num > maxValue) num = maxValue;

              const clamped = String(num);
              // evita doppie chiamate se non serve
              if (clamped !== val) {
                const computedValidation = computeValidation<T>(field, clamped, formData);
                const isValid = computedValidation.isValid;
                const feedbackText = computedValidation.feedbackText;

                triggerChange(e, clamped, isValid, feedbackText);
              }
            }
          }}
          style={style}
        />
      );
      break;

    default:
      control = (
        <MDBInput
          {...common}
          type={field.type || "text"}
          label={field_label}
          labelClass={label_class}
          value={(formData as any)[key] || ""}
          onChange={e => {
            const val = e.target.value;

            const computedValidation = computeValidation<T>(field, val, formData);
            const isValid = computedValidation.isValid;
            const feedbackText = computedValidation.feedbackText;

            triggerChange(e, val, isValid, feedbackText);
          }}
          style={style}
        />
      );
  }

  return <>{control}</>;
}