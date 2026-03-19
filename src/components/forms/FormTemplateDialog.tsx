import { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical, Copy, ChevronDown, ChevronUp, ImageIcon, LayoutList } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuestionRow {
  id?: string;
  question_text: string;
  question_type: string;
  options: string[];
  scale_min: number;
  scale_max: number;
  scale_label_min: string;
  scale_label_max: string;
  sort_order: number;
  required: boolean;
  description: string;
  image_url: string | null;
  multi_select: boolean;
}

interface FormTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: { id: string; name: string; description: string } | null;
  onSaved: () => void;
}

const QUESTION_TYPES = [
  { value: "section", label: "Bloco / Seção" },
  { value: "text", label: "Texto livre" },
  { value: "multiple_choice", label: "Múltipla escolha (uma)" },
  { value: "multi_select", label: "Múltipla escolha (várias)" },
  { value: "scale", label: "Escala visual" },
  { value: "yes_no", label: "Sim / Não" },
  { value: "number", label: "Número" },
];

const emptyQuestion = (): QuestionRow => ({
  question_text: "",
  question_type: "text",
  options: [],
  scale_min: 0,
  scale_max: 10,
  scale_label_min: "",
  scale_label_max: "",
  sort_order: 0,
  required: false,
  description: "",
  image_url: null,
  multi_select: false,
});

const FormTemplateDialog = ({ open, onOpenChange, template, onSaved }: FormTemplateDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [optionInput, setOptionInput] = useState<Record<number, string>>({});
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    if (template) {
      setName(template.name);
      setDescription(template.description);
      loadQuestions(template.id);
    } else {
      setName("");
      setDescription("");
      setQuestions([emptyQuestion()]);
    }
    setOptionInput({});
    setExpandedIdx(null);
  }, [open, template]);

  const loadQuestions = async (templateId: string) => {
    const { data } = await supabase
      .from("form_questions")
      .select("*")
      .eq("form_template_id", templateId)
      .order("sort_order");
    if (data) {
      setQuestions(
        data.map((q: any) => ({
          id: q.id,
          question_text: q.question_text,
          question_type: q.question_type === "multiple_choice" && q.multi_select ? "multi_select" : q.question_type,
          options: Array.isArray(q.options) ? q.options : [],
          scale_min: q.scale_min ?? 0,
          scale_max: q.scale_max ?? 10,
          scale_label_min: q.scale_label_min || "",
          scale_label_max: q.scale_label_max || "",
          sort_order: q.sort_order,
          required: q.required ?? false,
          description: q.description || "",
          image_url: q.image_url || null,
          multi_select: q.multi_select ?? false,
        }))
      );
    }
  };

  const addQuestion = () => {
    const newQ = { ...emptyQuestion(), sort_order: questions.length };
    setQuestions((prev) => [...prev, newQ]);
    setExpandedIdx(questions.length);
  };

  const addSection = () => {
    const newS: QuestionRow = { ...emptyQuestion(), question_type: "section", question_text: "Novo Bloco", sort_order: questions.length };
    setQuestions((prev) => [...prev, newS]);
    setExpandedIdx(questions.length);
  };

  const duplicateQuestion = (idx: number) => {
    const q = { ...questions[idx], id: undefined, sort_order: questions.length };
    setQuestions((prev) => [...prev.slice(0, idx + 1), q, ...prev.slice(idx + 1)]);
  };

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
    if (expandedIdx === idx) setExpandedIdx(null);
  };

  const updateQuestion = (idx: number, field: string, value: any) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    );
  };

  const moveQuestion = (from: number, to: number) => {
    if (to < 0 || to >= questions.length) return;
    const arr = [...questions];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    setQuestions(arr);
    setExpandedIdx(to);
  };

  const addOption = (idx: number) => {
    const text = (optionInput[idx] || "").trim();
    if (!text) return;
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, options: [...q.options, text] } : q))
    );
    setOptionInput((prev) => ({ ...prev, [idx]: "" }));
  };

  const removeOption = (qIdx: number, optIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, options: q.options.filter((_, oi) => oi !== optIdx) } : q
      )
    );
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== idx) {
      moveQuestion(dragIdx, idx);
      setDragIdx(idx);
    }
  };
  const handleDragEnd = () => setDragIdx(null);

  const handleImageUpload = async (idx: number, file: File) => {
    const ext = file.name.split(".").pop();
    const path = `form-images/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("materials").upload(path, file);
    if (error) { toast.error("Erro ao enviar imagem"); return; }
    const { data: { publicUrl } } = supabase.storage.from("materials").getPublicUrl(path);
    updateQuestion(idx, "image_url", publicUrl);
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Nome do formulário é obrigatório"); return; }
    if (questions.some((q) => !q.question_text.trim())) {
      toast.error("Todas as perguntas e blocos precisam ter um texto");
      return;
    }

    setSaving(true);
    let templateId = template?.id;

    if (templateId) {
      const { error } = await supabase
        .from("form_templates")
        .update({ name, description, updated_at: new Date().toISOString() })
        .eq("id", templateId);
      if (error) { toast.error("Erro ao atualizar formulário"); setSaving(false); return; }
      await supabase.from("form_questions").delete().eq("form_template_id", templateId);
    } else {
      const { data, error } = await supabase
        .from("form_templates")
        .insert({ name, description })
        .select("id")
        .single();
      if (error || !data) { toast.error("Erro ao criar formulário"); setSaving(false); return; }
      templateId = data.id;
    }

    const rows = questions.map((q, i) => ({
      form_template_id: templateId!,
      question_text: q.question_text,
      question_type: q.question_type === "multi_select" ? "multiple_choice" : q.question_type,
      options: q.options,
      scale_min: q.scale_min,
      scale_max: q.scale_max,
      scale_label_min: q.scale_label_min,
      scale_label_max: q.scale_label_max,
      sort_order: i,
      required: q.question_type === "section" ? false : q.required,
      description: q.description,
      image_url: q.question_type === "section" ? null : q.image_url,
      multi_select: q.question_type === "multi_select",
    }));

    const { error: qError } = await supabase.from("form_questions").insert(rows);
    setSaving(false);

    if (qError) {
      toast.error("Erro ao salvar perguntas");
      console.error(qError);
    } else {
      toast.success(template ? "Formulário atualizado!" : "Formulário criado!");
      onOpenChange(false);
      onSaved();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{template ? "Editar Formulário" : "Novo Formulário"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3">
            <div>
              <Label>Nome do Formulário</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Anamnese Inicial" className="mt-1 bg-secondary/50" />
            </div>
            <div>
              <Label>Descrição (opcional)</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descrição do formulário..." rows={2} className="mt-1 bg-secondary/50" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Perguntas ({questions.filter(q => q.question_type !== "section").length})</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addSection} className="gap-1.5">
              <LayoutList className="w-3.5 h-3.5" /> Bloco
            </Button>
            <Button variant="outline" size="sm" onClick={addQuestion} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Pergunta
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 max-h-[400px] pr-2">
          <div className="space-y-3 py-2">
            {questions.map((q, idx) => {
              const isSection = q.question_type === "section";
              const questionNumber = isSection ? null : questions.slice(0, idx).filter(qq => qq.question_type !== "section").length + 1;
              return (
                <div
                  key={idx}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`border rounded-xl p-4 space-y-3 transition-all ${dragIdx === idx ? "opacity-50" : ""} ${
                    isSection
                      ? "border-l-4 border-l-primary border-border bg-primary/5"
                      : "border-border bg-secondary/20"
                  }`}
                >
                  {/* Header row */}
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab shrink-0" />
                    {isSection ? (
                      <LayoutList className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground w-6">{questionNumber}.</span>
                    )}
                    <Input
                      value={q.question_text}
                      onChange={(e) => updateQuestion(idx, "question_text", e.target.value)}
                      placeholder={isSection ? "Título do bloco" : "Pergunta"}
                      className={`flex-1 ${isSection ? "bg-background font-semibold" : "bg-background"}`}
                    />
                    {!isSection && (
                      <Select value={q.question_type} onValueChange={(v) => updateQuestion(idx, "question_type", v)}>
                        <SelectTrigger className="w-48 bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {QUESTION_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}>
                      {expandedIdx === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>

                  {/* Expanded settings */}
                  {expandedIdx === idx && (
                    <div className="space-y-3 pl-6 border-l-2 border-primary/20 ml-3">
                      {/* Description / Subtitle */}
                      <div>
                        <Label className="text-xs">{isSection ? "Subtítulo (opcional)" : "Descrição/Explicação"}</Label>
                        <Input value={q.description} onChange={(e) => updateQuestion(idx, "description", e.target.value)} placeholder={isSection ? "Subtítulo do bloco..." : "Adicionar explicação..."} className="mt-1 bg-background h-8 text-sm" />
                      </div>

                      {!isSection && (
                        <>
                          {/* Required toggle */}
                          <div className="flex items-center gap-2">
                            <Switch checked={q.required} onCheckedChange={(v) => updateQuestion(idx, "required", v)} />
                            <Label className="text-xs">Obrigatória</Label>
                          </div>

                          {/* Image upload */}
                          <div>
                            <Label className="text-xs">Imagem (opcional)</Label>
                            <div className="flex items-center gap-2 mt-1">
                              {q.image_url && (
                                <img src={q.image_url} alt="" className="h-16 w-16 object-cover rounded-lg border border-border" />
                              )}
                              <label className="cursor-pointer">
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(idx, file);
                                }} />
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border rounded-lg px-3 py-2 transition-colors">
                                  <ImageIcon className="w-3.5 h-3.5" />
                                  {q.image_url ? "Trocar" : "Adicionar imagem"}
                                </div>
                              </label>
                              {q.image_url && (
                                <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => updateQuestion(idx, "image_url", null)}>Remover</Button>
                              )}
                            </div>
                          </div>

                          {/* Multiple choice options */}
                          {(q.question_type === "multiple_choice" || q.question_type === "multi_select") && (
                            <div className="space-y-2">
                              <Label className="text-xs">Opções</Label>
                              {q.options.map((opt, oi) => (
                                <div key={oi} className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground w-5">{oi + 1}.</span>
                                  <span className="text-sm text-foreground flex-1">{opt}</span>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeOption(idx, oi)}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Nova opção..."
                                  value={optionInput[idx] || ""}
                                  onChange={(e) => setOptionInput((p) => ({ ...p, [idx]: e.target.value }))}
                                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addOption(idx))}
                                  className="h-8 text-sm bg-background"
                                />
                                <Button variant="outline" size="sm" onClick={() => addOption(idx)} className="h-8">Adicionar</Button>
                              </div>
                            </div>
                          )}

                          {/* Scale options */}
                          {q.question_type === "scale" && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">De</span>
                                <Input type="number" value={q.scale_min} onChange={(e) => updateQuestion(idx, "scale_min", Number(e.target.value))} className="w-16 h-8 text-sm bg-background text-center" />
                                <span className="text-xs text-muted-foreground">até</span>
                                <Input type="number" value={q.scale_max} onChange={(e) => updateQuestion(idx, "scale_max", Number(e.target.value))} className="w-16 h-8 text-sm bg-background text-center" />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs">Rótulo mín.</Label>
                                  <Input value={q.scale_label_min} onChange={(e) => updateQuestion(idx, "scale_label_min", e.target.value)} placeholder="Ex: Sem dor" className="h-8 text-sm bg-background mt-1" />
                                </div>
                                <div>
                                  <Label className="text-xs">Rótulo máx.</Label>
                                  <Input value={q.scale_label_max} onChange={(e) => updateQuestion(idx, "scale_label_max", e.target.value)} placeholder="Ex: Dor máxima" className="h-8 text-sm bg-background mt-1" />
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-1">
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => moveQuestion(idx, idx - 1)} disabled={idx === 0}>
                          <ChevronUp className="w-3 h-3" /> Subir
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => moveQuestion(idx, idx + 1)} disabled={idx === questions.length - 1}>
                          <ChevronDown className="w-3 h-3" /> Descer
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => duplicateQuestion(idx)}>
                          <Copy className="w-3 h-3" /> Duplicar
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-destructive hover:text-destructive ml-auto" onClick={() => removeQuestion(idx)}>
                          <Trash2 className="w-3 h-3" /> Excluir
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : template ? "Salvar Alterações" : "Criar Formulário"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormTemplateDialog;
