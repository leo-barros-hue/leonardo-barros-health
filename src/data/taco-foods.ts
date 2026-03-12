// Tabela TACO (Tabela Brasileira de Composição de Alimentos) - 4ª Edição - UNICAMP
// Valores por 1g do alimento (dividido por 100 a partir dos valores originais por 100g)
export interface TabelaFood {
  name: string;
  category: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export const tacoFoods: TabelaFood[] = [
  // ═══════════════════════════════════════════
  // CARBOIDRATOS
  // ═══════════════════════════════════════════

  // Cereais e derivados
  { name: "Arroz integral cozido", category: "Carboidratos", kcal: 1.24, protein: 0.026, carbs: 0.258, fat: 0.010, fiber: 0.027 },
  { name: "Arroz integral cru", category: "Carboidratos", kcal: 3.60, protein: 0.073, carbs: 0.775, fat: 0.019, fiber: 0.048 },
  { name: "Arroz tipo 1 cozido", category: "Carboidratos", kcal: 1.28, protein: 0.025, carbs: 0.281, fat: 0.002, fiber: 0.016 },
  { name: "Arroz tipo 1 cru", category: "Carboidratos", kcal: 3.58, protein: 0.072, carbs: 0.788, fat: 0.003, fiber: 0.016 },
  { name: "Arroz tipo 2 cozido", category: "Carboidratos", kcal: 1.30, protein: 0.026, carbs: 0.282, fat: 0.004, fiber: 0.011 },
  { name: "Arroz tipo 2 cru", category: "Carboidratos", kcal: 3.58, protein: 0.072, carbs: 0.789, fat: 0.003, fiber: 0.017 },
  { name: "Aveia em flocos crua", category: "Carboidratos", kcal: 3.94, protein: 0.139, carbs: 0.666, fat: 0.085, fiber: 0.091 },
  { name: "Biscoito doce maisena", category: "Carboidratos", kcal: 4.43, protein: 0.081, carbs: 0.752, fat: 0.120, fiber: 0.021 },
  { name: "Biscoito doce wafer recheado chocolate", category: "Carboidratos", kcal: 5.02, protein: 0.056, carbs: 0.675, fat: 0.247, fiber: 0.018 },
  { name: "Biscoito doce wafer recheado morango", category: "Carboidratos", kcal: 5.13, protein: 0.045, carbs: 0.674, fat: 0.264, fiber: 0.008 },
  { name: "Biscoito salgado cream cracker", category: "Carboidratos", kcal: 4.32, protein: 0.101, carbs: 0.687, fat: 0.144, fiber: 0.025 },
  { name: "Canjica branca crua", category: "Carboidratos", kcal: 3.58, protein: 0.072, carbs: 0.781, fat: 0.010, fiber: 0.055 },
  { name: "Canjica com leite integral", category: "Carboidratos", kcal: 1.12, protein: 0.024, carbs: 0.236, fat: 0.012, fiber: 0.012 },
  { name: "Cereais milho flocos com sal", category: "Carboidratos", kcal: 3.70, protein: 0.073, carbs: 0.808, fat: 0.016, fiber: 0.053 },
  { name: "Cereais milho flocos sem sal", category: "Carboidratos", kcal: 3.63, protein: 0.069, carbs: 0.804, fat: 0.012, fiber: 0.018 },
  { name: "Cereais mingau milho infantil", category: "Carboidratos", kcal: 3.94, protein: 0.064, carbs: 0.873, fat: 0.011, fiber: 0.032 },
  { name: "Cereais mistura vitamina trigo cevada aveia", category: "Carboidratos", kcal: 3.81, protein: 0.089, carbs: 0.816, fat: 0.021, fiber: 0.050 },
  { name: "Cereal matinal milho", category: "Carboidratos", kcal: 3.65, protein: 0.072, carbs: 0.838, fat: 0.010, fiber: 0.041 },
  { name: "Cereal matinal milho com açúcar", category: "Carboidratos", kcal: 3.77, protein: 0.047, carbs: 0.888, fat: 0.007, fiber: 0.021 },
  { name: "Farinha de arroz enriquecida", category: "Carboidratos", kcal: 3.63, protein: 0.013, carbs: 0.855, fat: 0.003, fiber: 0.006 },
  { name: "Farinha de centeio integral", category: "Carboidratos", kcal: 3.36, protein: 0.125, carbs: 0.733, fat: 0.018, fiber: 0.155 },
  { name: "Farinha de rosca", category: "Carboidratos", kcal: 3.71, protein: 0.114, carbs: 0.758, fat: 0.015, fiber: 0.048 },
  { name: "Farinha de trigo", category: "Carboidratos", kcal: 3.60, protein: 0.098, carbs: 0.751, fat: 0.014, fiber: 0.023 },
  { name: "Farinha láctea de cereais", category: "Carboidratos", kcal: 4.15, protein: 0.119, carbs: 0.778, fat: 0.058, fiber: 0.019 },
  { name: "Macarrão trigo cru", category: "Carboidratos", kcal: 3.71, protein: 0.100, carbs: 0.779, fat: 0.013, fiber: 0.029 },
  { name: "Macarrão trigo cru com ovos", category: "Carboidratos", kcal: 3.71, protein: 0.103, carbs: 0.766, fat: 0.020, fiber: 0.023 },
  { name: "Milho verde cru", category: "Carboidratos", kcal: 1.38, protein: 0.066, carbs: 0.286, fat: 0.006, fiber: 0.039 },
  { name: "Milho verde enlatado drenado", category: "Carboidratos", kcal: 0.98, protein: 0.032, carbs: 0.171, fat: 0.024, fiber: 0.046 },
  { name: "Pão de aveia forma", category: "Carboidratos", kcal: 3.43, protein: 0.124, carbs: 0.596, fat: 0.057, fiber: 0.060 },
  { name: "Pão de soja", category: "Carboidratos", kcal: 3.09, protein: 0.113, carbs: 0.565, fat: 0.036, fiber: 0.057 },
  { name: "Pão de glúten forma", category: "Carboidratos", kcal: 2.53, protein: 0.120, carbs: 0.441, fat: 0.027, fiber: 0.025 },
  { name: "Pão de milho forma", category: "Carboidratos", kcal: 2.92, protein: 0.083, carbs: 0.564, fat: 0.031, fiber: 0.043 },
  { name: "Pão trigo forma integral", category: "Carboidratos", kcal: 2.53, protein: 0.094, carbs: 0.499, fat: 0.037, fiber: 0.069 },
  { name: "Pão trigo francês", category: "Carboidratos", kcal: 3.00, protein: 0.080, carbs: 0.586, fat: 0.031, fiber: 0.023 },
  { name: "Pão trigo sovado", category: "Carboidratos", kcal: 3.11, protein: 0.084, carbs: 0.615, fat: 0.028, fiber: 0.024 },
  { name: "Polenta pré-cozida", category: "Carboidratos", kcal: 1.03, protein: 0.023, carbs: 0.233, fat: 0.003, fiber: 0.024 },
  { name: "Torrada pão francês", category: "Carboidratos", kcal: 3.77, protein: 0.105, carbs: 0.746, fat: 0.033, fiber: 0.034 },

  // Tubérculos e raízes
  { name: "Batata baroa cozida", category: "Carboidratos", kcal: 0.80, protein: 0.009, carbs: 0.189, fat: 0.002, fiber: 0.018 },
  { name: "Batata baroa crua", category: "Carboidratos", kcal: 1.01, protein: 0.010, carbs: 0.240, fat: 0.002, fiber: 0.021 },
  { name: "Batata doce cozida", category: "Carboidratos", kcal: 0.77, protein: 0.006, carbs: 0.184, fat: 0.001, fiber: 0.022 },
  { name: "Batata doce crua", category: "Carboidratos", kcal: 1.18, protein: 0.013, carbs: 0.282, fat: 0.001, fiber: 0.026 },
  { name: "Batata inglesa cozida", category: "Carboidratos", kcal: 0.52, protein: 0.012, carbs: 0.119, fat: 0.000, fiber: 0.013 },
  { name: "Batata inglesa crua", category: "Carboidratos", kcal: 0.64, protein: 0.018, carbs: 0.147, fat: 0.000, fiber: 0.012 },
  { name: "Batata inglesa frita", category: "Carboidratos", kcal: 2.67, protein: 0.050, carbs: 0.356, fat: 0.131, fiber: 0.081 },
  { name: "Farinha de mandioca crua", category: "Carboidratos", kcal: 3.61, protein: 0.016, carbs: 0.879, fat: 0.003, fiber: 0.064 },
  { name: "Farinha de mandioca torrada", category: "Carboidratos", kcal: 3.65, protein: 0.012, carbs: 0.892, fat: 0.003, fiber: 0.065 },
  { name: "Mandioca cozida", category: "Carboidratos", kcal: 1.25, protein: 0.006, carbs: 0.301, fat: 0.003, fiber: 0.016 },
  { name: "Mandioca crua", category: "Carboidratos", kcal: 1.51, protein: 0.011, carbs: 0.362, fat: 0.003, fiber: 0.019 },
  { name: "Farinha de mesocarpo de babaçu crua", category: "Carboidratos", kcal: 3.29, protein: 0.014, carbs: 0.792, fat: 0.002, fiber: 0.179 },
  { name: "Pinhão cozido", category: "Carboidratos", kcal: 1.74, protein: 0.030, carbs: 0.439, fat: 0.007, fiber: 0.156 },

  // ═══════════════════════════════════════════
  // PROTEÍNAS
  // ═══════════════════════════════════════════

  // Peixes e frutos do mar
  { name: "Atum conserva em óleo", category: "Proteína", kcal: 1.66, protein: 0.262, carbs: 0.000, fat: 0.060, fiber: 0.000 },
  { name: "Atum fresco cru", category: "Proteína", kcal: 1.18, protein: 0.257, carbs: 0.000, fat: 0.009, fiber: 0.000 },
  { name: "Camarão cozido", category: "Proteína", kcal: 0.90, protein: 0.190, carbs: 0.000, fat: 0.010, fiber: 0.000 },
  { name: "Merluza filé assado", category: "Proteína", kcal: 1.22, protein: 0.266, carbs: 0.000, fat: 0.009, fiber: 0.000 },
  { name: "Salmão sem pele fresco cru", category: "Proteína", kcal: 1.70, protein: 0.193, carbs: 0.000, fat: 0.097, fiber: 0.000 },
  { name: "Salmão sem pele fresco grelhado", category: "Proteína", kcal: 2.43, protein: 0.261, carbs: 0.000, fat: 0.145, fiber: 0.000 },
  { name: "Sardinha conserva em óleo", category: "Proteína", kcal: 2.85, protein: 0.159, carbs: 0.000, fat: 0.240, fiber: 0.000 },

  // Carnes bovinas
  { name: "Carne bovina acém moído cozido", category: "Proteína", kcal: 2.12, protein: 0.267, carbs: 0.000, fat: 0.109, fiber: 0.000 },
  { name: "Carne bovina acém sem gordura cozido", category: "Proteína", kcal: 2.15, protein: 0.273, carbs: 0.000, fat: 0.109, fiber: 0.000 },
  { name: "Carne bovina coxão mole sem gordura cozido", category: "Proteína", kcal: 2.19, protein: 0.324, carbs: 0.000, fat: 0.089, fiber: 0.000 },
  { name: "Carne bovina filé mignon sem gordura grelhado", category: "Proteína", kcal: 2.20, protein: 0.328, carbs: 0.000, fat: 0.088, fiber: 0.000 },
  { name: "Carne bovina alcatra sem gordura grelhado", category: "Proteína", kcal: 2.41, protein: 0.319, carbs: 0.000, fat: 0.116, fiber: 0.000 },
  { name: "Carne bovina patinho sem gordura grelhado", category: "Proteína", kcal: 2.19, protein: 0.359, carbs: 0.000, fat: 0.073, fiber: 0.000 },

  // Aves
  { name: "Frango peito com pele assado", category: "Proteína", kcal: 2.12, protein: 0.334, carbs: 0.000, fat: 0.076, fiber: 0.000 },
  { name: "Frango sobrecoxa sem pele assada", category: "Proteína", kcal: 2.33, protein: 0.292, carbs: 0.000, fat: 0.120, fiber: 0.000 },

  // Suínos e embutidos
  { name: "Linguiça de porco frita", category: "Proteína", kcal: 2.80, protein: 0.205, carbs: 0.000, fat: 0.213, fiber: 0.000 },
  { name: "Porco lombo assado", category: "Proteína", kcal: 2.10, protein: 0.357, carbs: 0.000, fat: 0.064, fiber: 0.000 },

  // Laticínios
  { name: "Creme de leite", category: "Proteína", kcal: 2.21, protein: 0.015, carbs: 0.045, fat: 0.225, fiber: 0.000 },
  { name: "Iogurte natural", category: "Proteína", kcal: 0.51, protein: 0.041, carbs: 0.019, fat: 0.030, fiber: 0.000 },
  { name: "Iogurte natural desnatado", category: "Proteína", kcal: 0.41, protein: 0.038, carbs: 0.058, fat: 0.003, fiber: 0.000 },
  { name: "Leite condensado", category: "Proteína", kcal: 3.13, protein: 0.077, carbs: 0.570, fat: 0.067, fiber: 0.000 },
  { name: "Leite de vaca integral em pó", category: "Proteína", kcal: 4.97, protein: 0.254, carbs: 0.392, fat: 0.269, fiber: 0.000 },
  { name: "Leite fermentado", category: "Proteína", kcal: 0.70, protein: 0.019, carbs: 0.157, fat: 0.001, fiber: 0.000 },
  { name: "Queijo minas frescal", category: "Proteína", kcal: 2.64, protein: 0.174, carbs: 0.032, fat: 0.202, fiber: 0.000 },
  { name: "Queijo minas meia cura", category: "Proteína", kcal: 3.21, protein: 0.212, carbs: 0.036, fat: 0.246, fiber: 0.000 },
  { name: "Queijo muçarela", category: "Proteína", kcal: 3.30, protein: 0.226, carbs: 0.030, fat: 0.252, fiber: 0.000 },
  { name: "Queijo parmesão", category: "Proteína", kcal: 4.53, protein: 0.356, carbs: 0.017, fat: 0.335, fiber: 0.000 },
  { name: "Queijo requeijão cremoso", category: "Proteína", kcal: 2.57, protein: 0.096, carbs: 0.024, fat: 0.234, fiber: 0.000 },
  { name: "Queijo ricota", category: "Proteína", kcal: 1.40, protein: 0.126, carbs: 0.038, fat: 0.081, fiber: 0.000 },

  // Leguminosas
  { name: "Feijão carioca cozido", category: "Proteína", kcal: 0.76, protein: 0.048, carbs: 0.136, fat: 0.005, fiber: 0.085 },
  { name: "Grão-de-bico cru", category: "Proteína", kcal: 3.55, protein: 0.212, carbs: 0.579, fat: 0.054, fiber: 0.124 },
  { name: "Lentilha crua", category: "Proteína", kcal: 3.39, protein: 0.232, carbs: 0.620, fat: 0.008, fiber: 0.169 },

  // ═══════════════════════════════════════════
  // GORDURAS
  // ═══════════════════════════════════════════
  { name: "Azeite de oliva extra virgem", category: "Gorduras", kcal: 8.84, protein: 0.000, carbs: 0.000, fat: 1.000, fiber: 0.000 },
  { name: "Manteiga com sal", category: "Gorduras", kcal: 7.26, protein: 0.004, carbs: 0.001, fat: 0.824, fiber: 0.000 },
  { name: "Margarina sem sal", category: "Gorduras", kcal: 5.93, protein: 0.000, carbs: 0.000, fat: 0.671, fiber: 0.000 },
  { name: "Óleo de canola", category: "Gorduras", kcal: 8.84, protein: 0.000, carbs: 0.000, fat: 1.000, fiber: 0.000 },
  { name: "Óleo de soja", category: "Gorduras", kcal: 8.84, protein: 0.000, carbs: 0.000, fat: 1.000, fiber: 0.000 },
  { name: "Azeitona verde conserva", category: "Gorduras", kcal: 1.37, protein: 0.009, carbs: 0.041, fat: 0.142, fiber: 0.038 },
  { name: "Castanha-de-caju torrada salgada", category: "Gorduras", kcal: 5.70, protein: 0.185, carbs: 0.291, fat: 0.463, fiber: 0.037 },
  { name: "Castanha-do-Brasil crua", category: "Gorduras", kcal: 6.43, protein: 0.145, carbs: 0.151, fat: 0.635, fiber: 0.079 },
  { name: "Coco cru", category: "Gorduras", kcal: 4.06, protein: 0.037, carbs: 0.104, fat: 0.420, fiber: 0.054 },
  { name: "Linhaça semente", category: "Gorduras", kcal: 4.95, protein: 0.141, carbs: 0.433, fat: 0.323, fiber: 0.335 },
  { name: "Noz crua", category: "Gorduras", kcal: 6.20, protein: 0.140, carbs: 0.184, fat: 0.594, fiber: 0.072 },

  // ═══════════════════════════════════════════
  // FRUTAS
  // ═══════════════════════════════════════════
  { name: "Abacate cru", category: "Frutas", kcal: 0.96, protein: 0.012, carbs: 0.060, fat: 0.084, fiber: 0.063 },
  { name: "Abacaxi cru", category: "Frutas", kcal: 0.48, protein: 0.009, carbs: 0.123, fat: 0.001, fiber: 0.010 },
  { name: "Acerola crua", category: "Frutas", kcal: 0.33, protein: 0.009, carbs: 0.080, fat: 0.002, fiber: 0.015 },
  { name: "Ameixa em calda enlatada", category: "Frutas", kcal: 1.83, protein: 0.004, carbs: 0.469, fat: 0.000, fiber: 0.005 },
  { name: "Ameixa crua", category: "Frutas", kcal: 0.53, protein: 0.008, carbs: 0.139, fat: 0.000, fiber: 0.024 },
  { name: "Banana da terra crua", category: "Frutas", kcal: 1.28, protein: 0.014, carbs: 0.337, fat: 0.002, fiber: 0.015 },
  { name: "Banana nanica crua", category: "Frutas", kcal: 0.92, protein: 0.014, carbs: 0.238, fat: 0.001, fiber: 0.019 },
  { name: "Banana ouro crua", category: "Frutas", kcal: 1.12, protein: 0.015, carbs: 0.293, fat: 0.002, fiber: 0.020 },
  { name: "Banana prata crua", category: "Frutas", kcal: 0.98, protein: 0.013, carbs: 0.260, fat: 0.001, fiber: 0.020 },
  { name: "Figo cru", category: "Frutas", kcal: 0.41, protein: 0.010, carbs: 0.102, fat: 0.002, fiber: 0.018 },
  { name: "Goiaba vermelha com casca crua", category: "Frutas", kcal: 0.54, protein: 0.011, carbs: 0.130, fat: 0.004, fiber: 0.062 },
  { name: "Kiwi cru", category: "Frutas", kcal: 0.51, protein: 0.013, carbs: 0.115, fat: 0.006, fiber: 0.027 },
  { name: "Laranja lima crua", category: "Frutas", kcal: 0.46, protein: 0.011, carbs: 0.115, fat: 0.001, fiber: 0.018 },
  { name: "Laranja pêra crua", category: "Frutas", kcal: 0.37, protein: 0.010, carbs: 0.089, fat: 0.001, fiber: 0.008 },
  { name: "Maçã Argentina com casca crua", category: "Frutas", kcal: 0.63, protein: 0.002, carbs: 0.166, fat: 0.002, fiber: 0.020 },
  { name: "Maçã Fuji com casca crua", category: "Frutas", kcal: 0.56, protein: 0.003, carbs: 0.152, fat: 0.000, fiber: 0.013 },
  { name: "Mamão Formosa cru", category: "Frutas", kcal: 0.45, protein: 0.008, carbs: 0.116, fat: 0.001, fiber: 0.018 },
  { name: "Mamão Papaia cru", category: "Frutas", kcal: 0.40, protein: 0.005, carbs: 0.104, fat: 0.001, fiber: 0.010 },
  { name: "Manga Palmer crua", category: "Frutas", kcal: 0.72, protein: 0.004, carbs: 0.194, fat: 0.002, fiber: 0.016 },
  { name: "Maracujá cru", category: "Frutas", kcal: 0.68, protein: 0.020, carbs: 0.123, fat: 0.021, fiber: 0.011 },
  { name: "Melancia crua", category: "Frutas", kcal: 0.33, protein: 0.009, carbs: 0.081, fat: 0.000, fiber: 0.001 },
  { name: "Melão cru", category: "Frutas", kcal: 0.29, protein: 0.007, carbs: 0.075, fat: 0.000, fiber: 0.003 },
  { name: "Morango cru", category: "Frutas", kcal: 0.30, protein: 0.009, carbs: 0.068, fat: 0.003, fiber: 0.017 },
  { name: "Pêra Williams crua", category: "Frutas", kcal: 0.53, protein: 0.006, carbs: 0.140, fat: 0.001, fiber: 0.030 },
  { name: "Pêssego Aurora cru", category: "Frutas", kcal: 0.36, protein: 0.008, carbs: 0.093, fat: 0.000, fiber: 0.014 },
  { name: "Tangerina Poncã crua", category: "Frutas", kcal: 0.38, protein: 0.008, carbs: 0.096, fat: 0.001, fiber: 0.009 },

  // ═══════════════════════════════════════════
  // OUTROS (Verduras e Legumes)
  // ═══════════════════════════════════════════
  { name: "Abóbora cabotian cozida", category: "Outros", kcal: 0.48, protein: 0.014, carbs: 0.108, fat: 0.007, fiber: 0.025 },
  { name: "Abóbora cabotian crua", category: "Outros", kcal: 0.39, protein: 0.017, carbs: 0.084, fat: 0.005, fiber: 0.022 },
  { name: "Abóbora menina brasileira crua", category: "Outros", kcal: 0.14, protein: 0.006, carbs: 0.033, fat: 0.000, fiber: 0.012 },
  { name: "Abóbora moranga crua", category: "Outros", kcal: 0.12, protein: 0.010, carbs: 0.027, fat: 0.001, fiber: 0.017 },
  { name: "Feijão broto cru", category: "Outros", kcal: 0.39, protein: 0.042, carbs: 0.078, fat: 0.001, fiber: 0.020 },
];
