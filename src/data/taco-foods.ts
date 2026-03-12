// Tabela TACO (Tabela Brasileira de Composição de Alimentos) - UNICAMP
// Valores por 1g do alimento
export interface TabelaFood {
  name: string;
  category: string;
  protein: number;
  carbs: number;
  fat: number;
}

export const tacoFoods: TabelaFood[] = [
  // Cereais e derivados
  { name: "Arroz integral cozido", category: "Carboidratos", protein: 0.026, carbs: 0.258, fat: 0.010 },
  { name: "Arroz branco cozido", category: "Carboidratos", protein: 0.025, carbs: 0.281, fat: 0.002 },
  { name: "Aveia em flocos", category: "Carboidratos", protein: 0.139, carbs: 0.666, fat: 0.085 },
  { name: "Farinha de mandioca", category: "Carboidratos", protein: 0.016, carbs: 0.879, fat: 0.003 },
  { name: "Farinha de trigo", category: "Carboidratos", protein: 0.098, carbs: 0.751, fat: 0.014 },
  { name: "Macarrão cozido", category: "Carboidratos", protein: 0.034, carbs: 0.199, fat: 0.005 },
  { name: "Milho verde cozido", category: "Carboidratos", protein: 0.036, carbs: 0.183, fat: 0.010 },
  { name: "Pão francês", category: "Carboidratos", protein: 0.080, carbs: 0.586, fat: 0.031 },
  { name: "Pão integral", category: "Carboidratos", protein: 0.094, carbs: 0.441, fat: 0.034 },
  { name: "Tapioca", category: "Carboidratos", protein: 0.000, carbs: 0.872, fat: 0.001 },
  { name: "Cuscuz de milho cozido", category: "Carboidratos", protein: 0.022, carbs: 0.250, fat: 0.004 },
  { name: "Granola", category: "Carboidratos", protein: 0.100, carbs: 0.635, fat: 0.134 },
  { name: "Farinha de aveia", category: "Carboidratos", protein: 0.140, carbs: 0.660, fat: 0.070 },
  { name: "Biscoito cream cracker", category: "Carboidratos", protein: 0.101, carbs: 0.672, fat: 0.146 },
  { name: "Batata doce cozida", category: "Carboidratos", protein: 0.006, carbs: 0.184, fat: 0.001 },
  { name: "Batata inglesa cozida", category: "Carboidratos", protein: 0.012, carbs: 0.119, fat: 0.001 },
  { name: "Mandioca cozida", category: "Carboidratos", protein: 0.006, carbs: 0.301, fat: 0.003 },
  { name: "Inhame cozido", category: "Carboidratos", protein: 0.020, carbs: 0.232, fat: 0.001 },
  { name: "Cará cozido", category: "Carboidratos", protein: 0.015, carbs: 0.201, fat: 0.001 },

  // Frutas
  { name: "Abacate", category: "Frutas", protein: 0.012, carbs: 0.060, fat: 0.084 },
  { name: "Abacaxi", category: "Frutas", protein: 0.009, carbs: 0.123, fat: 0.001 },
  { name: "Açaí polpa", category: "Frutas", protein: 0.038, carbs: 0.062, fat: 0.296 },
  { name: "Banana prata", category: "Frutas", protein: 0.013, carbs: 0.260, fat: 0.001 },
  { name: "Banana nanica", category: "Frutas", protein: 0.014, carbs: 0.228, fat: 0.001 },
  { name: "Goiaba vermelha", category: "Frutas", protein: 0.011, carbs: 0.130, fat: 0.004 },
  { name: "Kiwi", category: "Frutas", protein: 0.013, carbs: 0.115, fat: 0.006 },
  { name: "Laranja pêra", category: "Frutas", protein: 0.010, carbs: 0.089, fat: 0.001 },
  { name: "Limão", category: "Frutas", protein: 0.009, carbs: 0.111, fat: 0.001 },
  { name: "Maçã", category: "Frutas", protein: 0.003, carbs: 0.152, fat: 0.000 },
  { name: "Mamão papaia", category: "Frutas", protein: 0.005, carbs: 0.116, fat: 0.001 },
  { name: "Manga", category: "Frutas", protein: 0.004, carbs: 0.128, fat: 0.002 },
  { name: "Melancia", category: "Frutas", protein: 0.009, carbs: 0.081, fat: 0.000 },
  { name: "Melão", category: "Frutas", protein: 0.007, carbs: 0.075, fat: 0.000 },
  { name: "Morango", category: "Frutas", protein: 0.009, carbs: 0.068, fat: 0.003 },
  { name: "Pêra", category: "Frutas", protein: 0.006, carbs: 0.140, fat: 0.001 },
  { name: "Uva itália", category: "Frutas", protein: 0.007, carbs: 0.140, fat: 0.002 },
  { name: "Tangerina", category: "Frutas", protein: 0.008, carbs: 0.124, fat: 0.001 },
  { name: "Coco ralado", category: "Frutas", protein: 0.037, carbs: 0.104, fat: 0.272 },
  { name: "Maracujá suco", category: "Frutas", protein: 0.004, carbs: 0.116, fat: 0.001 },

  // Proteínas - Carnes
  { name: "Frango peito sem pele grelhado", category: "Proteína", protein: 0.315, carbs: 0.000, fat: 0.032 },
  { name: "Frango coxa sem pele cozida", category: "Proteína", protein: 0.262, carbs: 0.000, fat: 0.073 },
  { name: "Frango sobrecoxa sem pele cozida", category: "Proteína", protein: 0.239, carbs: 0.000, fat: 0.105 },
  { name: "Carne bovina patinho grelhado", category: "Proteína", protein: 0.359, carbs: 0.000, fat: 0.030 },
  { name: "Carne bovina alcatra grelhada", category: "Proteína", protein: 0.324, carbs: 0.000, fat: 0.060 },
  { name: "Carne bovina coxão mole grelhado", category: "Proteína", protein: 0.324, carbs: 0.000, fat: 0.073 },
  { name: "Carne bovina maminha grelhada", category: "Proteína", protein: 0.288, carbs: 0.000, fat: 0.110 },
  { name: "Carne bovina acém moído cozido", category: "Proteína", protein: 0.267, carbs: 0.000, fat: 0.098 },
  { name: "Carne bovina filé mignon grelhado", category: "Proteína", protein: 0.328, carbs: 0.000, fat: 0.060 },
  { name: "Carne suína lombo assado", category: "Proteína", protein: 0.334, carbs: 0.000, fat: 0.060 },
  { name: "Carne suína bisteca grelhada", category: "Proteína", protein: 0.290, carbs: 0.000, fat: 0.080 },

  // Proteínas - Ovos e laticínios
  { name: "Ovo de galinha inteiro cozido", category: "Proteína", protein: 0.133, carbs: 0.006, fat: 0.089 },
  { name: "Ovo de galinha clara cozida", category: "Proteína", protein: 0.111, carbs: 0.007, fat: 0.000 },
  { name: "Leite integral", category: "Proteína", protein: 0.032, carbs: 0.047, fat: 0.031 },
  { name: "Leite desnatado", category: "Proteína", protein: 0.034, carbs: 0.048, fat: 0.003 },
  { name: "Queijo minas frescal", category: "Proteína", protein: 0.174, carbs: 0.032, fat: 0.202 },
  { name: "Queijo muçarela", category: "Proteína", protein: 0.226, carbs: 0.030, fat: 0.252 },
  { name: "Queijo cottage", category: "Proteína", protein: 0.136, carbs: 0.030, fat: 0.043 },
  { name: "Iogurte natural", category: "Proteína", protein: 0.041, carbs: 0.052, fat: 0.030 },
  { name: "Iogurte desnatado", category: "Proteína", protein: 0.038, carbs: 0.055, fat: 0.003 },
  { name: "Whey protein concentrado", category: "Proteína", protein: 0.800, carbs: 0.070, fat: 0.050 },
  { name: "Ricota", category: "Proteína", protein: 0.126, carbs: 0.034, fat: 0.080 },

  // Proteínas - Peixes
  { name: "Tilápia grelhada", category: "Proteína", protein: 0.247, carbs: 0.000, fat: 0.027 },
  { name: "Salmão grelhado", category: "Proteína", protein: 0.238, carbs: 0.000, fat: 0.124 },
  { name: "Atum em conserva", category: "Proteína", protein: 0.262, carbs: 0.000, fat: 0.027 },
  { name: "Sardinha assada", category: "Proteína", protein: 0.284, carbs: 0.000, fat: 0.081 },
  { name: "Camarão cozido", category: "Proteína", protein: 0.228, carbs: 0.000, fat: 0.010 },

  // Leguminosas
  { name: "Feijão carioca cozido", category: "Proteína", protein: 0.048, carbs: 0.136, fat: 0.005 },
  { name: "Feijão preto cozido", category: "Proteína", protein: 0.045, carbs: 0.140, fat: 0.005 },
  { name: "Lentilha cozida", category: "Proteína", protein: 0.063, carbs: 0.163, fat: 0.005 },
  { name: "Grão-de-bico cozido", category: "Proteína", protein: 0.089, carbs: 0.186, fat: 0.026 },
  { name: "Soja cozida", category: "Proteína", protein: 0.150, carbs: 0.075, fat: 0.070 },
  { name: "Ervilha cozida", category: "Proteína", protein: 0.070, carbs: 0.140, fat: 0.004 },

  // Gorduras
  { name: "Azeite de oliva", category: "Gorduras", protein: 0.000, carbs: 0.000, fat: 1.000 },
  { name: "Óleo de coco", category: "Gorduras", protein: 0.000, carbs: 0.000, fat: 1.000 },
  { name: "Manteiga", category: "Gorduras", protein: 0.004, carbs: 0.000, fat: 0.824 },
  { name: "Castanha do Pará", category: "Gorduras", protein: 0.145, carbs: 0.079, fat: 0.635 },
  { name: "Castanha de caju", category: "Gorduras", protein: 0.185, carbs: 0.291, fat: 0.463 },
  { name: "Amendoim torrado", category: "Gorduras", protein: 0.272, carbs: 0.117, fat: 0.440 },
  { name: "Amêndoas", category: "Gorduras", protein: 0.186, carbs: 0.295, fat: 0.473 },
  { name: "Nozes", category: "Gorduras", protein: 0.140, carbs: 0.184, fat: 0.594 },
  { name: "Pasta de amendoim", category: "Gorduras", protein: 0.240, carbs: 0.210, fat: 0.500 },
  { name: "Linhaça", category: "Gorduras", protein: 0.141, carbs: 0.433, fat: 0.323 },
  { name: "Chia", category: "Gorduras", protein: 0.165, carbs: 0.421, fat: 0.307 },
  { name: "Abacate (polpa)", category: "Gorduras", protein: 0.012, carbs: 0.060, fat: 0.084 },

  // Verduras e Legumes
  { name: "Brócolis cozido", category: "Outros", protein: 0.021, carbs: 0.044, fat: 0.005 },
  { name: "Espinafre cozido", category: "Outros", protein: 0.026, carbs: 0.020, fat: 0.002 },
  { name: "Couve refogada", category: "Outros", protein: 0.029, carbs: 0.043, fat: 0.012 },
  { name: "Alface crespa", category: "Outros", protein: 0.013, carbs: 0.017, fat: 0.002 },
  { name: "Tomate", category: "Outros", protein: 0.011, carbs: 0.031, fat: 0.002 },
  { name: "Cenoura crua", category: "Outros", protein: 0.013, carbs: 0.077, fat: 0.002 },
  { name: "Beterraba cozida", category: "Outros", protein: 0.012, carbs: 0.072, fat: 0.001 },
  { name: "Chuchu cozido", category: "Outros", protein: 0.004, carbs: 0.030, fat: 0.001 },
  { name: "Abobrinha cozida", category: "Outros", protein: 0.007, carbs: 0.030, fat: 0.003 },
  { name: "Pepino", category: "Outros", protein: 0.009, carbs: 0.020, fat: 0.001 },
  { name: "Pimentão verde", category: "Outros", protein: 0.011, carbs: 0.049, fat: 0.002 },
  { name: "Berinjela cozida", category: "Outros", protein: 0.007, carbs: 0.034, fat: 0.002 },
  { name: "Vagem cozida", category: "Outros", protein: 0.016, carbs: 0.050, fat: 0.002 },
  { name: "Quiabo cozido", category: "Outros", protein: 0.014, carbs: 0.046, fat: 0.002 },
  { name: "Abóbora cozida", category: "Outros", protein: 0.007, carbs: 0.048, fat: 0.001 },
  { name: "Repolho cru", category: "Outros", protein: 0.009, carbs: 0.042, fat: 0.001 },
  { name: "Cogumelo champignon", category: "Outros", protein: 0.025, carbs: 0.041, fat: 0.003 },
];
