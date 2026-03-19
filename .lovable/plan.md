

# Plano: Adicionar botão "Salvar Formulário" visível ao rolar

O botão de salvar já existe no topo da página, mas ao rolar para baixo com muitas perguntas ele fica fora de vista. A solução é torná-lo mais acessível.

## Alterações em `src/pages/admin/AdminFormEditor.tsx`

1. **Botão de salvar fixo (sticky)** -- Tornar o header com o botão "Salvar" sticky no topo da página, para que fique sempre visível mesmo ao rolar para baixo.

2. **Botão de salvar também no rodapé** -- Adicionar um segundo botão "Salvar Formulário" ao lado dos botões "Adicionar Bloco" e "Adicionar Pergunta" na parte inferior da página, para acesso rápido quando o usuário está no final do formulário.

## Detalhes técnicos

- Adicionar `sticky top-0 z-10 bg-background py-4` ao container do header para fixá-lo durante a rolagem
- Adicionar um `Button` com `handleSave` na seção inferior ao lado dos botões de adicionar

