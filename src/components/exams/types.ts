export type Category =
  | 'Perfil lipídico'
  | 'Metabolismo da glicose'
  | 'Função hepática'
  | 'Função renal'
  | 'Eletrólitos'
  | 'Hematologia'
  | 'Painel hormonal'
  | 'Vitaminas'
  | 'Minerais e oligoelementos'
  | 'Marcadores inflamatórios'
  | 'Marcadores musculares';

export const CATEGORIES: Category[] = [
  'Perfil lipídico',
  'Metabolismo da glicose',
  'Função hepática',
  'Função renal',
  'Eletrólitos',
  'Hematologia',
  'Painel hormonal',
  'Vitaminas',
  'Minerais e oligoelementos',
  'Marcadores inflamatórios',
  'Marcadores musculares',
];

export interface ReferenceRange {
  unisex?: { min: number; max: number };
  male?: { min: number; max: number };
  female?: { min: number; max: number };
}

export interface AlternativeUnit {
  unit: string;
  factor: number;
}

export interface ExamDefinition {
  id: string;
  name: string;
  category: Category | string;
  unit: string;
  alternativeUnits: AlternativeUnit[];
  referenceRange: ReferenceRange;
}

export interface ExamResult {
  id: string;
  examId: string;
  patientId: string;
  value: number;
  date: string;
  notes?: string;
}

export interface Patient {
  id: string;
  name: string;
  gender: 'male' | 'female';
  weight: number;
  height: number;
}
