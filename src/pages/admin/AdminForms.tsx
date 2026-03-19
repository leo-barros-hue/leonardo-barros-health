import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, FileText, Eye, Send, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import FormTemplateDialog from "@/components/forms/FormTemplateDialog";
import FormPreviewDialog from "@/components/forms/FormPreviewDialog";
import FormAssignDialog from "@/components/forms/FormAssignDialog";
import FormResponsesDialog from "@/components/forms/FormResponsesDialog";

interface FormTemplate {
  id: string;
  name: string;
  description: string;
  created_at: string;
  question_count?: number;
  response_count?: number;
}

const AdminForms = () => {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FormTemplate | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [assignTemplate, setAssignTemplate] = useState<{ id: string; name: string } | null>(null);
  const [responsesTemplate, setResponsesTemplate] = useState<{ id: string; name: string } | null>(null);

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from("form_templates")
      .select("*, form_questions(id), form_assignments(id, completed_at)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar formulários");
    } else {
      setTemplates(
        (data || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          created_at: t.created_at,
          question_count: t.form_questions?.length || 0,
          response_count: t.form_assignments?.filter((a: any) => a.completed_at)?.length || 0,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("form_templates").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir formulário");
    else { toast.success("Formulário excluído"); fetchTemplates(); }
  };

  return (
    <div className="space-y-6 stagger-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Formulários</h1>
          <p className="text-muted-foreground text-sm mt-1">Crie e envie formulários personalizados para os pacientes</p>
        </div>
        <Button onClick={() => { setEditingTemplate(null); setDialogOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Formulário
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-12">Carregando...</p>
      ) : templates.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum formulário criado</p>
          <p className="text-muted-foreground text-sm mt-1">Clique em "Novo Formulário" para começar</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <div key={t.id} className="glass-card p-5 flex flex-col gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{t.name}</h3>
                {t.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.description}</p>}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{t.question_count} pergunta(s)</span>
                <span>•</span>
                <span>{t.response_count} resposta(s)</span>
                <span>•</span>
                <span>{new Date(t.created_at).toLocaleDateString("pt-BR")}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => setPreviewId(t.id)} className="gap-1.5 text-muted-foreground text-xs h-8">
                  <Eye className="w-3.5 h-3.5" /> Visualizar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setEditingTemplate(t); setDialogOpen(true); }} className="gap-1.5 text-muted-foreground text-xs h-8">
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setAssignTemplate({ id: t.id, name: t.name })} className="gap-1.5 text-muted-foreground text-xs h-8">
                  <Send className="w-3.5 h-3.5" /> Enviar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setResponsesTemplate({ id: t.id, name: t.name })} className="gap-1.5 text-muted-foreground text-xs h-8">
                  <BarChart3 className="w-3.5 h-3.5" /> Respostas
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)} className="gap-1.5 text-destructive hover:text-destructive ml-auto text-xs h-8">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <FormTemplateDialog open={dialogOpen} onOpenChange={setDialogOpen} template={editingTemplate} onSaved={fetchTemplates} />
      <FormPreviewDialog open={!!previewId} onOpenChange={() => setPreviewId(null)} templateId={previewId} />
      <FormAssignDialog open={!!assignTemplate} onOpenChange={() => setAssignTemplate(null)} templateId={assignTemplate?.id || null} templateName={assignTemplate?.name || ""} />
      <FormResponsesDialog open={!!responsesTemplate} onOpenChange={() => setResponsesTemplate(null)} templateId={responsesTemplate?.id || null} templateName={responsesTemplate?.name || ""} />
    </div>
  );
};

export default AdminForms;
