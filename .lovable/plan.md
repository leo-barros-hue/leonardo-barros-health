

# Plano: Toggle Dark/Light Theme

## Resumo

Adicionar um botão de alternância entre tema escuro (atual) e tema claro na sidebar e no layout do paciente, persistindo a preferência no `localStorage`.

## Alterações

### 1. `src/index.css` — Adicionar variáveis do tema claro

Criar um bloco `.light` (ou `:root` para light, `.dark` para dark) com a paleta clara:
- Background: `0 0% 98%` (branco suave)
- Foreground: `0 0% 10%` (texto escuro)
- Card: `0 0% 100%` (branco)
- Border: `0 0% 88%`
- Muted: `0 0% 94%`
- Primary permanece `210 100% 56%` (azul elétrico)
- Sidebar: fundo branco, texto escuro
- Sombras mais leves
- Scrollbar adaptada

Manter `:root` como dark (padrão), e definir `.light` que sobrescreve as variáveis.

### 2. `src/hooks/useTheme.ts` — Novo hook de tema

- Lê/salva preferência em `localStorage` (chave `theme`)
- Aplica/remove classe `light` no `document.documentElement`
- Retorna `{ theme, toggleTheme }`

### 3. `src/components/AdminSidebar.tsx` — Botão de toggle

- Adicionar botão com ícone `Sun`/`Moon` no footer da sidebar (ao lado de "Recolher")
- Ao clicar, alterna o tema

### 4. `src/layouts/PatientLayout.tsx` — Botão de toggle

- Adicionar ícone `Sun`/`Moon` no header do paciente

### 5. `src/pages/Login.tsx` — Botão de toggle

- Adicionar no canto superior direito da tela de login

### 6. `tailwind.config.ts`

- Alterar `darkMode` de `["class"]` para `["class"]` (já está correto, funciona com classe no html)

## Paleta Light (valores principais)

| Token | Dark (atual) | Light |
|-------|-------------|-------|
| background | 0 0% 0% | 0 0% 98% |
| foreground | 0 0% 95% | 0 0% 10% |
| card | 0 0% 5% | 0 0% 100% |
| card-foreground | 0 0% 95% | 0 0% 10% |
| border | 0 0% 14% | 0 0% 88% |
| muted | 0 0% 15% | 0 0% 94% |
| muted-foreground | 0 0% 50% | 0 0% 45% |
| accent | 0 0% 12% | 210 20% 96% |
| popover | 0 0% 7% | 0 0% 100% |
| sidebar-background | 0 0% 0% | 0 0% 100% |

## Comportamento

- Dark é o padrão (se nenhuma preferência salva)
- Toggle persiste em `localStorage`
- Transição suave de 200ms ao alternar

