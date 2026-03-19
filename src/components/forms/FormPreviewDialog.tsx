import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface FormPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string | null;
}

interface Question {
  id: string;
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

const FormPreviewDialog = ({ open, onOpenChange, templateId }: FormPreviewDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!open || !templateId) return;
    const load = async () => {
      const { data: tmpl } = await supabase
        .from("form_templates")
        .select("name, description")
        .eq("id", templateId)
        .single();
      if (tmpl) { setName(tmpl.name); setDescription(tmpl.description || ""); }

      const { data: qs } = await supabase
        .from("form_questions")
        .select("*")
        .eq("form_template_id", templateId)
        .order("sort_order");
      if (qs) {
        setQuestions(
          qs.map((q: any) => ({
            id: q.id,
            question_text: q.question_text,
            question_type: q.multi_select ? "multi_select" : q.question_type,
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
      setAnswers({});
    };
    load();
  }, [open, templateId]);

  const renderQuestion = (q: Question, idx: number) => (
    <div key={q.id} className="space-y-2">
      <Label className="text-sm font-medium">
        {idx + 1}. {q.question_text}
        {q.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {q.description && <p className="text-xs text-muted-foreground">{q.description}</p>}
      {q.image_url && <img src={q.image_url} alt="" className="max-h-40 rounded-lg border border-border" />}

      {q.question_type === "text" && (
        <Textarea placeholder="Resposta..." value={(answers[q.id] as string) || ""} onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))} className="bg-secondary/50" rows={3} />
      )}

      {q.question_type === "number" && (
        <Input type="number" placeholder="0" value={(answers[q.id] as string) || ""} onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))} className="bg-secondary/50 w-40" />
      )}

      {q.question_type === "yes_no" && (
        <div className="flex gap-3">
          {["Sim", "Não"].map((opt) => (
            <Button key={opt} variant={answers[q.id] === opt ? "default" : "outline"} size="sm" onClick={() => setAnswers((p) => ({ ...p, [q.id]: opt }))}>{opt}</Button>
          ))}
        </div>
      )}

      {q.question_type === "multiple_choice" && (
        <RadioGroup value={(answers[q.id] as string) || ""} onValueChange={(v) => setAnswers((p) => ({ ...p, [q.id]: v }))} className="space-y-2">
          {q.options.map((opt, oi) => (
            <div key={oi} className="flex items-center gap-2">
              <RadioGroupItem value={opt} id={`${q.id}-${oi}`} />
              <Label htmlFor={`${q.id}-${oi}`} className="text-sm font-normal cursor-pointer">{opt}</Label>
            </div>
          ))}
        </RadioGroup>
      )}

      {q.question_type === "multi_select" && (
        <div className="space-y-2">
          {q.options.map((opt, oi) => {
            const selected: string[] = (answers[q.id] as string[]) || [];
            return (
              <div key={oi} className="flex items-center gap-2">
                <Checkbox
                  checked={selected.includes(opt)}
                  onCheckedChange={(checked) => {
                    setAnswers((p) => ({
                      ...p,
                      [q.id]: checked ? [...selected, opt] : selected.filter((s) => s !== opt),
                    }));
                  }}
                  id={`${q.id}-${oi}`}
                />
                <Label htmlFor={`${q.id}-${oi}`} className="text-sm font-normal cursor-pointer">{opt}</Label>
              </div>
            );
          })}
        </div>
      )}

      {q.question_type === "scale" && (
        <div className="space-y-2">
          <Slider min={q.scale_min} max={q.scale_max} step={1} value={[typeof answers[q.id] === "number" ? (answers[q.id] as number) : q.scale_min]} onValueChange={([v]) => setAnswers((p) => ({ ...p, [q.id]: v }))} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{q.scale_label_min || q.scale_min}</span>
            <span className="text-foreground font-semibold text-sm">{typeof answers[q.id] === "number" ? answers[q.id] : q.scale_min}</span>
            <span>{q.scale_label_max || q.scale_max}</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange(false)}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Pré-visualização</DialogTitle>
        </DialogHeader>
        <div className="mb-2">
          <h2 className="text-lg font-bold text-foreground">{name}</h2>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        <ScrollArea className="flex-1 max-h-[500px]">
          <div className="space-y-6 pr-2 py-2">
            {questions.map((q, idx) => renderQuestion(q, idx))}
            {questions.length === 0 && <p className="text-muted-foreground text-center py-8">Nenhuma pergunta cadastrada</p>}
          </div>
        </ScrollArea>
        <p className="text-[10px] text-muted-foreground text-center pt-2 border-t border-border">
          Esta é apenas uma pré-visualização. As respostas não serão salvas.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default FormPreviewDialog;
