import { useState, useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { format } from "date-fns";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Heading from "@tiptap/extension-heading";
import { TextStyle } from "@tiptap/extension-text-style";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Loader2, Clock, FileText, Check, CalendarDays, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import AnamnesisToolbar from "./AnamnesisToolbar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface Anamnesis {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface AnamnesisTabProps {
  patientId: string;
}

const AnamnesisTab = ({ patientId }: AnamnesisTabProps) => {
  const [records, setRecords] = useState<Anamnesis[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [editingDateId, setEditingDateId] = useState<string | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: [1, 2, 3] }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setDirty(true);
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        if (activeId) {
          saveContent(activeId, editor.getHTML());
        }
      }, 1500);
    },
  });

  // Fetch all anamneses
  useEffect(() => {
    const fetchRecords = async () => {
      const { data } = await supabase
        .from("anamneses")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });
      const items = (data as Anamnesis[]) || [];
      setRecords(items);
      if (items.length > 0 && !activeId) {
        setActiveId(items[0].id);
        editor?.commands.setContent(items[0].content || "");
      }
      setLoading(false);
    };
    fetchRecords();
  }, [patientId]);

  // Load content when activeId changes
  useEffect(() => {
    if (!activeId || !editor) return;
    const record = records.find((r) => r.id === activeId);
    if (record) {
      const currentContent = editor.getHTML();
      if (currentContent !== record.content) {
        editor.commands.setContent(record.content || "");
      }
      setDirty(false);
    }
  }, [activeId]);

  const saveContent = useCallback(
    async (id: string, html: string) => {
      setSaving(true);
      const { error } = await supabase
        .from("anamneses")
        .update({ content: html, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) {
        toast.error("Erro ao salvar anamnese");
      } else {
        setDirty(false);
        setRecords((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, content: html, updated_at: new Date().toISOString() } : r
          )
        );
      }
      setSaving(false);
    },
    []
  );

  const createNew = async () => {
    const { data, error } = await supabase
      .from("anamneses")
      .insert({ patient_id: patientId, content: "" })
      .select()
      .single();
    if (error) {
      toast.error("Erro ao criar anamnese");
      return;
    }
    const newRecord = data as Anamnesis;
    setRecords((prev) => [newRecord, ...prev]);
    setActiveId(newRecord.id);
    editor?.commands.setContent("");
    setDirty(false);
    toast.success("Nova anamnese criada");
  };

  const updateRecordDate = async (recordId: string, newDate: Date) => {
    const record = records.find((r) => r.id === recordId);
    if (!record) return;
    // Preserve original time, change only date
    const original = new Date(record.created_at);
    newDate.setHours(original.getHours(), original.getMinutes(), original.getSeconds());
    const iso = newDate.toISOString();
    const { error } = await supabase
      .from("anamneses")
      .update({ created_at: iso })
      .eq("id", recordId);
    if (error) {
      toast.error("Erro ao atualizar data");
      return;
    }
    setRecords((prev) =>
      prev
        .map((r) => (r.id === recordId ? { ...r, created_at: iso } : r))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    );
    setEditingDateId(null);
    toast.success("Data atualizada");
  };

  const switchRecord = (record: Anamnesis) => {
    if (dirty && activeId) {
      if (editor) {
        saveContent(activeId, editor.getHTML());
      }
    }
    setActiveId(record.id);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) + " - " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative flex gap-0 min-h-[600px]">
      {/* History Sidebar */}
      <div
        onMouseEnter={() => setHistoryOpen(true)}
        onMouseLeave={() => setHistoryOpen(false)}
        className={cn(
          "absolute left-0 top-0 bottom-0 z-20 flex flex-col glass-card border border-border rounded-xl overflow-hidden transition-all duration-300 ease-in-out",
          historyOpen ? "w-72 opacity-100 shadow-xl" : "w-10 opacity-80"
        )}
      >
        {/* Collapsed indicator */}
        <div className={cn(
          "flex items-center justify-center py-4 transition-opacity duration-200",
          historyOpen ? "hidden" : "flex flex-col gap-2"
        )}>
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground [writing-mode:vertical-lr] rotate-180 tracking-widest uppercase">
            Histórico
          </span>
        </div>

        {/* Expanded content */}
        <div className={cn(
          "flex flex-col h-full transition-opacity duration-200",
          historyOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Histórico</h3>
            <Button size="sm" variant="ghost" onClick={createNew} className="h-7 w-7 p-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {records.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhuma anamnese</p>
              ) : (
                records.map((record) => (
                  <button
                    key={record.id}
                    onClick={() => switchRecord(record)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 group",
                      activeId === record.id
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-xs font-medium flex-1">{formatDate(record.created_at)}</span>
                      <Popover open={editingDateId === record.id} onOpenChange={(open) => { if (!open) setEditingDateId(null); }}>
                        <PopoverTrigger asChild>
                          <span
                            role="button"
                            onClick={(e) => { e.stopPropagation(); setEditingDateId(record.id); }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-primary"
                          >
                            <Pencil className="w-3 h-3" />
                          </span>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start" onClick={(e) => e.stopPropagation()}>
                          <Calendar
                            mode="single"
                            selected={new Date(record.created_at)}
                            onSelect={(date) => date && updateRecordDate(record.id, date)}
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    {record.content && (
                      <p className="text-[11px] mt-1 ml-5.5 line-clamp-1 opacity-60">
                        {record.content.replace(/<[^>]*>/g, "").slice(0, 50)}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        historyOpen ? "ml-72" : "ml-10"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">Anamnese</h2>
            {dirty && (
              <span className="text-xs text-amber-500 flex items-center gap-1 animate-pulse">
                ● Não salvo
              </span>
            )}
            {saving && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Salvando...
              </span>
            )}
            {!dirty && !saving && activeId && (
              <span className="text-xs text-emerald-500 flex items-center gap-1">
                <Check className="w-3 h-3" /> Salvo
              </span>
            )}
          </div>
          <Button onClick={createNew} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            Nova Anamnese
          </Button>
        </div>

        {records.length === 0 && !activeId ? (
          <div className="glass-card p-12 text-center flex flex-col items-center gap-4">
            <FileText className="w-10 h-10 text-muted-foreground/40" />
            <div>
              <h3 className="text-base font-semibold text-foreground mb-1">Nenhuma anamnese registrada</h3>
              <p className="text-sm text-muted-foreground">Clique em "Nova Anamnese" para iniciar o registro.</p>
            </div>
          </div>
        ) : editor ? (
          <div className="glass-card border border-border rounded-xl overflow-hidden flex flex-col">
            {/* Registration date */}
            {activeId && (() => {
              const activeRecord = records.find(r => r.id === activeId);
              return activeRecord ? (
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary/10 text-xs text-muted-foreground">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>Data de registro: <span className="font-medium text-foreground">{format(new Date(activeRecord.created_at), "dd/MM/yyyy")}</span></span>
                  <Popover open={editingDateId === activeRecord.id} onOpenChange={(open) => { if (!open) setEditingDateId(null); }}>
                    <PopoverTrigger asChild>
                      <button onClick={() => setEditingDateId(activeRecord.id)} className="ml-1 text-muted-foreground hover:text-primary transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={new Date(activeRecord.created_at)}
                        onSelect={(date) => date && updateRecordDate(activeRecord.id, date)}
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              ) : null;
            })()}
            <AnamnesisToolbar editor={editor} />
            <EditorContent
              editor={editor}
              className="prose prose-sm max-w-none p-6 min-h-[480px] focus:outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-[460px] text-foreground [&_.tiptap_h1]:text-2xl [&_.tiptap_h1]:font-bold [&_.tiptap_h2]:text-xl [&_.tiptap_h2]:font-semibold [&_.tiptap_h3]:text-lg [&_.tiptap_h3]:font-medium [&_.tiptap_mark]:bg-yellow-200/60 [&_.tiptap_mark]:rounded-sm [&_.tiptap_mark]:px-0.5"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AnamnesisTab;
