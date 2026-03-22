import { useState, useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Heading from "@tiptap/extension-heading";
import { TextStyle } from "@tiptap/extension-text-style";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Plus, Loader2, Clock, FileText, Check, CalendarDays, Pencil, Trash2,
  Upload, File, Download, Eye, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import AnamnesisToolbar from "@/components/anamnesis/AnamnesisToolbar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Prescription {
  id: string;
  title: string;
  content: string;
  prescribed_at: string;
  created_at: string;
  type: string;
  pdf_url: string | null;
  pdf_file_name: string | null;
}

interface Props {
  patientId: string;
}

const PatientPrescriptionsTab = ({ patientId }: Props) => {
  const [records, setRecords] = useState<Prescription[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [editingDateKey, setEditingDateKey] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfUploadDate, setPdfUploadDate] = useState(new Date().toISOString().split("T")[0]);
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [viewPdfUrl, setViewPdfUrl] = useState<string | null>(null);
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
          const record = records.find(r => r.id === activeId);
          if (record?.type === "manual") {
            saveContent(activeId, editor.getHTML());
          }
        }
      }, 1500);
    },
  });

  useEffect(() => {
    fetchRecords();
  }, [patientId]);

  const fetchRecords = async () => {
    const { data } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("patient_id", patientId)
      .order("prescribed_at", { ascending: false });
    const items = (data as Prescription[]) || [];
    setRecords(items);
    if (items.length > 0 && !activeId) {
      const first = items[0];
      setActiveId(first.id);
      if (first.type === "manual") {
        editor?.commands.setContent(first.content || "");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!activeId || !editor) return;
    const record = records.find((r) => r.id === activeId);
    if (record && record.type === "manual") {
      const currentContent = editor.getHTML();
      if (currentContent !== record.content) {
        editor.commands.setContent(record.content || "");
      }
      setDirty(false);
    }
  }, [activeId]);

  const saveContent = useCallback(async (id: string, html: string) => {
    setSaving(true);
    const { error } = await supabase
      .from("prescriptions")
      .update({ content: html })
      .eq("id", id);
    if (error) {
      toast.error("Erro ao salvar prescrição");
    } else {
      setDirty(false);
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, content: html } : r))
      );
    }
    setSaving(false);
  }, []);

  const createNewManual = async () => {
    const { data, error } = await supabase
      .from("prescriptions")
      .insert({
        patient_id: patientId,
        content: "",
        title: "Nova Prescrição",
        type: "manual",
        prescribed_at: new Date().toISOString().split("T")[0],
      })
      .select()
      .single();
    if (error) {
      toast.error("Erro ao criar prescrição");
      return;
    }
    const newRecord = data as Prescription;
    setRecords((prev) => [newRecord, ...prev]);
    setActiveId(newRecord.id);
    editor?.commands.setContent("");
    setDirty(false);
    toast.success("Nova prescrição criada");
  };

  const handlePdfUpload = async () => {
    if (!pdfFile || !pdfTitle.trim()) {
      toast.error("Título e arquivo são obrigatórios");
      return;
    }
    setUploadingPdf(true);
    try {
      const fileName = `${patientId}/${Date.now()}_${pdfFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(fileName, pdfFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("materials")
        .getPublicUrl(fileName);

      const { data, error } = await supabase
        .from("prescriptions")
        .insert({
          patient_id: patientId,
          title: pdfTitle,
          content: "",
          type: "pdf",
          pdf_url: urlData.publicUrl,
          pdf_file_name: pdfFile.name,
          prescribed_at: pdfUploadDate,
        })
        .select()
        .single();
      if (error) throw error;

      const newRecord = data as Prescription;
      setRecords((prev) => [newRecord, ...prev].sort(
        (a, b) => new Date(b.prescribed_at).getTime() - new Date(a.prescribed_at).getTime()
      ));
      setActiveId(newRecord.id);
      setPdfDialogOpen(false);
      setPdfFile(null);
      setPdfTitle("");
      toast.success("Receita PDF enviada");
    } catch (err) {
      toast.error("Erro ao enviar PDF");
      console.error(err);
    } finally {
      setUploadingPdf(false);
    }
  };

  const updateRecordDate = async (recordId: string, newDate: Date) => {
    const dateStr = format(newDate, "yyyy-MM-dd");
    const { error } = await supabase
      .from("prescriptions")
      .update({ prescribed_at: dateStr })
      .eq("id", recordId);
    if (error) {
      toast.error("Erro ao atualizar data");
      return;
    }
    setRecords((prev) =>
      prev
        .map((r) => (r.id === recordId ? { ...r, prescribed_at: dateStr } : r))
        .sort((a, b) => new Date(b.prescribed_at).getTime() - new Date(a.prescribed_at).getTime())
    );
    setEditingDateKey(null);
    toast.success("Data atualizada");
  };

  const updateTitle = async (recordId: string, newTitle: string) => {
    const { error } = await supabase
      .from("prescriptions")
      .update({ title: newTitle })
      .eq("id", recordId);
    if (error) {
      toast.error("Erro ao atualizar título");
      return;
    }
    setRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, title: newTitle } : r))
    );
  };

  const deleteRecord = async (recordId: string) => {
    const { error } = await supabase.from("prescriptions").delete().eq("id", recordId);
    if (error) {
      toast.error("Erro ao excluir prescrição");
      return;
    }
    const remaining = records.filter((r) => r.id !== recordId);
    setRecords(remaining);
    if (activeId === recordId) {
      if (remaining.length > 0) {
        setActiveId(remaining[0].id);
        if (remaining[0].type === "manual") {
          editor?.commands.setContent(remaining[0].content || "");
        }
      } else {
        setActiveId(null);
        editor?.commands.setContent("");
      }
    }
    setDeletingId(null);
    toast.success("Prescrição excluída");
  };

  const switchRecord = (record: Prescription) => {
    if (dirty && activeId) {
      const current = records.find(r => r.id === activeId);
      if (current?.type === "manual" && editor) {
        saveContent(activeId, editor.getHTML());
      }
    }
    setActiveId(record.id);
    if (record.type === "manual") {
      editor?.commands.setContent(record.content || "");
    }
    setDirty(false);
  };

  const replacePdf = async (recordId: string, file: File) => {
    setUploadingPdf(true);
    try {
      const fileName = `${patientId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("materials")
        .getPublicUrl(fileName);

      const { error } = await supabase
        .from("prescriptions")
        .update({ pdf_url: urlData.publicUrl, pdf_file_name: file.name })
        .eq("id", recordId);
      if (error) throw error;

      setRecords((prev) =>
        prev.map((r) =>
          r.id === recordId ? { ...r, pdf_url: urlData.publicUrl, pdf_file_name: file.name } : r
        )
      );
      toast.success("PDF substituído");
    } catch {
      toast.error("Erro ao substituir PDF");
    } finally {
      setUploadingPdf(false);
    }
  };

  const activeRecord = records.find((r) => r.id === activeId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative flex gap-3 min-h-[600px]">
      {/* History Sidebar */}
      <div
        onMouseEnter={() => setHistoryOpen(true)}
        onMouseLeave={() => setHistoryOpen(false)}
        className={cn(
          "absolute left-0 top-0 bottom-0 z-20 flex flex-col glass-card border border-border rounded-xl overflow-hidden transition-all duration-300 ease-in-out",
          historyOpen ? "w-72 opacity-100 shadow-xl" : "w-10 opacity-80"
        )}
      >
        <div className={cn(
          "flex items-center justify-center py-4 transition-opacity duration-200",
          historyOpen ? "hidden" : "flex flex-col gap-2"
        )}>
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground [writing-mode:vertical-lr] rotate-180 tracking-widest uppercase">
            Histórico
          </span>
        </div>

        <div className={cn(
          "flex flex-col h-full transition-opacity duration-200",
          historyOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Histórico</h3>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={createNewManual} className="h-7 w-7 p-0" title="Nova prescrição manual">
                <Plus className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPdfDialogOpen(true)} className="h-7 w-7 p-0" title="Enviar receita PDF">
                <Upload className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {records.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhuma prescrição</p>
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
                      {record.type === "pdf" ? (
                        <File className="w-3.5 h-3.5 shrink-0 text-red-500" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium block truncate">{record.title}</span>
                        <span className="text-[10px] opacity-60">
                          {new Date(record.prescribed_at).toLocaleDateString("pt-BR")}
                          {record.type === "pdf" && " • PDF"}
                        </span>
                      </div>
                      <Popover
                        open={editingDateKey === `sidebar-${record.id}`}
                        onOpenChange={(open) => { if (!open) setEditingDateKey(null); }}
                      >
                        <PopoverTrigger asChild>
                          <span
                            role="button"
                            onClick={(e) => { e.stopPropagation(); setEditingDateKey(`sidebar-${record.id}`); }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-primary"
                          >
                            <Pencil className="w-3 h-3" />
                          </span>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start" onClick={(e) => e.stopPropagation()}>
                          <Calendar
                            mode="single"
                            selected={new Date(record.prescribed_at + "T12:00:00")}
                            onSelect={(date) => date && updateRecordDate(record.id, date)}
                            locale={ptBR}
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <AlertDialog open={deletingId === record.id} onOpenChange={(open) => { if (!open) setDeletingId(null); }}>
                        <AlertDialogTrigger asChild>
                          <span
                            role="button"
                            onClick={(e) => { e.stopPropagation(); setDeletingId(record.id); }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </span>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir prescrição?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. A prescrição será excluída permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteRecord(record.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        historyOpen ? "ml-[19.5rem]" : "ml-[3.25rem]"
      )}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">Prescrições</h2>
            {activeRecord?.type === "manual" && (
              <>
                {dirty && (
                  <span className="text-xs text-amber-500 flex items-center gap-1 animate-pulse">● Não salvo</span>
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
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setPdfDialogOpen(true)} size="sm" variant="outline" className="gap-1.5">
              <Upload className="w-4 h-4" />
              Enviar Receita PDF
            </Button>
            <Button onClick={createNewManual} size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              Nova Prescrição
            </Button>
          </div>
        </div>

        {records.length === 0 && !activeId ? (
          <div className="glass-card p-12 text-center flex flex-col items-center gap-4">
            <FileText className="w-10 h-10 text-muted-foreground/40" />
            <div>
              <h3 className="text-base font-semibold text-foreground mb-1">Nenhuma prescrição registrada</h3>
              <p className="text-sm text-muted-foreground">Crie uma prescrição manual ou envie uma receita em PDF.</p>
            </div>
          </div>
        ) : activeRecord?.type === "manual" && editor ? (
          <div className="glass-card border border-border rounded-xl overflow-hidden flex flex-col">
            {/* Header with date and title */}
            {activeRecord && (
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary/10">
                <FileText className="w-3.5 h-3.5 text-primary" />
                <input
                  className="text-sm font-medium text-foreground bg-transparent border-none outline-none flex-1"
                  value={activeRecord.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setRecords(prev => prev.map(r => r.id === activeRecord.id ? { ...r, title: newTitle } : r));
                  }}
                  onBlur={() => updateTitle(activeRecord.id, activeRecord.title)}
                  placeholder="Título da prescrição"
                />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>{new Date(activeRecord.prescribed_at + "T12:00:00").toLocaleDateString("pt-BR")}</span>
                  <Popover
                    open={editingDateKey === `header-${activeRecord.id}`}
                    onOpenChange={(open) => { if (!open) setEditingDateKey(null); }}
                  >
                    <PopoverTrigger asChild>
                      <button onClick={() => setEditingDateKey(`header-${activeRecord.id}`)} className="hover:text-primary transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={new Date(activeRecord.prescribed_at + "T12:00:00")}
                        onSelect={(date) => date && updateRecordDate(activeRecord.id, date)}
                        locale={ptBR}
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="ml-2 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir prescrição?</AlertDialogTitle>
                      <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteRecord(activeRecord.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
            <AnamnesisToolbar editor={editor} />
            <EditorContent
              editor={editor}
              className="prose prose-sm max-w-none p-6 min-h-[400px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[380px]"
            />
          </div>
        ) : activeRecord?.type === "pdf" ? (
          <div className="glass-card border border-border rounded-xl overflow-hidden flex flex-col">
            {/* PDF Header */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary/10">
              <File className="w-3.5 h-3.5 text-red-500" />
              <input
                className="text-sm font-medium text-foreground bg-transparent border-none outline-none flex-1"
                value={activeRecord.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setRecords(prev => prev.map(r => r.id === activeRecord.id ? { ...r, title: newTitle } : r));
                }}
                onBlur={() => updateTitle(activeRecord.id, activeRecord.title)}
                placeholder="Título da receita"
              />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>{new Date(activeRecord.prescribed_at + "T12:00:00").toLocaleDateString("pt-BR")}</span>
                <Popover
                  open={editingDateKey === `header-${activeRecord.id}`}
                  onOpenChange={(open) => { if (!open) setEditingDateKey(null); }}
                >
                  <PopoverTrigger asChild>
                    <button onClick={() => setEditingDateKey(`header-${activeRecord.id}`)} className="hover:text-primary transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(activeRecord.prescribed_at + "T12:00:00")}
                      onSelect={(date) => date && updateRecordDate(activeRecord.id, date)}
                      locale={ptBR}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="ml-2 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir receita?</AlertDialogTitle>
                    <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteRecord(activeRecord.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* PDF Content */}
            <div className="p-6 flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <File className="w-10 h-10 text-red-500" />
              </div>
              <p className="text-sm text-muted-foreground">{activeRecord.pdf_file_name}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setViewPdfUrl(activeRecord.pdf_url)}>
                  <Eye className="w-4 h-4" />
                  Visualizar
                </Button>
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <a href={activeRecord.pdf_url || ""} target="_blank" rel="noopener noreferrer" download>
                    <Download className="w-4 h-4" />
                    Baixar
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".pdf";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) replacePdf(activeRecord.id, file);
                    };
                    input.click();
                  }}
                >
                  <Upload className="w-4 h-4" />
                  Substituir
                </Button>
              </div>

              {/* Inline PDF preview */}
              {activeRecord.pdf_url && (
                <div className="w-full mt-4 border border-border rounded-xl overflow-hidden">
                  <iframe
                    src={activeRecord.pdf_url}
                    className="w-full h-[500px]"
                    title="PDF Preview"
                  />
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* PDF Upload Dialog */}
      <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Receita PDF</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={pdfTitle}
                onChange={(e) => setPdfTitle(e.target.value)}
                placeholder="Ex: Receita de suplementação"
              />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={pdfUploadDate}
                onChange={(e) => setPdfUploadDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Arquivo PDF</Label>
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPdfDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handlePdfUpload} disabled={uploadingPdf}>
                {uploadingPdf && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Enviar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Viewer Dialog */}
      <Dialog open={!!viewPdfUrl} onOpenChange={() => setViewPdfUrl(null)}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Visualizar Receita</DialogTitle>
          </DialogHeader>
          {viewPdfUrl && (
            <iframe src={viewPdfUrl} className="w-full flex-1 rounded-lg" title="PDF Viewer" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientPrescriptionsTab;
