// Tabela TBCA (Tabela Brasileira de Composição de Alimentos) - USP
// Valores por 100g do alimento
import type { TabelaFood } from "./taco-foods";

export const tbcaFoods: TabelaFood[] = [
  // Cereais e derivados
  { name: "Arroz parboilizado cozido", category: "Carboidratos", protein: 2.8, carbs: 27.8, fat: 0.4 },
  { name: "Arroz selvagem cozido", category: "Carboidratos", protein: 4.0, carbs: 21.3, fat: 0.3 },
  { name: "Quinoa cozida", category: "Carboidratos", protein: 4.4, carbs: 21.3, fat: 1.9 },
  { name: "Amaranto cozido", category: "Carboidratos", protein: 3.8, carbs: 18.7, fat: 1.6 },
  { name: "Painço (milho painço) cozido", category: "Carboidratos", protein: 3.5, carbs: 23.7, fat: 1.0 },
  { name: "Polenta cozida", category: "Carboidratos", protein: 1.8, carbs: 13.4, fat: 0.2 },
  { name: "Farinha de rosca", category: "Carboidratos", protein: 10.5, carbs: 73.0, fat: 3.5 },
  { name: "Farinha de linhaça", category: "Carboidratos", protein: 14.1, carbs: 43.3, fat: 32.3 },
  { name: "Pão de queijo", category: "Carboidratos", protein: 5.0, carbs: 34.0, fat: 14.0 },
  { name: "Cevada em grão cozida", category: "Carboidratos", protein: 2.3, carbs: 28.2, fat: 0.4 },
  { name: "Torrada integral", category: "Carboidratos", protein: 11.3, carbs: 69.9, fat: 5.6 },
  { name: "Wrap integral", category: "Carboidratos", protein: 8.5, carbs: 50.0, fat: 6.0 },
  { name: "Macarrão integral cozido", category: "Carboidratos", protein: 5.3, carbs: 26.5, fat: 0.9 },

  // Tubérculos e raízes
  { name: "Batata baroa cozida", category: "Carboidratos", protein: 0.9, carbs: 18.3, fat: 0.2 },
  { name: "Batata yacon", category: "Carboidratos", protein: 0.3, carbs: 9.3, fat: 0.1 },

  // Frutas
  { name: "Amora", category: "Frutas", protein: 1.4, carbs: 9.6, fat: 0.5 },
  { name: "Blueberry (mirtilo)", category: "Frutas", protein: 0.7, carbs: 14.5, fat: 0.3 },
  { name: "Framboesa", category: "Frutas", protein: 1.2, carbs: 11.9, fat: 0.7 },
  { name: "Jabuticaba", category: "Frutas", protein: 0.6, carbs: 15.3, fat: 0.1 },
  { name: "Graviola", category: "Frutas", protein: 1.0, carbs: 16.8, fat: 0.3 },
  { name: "Pitaya", category: "Frutas", protein: 1.1, carbs: 11.0, fat: 0.4 },
  { name: "Caqui", category: "Frutas", protein: 0.4, carbs: 19.3, fat: 0.2 },
  { name: "Figo fresco", category: "Frutas", protein: 1.0, carbs: 11.4, fat: 0.2 },
  { name: "Ameixa fresca", category: "Frutas", protein: 0.8, carbs: 12.4, fat: 0.1 },
  { name: "Carambola", category: "Frutas", protein: 0.5, carbs: 7.8, fat: 0.1 },
  { name: "Nectarina", category: "Frutas", protein: 1.1, carbs: 10.6, fat: 0.3 },
  { name: "Pêssego", category: "Frutas", protein: 0.9, carbs: 9.3, fat: 0.1 },
  { name: "Romã", category: "Frutas", protein: 0.4, carbs: 16.6, fat: 0.3 },
  { name: "Lichia", category: "Frutas", protein: 0.8, carbs: 16.5, fat: 0.4 },
  { name: "Banana da terra cozida", category: "Frutas", protein: 1.3, carbs: 32.0, fat: 0.2 },

  // Proteínas - Carnes e derivados
  { name: "Frango peito com pele grelhado", category: "Proteína", protein: 29.0, carbs: 0.0, fat: 7.0 },
  { name: "Peru peito assado", category: "Proteína", protein: 29.3, carbs: 0.0, fat: 1.8 },
  { name: "Carne bovina contrafilé grelhado", category: "Proteína", protein: 30.0, carbs: 0.0, fat: 9.2 },
  { name: "Carne bovina lagarto grelhado", category: "Proteína", protein: 33.0, carbs: 0.0, fat: 3.6 },
  { name: "Carne bovina músculo cozido", category: "Proteína", protein: 27.5, carbs: 0.0, fat: 5.8 },
  { name: "Carne bovina picanha grelhada", category: "Proteína", protein: 27.0, carbs: 0.0, fat: 15.5 },
  { name: "Carne bovina coxão duro grelhado", category: "Proteína", protein: 32.5, carbs: 0.0, fat: 4.2 },
  { name: "Carne de cordeiro pernil assado", category: "Proteína", protein: 26.0, carbs: 0.0, fat: 12.0 },
  { name: "Carne de pato assada", category: "Proteína", protein: 23.5, carbs: 0.0, fat: 11.2 },

  // Proteínas - Peixes e frutos do mar
  { name: "Bacalhau cozido", category: "Proteína", protein: 26.0, carbs: 0.0, fat: 0.7 },
  { name: "Pescada branca grelhada", category: "Proteína", protein: 23.4, carbs: 0.0, fat: 1.6 },
  { name: "Merluza cozida", category: "Proteína", protein: 22.0, carbs: 0.0, fat: 1.2 },
  { name: "Robalo grelhado", category: "Proteína", protein: 24.0, carbs: 0.0, fat: 2.5 },
  { name: "Lula cozida", category: "Proteína", protein: 17.9, carbs: 1.8, fat: 1.7 },
  { name: "Polvo cozido", category: "Proteína", protein: 29.8, carbs: 0.0, fat: 1.0 },

  // Laticínios
  { name: "Queijo prato", category: "Proteína", protein: 22.7, carbs: 1.9, fat: 28.8 },
  { name: "Queijo parmesão", category: "Proteína", protein: 35.6, carbs: 3.2, fat: 25.8 },
  { name: "Cream cheese", category: "Gorduras", protein: 4.8, carbs: 5.5, fat: 33.0 },
  { name: "Requeijão cremoso", category: "Gorduras", protein: 10.0, carbs: 2.8, fat: 24.0 },
  { name: "Iogurte grego natural", category: "Proteína", protein: 6.0, carbs: 4.0, fat: 5.0 },
  { name: "Leite de coco", category: "Gorduras", protein: 1.4, carbs: 2.7, fat: 15.0 },
  { name: "Kefir", category: "Proteína", protein: 3.3, carbs: 4.5, fat: 1.5 },

  // Gorduras e oleaginosas
  { name: "Óleo de abacate", category: "Gorduras", protein: 0.0, carbs: 0.0, fat: 100.0 },
  { name: "Óleo de linhaça", category: "Gorduras", protein: 0.0, carbs: 0.0, fat: 100.0 },
  { name: "Tahine (pasta de gergelim)", category: "Gorduras", protein: 18.0, carbs: 18.5, fat: 53.0 },
  { name: "Semente de girassol", category: "Gorduras", protein: 20.8, carbs: 20.0, fat: 51.5 },
  { name: "Semente de abóbora", category: "Gorduras", protein: 30.2, carbs: 10.7, fat: 49.1 },
  { name: "Macadâmia", category: "Gorduras", protein: 7.9, carbs: 13.8, fat: 75.8 },
  { name: "Pistache torrado", category: "Gorduras", protein: 20.2, carbs: 27.2, fat: 45.3 },

  // Verduras e Legumes
  { name: "Aspargo cozido", category: "Outros", protein: 2.4, carbs: 2.5, fat: 0.2 },
  { name: "Rúcula", category: "Outros", protein: 2.6, carbs: 2.1, fat: 0.7 },
  { name: "Agrião", category: "Outros", protein: 2.7, carbs: 1.3, fat: 0.3 },
  { name: "Couve-flor cozida", category: "Outros", protein: 1.8, carbs: 2.8, fat: 0.2 },
  { name: "Palmito pupunha", category: "Outros", protein: 2.0, carbs: 3.5, fat: 0.8 },
  { name: "Alcachofra cozida", category: "Outros", protein: 2.9, carbs: 6.0, fat: 0.2 },
  { name: "Jiló cozido", category: "Outros", protein: 1.4, carbs: 3.5, fat: 0.1 },
  { name: "Maxixe cozido", category: "Outros", protein: 1.0, carbs: 2.5, fat: 0.1 },
  { name: "Ora-pro-nóbis", category: "Outros", protein: 2.0, carbs: 3.6, fat: 0.4 },
  { name: "Taioba cozida", category: "Outros", protein: 2.6, carbs: 3.5, fat: 0.8 },
];
