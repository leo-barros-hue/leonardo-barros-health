import { useState, useMemo } from "react";
import { Search, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { tacoFoods, type TabelaFood } from "@/data/taco-foods";
import { tbcaFoods } from "@/data/tbca-foods";

interface ImportFoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}

const ImportFoodDialog = ({ open, onOpenChange, onImported }: ImportFoodDialogProps) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState("taco");
  const [importing, setImporting] = useState(false);

  const currentFoods = tab === "taco" ? tacoFoods : tbcaFoods;

  const filtered = useMemo(() => {
    if (!search.trim()) return currentFoods;
    const q = search.toLowerCase();
    return currentFoods.filter((f) => f.name.toLowerCase().includes(q));
  }, [currentFoods, search]);

  const getKey = (food: TabelaFood) => `${tab}::${food.name}`;

  const toggleSelect = (food: TabelaFood) => {
    const key = getKey(food);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    const keys = filtered.map(getKey);
    const allSelected = keys.every((k) => selected.has(k));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) keys.forEach((k) => next.delete(k));
      else keys.forEach((k) => next.add(k));
      return next;
    });
  };

  const getSelectedFoods = (): TabelaFood[] => {
    const foods: TabelaFood[] = [];
    selected.forEach((key) => {
      const [source, name] = [key.split("::")[0], key.slice(key.indexOf("::") + 2)];
      const list = source === "taco" ? tacoFoods : tbcaFoods;
      const found = list.find((f) => f.name === name);
      if (found) foods.push(found);
    });
    return foods;
  };

  const handleImport = async () => {
    const foods = getSelectedFoods();
    if (foods.length === 0) {
      toast.error("Selecione ao menos um alimento");
      return;
    }

    setImporting(true);
    const rows = foods.map((f) => ({
      name: f.name,
      category: f.category,
      measure: "g",
      protein_per_unit: f.protein,
      carbs_per_unit: f.carbs,
      fat_per_unit: f.fat,
      kcal_per_unit: f.kcal,
      fiber_per_unit: f.fiber,
    }));

    const { error } = await supabase.from("foods").insert(rows);
    setImporting(false);

    if (error) {
      toast.error("Erro ao importar alimentos");
      console.error(error);
    } else {
      toast.success(`${foods.length} alimento(s) importado(s)!`);
      setSelected(new Set());
      onOpenChange(false);
      onImported();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Importar de Tabelas Nutricionais</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => { setTab(v); setSearch(""); }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="taco">TACO (UNICAMP)</TabsTrigger>
            <TabsTrigger value="tbca">TBCA (USP)</TabsTrigger>
          </TabsList>

          <div className="mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alimento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-secondary/50"
              />
            </div>
          </div>

          {["taco", "tbca"].map((source) => (
            <TabsContent key={source} value={source} className="mt-3">
              <div className="flex items-center justify-between mb-2 px-1">
                <button
                  onClick={toggleAll}
                  className="text-xs text-primary hover:underline"
                >
                  {filtered.every((f) => selected.has(getKey(f))) && filtered.length > 0
                    ? "Desmarcar todos"
                    : "Selecionar todos"}
                </button>
                <span className="text-xs text-muted-foreground">
                  {selected.size} selecionado(s)
                </span>
              </div>

              <ScrollArea className="h-[380px] border border-border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-secondary/80 backdrop-blur z-10">
                    <tr className="border-b border-border">
                      <th className="w-10 py-2 px-2"></th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-semibold text-xs uppercase">Alimento</th>
                      <th className="text-center py-2 px-2 text-muted-foreground font-semibold text-xs uppercase w-14">Cat</th>
                      <th className="text-center py-2 px-2 text-muted-foreground font-semibold text-xs uppercase w-14">Kcal</th>
                      <th className="text-center py-2 px-2 text-success font-semibold text-xs uppercase w-14">Ptn</th>
                      <th className="text-center py-2 px-2 text-warning font-semibold text-xs uppercase w-14">Carb</th>
                      <th className="text-center py-2 px-2 text-destructive font-semibold text-xs uppercase w-14">Gor</th>
                      <th className="text-center py-2 px-2 text-muted-foreground font-semibold text-xs uppercase w-14">Fib</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-muted-foreground">
                          Nenhum alimento encontrado
                        </td>
                      </tr>
                    ) : (
                      filtered.map((food) => {
                        const key = getKey(food);
                        const isSelected = selected.has(key);
                        return (
                          <tr
                            key={key}
                            className={`border-b border-border/50 cursor-pointer transition-colors ${
                              isSelected ? "bg-primary/10" : "hover:bg-secondary/30"
                            }`}
                            onClick={() => toggleSelect(food)}
                          >
                            <td className="py-2 px-2 text-center">
                              <Checkbox checked={isSelected} tabIndex={-1} className="pointer-events-none" />
                            </td>
                            <td className="py-2 px-3 font-medium text-foreground">{food.name}</td>
                            <td className="py-2 px-2 text-center">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                                {food.category.slice(0, 4)}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-center text-muted-foreground">{food.kcal}</td>
                            <td className="py-2 px-2 text-center text-success">{food.protein}</td>
                            <td className="py-2 px-2 text-center text-warning">{food.carbs}</td>
                            <td className="py-2 px-2 text-center text-destructive">{food.fat}</td>
                            <td className="py-2 px-2 text-center text-muted-foreground">{food.fiber}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </ScrollArea>
              <p className="text-[10px] text-muted-foreground mt-2">
                {source === "taco" ? "Fonte: TACO 4ª ed. – UNICAMP" : "Fonte: TBCA – USP/FCF"}
              </p>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={selected.size === 0 || importing} className="gap-2">
            <Download className="w-4 h-4" />
            {importing ? "Importando..." : `Importar ${selected.size > 0 ? `(${selected.size})` : ""}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportFoodDialog;
