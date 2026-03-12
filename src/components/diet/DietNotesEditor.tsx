import { useEffect, useRef, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  RemoveFormatting, Palette, FileText,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DietNotesEditorProps {
  dietId: string;
  initialContent: string;
}

const TEXT_COLORS = [
  "#000000", "#374151", "#6B7280", "#DC2626", "#EA580C", "#D97706",
  "#16A34A", "#0891B2", "#2563EB", "#7C3AED", "#DB2777", "#FFFFFF",
];

const DietNotesEditor = ({ dietId, initialContent }: DietNotesEditorProps) => {
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [colorOpen, setColorOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["paragraph"] }),
    ],
    content: initialContent || "",
    onUpdate: ({ editor }) => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        saveNotes(editor.getHTML());
      }, 1000);
    },
  });

  useEffect(() => {
    if (editor && initialContent !== undefined) {
      const currentContent = editor.getHTML();
      if (currentContent !== initialContent) {
        editor.commands.setContent(initialContent || "");
      }
    }
  }, [dietId]);

  const saveNotes = useCallback(async (html: string) => {
    const { error } = await supabase
      .from("diets")
      .update({ notes: html })
      .eq("id", dietId);
    if (error) {
      toast.error("Erro ao salvar observações");
    }
  }, [dietId]);

  if (!editor) return null;

  const ToolbarButton = ({
    active,
    onClick,
    children,
    title,
  }: {
    active?: boolean;
    onClick: () => void;
    children: React.ReactNode;
    title?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="glass-card p-5 border border-border">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Observações
        </h3>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-border bg-secondary/20">
          <ToolbarButton
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Negrito"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Itálico"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Sublinhado"
          >
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Tachado"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>

          <div className="w-px h-5 bg-border mx-1" />

          <ToolbarButton
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Lista numerada"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Lista com marcadores"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>

          <div className="w-px h-5 bg-border mx-1" />

          <ToolbarButton
            active={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            title="Alinhar à esquerda"
          >
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            title="Centralizar"
          >
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            title="Alinhar à direita"
          >
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive({ textAlign: "justify" })}
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            title="Justificar"
          >
            <AlignJustify className="w-4 h-4" />
          </ToolbarButton>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Color Picker */}
          <Popover open={colorOpen} onOpenChange={setColorOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                title="Cor do texto"
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              >
                <Palette className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="start">
              <div className="grid grid-cols-6 gap-1">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      editor.chain().focus().setColor(color).run();
                      setColorOpen(false);
                    }}
                    className="w-6 h-6 rounded-md border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <ToolbarButton
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            title="Limpar formatação"
          >
            <RemoveFormatting className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Editor Content */}
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none p-4 min-h-[160px] focus:outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-[140px] text-foreground"
        />
      </div>
    </div>
  );
};

export default DietNotesEditor;
