// Tabela TACO (Tabela Brasileira de Composição de Alimentos) - UNICAMP
// Valores por 100g do alimento
export interface TabelaFood {
  name: string;
  category: string;
  protein: number;
  carbs: number;
  fat: number;
}

export const tacoFoods: TabelaFood[] = [
  // Cereais e derivados
  { name: "Arroz integral cozido", category: "Carboidratos", protein: 2.6, carbs: 25.8, fat: 1.0 },
  { name: "Arroz branco cozido", category: "Carboidratos", protein: 2.5, carbs: 28.1, fat: 0.2 },
  { name: "Aveia em flocos", category: "Carboidratos", protein: 13.9, carbs: 66.6, fat: 8.5 },
  { name: "Farinha de mandioca", category: "Carboidratos", protein: 1.6, carbs: 87.9, fat: 0.3 },
  { name: "Farinha de trigo", category: "Carboidratos", protein: 9.8, carbs: 75.1, fat: 1.4 },
  { name: "Macarrão cozido", category: "Carboidratos", protein: 3.4, carbs: 19.9, fat: 0.5 },
  { name: "Milho verde cozido", category: "Carboidratos", protein: 3.6, carbs: 18.3, fat: 1.0 },
  { name: "Pão francês", category: "Carboidratos", protein: 8.0, carbs: 58.6, fat: 3.1 },
  { name: "Pão integral", category: "Carboidratos", protein: 9.4, carbs: 44.1, fat: 3.4 },
  { name: "Tapioca", category: "Carboidratos", protein: 0.0, carbs: 87.2, fat: 0.1 },
  { name: "Cuscuz de milho cozido", category: "Carboidratos", protein: 2.2, carbs: 25.0, fat: 0.4 },
  { name: "Granola", category: "Carboidratos", protein: 10.0, carbs: 63.5, fat: 13.4 },
  { name: "Farinha de aveia", category: "Carboidratos", protein: 14.0, carbs: 66.0, fat: 7.0 },
  { name: "Biscoito cream cracker", category: "Carboidratos", protein: 10.1, carbs: 67.2, fat: 14.6 },
  { name: "Batata doce cozida", category: "Carboidratos", protein: 0.6, carbs: 18.4, fat: 0.1 },
  { name: "Batata inglesa cozida", category: "Carboidratos", protein: 1.2, carbs: 11.9, fat: 0.1 },
  { name: "Mandioca cozida", category: "Carboidratos", protein: 0.6, carbs: 30.1, fat: 0.3 },
  { name: "Inhame cozido", category: "Carboidratos", protein: 2.0, carbs: 23.2, fat: 0.1 },
  { name: "Cará cozido", category: "Carboidratos", protein: 1.5, carbs: 20.1, fat: 0.1 },

  // Frutas
  { name: "Abacate", category: "Frutas", protein: 1.2, carbs: 6.0, fat: 8.4 },
  { name: "Abacaxi", category: "Frutas", protein: 0.9, carbs: 12.3, fat: 0.1 },
  { name: "Açaí polpa", category: "Frutas", protein: 3.8, carbs: 6.2, fat: 29.6 },
  { name: "Banana prata", category: "Frutas", protein: 1.3, carbs: 26.0, fat: 0.1 },
  { name: "Banana nanica", category: "Frutas", protein: 1.4, carbs: 22.8, fat: 0.1 },
  { name: "Goiaba vermelha", category: "Frutas", protein: 1.1, carbs: 13.0, fat: 0.4 },
  { name: "Kiwi", category: "Frutas", protein: 1.3, carbs: 11.5, fat: 0.6 },
  { name: "Laranja pêra", category: "Frutas", protein: 1.0, carbs: 8.9, fat: 0.1 },
  { name: "Limão", category: "Frutas", protein: 0.9, carbs: 11.1, fat: 0.1 },
  { name: "Maçã", category: "Frutas", protein: 0.3, carbs: 15.2, fat: 0.0 },
  { name: "Mamão papaia", category: "Frutas", protein: 0.5, carbs: 11.6, fat: 0.1 },
  { name: "Manga", category: "Frutas", protein: 0.4, carbs: 12.8, fat: 0.2 },
  { name: "Melancia", category: "Frutas", protein: 0.9, carbs: 8.1, fat: 0.0 },
  { name: "Melão", category: "Frutas", protein: 0.7, carbs: 7.5, fat: 0.0 },
  { name: "Morango", category: "Frutas", protein: 0.9, carbs: 6.8, fat: 0.3 },
  { name: "Pêra", category: "Frutas", protein: 0.6, carbs: 14.0, fat: 0.1 },
  { name: "Uva itália", category: "Frutas", protein: 0.7, carbs: 14.0, fat: 0.2 },
  { name: "Tangerina", category: "Frutas", protein: 0.8, carbs: 12.4, fat: 0.1 },
  { name: "Coco ralado", category: "Frutas", protein: 3.7, carbs: 10.4, fat: 27.2 },
  { name: "Maracujá suco", category: "Frutas", protein: 0.4, carbs: 11.6, fat: 0.1 },

  // Proteínas - Carnes
  { name: "Frango peito sem pele grelhado", category: "Proteína", protein: 31.5, carbs: 0.0, fat: 3.2 },
  { name: "Frango coxa sem pele cozida", category: "Proteína", protein: 26.2, carbs: 0.0, fat: 7.3 },
  { name: "Frango sobrecoxa sem pele cozida", category: "Proteína", protein: 23.9, carbs: 0.0, fat: 10.5 },
  { name: "Carne bovina patinho grelhado", category: "Proteína", protein: 35.9, carbs: 0.0, fat: 3.0 },
  { name: "Carne bovina alcatra grelhada", category: "Proteína", protein: 32.4, carbs: 0.0, fat: 6.0 },
  { name: "Carne bovina coxão mole grelhado", category: "Proteína", protein: 32.4, carbs: 0.0, fat: 7.3 },
  { name: "Carne bovina maminha grelhada", category: "Proteína", protein: 28.8, carbs: 0.0, fat: 11.0 },
  { name: "Carne bovina acém moído cozido", category: "Proteína", protein: 26.7, carbs: 0.0, fat: 9.8 },
  { name: "Carne bovina filé mignon grelhado", category: "Proteína", protein: 32.8, carbs: 0.0, fat: 6.0 },
  { name: "Carne suína lombo assado", category: "Proteína", protein: 33.4, carbs: 0.0, fat: 6.0 },
  { name: "Carne suína bisteca grelhada", category: "Proteína", protein: 29.0, carbs: 0.0, fat: 8.0 },

  // Proteínas - Ovos e laticínios
  { name: "Ovo de galinha inteiro cozido", category: "Proteína", protein: 13.3, carbs: 0.6, fat: 8.9 },
  { name: "Ovo de galinha clara cozida", category: "Proteína", protein: 11.1, carbs: 0.7, fat: 0.0 },
  { name: "Leite integral", category: "Proteína", protein: 3.2, carbs: 4.7, fat: 3.1 },
  { name: "Leite desnatado", category: "Proteína", protein: 3.4, carbs: 4.8, fat: 0.3 },
  { name: "Queijo minas frescal", category: "Proteína", protein: 17.4, carbs: 3.2, fat: 20.2 },
  { name: "Queijo muçarela", category: "Proteína", protein: 22.6, carbs: 3.0, fat: 25.2 },
  { name: "Queijo cottage", category: "Proteína", protein: 13.6, carbs: 3.0, fat: 4.3 },
  { name: "Iogurte natural", category: "Proteína", protein: 4.1, carbs: 5.2, fat: 3.0 },
  { name: "Iogurte desnatado", category: "Proteína", protein: 3.8, carbs: 5.5, fat: 0.3 },
  { name: "Whey protein concentrado", category: "Proteína", protein: 80.0, carbs: 7.0, fat: 5.0 },
  { name: "Ricota", category: "Proteína", protein: 12.6, carbs: 3.4, fat: 8.0 },

  // Proteínas - Peixes
  { name: "Tilápia grelhada", category: "Proteína", protein: 24.7, carbs: 0.0, fat: 2.7 },
  { name: "Salmão grelhado", category: "Proteína", protein: 23.8, carbs: 0.0, fat: 12.4 },
  { name: "Atum em conserva", category: "Proteína", protein: 26.2, carbs: 0.0, fat: 2.7 },
  { name: "Sardinha assada", category: "Proteína", protein: 28.4, carbs: 0.0, fat: 8.1 },
  { name: "Camarão cozido", category: "Proteína", protein: 22.8, carbs: 0.0, fat: 1.0 },

  // Leguminosas
  { name: "Feijão carioca cozido", category: "Proteína", protein: 4.8, carbs: 13.6, fat: 0.5 },
  { name: "Feijão preto cozido", category: "Proteína", protein: 4.5, carbs: 14.0, fat: 0.5 },
  { name: "Lentilha cozida", category: "Proteína", protein: 6.3, carbs: 16.3, fat: 0.5 },
  { name: "Grão-de-bico cozido", category: "Proteína", protein: 8.9, carbs: 18.6, fat: 2.6 },
  { name: "Soja cozida", category: "Proteína", protein: 15.0, carbs: 7.5, fat: 7.0 },
  { name: "Ervilha cozida", category: "Proteína", protein: 7.0, carbs: 14.0, fat: 0.4 },

  // Gorduras
  { name: "Azeite de oliva", category: "Gorduras", protein: 0.0, carbs: 0.0, fat: 100.0 },
  { name: "Óleo de coco", category: "Gorduras", protein: 0.0, carbs: 0.0, fat: 100.0 },
  { name: "Manteiga", category: "Gorduras", protein: 0.4, carbs: 0.0, fat: 82.4 },
  { name: "Castanha do Pará", category: "Gorduras", protein: 14.5, carbs: 7.9, fat: 63.5 },
  { name: "Castanha de caju", category: "Gorduras", protein: 18.5, carbs: 29.1, fat: 46.3 },
  { name: "Amendoim torrado", category: "Gorduras", protein: 27.2, carbs: 11.7, fat: 44.0 },
  { name: "Amêndoas", category: "Gorduras", protein: 18.6, carbs: 29.5, fat: 47.3 },
  { name: "Nozes", category: "Gorduras", protein: 14.0, carbs: 18.4, fat: 59.4 },
  { name: "Pasta de amendoim", category: "Gorduras", protein: 24.0, carbs: 21.0, fat: 50.0 },
  { name: "Linhaça", category: "Gorduras", protein: 14.1, carbs: 43.3, fat: 32.3 },
  { name: "Chia", category: "Gorduras", protein: 16.5, carbs: 42.1, fat: 30.7 },
  { name: "Abacate (polpa)", category: "Gorduras", protein: 1.2, carbs: 6.0, fat: 8.4 },

  // Verduras e Legumes
  { name: "Brócolis cozido", category: "Outros", protein: 2.1, carbs: 4.4, fat: 0.5 },
  { name: "Espinafre cozido", category: "Outros", protein: 2.6, carbs: 2.0, fat: 0.2 },
  { name: "Couve refogada", category: "Outros", protein: 2.9, carbs: 4.3, fat: 1.2 },
  { name: "Alface crespa", category: "Outros", protein: 1.3, carbs: 1.7, fat: 0.2 },
  { name: "Tomate", category: "Outros", protein: 1.1, carbs: 3.1, fat: 0.2 },
  { name: "Cenoura crua", category: "Outros", protein: 1.3, carbs: 7.7, fat: 0.2 },
  { name: "Beterraba cozida", category: "Outros", protein: 1.2, carbs: 7.2, fat: 0.1 },
  { name: "Chuchu cozido", category: "Outros", protein: 0.4, carbs: 3.0, fat: 0.1 },
  { name: "Abobrinha cozida", category: "Outros", protein: 0.7, carbs: 3.0, fat: 0.3 },
  { name: "Pepino", category: "Outros", protein: 0.9, carbs: 2.0, fat: 0.1 },
  { name: "Pimentão verde", category: "Outros", protein: 1.1, carbs: 4.9, fat: 0.2 },
  { name: "Berinjela cozida", category: "Outros", protein: 0.7, carbs: 3.4, fat: 0.2 },
  { name: "Vagem cozida", category: "Outros", protein: 1.6, carbs: 5.0, fat: 0.2 },
  { name: "Quiabo cozido", category: "Outros", protein: 1.4, carbs: 4.6, fat: 0.2 },
  { name: "Abóbora cozida", category: "Outros", protein: 0.7, carbs: 4.8, fat: 0.1 },
  { name: "Repolho cru", category: "Outros", protein: 0.9, carbs: 4.2, fat: 0.1 },
  { name: "Cogumelo champignon", category: "Outros", protein: 2.5, carbs: 4.1, fat: 0.3 },
];
