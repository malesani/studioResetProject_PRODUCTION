export interface APIFair {
  fair_uid: string;
  name: string;

  /** Formato: 'YYYY-MM-DD' */
  start_date: string;
  /** Formato: 'YYYY-MM-DD' */
  end_date: string;

  location?: string | null;
  sector?: string | null;

  /** Dato DB: tinyint(1). In API può arrivare 0/1 o boolean */
  active: boolean | 0 | 1;

  website?: string | null;
  description?: string | null;
  note?: string | null;

  /** Generato dal DB (STORED): giorni inclusivi tra start_date ed end_date */
  duration_days: number;

  /** Timestamp ISO del DB */
  created_at: string;
  updated_at: string;

  /** opzionale se l’API lo espone; spesso non serve sul client */
  company_uid?: string;
}
