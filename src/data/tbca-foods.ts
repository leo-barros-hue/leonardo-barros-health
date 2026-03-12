// Tabela TBCA (Tabela Brasileira de Composição de Alimentos) - USP
// Valores por 1g do alimento
import type { TabelaFood } from "./taco-foods";

export const tbcaFoods: TabelaFood[] = [
  // Cereais e derivados
  { name: "Arroz parboilizado cozido", category: "Carboidratos", kcal: 1.23, protein: 0.028, carbs: 0.278, fat: 0.004, fiber: 0.014 },
  { name: "Arroz selvagem cozido", category: "Carboidratos", kcal: 1.01, protein: 0.040, carbs: 0.213, fat: 0.003, fiber: 0.018 },
  { name: "Quinoa cozida", category: "Carboidratos", kcal: 1.20, protein: 0.044, carbs: 0.213, fat: 0.019, fiber: 0.028 },
  { name: "Amaranto cozido", category: "Carboidratos", kcal: 1.02, protein: 0.038, carbs: 0.187, fat: 0.016, fiber: 0.021 },
  { name: "Painço (milho painço) cozido", category: "Carboidratos", kcal: 1.19, protein: 0.035, carbs: 0.237, fat: 0.010, fiber: 0.013 },
  { name: "Polenta cozida", category: "Carboidratos", kcal: 0.62, protein: 0.018, carbs: 0.134, fat: 0.002, fiber: 0.012 },
  { name: "Farinha de rosca", category: "Carboidratos", kcal: 3.95, protein: 0.105, carbs: 0.730, fat: 0.035, fiber: 0.048 },
  { name: "Farinha de linhaça", category: "Carboidratos", kcal: 4.95, protein: 0.141, carbs: 0.433, fat: 0.323, fiber: 0.335 },
  { name: "Pão de queijo", category: "Carboidratos", kcal: 3.63, protein: 0.050, carbs: 0.340, fat: 0.140, fiber: 0.005 },
  { name: "Cevada em grão cozida", category: "Carboidratos", kcal: 1.23, protein: 0.023, carbs: 0.282, fat: 0.004, fiber: 0.038 },
  { name: "Torrada integral", category: "Carboidratos", kcal: 3.69, protein: 0.113, carbs: 0.699, fat: 0.056, fiber: 0.069 },
  { name: "Wrap integral", category: "Carboidratos", kcal: 2.90, protein: 0.085, carbs: 0.500, fat: 0.060, fiber: 0.040 },
  { name: "Macarrão integral cozido", category: "Carboidratos", kcal: 1.24, protein: 0.053, carbs: 0.265, fat: 0.009, fiber: 0.039 },

  // Tubérculos e raízes
  { name: "Batata baroa cozida", category: "Carboidratos", kcal: 0.80, protein: 0.009, carbs: 0.183, fat: 0.002, fiber: 0.018 },
  { name: "Batata yacon", category: "Carboidratos", kcal: 0.40, protein: 0.003, carbs: 0.093, fat: 0.001, fiber: 0.013 },

  // Frutas
  { name: "Amora", category: "Frutas", kcal: 0.43, protein: 0.014, carbs: 0.096, fat: 0.005, fiber: 0.053 },
  { name: "Blueberry (mirtilo)", category: "Frutas", kcal: 0.57, protein: 0.007, carbs: 0.145, fat: 0.003, fiber: 0.024 },
  { name: "Framboesa", category: "Frutas", kcal: 0.52, protein: 0.012, carbs: 0.119, fat: 0.007, fiber: 0.065 },
  { name: "Jabuticaba", category: "Frutas", kcal: 0.58, protein: 0.006, carbs: 0.153, fat: 0.001, fiber: 0.026 },
  { name: "Graviola", category: "Frutas", kcal: 0.66, protein: 0.010, carbs: 0.168, fat: 0.003, fiber: 0.033 },
  { name: "Pitaya", category: "Frutas", kcal: 0.50, protein: 0.011, carbs: 0.110, fat: 0.004, fiber: 0.033 },
  { name: "Caqui", category: "Frutas", kcal: 0.70, protein: 0.004, carbs: 0.193, fat: 0.002, fiber: 0.036 },
  { name: "Figo fresco", category: "Frutas", kcal: 0.74, protein: 0.010, carbs: 0.114, fat: 0.002, fiber: 0.029 },
  { name: "Ameixa fresca", category: "Frutas", kcal: 0.46, protein: 0.008, carbs: 0.124, fat: 0.001, fiber: 0.014 },
  { name: "Carambola", category: "Frutas", kcal: 0.31, protein: 0.005, carbs: 0.078, fat: 0.001, fiber: 0.028 },
  { name: "Nectarina", category: "Frutas", kcal: 0.44, protein: 0.011, carbs: 0.106, fat: 0.003, fiber: 0.017 },
  { name: "Pêssego", category: "Frutas", kcal: 0.39, protein: 0.009, carbs: 0.093, fat: 0.001, fiber: 0.015 },
  { name: "Romã", category: "Frutas", kcal: 0.83, protein: 0.004, carbs: 0.166, fat: 0.003, fiber: 0.040 },
  { name: "Lichia", category: "Frutas", kcal: 0.66, protein: 0.008, carbs: 0.165, fat: 0.004, fiber: 0.013 },
  { name: "Banana da terra cozida", category: "Frutas", kcal: 1.22, protein: 0.013, carbs: 0.320, fat: 0.002, fiber: 0.023 },

  // Proteínas - Carnes e derivados
  { name: "Frango peito com pele grelhado", category: "Proteína", kcal: 1.97, protein: 0.290, carbs: 0.000, fat: 0.070, fiber: 0.000 },
  { name: "Peru peito assado", category: "Proteína", kcal: 1.35, protein: 0.293, carbs: 0.000, fat: 0.018, fiber: 0.000 },
  { name: "Carne bovina contrafilé grelhado", category: "Proteína", kcal: 2.07, protein: 0.300, carbs: 0.000, fat: 0.092, fiber: 0.000 },
  { name: "Carne bovina lagarto grelhado", category: "Proteína", kcal: 1.66, protein: 0.330, carbs: 0.000, fat: 0.036, fiber: 0.000 },
  { name: "Carne bovina músculo cozido", category: "Proteína", kcal: 1.64, protein: 0.275, carbs: 0.000, fat: 0.058, fiber: 0.000 },
  { name: "Carne bovina picanha grelhada", category: "Proteína", kcal: 2.57, protein: 0.270, carbs: 0.000, fat: 0.155, fiber: 0.000 },
  { name: "Carne bovina coxão duro grelhado", category: "Proteína", kcal: 1.69, protein: 0.325, carbs: 0.000, fat: 0.042, fiber: 0.000 },
  { name: "Carne de cordeiro pernil assado", category: "Proteína", kcal: 2.17, protein: 0.260, carbs: 0.000, fat: 0.120, fiber: 0.000 },
  { name: "Carne de pato assada", category: "Proteína", kcal: 2.01, protein: 0.235, carbs: 0.000, fat: 0.112, fiber: 0.000 },

  // Proteínas - Peixes e frutos do mar
  { name: "Bacalhau cozido", category: "Proteína", kcal: 1.11, protein: 0.260, carbs: 0.000, fat: 0.007, fiber: 0.000 },
  { name: "Pescada branca grelhada", category: "Proteína", kcal: 1.10, protein: 0.234, carbs: 0.000, fat: 0.016, fiber: 0.000 },
  { name: "Merluza cozida", category: "Proteína", kcal: 1.00, protein: 0.220, carbs: 0.000, fat: 0.012, fiber: 0.000 },
  { name: "Robalo grelhado", category: "Proteína", kcal: 1.18, protein: 0.240, carbs: 0.000, fat: 0.025, fiber: 0.000 },
  { name: "Lula cozida", category: "Proteína", kcal: 0.92, protein: 0.179, carbs: 0.018, fat: 0.017, fiber: 0.000 },
  { name: "Polvo cozido", category: "Proteína", kcal: 1.64, protein: 0.298, carbs: 0.000, fat: 0.010, fiber: 0.000 },

  // Laticínios
  { name: "Queijo prato", category: "Proteína", kcal: 3.56, protein: 0.227, carbs: 0.019, fat: 0.288, fiber: 0.000 },
  { name: "Queijo parmesão", category: "Proteína", kcal: 3.92, protein: 0.356, carbs: 0.032, fat: 0.258, fiber: 0.000 },
  { name: "Cream cheese", category: "Gorduras", kcal: 3.42, protein: 0.048, carbs: 0.055, fat: 0.330, fiber: 0.000 },
  { name: "Requeijão cremoso", category: "Gorduras", kcal: 2.57, protein: 0.100, carbs: 0.028, fat: 0.240, fiber: 0.000 },
  { name: "Iogurte grego natural", category: "Proteína", kcal: 0.97, protein: 0.060, carbs: 0.040, fat: 0.050, fiber: 0.000 },
  { name: "Leite de coco", category: "Gorduras", kcal: 1.50, protein: 0.014, carbs: 0.027, fat: 0.150, fiber: 0.000 },
  { name: "Kefir", category: "Proteína", kcal: 0.43, protein: 0.033, carbs: 0.045, fat: 0.015, fiber: 0.000 },

  // Gorduras e oleaginosas
  { name: "Óleo de abacate", category: "Gorduras", kcal: 8.84, protein: 0.000, carbs: 0.000, fat: 1.000, fiber: 0.000 },
  { name: "Óleo de linhaça", category: "Gorduras", kcal: 8.84, protein: 0.000, carbs: 0.000, fat: 1.000, fiber: 0.000 },
  { name: "Tahine (pasta de gergelim)", category: "Gorduras", kcal: 5.95, protein: 0.180, carbs: 0.185, fat: 0.530, fiber: 0.093 },
  { name: "Semente de girassol", category: "Gorduras", kcal: 5.84, protein: 0.208, carbs: 0.200, fat: 0.515, fiber: 0.086 },
  { name: "Semente de abóbora", category: "Gorduras", kcal: 5.59, protein: 0.302, carbs: 0.107, fat: 0.491, fiber: 0.064 },
  { name: "Macadâmia", category: "Gorduras", kcal: 7.18, protein: 0.079, carbs: 0.138, fat: 0.758, fiber: 0.086 },
  { name: "Pistache torrado", category: "Gorduras", kcal: 5.62, protein: 0.202, carbs: 0.272, fat: 0.453, fiber: 0.102 },

  // Verduras e Legumes
  { name: "Aspargo cozido", category: "Outros", kcal: 0.22, protein: 0.024, carbs: 0.025, fat: 0.002, fiber: 0.020 },
  { name: "Rúcula", category: "Outros", kcal: 0.25, protein: 0.026, carbs: 0.021, fat: 0.007, fiber: 0.016 },
  { name: "Agrião", category: "Outros", kcal: 0.11, protein: 0.027, carbs: 0.013, fat: 0.003, fiber: 0.005 },
  { name: "Couve-flor cozida", category: "Outros", kcal: 0.23, protein: 0.018, carbs: 0.028, fat: 0.002, fiber: 0.021 },
  { name: "Palmito pupunha", category: "Outros", kcal: 0.28, protein: 0.020, carbs: 0.035, fat: 0.008, fiber: 0.014 },
  { name: "Alcachofra cozida", category: "Outros", kcal: 0.47, protein: 0.029, carbs: 0.060, fat: 0.002, fiber: 0.054 },
  { name: "Jiló cozido", category: "Outros", kcal: 0.27, protein: 0.014, carbs: 0.035, fat: 0.001, fiber: 0.039 },
  { name: "Maxixe cozido", category: "Outros", kcal: 0.15, protein: 0.010, carbs: 0.025, fat: 0.001, fiber: 0.015 },
  { name: "Ora-pro-nóbis", category: "Outros", kcal: 0.26, protein: 0.020, carbs: 0.036, fat: 0.004, fiber: 0.034 },
  { name: "Taioba cozida", category: "Outros", kcal: 0.34, protein: 0.026, carbs: 0.035, fat: 0.008, fiber: 0.038 },
];
