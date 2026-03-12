import { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
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
  sort_order: number;
}

interface FormTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: { id: string; name: string; description: string } | null;
  onSaved: () => void;
}

const emptyQuestion = (): QuestionRow => ({
  question_text: "",
  question_type: "text",
  options: [],
  scale_min: 1,
  scale_max: 10,
  sort_order: 0,
});

const FormTemplateDialog = ({ open, onOpenChange, template, onSaved }: FormTemplateDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [optionInput, setOptionInput] = useState<Record<number, string>>({});

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
          question_type: q.question_type,
          options: Array.isArray(q.options) ? q.options : [],
          scale_min: q.scale_min ?? 1,
          scale_max: q.scale_max ?? 10,
          sort_order: q.sort_order,
        }))
      );
    }
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, { ...emptyQuestion(), sort_order: prev.length }]);
  };

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, field: string, value: any) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    );
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

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Nome do formulário é obrigatório"); return; }
    if (questions.some((q) => !q.question_text.trim())) {
      toast.error("Todas as perguntas precisam ter um texto");
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

      // Delete old questions and re-insert
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

    // Insert questions
    const rows = questions.map((q, i) => ({
      form_template_id: templateId!,
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options,
      scale_min: q.scale_min,
      scale_max: q.scale_max,
      sort_order: i,
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
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Anamnese Inicial"
                className="mt-1 bg-secondary/50"
              />
            </div>
            <div>
              <Label>Descrição (opcional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descrição do formulário..."
                rows={2}
                className="mt-1 bg-secondary/50"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Perguntas</h3>
          <Button variant="outline" size="sm" onClick={addQuestion} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Adicionar
          </Button>
        </div>

        <ScrollArea className="flex-1 max-h-[400px] pr-2">
          <div className="space-y-4 py-2">
            {questions.map((q, idx) => (
              <div key={idx} className="border border-border rounded-xl p-4 space-y-3 bg-secondary/20">
                <div className="flex items-start gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground mt-2.5 shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={q.question_text}
                        onChange={(e) => updateQuestion(idx, "question_text", e.target.value)}
                        placeholder={`Pergunta ${idx + 1}`}
                        className="bg-background"
                      />
                      <Select
                        value={q.question_type}
                        onValueChange={(v) => updateQuestion(idx, "question_type", v)}
                      >
                        <SelectTrigger className="w-44 bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Texto livre</SelectItem>
                          <SelectItem value="multiple_choice">Múltipla escolha</SelectItem>
                          <SelectItem value="scale">Escala numérica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Multiple choice options */}
                    {q.question_type === "multiple_choice" && (
                      <div className="space-y-2 pl-2">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground w-5">{oi + 1}.</span>
                            <span className="text-sm text-foreground flex-1">{opt}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={() => removeOption(idx, oi)}
                            >
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
                          <Button variant="outline" size="sm" onClick={() => addOption(idx)} className="h-8">
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Scale options */}
                    {q.question_type === "scale" && (
                      <div className="flex items-center gap-3 pl-2">
                        <span className="text-sm text-muted-foreground">De</span>
                        <Input
                          type="number"
                          value={q.scale_min}
                          onChange={(e) => updateQuestion(idx, "scale_min", Number(e.target.value))}
                          className="w-20 h-8 text-sm bg-background text-center"
                        />
                        <span className="text-sm text-muted-foreground">até</span>
                        <Input
                          type="number"
                          value={q.scale_max}
                          onChange={(e) => updateQuestion(idx, "scale_max", Number(e.target.value))}
                          className="w-20 h-8 text-sm bg-background text-center"
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => removeQuestion(idx)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
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
