import { ExamDefinition } from './types';

export const INITIAL_EXAMS: ExamDefinition[] = [
  // PERFIL LIPÍDICO
  { id: 'colesterol-total', name: 'Colesterol total', category: 'Perfil lipídico', unit: 'mg/dL', alternativeUnits: [{ unit: 'mmol/L', factor: 0.02586 }], referenceRange: { unisex: { min: 0, max: 200 } } },
  { id: 'ldl-colesterol', name: 'LDL-colesterol', category: 'Perfil lipídico', unit: 'mg/dL', alternativeUnits: [{ unit: 'mmol/L', factor: 0.02586 }], referenceRange: { unisex: { min: 0, max: 100 } } },
  { id: 'hdl-colesterol', name: 'HDL-colesterol', category: 'Perfil lipídico', unit: 'mg/dL', alternativeUnits: [{ unit: 'mmol/L', factor: 0.02586 }], referenceRange: { male: { min: 40, max: 100 }, female: { min: 50, max: 100 } } },
  { id: 'vldl-colesterol', name: 'VLDL-colesterol', category: 'Perfil lipídico', unit: 'mg/dL', alternativeUnits: [], referenceRange: { unisex: { min: 0, max: 30 } } },
  { id: 'triglicerideos', name: 'Triglicerídeos', category: 'Perfil lipídico', unit: 'mg/dL', alternativeUnits: [{ unit: 'mmol/L', factor: 0.01129 }], referenceRange: { unisex: { min: 0, max: 150 } } },
  { id: 'apoa1', name: 'Apolipoproteína A1 (ApoA1)', category: 'Perfil lipídico', unit: 'mg/dL', alternativeUnits: [], referenceRange: { male: { min: 120, max: 160 }, female: { min: 140, max: 180 } } },
  { id: 'apob', name: 'Apolipoproteína B (ApoB)', category: 'Perfil lipídico', unit: 'mg/dL', alternativeUnits: [], referenceRange: { unisex: { min: 0, max: 90 } } },
  { id: 'lpa', name: 'Lipoproteína(a) — Lp(a)', category: 'Perfil lipídico', unit: 'mg/dL', alternativeUnits: [{ unit: 'nmol/L', factor: 2.4 }], referenceRange: { unisex: { min: 0, max: 30 } } },

  // METABOLISMO DA GLICOSE
  { id: 'glicemia-jejum', name: 'Glicemia de jejum', category: 'Metabolismo da glicose', unit: 'mg/dL', alternativeUnits: [{ unit: 'mmol/L', factor: 0.0555 }], referenceRange: { unisex: { min: 70, max: 99 } } },
  { id: 'hba1c', name: 'Hemoglobina glicada (HbA1c)', category: 'Metabolismo da glicose', unit: '%', alternativeUnits: [], referenceRange: { unisex: { min: 4, max: 5.7 } } },
  { id: 'insulina-jejum', name: 'Insulina de jejum', category: 'Metabolismo da glicose', unit: 'μU/mL', alternativeUnits: [], referenceRange: { unisex: { min: 2, max: 25 } } },
  { id: 'peptideo-c', name: 'Peptídeo C', category: 'Metabolismo da glicose', unit: 'ng/mL', alternativeUnits: [], referenceRange: { unisex: { min: 0.8, max: 3.1 } } },
  { id: 'totg-2h', name: 'TOTG (2h)', category: 'Metabolismo da glicose', unit: 'mg/dL', alternativeUnits: [], referenceRange: { unisex: { min: 0, max: 140 } } },

  // FUNÇÃO HEPÁTICA
  { id: 'tgo-ast', name: 'TGO (AST)', category: 'Função hepática', unit: 'U/L', alternativeUnits: [], referenceRange: { male: { min: 0, max: 40 }, female: { min: 0, max: 32 } } },
  { id: 'tgp-alt', name: 'TGP (ALT)', category: 'Função hepática', unit: 'U/L', alternativeUnits: [], referenceRange: { male: { min: 0, max: 40 }, female: { min: 0, max: 32 } } },
  { id: 'ggt', name: 'GGT', category: 'Função hepática', unit: 'U/L', alternativeUnits: [], referenceRange: { unisex: { min: 0, max: 75 } } },
  { id: 'fosfatase-alcalina', name: 'Fosfatase alcalina', category: 'Função hepática', unit: 'U/L', alternativeUnits: [], referenceRange: { unisex: { min: 30, max: 120 } } },
  { id: 'bilirrubina-total', name: 'Bilirrubina total', category: 'Função hepática', unit: 'mg/dL', alternativeUnits: [], referenceRange: { unisex: { min: 0.3, max: 1.2 } } },
  { id: 'bilirrubina-direta', name: 'Bilirrubina direta', category: 'Função hepática', unit: 'mg/dL', alternativeUnits: [], referenceRange: { unisex: { min: 0, max: 0.3 } } },
  { id: 'bilirrubina-indireta', name: 'Bilirrubina indireta', category: 'Função hepática', unit: 'mg/dL', alternativeUnits: [], referenceRange: { unisex: { min: 0.2, max: 0.9 } } },
  { id: 'albumina', name: 'Albumina', category: 'Função hepática', unit: 'g/dL', alternativeUnits: [], referenceRange: { unisex: { min: 3.5, max: 5.0 } } },
  { id: 'proteinas-totais', name: 'Proteínas totais', category: 'Função hepática', unit: 'g/dL', alternativeUnits: [], referenceRange: { unisex: { min: 6.0, max: 8.3 } } },
  { id: 'inr', name: 'INR', category: 'Função hepática', unit: '—', alternativeUnits: [], referenceRange: { unisex: { min: 0.8, max: 1.2 } } },

  // FUNÇÃO RENAL
  { id: 'creatinina', name: 'Creatinina', category: 'Função renal', unit: 'mg/dL', alternativeUnits: [{ unit: 'μmol/L', factor: 88.4 }], referenceRange: { male: { min: 0.7, max: 1.2 }, female: { min: 0.6, max: 1.0 } } },
  { id: 'ureia', name: 'Ureia', category: 'Função renal', unit: 'mg/dL', alternativeUnits: [], referenceRange: { unisex: { min: 15, max: 40 } } },
  { id: 'acido-urico', name: 'Ácido úrico', category: 'Função renal', unit: 'mg/dL', alternativeUnits: [], referenceRange: { male: { min: 3.4, max: 7.0 }, female: { min: 2.4, max: 6.0 } } },
  { id: 'cistatina-c', name: 'Cistatina C', category: 'Função renal', unit: 'mg/L', alternativeUnits: [], referenceRange: { male: { min: 0.56, max: 1.25 }, female: { min: 0.49, max: 0.98 } } },

  // ELETRÓLITOS
  { id: 'sodio', name: 'Sódio', category: 'Eletrólitos', unit: 'mmol/L', alternativeUnits: [], referenceRange: { unisex: { min: 135, max: 145 } } },
  { id: 'potassio', name: 'Potássio', category: 'Eletrólitos', unit: 'mmol/L', alternativeUnits: [], referenceRange: { unisex: { min: 3.5, max: 5.0 } } },
  { id: 'cloro', name: 'Cloro', category: 'Eletrólitos', unit: 'mmol/L', alternativeUnits: [], referenceRange: { unisex: { min: 98, max: 107 } } },
  { id: 'calcio-total', name: 'Cálcio total', category: 'Eletrólitos', unit: 'mg/dL', alternativeUnits: [], referenceRange: { unisex: { min: 8.5, max: 10.5 } } },
  { id: 'magnesio', name: 'Magnésio', category: 'Eletrólitos', unit: 'mg/dL', alternativeUnits: [], referenceRange: { unisex: { min: 1.7, max: 2.2 } } },
  { id: 'fosforo', name: 'Fósforo', category: 'Eletrólitos', unit: 'mg/dL', alternativeUnits: [], referenceRange: { unisex: { min: 2.5, max: 4.5 } } },

  // HEMATOLOGIA
  { id: 'hemoglobina', name: 'Hemoglobina', category: 'Hematologia', unit: 'g/dL', alternativeUnits: [{ unit: 'mmol/L', factor: 0.6206 }], referenceRange: { male: { min: 13.5, max: 17.5 }, female: { min: 12.0, max: 15.5 } } },
  { id: 'hematocrito', name: 'Hematócrito', category: 'Hematologia', unit: '%', alternativeUnits: [], referenceRange: { male: { min: 40, max: 52 }, female: { min: 36, max: 46 } } },
  { id: 'leucocitos', name: 'Leucócitos', category: 'Hematologia', unit: '/μL', alternativeUnits: [], referenceRange: { unisex: { min: 4000, max: 11000 } } },
  { id: 'plaquetas', name: 'Plaquetas', category: 'Hematologia', unit: '/μL', alternativeUnits: [], referenceRange: { unisex: { min: 150000, max: 400000 } } },
  { id: 'ferritina', name: 'Ferritina', category: 'Hematologia', unit: 'ng/mL', alternativeUnits: [], referenceRange: { male: { min: 30, max: 300 }, female: { min: 15, max: 150 } } },
  { id: 'ferro-serico', name: 'Ferro sérico', category: 'Hematologia', unit: 'μg/dL', alternativeUnits: [], referenceRange: { male: { min: 65, max: 175 }, female: { min: 50, max: 170 } } },
  { id: 'transferrina', name: 'Transferrina', category: 'Hematologia', unit: 'mg/dL', alternativeUnits: [], referenceRange: { unisex: { min: 200, max: 360 } } },
  { id: 'saturacao-transferrina', name: 'Saturação de transferrina', category: 'Hematologia', unit: '%', alternativeUnits: [], referenceRange: { unisex: { min: 20, max: 50 } } },
  { id: 'tibc', name: 'TIBC (capacidade total de ligação do ferro)', category: 'Hematologia', unit: 'μg/dL', alternativeUnits: [], referenceRange: { unisex: { min: 250, max: 450 } } },

  // PAINEL HORMONAL
  { id: 'tsh', name: 'TSH', category: 'Painel hormonal', unit: 'mIU/L', alternativeUnits: [], referenceRange: { unisex: { min: 0.4, max: 5.0 } } },
  { id: 't4-livre', name: 'T4 livre', category: 'Painel hormonal', unit: 'ng/dL', alternativeUnits: [], referenceRange: { unisex: { min: 0.9, max: 1.7 } } },
  { id: 't3-livre', name: 'T3 livre', category: 'Painel hormonal', unit: 'pg/mL', alternativeUnits: [], referenceRange: { unisex: { min: 2.3, max: 4.2 } } },
  { id: 'anti-tpo', name: 'Anti-TPO', category: 'Painel hormonal', unit: 'IU/mL', alternativeUnits: [], referenceRange: { unisex: { min: 0, max: 35 } } },
  { id: 'anti-tg', name: 'Anti-tireoglobulina', category: 'Painel hormonal', unit: 'IU/mL', alternativeUnits: [], referenceRange: { unisex: { min: 0, max: 40 } } },
  { id: 'trab', name: 'TRAb', category: 'Painel hormonal', unit: 'IU/L', alternativeUnits: [], referenceRange: { unisex: { min: 0, max: 1.75 } } },
  { id: 'testosterona-total', name: 'Testosterona total', category: 'Painel hormonal', unit: 'ng/dL', alternativeUnits: [{ unit: 'ng/mL', factor: 0.01 }], referenceRange: { male: { min: 300, max: 1000 }, female: { min: 15, max: 70 } } },
  { id: 'testosterona-livre', name: 'Testosterona livre', category: 'Painel hormonal', unit: 'pg/mL', alternativeUnits: [], referenceRange: { male: { min: 50, max: 210 }, female: { min: 1.0, max: 8.5 } } },
  { id: 'shbg', name: 'SHBG', category: 'Painel hormonal', unit: 'nmol/L', alternativeUnits: [], referenceRange: { male: { min: 10, max: 57 }, female: { min: 18, max: 114 } } },
  { id: 'estradiol', name: 'Estradiol', category: 'Painel hormonal', unit: 'pg/mL', alternativeUnits: [], referenceRange: { male: { min: 10, max: 40 }, female: { min: 30, max: 400 } } },
  { id: 'progesterona', name: 'Progesterona', category: 'Painel hormonal', unit: 'ng/mL', alternativeUnits: [], referenceRange: { male: { min: 0, max: 1.0 }, female: { min: 0, max: 20 } } },
  { id: 'lh', name: 'LH', category: 'Painel hormonal', unit: 'mIU/mL', alternativeUnits: [], referenceRange: { male: { min: 1.5, max: 9.3 }, female: { min: 0.5, max: 76.3 } } },
  { id: 'fsh', name: 'FSH', category: 'Painel hormonal', unit: 'mIU/mL', alternativeUnits: [], referenceRange: { male: { min: 1.4, max: 18.1 }, female: { min: 1.5, max: 116.3 } } },
  { id: 'prolactina', name: 'Prolactina', category: 'Painel hormonal', unit: 'ng/mL', alternativeUnits: [], referenceRange: { male: { min: 2, max: 18 }, female: { min: 2, max: 29 } } },
  { id: 'dheas', name: 'DHEA-S', category: 'Painel hormonal', unit: 'μg/dL', alternativeUnits: [], referenceRange: { male: { min: 80, max: 560 }, female: { min: 35, max: 430 } } },
  { id: 'igf1', name: 'IGF-1', category: 'Painel hormonal', unit: 'ng/mL', alternativeUnits: [], referenceRange: { unisex: { min: 115, max: 358 } } },
  { id: 'gh', name: 'GH', category: 'Painel hormonal', unit: 'ng/mL', alternativeUnits: [], referenceRange: { unisex: { min: 0, max: 5 } } },

  // VITAMINAS
  { id: 'vitamina-d', name: 'Vitamina D', category: 'Vitaminas', unit: 'ng/mL', alternativeUnits: [], referenceRange: { unisex: { min: 30, max: 100 } } },
  { id: 'vitamina-b12', name: 'Vitamina B12', category: 'Vitaminas', unit: 'pg/mL', alternativeUnits: [], referenceRange: { unisex: { min: 300, max: 900 } } },
  { id: 'acido-folico', name: 'Ácido fólico (vitamina B9)', category: 'Vitaminas', unit: 'ng/mL', alternativeUnits: [], referenceRange: { unisex: { min: 3, max: 20 } } },
  { id: 'vitamina-a', name: 'Vitamina A', category: 'Vitaminas', unit: 'μmol/L', alternativeUnits: [], referenceRange: { unisex: { min: 0.7, max: 3.0 } } },
  { id: 'vitamina-c', name: 'Vitamina C', category: 'Vitaminas', unit: 'mg/dL', alternativeUnits: [], referenceRange: { unisex: { min: 0.4, max: 2.0 } } },

  // MINERAIS E OLIGOELEMENTOS
  { id: 'zinco', name: 'Zinco', category: 'Minerais e oligoelementos', unit: 'μg/dL', alternativeUnits: [], referenceRange: { unisex: { min: 65, max: 120 } } },
  { id: 'cobre', name: 'Cobre', category: 'Minerais e oligoelementos', unit: 'μg/dL', alternativeUnits: [], referenceRange: { unisex: { min: 75, max: 155 } } },
  { id: 'selenio', name: 'Selênio', category: 'Minerais e oligoelementos', unit: 'μg/L', alternativeUnits: [], referenceRange: { unisex: { min: 60, max: 95 } } },

  // MARCADORES INFLAMATÓRIOS
  { id: 'pcr-us', name: 'PCR-us', category: 'Marcadores inflamatórios', unit: 'mg/L', alternativeUnits: [], referenceRange: { unisex: { min: 0, max: 1.0 } } },
  { id: 'vhs', name: 'Velocidade de hemossedimentação (VHS)', category: 'Marcadores inflamatórios', unit: 'mm/h', alternativeUnits: [], referenceRange: { male: { min: 0, max: 15 }, female: { min: 0, max: 20 } } },
  { id: 'homocisteina', name: 'Homocisteína', category: 'Marcadores inflamatórios', unit: 'μmol/L', alternativeUnits: [], referenceRange: { unisex: { min: 0, max: 15 } } },
  { id: 'fibrinogenio', name: 'Fibrinogênio', category: 'Marcadores inflamatórios', unit: 'mg/dL', alternativeUnits: [], referenceRange: { unisex: { min: 200, max: 400 } } },

  // MARCADORES MUSCULARES
  { id: 'cpk', name: 'CPK', category: 'Marcadores musculares', unit: 'U/L', alternativeUnits: [], referenceRange: { male: { min: 38, max: 174 }, female: { min: 26, max: 140 } } },
];

export const COMMON_UNITS = [
  'mg/dL', 'mmol/L', 'ng/mL', 'pg/mL', 'U/L', 'g/dL', '%', 'μmol/L', 'mEq/L', 'pg', 'fL', 'x10^6/μL', 'x10^3/μL', 'μg/dL', 'nmol/L', 'IU/mL', 'IU/L', 'mIU/mL', 'mIU/L', 'μg/L', 'mm/h'
];
