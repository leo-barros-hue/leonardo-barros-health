import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2, Pencil, Zap, Search } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Technique {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

const AdminTechniques = () => {
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Technique | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchTechniques(); }, []);

  const fetchTechniques = async () => {
    const { data } = await supabase
      .from("technique_catalog")
      .select("*")
      .order("name");
    setTechniques((data as Technique[]) || []);
    setLoading(false);
  };

  const openNew = () => {
    setEditing(null);
    setFormName("");
    setFormDescription("");
    setDialogOpen(true);
  };

  const openEdit = (t: Technique) => {
    setEditing(t);
    setFormName(t.name);
    setFormDescription(t.description);
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) { toast.error("Nome da técnica é obrigatório"); return; }
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("technique_catalog")
          .update({ name: formName.trim(), description: formDescription.trim() } as any)
          .eq("id", editing.id);
        if (error) throw error;
        toast.success("Técnica atualizada");
      } else {
        const { error } = await supabase
          .from("technique_catalog")
          .insert({ name: formName.trim(), description: formDescription.trim() } as any);
        if (error) throw error;
        toast.success("Técnica cadastrada");
      }
      setDialogOpen(false);
      fetchTechniques();
    } catch {
      toast.error("Erro ao salvar técnica");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta técnica do catálogo?")) return;
    const { error } = await supabase.from("technique_catalog").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); } else { toast.success("Técnica excluída"); fetchTechniques(); }
  };

  const filtered = techniques.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 stagger-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Técnicas de Treino</h1>
          <p className="text-sm text-muted-foreground">{techniques.length} técnicas cadastradas</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Técnica
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar técnica..." className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Zap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma técnica encontrada</h3>
          <p className="text-sm text-muted-foreground">Cadastre técnicas de treino para começar.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="bg-muted/50 px-4 py-3 flex items-center gap-3">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground uppercase">Técnicas</span>
            <span className="text-xs text-muted-foreground">({filtered.length})</span>
          </div>
          <div className="divide-y divide-border/50">
            {filtered.map((t) => (
              <div key={t.id} className="px-4 py-3 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-foreground block">{t.name}</span>
                  {t.description && (
                    <span className="text-xs text-muted-foreground line-clamp-2 mt-0.5 block">{t.description}</span>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(t)}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(t.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Técnica" : "Nova Técnica"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Técnica</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ex: Drop Set" />
            </div>
            <div className="space-y-2">
              <Label>Explicação da Técnica</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Descreva como a técnica funciona..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editing ? "Salvar" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTechniques;
