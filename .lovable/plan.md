

# Plano: Blocos/Seções para organizar perguntas nos formulários

## Resumo

Adicionar um conceito de "bloco" (seção) ao editor de formulários, permitindo agrupar perguntas sob títulos como "Identificação e Dados Pessoais", "História Médica Pregressa", etc.

## Abordagem

Usar a coluna `description` da tabela `form_questions` com um novo `question_type` chamado `"section"` para representar separadores de bloco. Isso evita migração de banco de dados -- os blocos são apenas itens especiais na lista de perguntas que renderizam como cabeçalhos visuais.

## Alterações

### 1. FormTemplateDialog.tsx (Editor)

- Adicionar tipo `"section"` ao array `QUESTION_TYPES` com label "Bloco / Seção"
- Quando o tipo for `"section"`, o campo `question_text` funciona como título do bloco e `description` como subtítulo opcional
- Não exibir configurações de obrigatória, imagem, opções para blocos
- Adicionar botão "Adicionar Bloco" ao lado de "Adicionar Pergunta"
- Renderizar blocos com visual diferenciado (ícone de seção, fundo mais destacado, borda colorida)

### 2. FormPreviewDialog.tsx (Pré-visualização)

- Quando `question_type === "section"`, renderizar como cabeçalho de seção (título maior, separador visual) em vez de campo de resposta

### 3. FormFill.tsx (Preenchimento pelo paciente)

- Quando `question_type === "section"`, renderizar como cabeçalho visual sem campo de input
- Não contar blocos no cálculo de progresso nem na validação de obrigatórias

### 4. FormResponsesDialog.tsx (Visualização de respostas)

- Pular itens do tipo `"section"` na listagem de respostas, ou usá-los como separadores visuais

## Design Visual dos Blocos

No editor: card com borda colorida à esquerda, ícone de seção, fundo levemente diferente
No formulário do paciente: título em destaque com linha separadora, criando agrupamento visual claro

## Sem migração de banco

Reutiliza a estrutura existente de `form_questions` -- o bloco é salvo como uma "pergunta" com `question_type = 'section'`.

