import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, Pencil, Dumbbell, Search } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const MUSCLE_GROUPS = [
  "PEITO",
  "DORSAL",
  "OMBROS",
  "BRAÇOS",
  "ANTEBRAÇO",
  "QUADRÍCEPS",
  "ISQUIOTIBIAIS",
  "ADUTORES",
  "GLÚTEOS",
  "ABDOME",
  "PANTURRILHA",
] as const;

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  created_at: string;
}

const AdminExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [formName, setFormName] = useState("");
  const [formGroup, setFormGroup] = useState<string>(MUSCLE_GROUPS[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    const { data } = await supabase
      .from("exercise_catalog")
      .select("*")
      .order("muscle_group")
      .order("name");
    setExercises((data as Exercise[]) || []);
    setLoading(false);
  };

  const openNew = () => {
    setEditingExercise(null);
    setFormName("");
    setFormGroup(MUSCLE_GROUPS[0]);
    setDialogOpen(true);
  };

  const openEdit = (ex: Exercise) => {
    setEditingExercise(ex);
    setFormName(ex.name);
    setFormGroup(ex.muscle_group);
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Nome do exercício é obrigatório");
      return;
    }
    setSaving(true);
    try {
      if (editingExercise) {
        const { error } = await supabase
          .from("exercise_catalog")
          .update({ name: formName.trim(), muscle_group: formGroup } as any)
          .eq("id", editingExercise.id);
        if (error) throw error;
        toast.success("Exercício atualizado");
      } else {
        const { error } = await supabase
          .from("exercise_catalog")
          .insert({ name: formName.trim(), muscle_group: formGroup } as any);
        if (error) throw error;
        toast.success("Exercício cadastrado");
      }
      setDialogOpen(false);
      fetchExercises();
    } catch {
      toast.error("Erro ao salvar exercício");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este exercício do catálogo?")) return;
    const { error } = await supabase.from("exercise_catalog").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir");
    } else {
      toast.success("Exercício excluído");
      fetchExercises();
    }
  };

  const filtered = exercises.filter((ex) => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchGroup = filterGroup === "all" || ex.muscle_group === filterGroup;
    return matchSearch && matchGroup;
  });

  const grouped = MUSCLE_GROUPS.reduce((acc, group) => {
    const items = filtered.filter((ex) => ex.muscle_group === group);
    if (items.length > 0) acc.push({ group, items });
    return acc;
  }, [] as { group: string; items: Exercise[] }[]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 stagger-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Banco de Exercícios</h1>
          <p className="text-sm text-muted-foreground">{exercises.length} exercícios cadastrados</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Exercício
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar exercício..."
            className="pl-9"
          />
        </div>
        <Select value={filterGroup} onValueChange={setFilterGroup}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Grupo muscular" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os grupos</SelectItem>
            {MUSCLE_GROUPS.map((g) => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Exercise List by Group */}
      {grouped.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Dumbbell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum exercício encontrado</h3>
          <p className="text-sm text-muted-foreground">Cadastre exercícios para começar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ group, items }) => (
            <div key={group} className="glass-card overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 flex items-center gap-3">
                <Dumbbell className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-foreground uppercase">{group}</span>
                <span className="text-xs text-muted-foreground">({items.length})</span>
              </div>
              <div className="divide-y divide-border/50">
                {items.map((ex) => (
                  <div key={ex.id} className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-sm text-foreground">{ex.name}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(ex)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(ex.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingExercise ? "Editar Exercício" : "Novo Exercício"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Exercício</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ex: Supino Reto com Barra"
              />
            </div>
            <div className="space-y-2">
              <Label>Grupo Muscular</Label>
              <Select value={formGroup} onValueChange={setFormGroup}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MUSCLE_GROUPS.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingExercise ? "Salvar" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminExercises;
