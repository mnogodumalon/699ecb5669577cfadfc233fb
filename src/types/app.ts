// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export interface ArtikelEinstellen {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    artikelname?: string;
    beschreibung?: string;
    preis?: number;
    zustand?: 'neu' | 'wie_neu' | 'sehr_gut' | 'gut' | 'akzeptabel';
    kategorie?: 'elektronik' | 'moebel' | 'kleidung' | 'sport_freizeit' | 'haushalt' | 'garten' | 'fahrzeuge' | 'buecher_medien' | 'sonstiges';
    fotos?: string;
    vorname?: string;
    nachname?: string;
    email?: string;
    telefon?: string;
    strasse?: string;
    hausnummer?: string;
    postleitzahl?: string;
    stadt?: string;
  };
}

export const APP_IDS = {
  ARTIKEL_EINSTELLEN: '699ecb49548c6ac0b6a9dfe7',
} as const;

// Helper Types for creating new records
export type CreateArtikelEinstellen = ArtikelEinstellen['fields'];