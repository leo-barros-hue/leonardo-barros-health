

# Plano: Página de Materiais (PDFs + Vídeos YouTube)

## Resumo

Criar uma página completa de biblioteca de conteúdos com duas abas (PDFs e Vídeos), acessível pelo menu lateral, com upload de PDFs para storage e embed de vídeos do YouTube.

## Banco de Dados

Criar duas tabelas:

**`materials_pdfs`**: id, name, description, category, file_url, file_name, created_at
**`materials_videos`**: id, title, description, youtube_url, youtube_id, created_at

RLS: authenticated users podem CRUD (admin gerencia via interface, pacientes apenas visualizam via lógica de UI).

Criar um bucket de storage `materials` (público) para os arquivos PDF.

## Menu Lateral

Adicionar "Materiais" como item direto no `navItems` do `AdminSidebar.tsx`, com ícone `BookOpen`, apontando para `/admin/materials`.

## Rota

Adicionar `<Route path="materials" element={<AdminMaterials />} />` no `App.tsx`.

## Página `AdminMaterials.tsx`

- Layout com tabs: "PDFs" e "Vídeos"
- **Aba PDFs**:
  - Botão "+ Adicionar PDF" abre dialog com campos: nome, descrição, categoria (opcional), upload do arquivo
  - Upload vai para bucket `materials` no storage
  - Grid responsivo de cards com ícone PDF, nome, descrição, botões "Baixar" e "Visualizar" (nova aba), "Excluir"
  - Ordenação por data
- **Aba Vídeos**:
  - Botão "+ Adicionar Vídeo" abre dialog com campos: URL do YouTube, título, descrição
  - Extração automática do ID do vídeo da URL
  - Grid responsivo de cards com player embed do YouTube, título, descrição, botão "Remover"

## Componentes Novos

1. **`src/pages/admin/AdminMaterials.tsx`** - Página principal com tabs
2. **`src/components/materials/PdfUploadDialog.tsx`** - Dialog de upload de PDF
3. **`src/components/materials/VideoAddDialog.tsx`** - Dialog de adição de vídeo

## Design

- Cards com fundo branco, borda leve, sombra suave, bordas arredondadas
- Hover com elevação sutil (shadow transition)
- Grid: 3 colunas desktop, 1 coluna mobile
- Estilo consistente com o restante da aplicação

## Detalhes Técnicos

- Upload de PDF via Supabase Storage (`materials` bucket)
- Extração de YouTube ID via regex para gerar embed `https://www.youtube.com/embed/{id}`
- Queries via `@tanstack/react-query` para fetch/mutate dos dados
- Validação de URL do YouTube antes de salvar

