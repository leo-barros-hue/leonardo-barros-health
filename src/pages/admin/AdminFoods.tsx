import { useState, useEffect } from "react";
import { Plus, Trash2, Search, Check, X, Pencil, FileDown } from "lucide-react";
import ImportFoodDialog from "@/components/foods/ImportFoodDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Food {
  id: string;
  name: string;
  category: string;
  measure: string;
  protein_per_unit: number;
  carbs_per_unit: number;
  fat_per_unit: number;
}

const CATEGORIES = ["Carboidratos", "Frutas", "Proteína", "Gorduras", "Outros"];

const emptyFood = { name: "", category: "Outros", measure: "g", protein_per_unit: 0, carbs_per_unit: 0, fat_per_unit: 0 };

const AdminFoods = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [newFood, setNewFood] = useState({ ...emptyFood });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ ...emptyFood });
  const [showImport, setShowImport] = useState(false);

  const fetchFoods = async () => {
    const { data, error } = await supabase.from("foods").select("*").order("category").order("name");
    if (error) toast.error("Erro ao carregar alimentos");
    else setFoods(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchFoods(); }, []);

  const handleAdd = async () => {
    if (!newFood.name.trim()) { toast.error("Nome é obrigatório"); return; }
    const { error } = await supabase.from("foods").insert([newFood]);
    if (error) toast.error("Erro ao cadastrar");
    else { toast.success("Alimento cadastrado!"); setNewFood({ ...emptyFood }); setShowForm(false); fetchFoods(); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("foods").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir");
    else { toast.success("Excluído"); setFoods((prev) => prev.filter((f) => f.id !== id)); }
  };

  const startEdit = (food: Food) => {
    setEditingId(food.id);
    setEditData({ name: food.name, category: food.category, measure: food.measure, protein_per_unit: food.protein_per_unit, carbs_per_unit: food.carbs_per_unit, fat_per_unit: food.fat_per_unit });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from("foods").update(editData).eq("id", editingId);
    if (error) toast.error("Erro ao salvar");
    else { toast.success("Alimento atualizado!"); setEditingId(null); fetchFoods(); }
  };

  const filtered = foods.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || f.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6 stagger-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cadastro de Alimentos</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie a base de alimentos com informações nutricionais</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2"><Plus className="w-4 h-4" />Novo Alimento</Button>
      </div>

      {showForm && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Novo Alimento</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3">
            <Input placeholder="Nome do alimento" value={newFood.name} onChange={(e) => setNewFood((p) => ({ ...p, name: e.target.value }))} className="md:col-span-2 bg-secondary/50" />
            <Select value={newFood.category} onValueChange={(v) => setNewFood((p) => ({ ...p, category: v }))}><SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
            <Select value={newFood.measure} onValueChange={(v) => setNewFood((p) => ({ ...p, measure: v }))}><SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="g">g</SelectItem><SelectItem value="ml">ml</SelectItem><SelectItem value="unid.">unid.</SelectItem></SelectContent></Select>
            <Input type="number" placeholder="Ptn" min={0} step={0.01} value={newFood.protein_per_unit || ""} onChange={(e) => setNewFood((p) => ({ ...p, protein_per_unit: Number(e.target.value) }))} className="bg-secondary/50 text-success" />
            <Input type="number" placeholder="Carb" min={0} step={0.01} value={newFood.carbs_per_unit || ""} onChange={(e) => setNewFood((p) => ({ ...p, carbs_per_unit: Number(e.target.value) }))} className="bg-secondary/50 text-warning" />
            <Input type="number" placeholder="Fat" min={0} step={0.01} value={newFood.fat_per_unit || ""} onChange={(e) => setNewFood((p) => ({ ...p, fat_per_unit: Number(e.target.value) }))} className="bg-secondary/50 text-destructive" />
          </div>
          <p className="text-xs text-muted-foreground">Para alimentos em g/ml, insira o valor por 1g ou 1ml. Para unidades, insira o valor por 1 unidade.</p>
          <div className="flex gap-2">
            <Button onClick={handleAdd} size="sm" className="gap-1"><Check className="w-4 h-4" /> Cadastrar</Button>
            <Button onClick={() => setShowForm(false)} size="sm" variant="ghost" className="gap-1"><X className="w-4 h-4" /> Cancelar</Button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar alimento..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger className="w-48 bg-secondary/50"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas categorias</SelectItem>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left py-3 px-4 text-muted-foreground font-semibold uppercase text-xs tracking-wider">Alimento</th>
                <th className="text-center py-3 px-3 text-muted-foreground font-semibold uppercase text-xs tracking-wider w-28">Categoria</th>
                <th className="text-center py-3 px-3 text-muted-foreground font-semibold uppercase text-xs tracking-wider w-16">Med</th>
                <th className="text-center py-3 px-3 text-success font-semibold uppercase text-xs tracking-wider w-20">Ptn</th>
                <th className="text-center py-3 px-3 text-warning font-semibold uppercase text-xs tracking-wider w-20">Carb</th>
                <th className="text-center py-3 px-3 text-destructive font-semibold uppercase text-xs tracking-wider w-20">Fat</th>
                <th className="w-20"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">Carregando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">Nenhum alimento encontrado</td></tr>
              ) : (
                filtered.map((food) => (
                  <tr key={food.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    {editingId === food.id ? (
                      <>
                        <td className="py-2 px-4"><Input value={editData.name} onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))} className="h-8 text-sm bg-secondary/50" /></td>
                        <td className="py-2 px-2">
                          <Select value={editData.category} onValueChange={(v) => setEditData((p) => ({ ...p, category: v }))}><SelectTrigger className="h-8 text-sm bg-secondary/50"><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                        </td>
                        <td className="py-2 px-2">
                          <Select value={editData.measure} onValueChange={(v) => setEditData((p) => ({ ...p, measure: v }))}><SelectTrigger className="h-8 text-sm bg-secondary/50"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="g">g</SelectItem><SelectItem value="ml">ml</SelectItem><SelectItem value="unid.">unid.</SelectItem></SelectContent></Select>
                        </td>
                        <td className="py-2 px-2"><Input type="number" min={0} step={0.01} value={editData.protein_per_unit || ""} onChange={(e) => setEditData((p) => ({ ...p, protein_per_unit: Number(e.target.value) }))} className="h-8 text-sm text-center text-success bg-secondary/50" /></td>
                        <td className="py-2 px-2"><Input type="number" min={0} step={0.01} value={editData.carbs_per_unit || ""} onChange={(e) => setEditData((p) => ({ ...p, carbs_per_unit: Number(e.target.value) }))} className="h-8 text-sm text-center text-warning bg-secondary/50" /></td>
                        <td className="py-2 px-2"><Input type="number" min={0} step={0.01} value={editData.fat_per_unit || ""} onChange={(e) => setEditData((p) => ({ ...p, fat_per_unit: Number(e.target.value) }))} className="h-8 text-sm text-center text-destructive bg-secondary/50" /></td>
                        <td className="py-2 px-1 flex gap-1">
                          <Button variant="ghost" size="icon" onClick={handleSaveEdit} className="h-7 w-7 text-success hover:text-success"><Check className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setEditingId(null)} className="h-7 w-7 text-muted-foreground hover:text-destructive"><X className="w-3.5 h-3.5" /></Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4 font-medium text-foreground">{food.name}</td>
                        <td className="py-3 px-3 text-center"><span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">{food.category}</span></td>
                        <td className="py-3 px-3 text-center text-muted-foreground">{food.measure}</td>
                        <td className="py-3 px-3 text-center text-success font-medium">{food.protein_per_unit}</td>
                        <td className="py-3 px-3 text-center text-warning font-medium">{food.carbs_per_unit}</td>
                        <td className="py-3 px-3 text-center text-destructive font-medium">{food.fat_per_unit}</td>
                        <td className="py-3 px-1 flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => startEdit(food)} className="h-7 w-7 text-muted-foreground hover:text-primary"><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(food.id)} className="h-7 w-7 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border bg-secondary/20 text-xs text-muted-foreground">
          {filtered.length} alimento(s) encontrado(s)
        </div>
      </div>
    </div>
  );
};

export default AdminFoods;
