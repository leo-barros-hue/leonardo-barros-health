export type Category = 
  | 'Perfil lipídico'
  | 'Hematologia'
  | 'Metabolismo da glicose'
  | 'Função hepática'
  | 'Função renal'
  | 'Painel hormonal'
  | 'Eletrólitos'
  | 'Vitaminas'
  | 'Minerais e oligoelementos'
  | 'Marcadores inflamatórios'
  | 'Marcadores musculares';

export const CATEGORIES: Category[] = [
  'Perfil lipídico',
  'Hematologia',
  'Metabolismo da glicose',
  'Função hepática',
  'Função renal',
  'Painel hormonal',
  'Eletrólitos',
  'Vitaminas',
  'Minerais e oligoelementos',
  'Marcadores inflamatórios',
  'Marcadores musculares'
];

export interface ReferenceRange {
  min: number;
  max: number;
}

export interface ExamDefinition {
  id: string;
  name: string;
  category: Category | string;
  unit: string;
  alternativeUnits: { unit: string; factor: number }[];
  referenceRange: {
    unisex?: ReferenceRange;
    male?: ReferenceRange;
    female?: ReferenceRange;
  };
}

export interface ExamResult {
  id: string;
  examId: string;
  value: number;
  date: string;
  patientId: string;
}

export interface Patient {
  id: string;
  name: string;
  gender: 'male' | 'female';
  weight?: number;
  height?: number;
}

export type StatusColor = 'green' | 'yellow' | 'orange' | 'red';
