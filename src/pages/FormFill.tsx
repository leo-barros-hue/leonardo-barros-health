import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Activity, Loader2, CheckCircle2 } from "lucide-react";

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: string[];
  scale_min: number;
  scale_max: number;
  scale_label_min: string;
  scale_label_max: string;
  required: boolean;
  description: string;
  image_url: string | null;
  multi_select: boolean;
}

const FormFill = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      // Find assignment by token
      const { data: assignment } = await supabase
        .from("form_assignments")
        .select("id, form_template_id, completed_at")
        .eq("access_token", token)
        .single();

      if (!assignment) { setExpired(true); setLoading(false); return; }
      if (assignment.completed_at) { setSubmitted(true); setLoading(false); return; }

      setAssignmentId(assignment.id);

      // Load template
      const { data: tmpl } = await supabase
        .from("form_templates")
        .select("name, description")
        .eq("id", assignment.form_template_id)
        .single();
      if (tmpl) { setFormName(tmpl.name); setFormDescription(tmpl.description || ""); }

      // Load questions
      const { data: qs } = await supabase
        .from("form_questions")
        .select("*")
        .eq("form_template_id", assignment.form_template_id)
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
            required: q.required ?? false,
            description: q.description || "",
            image_url: q.image_url || null,
            multi_select: q.multi_select ?? false,
          }))
        );
      }
      setLoading(false);
    };
    load();
  }, [token]);

  const answeredCount = questions.filter((q) => {
    const a = answers[q.id];
    if (a === undefined || a === null || a === "") return false;
    if (Array.isArray(a) && a.length === 0) return false;
    return true;
  }).length;

  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  const handleSubmit = async () => {
    // Validate required
    for (const q of questions) {
      if (q.required) {
        const a = answers[q.id];
        if (a === undefined || a === null || a === "" || (Array.isArray(a) && a.length === 0)) {
          toast.error(`A pergunta "${q.question_text}" é obrigatória`);
          return;
        }
      }
    }

    setSubmitting(true);
    const rows = questions.map((q) => {
      const a = answers[q.id];
      let answer_text: string | null = null;
      let answer_number: number | null = null;

      if (q.question_type === "scale" || q.question_type === "number") {
        answer_number = typeof a === "number" ? a : a ? Number(a) : null;
        answer_text = answer_number !== null ? String(answer_number) : null;
      } else if (Array.isArray(a)) {
        answer_text = a.join(", ");
      } else {
        answer_text = a ? String(a) : null;
      }

      return {
        form_assignment_id: assignmentId!,
        form_question_id: q.id,
        answer_text,
        answer_number,
      };
    });

    const { error } = await supabase.from("form_responses").insert(rows);
    if (error) { toast.error("Erro ao enviar respostas"); setSubmitting(false); return; }

    await supabase
      .from("form_assignments")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", assignmentId!);

    setSubmitted(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-sm">
          <p className="text-lg font-semibold text-foreground">Link inválido</p>
          <p className="text-sm text-muted-foreground mt-2">Este formulário não existe ou o link está incorreto.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-sm space-y-4">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
          <p className="text-xl font-semibold text-foreground">Respostas enviadas!</p>
          <p className="text-sm text-muted-foreground">Obrigado por responder o formulário. Suas respostas foram salvas com sucesso.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Saúde & Performance</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Formulário</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{formName}</h1>
          {formDescription && <p className="text-sm text-muted-foreground mt-2">{formDescription}</p>}
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{answeredCount} de {questions.length} respondidas</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div key={q.id} className="border border-border rounded-xl p-5 space-y-3 bg-card">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">
                  {idx + 1}. {q.question_text}
                  {q.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {q.description && <p className="text-xs text-muted-foreground">{q.description}</p>}
              </div>
              {q.image_url && <img src={q.image_url} alt="" className="max-h-48 rounded-lg border border-border" />}

              {q.question_type === "text" && (
                <Textarea placeholder="Sua resposta..." value={(answers[q.id] as string) || ""} onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))} className="bg-secondary/30" rows={3} />
              )}

              {q.question_type === "number" && (
                <Input type="number" placeholder="0" value={(answers[q.id] as string) || ""} onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))} className="bg-secondary/30 w-40" />
              )}

              {q.question_type === "yes_no" && (
                <div className="flex gap-3">
                  {["Sim", "Não"].map((opt) => (
                    <Button key={opt} variant={answers[q.id] === opt ? "default" : "outline"} onClick={() => setAnswers((p) => ({ ...p, [q.id]: opt }))}>{opt}</Button>
                  ))}
                </div>
              )}

              {q.question_type === "multiple_choice" && (
                <RadioGroup value={(answers[q.id] as string) || ""} onValueChange={(v) => setAnswers((p) => ({ ...p, [q.id]: v }))} className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <RadioGroupItem value={opt} id={`fill-${q.id}-${oi}`} />
                      <Label htmlFor={`fill-${q.id}-${oi}`} className="text-sm font-normal cursor-pointer">{opt}</Label>
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
                          id={`fill-${q.id}-${oi}`}
                        />
                        <Label htmlFor={`fill-${q.id}-${oi}`} className="text-sm font-normal cursor-pointer">{opt}</Label>
                      </div>
                    );
                  })}
                </div>
              )}

              {q.question_type === "scale" && (
                <div className="space-y-3 pt-2">
                  <div className="flex gap-1 justify-center flex-wrap">
                    {Array.from({ length: q.scale_max - q.scale_min + 1 }, (_, i) => q.scale_min + i).map((n) => (
                      <button
                        key={n}
                        onClick={() => setAnswers((p) => ({ ...p, [q.id]: n }))}
                        className={`w-9 h-9 rounded-lg text-sm font-medium border transition-all ${
                          answers[q.id] === n
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-foreground hover:bg-secondary"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground px-1">
                    <span>{q.scale_label_min || q.scale_min}</span>
                    <span>{q.scale_label_max || q.scale_max}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="pt-4">
          <Button onClick={handleSubmit} disabled={submitting} size="lg" className="w-full">
            {submitting ? "Enviando..." : "Enviar Respostas"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormFill;
