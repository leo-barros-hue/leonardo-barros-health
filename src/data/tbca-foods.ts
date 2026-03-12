// Tabela TBCA (Tabela Brasileira de Composição de Alimentos) - USP
// Valores por 1g do alimento
import type { TabelaFood } from "./taco-foods";

export const tbcaFoods: TabelaFood[] = [
  // Cereais e derivados
  { name: "Arroz parboilizado cozido", category: "Carboidratos", protein: 0.028, carbs: 0.278, fat: 0.004 },
  { name: "Arroz selvagem cozido", category: "Carboidratos", protein: 0.040, carbs: 0.213, fat: 0.003 },
  { name: "Quinoa cozida", category: "Carboidratos", protein: 0.044, carbs: 0.213, fat: 0.019 },
  { name: "Amaranto cozido", category: "Carboidratos", protein: 0.038, carbs: 0.187, fat: 0.016 },
  { name: "Painço (milho painço) cozido", category: "Carboidratos", protein: 0.035, carbs: 0.237, fat: 0.010 },
  { name: "Polenta cozida", category: "Carboidratos", protein: 0.018, carbs: 0.134, fat: 0.002 },
  { name: "Farinha de rosca", category: "Carboidratos", protein: 0.105, carbs: 0.730, fat: 0.035 },
  { name: "Farinha de linhaça", category: "Carboidratos", protein: 0.141, carbs: 0.433, fat: 0.323 },
  { name: "Pão de queijo", category: "Carboidratos", protein: 0.050, carbs: 0.340, fat: 0.140 },
  { name: "Cevada em grão cozida", category: "Carboidratos", protein: 0.023, carbs: 0.282, fat: 0.004 },
  { name: "Torrada integral", category: "Carboidratos", protein: 0.113, carbs: 0.699, fat: 0.056 },
  { name: "Wrap integral", category: "Carboidratos", protein: 0.085, carbs: 0.500, fat: 0.060 },
  { name: "Macarrão integral cozido", category: "Carboidratos", protein: 0.053, carbs: 0.265, fat: 0.009 },

  // Tubérculos e raízes
  { name: "Batata baroa cozida", category: "Carboidratos", protein: 0.009, carbs: 0.183, fat: 0.002 },
  { name: "Batata yacon", category: "Carboidratos", protein: 0.003, carbs: 0.093, fat: 0.001 },

  // Frutas
  { name: "Amora", category: "Frutas", protein: 0.014, carbs: 0.096, fat: 0.005 },
  { name: "Blueberry (mirtilo)", category: "Frutas", protein: 0.007, carbs: 0.145, fat: 0.003 },
  { name: "Framboesa", category: "Frutas", protein: 0.012, carbs: 0.119, fat: 0.007 },
  { name: "Jabuticaba", category: "Frutas", protein: 0.006, carbs: 0.153, fat: 0.001 },
  { name: "Graviola", category: "Frutas", protein: 0.010, carbs: 0.168, fat: 0.003 },
  { name: "Pitaya", category: "Frutas", protein: 0.011, carbs: 0.110, fat: 0.004 },
  { name: "Caqui", category: "Frutas", protein: 0.004, carbs: 0.193, fat: 0.002 },
  { name: "Figo fresco", category: "Frutas", protein: 0.010, carbs: 0.114, fat: 0.002 },
  { name: "Ameixa fresca", category: "Frutas", protein: 0.008, carbs: 0.124, fat: 0.001 },
  { name: "Carambola", category: "Frutas", protein: 0.005, carbs: 0.078, fat: 0.001 },
  { name: "Nectarina", category: "Frutas", protein: 0.011, carbs: 0.106, fat: 0.003 },
  { name: "Pêssego", category: "Frutas", protein: 0.009, carbs: 0.093, fat: 0.001 },
  { name: "Romã", category: "Frutas", protein: 0.004, carbs: 0.166, fat: 0.003 },
  { name: "Lichia", category: "Frutas", protein: 0.008, carbs: 0.165, fat: 0.004 },
  { name: "Banana da terra cozida", category: "Frutas", protein: 0.013, carbs: 0.320, fat: 0.002 },

  // Proteínas - Carnes e derivados
  { name: "Frango peito com pele grelhado", category: "Proteína", protein: 0.290, carbs: 0.000, fat: 0.070 },
  { name: "Peru peito assado", category: "Proteína", protein: 0.293, carbs: 0.000, fat: 0.018 },
  { name: "Carne bovina contrafilé grelhado", category: "Proteína", protein: 0.300, carbs: 0.000, fat: 0.092 },
  { name: "Carne bovina lagarto grelhado", category: "Proteína", protein: 0.330, carbs: 0.000, fat: 0.036 },
  { name: "Carne bovina músculo cozido", category: "Proteína", protein: 0.275, carbs: 0.000, fat: 0.058 },
  { name: "Carne bovina picanha grelhada", category: "Proteína", protein: 0.270, carbs: 0.000, fat: 0.155 },
  { name: "Carne bovina coxão duro grelhado", category: "Proteína", protein: 0.325, carbs: 0.000, fat: 0.042 },
  { name: "Carne de cordeiro pernil assado", category: "Proteína", protein: 0.260, carbs: 0.000, fat: 0.120 },
  { name: "Carne de pato assada", category: "Proteína", protein: 0.235, carbs: 0.000, fat: 0.112 },

  // Proteínas - Peixes e frutos do mar
  { name: "Bacalhau cozido", category: "Proteína", protein: 0.260, carbs: 0.000, fat: 0.007 },
  { name: "Pescada branca grelhada", category: "Proteína", protein: 0.234, carbs: 0.000, fat: 0.016 },
  { name: "Merluza cozida", category: "Proteína", protein: 0.220, carbs: 0.000, fat: 0.012 },
  { name: "Robalo grelhado", category: "Proteína", protein: 0.240, carbs: 0.000, fat: 0.025 },
  { name: "Lula cozida", category: "Proteína", protein: 0.179, carbs: 0.018, fat: 0.017 },
  { name: "Polvo cozido", category: "Proteína", protein: 0.298, carbs: 0.000, fat: 0.010 },

  // Laticínios
  { name: "Queijo prato", category: "Proteína", protein: 0.227, carbs: 0.019, fat: 0.288 },
  { name: "Queijo parmesão", category: "Proteína", protein: 0.356, carbs: 0.032, fat: 0.258 },
  { name: "Cream cheese", category: "Gorduras", protein: 0.048, carbs: 0.055, fat: 0.330 },
  { name: "Requeijão cremoso", category: "Gorduras", protein: 0.100, carbs: 0.028, fat: 0.240 },
  { name: "Iogurte grego natural", category: "Proteína", protein: 0.060, carbs: 0.040, fat: 0.050 },
  { name: "Leite de coco", category: "Gorduras", protein: 0.014, carbs: 0.027, fat: 0.150 },
  { name: "Kefir", category: "Proteína", protein: 0.033, carbs: 0.045, fat: 0.015 },

  // Gorduras e oleaginosas
  { name: "Óleo de abacate", category: "Gorduras", protein: 0.000, carbs: 0.000, fat: 1.000 },
  { name: "Óleo de linhaça", category: "Gorduras", protein: 0.000, carbs: 0.000, fat: 1.000 },
  { name: "Tahine (pasta de gergelim)", category: "Gorduras", protein: 0.180, carbs: 0.185, fat: 0.530 },
  { name: "Semente de girassol", category: "Gorduras", protein: 0.208, carbs: 0.200, fat: 0.515 },
  { name: "Semente de abóbora", category: "Gorduras", protein: 0.302, carbs: 0.107, fat: 0.491 },
  { name: "Macadâmia", category: "Gorduras", protein: 0.079, carbs: 0.138, fat: 0.758 },
  { name: "Pistache torrado", category: "Gorduras", protein: 0.202, carbs: 0.272, fat: 0.453 },

  // Verduras e Legumes
  { name: "Aspargo cozido", category: "Outros", protein: 0.024, carbs: 0.025, fat: 0.002 },
  { name: "Rúcula", category: "Outros", protein: 0.026, carbs: 0.021, fat: 0.007 },
  { name: "Agrião", category: "Outros", protein: 0.027, carbs: 0.013, fat: 0.003 },
  { name: "Couve-flor cozida", category: "Outros", protein: 0.018, carbs: 0.028, fat: 0.002 },
  { name: "Palmito pupunha", category: "Outros", protein: 0.020, carbs: 0.035, fat: 0.008 },
  { name: "Alcachofra cozida", category: "Outros", protein: 0.029, carbs: 0.060, fat: 0.002 },
  { name: "Jiló cozido", category: "Outros", protein: 0.014, carbs: 0.035, fat: 0.001 },
  { name: "Maxixe cozido", category: "Outros", protein: 0.010, carbs: 0.025, fat: 0.001 },
  { name: "Ora-pro-nóbis", category: "Outros", protein: 0.020, carbs: 0.036, fat: 0.004 },
  { name: "Taioba cozida", category: "Outros", protein: 0.026, carbs: 0.035, fat: 0.008 },
];
