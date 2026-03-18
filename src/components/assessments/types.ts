export type Gender = 'Masculino' | 'Feminino';

export type Protocol = 
  | '3 dobras Guedes'
  | '3 dobras Jackson & Pollock'
  | '4 dobras Durnin & Womersley'
  | '4 dobras Faulkner'
  | '7 dobras Jackson, Pollock & Ward';

export interface Skinfolds {
  bicipital?: number;
  peitoral?: number;
  supraIliaca?: number;
  tricipital?: number;
  axilarMedia?: number;
  coxa?: number;
  subescapular?: number;
  abdominal?: number;
  panturrilha?: number;
}

export interface Circumferences {
  bracoDireitoRelaxado?: number;
  bracoDireitoContraido?: number;
  bracoEsquerdoRelaxado?: number;
  bracoEsquerdoContraido?: number;
  antebracoDireito?: number;
  antebracoEsquerdo?: number;
  peitoral?: number;
  cintura?: number;
  abdomen?: number;
  quadril?: number;
  coxaEsquerda?: number;
  coxaDireita?: number;
  panturrilhaDireita?: number;
  panturrilhaEsquerda?: number;
}

export interface Assessment {
  id: string;
  date: string;
  gender: Gender;
  age: number;
  weight: number;
  height: number;
  protocol: Protocol;
  skinfolds: Skinfolds;
  circumferences: Circumferences;
  results: {
    bodyFat: number;
    fatMass: number;
    leanMass: number;
    sumFolds: number;
    imc: number;
    ffmi: number;
  };
}

export const PROTOCOL_FOLDS: Record<Protocol, (keyof Skinfolds)[]> = {
  '3 dobras Guedes': ['tricipital', 'supraIliaca', 'abdominal'],
  '3 dobras Jackson & Pollock': ['peitoral', 'abdominal', 'coxa'],
  '4 dobras Durnin & Womersley': ['bicipital', 'tricipital', 'subescapular', 'supraIliaca'],
  '4 dobras Faulkner': ['tricipital', 'subescapular', 'supraIliaca', 'abdominal'],
  '7 dobras Jackson, Pollock & Ward': ['peitoral', 'axilarMedia', 'tricipital', 'subescapular', 'abdominal', 'supraIliaca', 'coxa'],
};
