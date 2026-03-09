import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface FoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealId: string;
  food?: {
    id: string;
    food_name: string;
    quantity: number;
    measure: string;
    protein: number;
    carbs: number;
    fat: number;
  } | null;
  onSuccess: () => void;
}

const FoodDialog = ({ open, onOpenChange, mealId, food, onSuccess }: FoodDialogProps) => {
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [measure, setMeasure] = useState("g");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [loading, setLoading] = useState(false);
  const isEditing = !!food;

  useEffect(() => {
    if (food) {
      setFoodName(food.food_name);
      setQuantity(String(food.quantity));
      setMeasure(food.measure);
      setProtein(String(food.protein));
      setCarbs(String(food.carbs));
      setFat(String(food.fat));
    } else {
      setFoodName("");
      setQuantity("");
      setMeasure("g");
      setProtein("");
      setCarbs("");
      setFat("");
    }
  }, [food, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) {
      toast.error("Nome do alimento é obrigatório");
      return;
    }

    setLoading(true);
    try {
      const data = {
        food_name: foodName,
        quantity: parseFloat(quantity) || 0,
        measure,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("diet_meal_foods")
          .update(data)
          .eq("id", food.id);
        if (error) throw error;
        toast.success("Alimento atualizado");
      } else {
        // Get max sort_order
        const { data: maxOrder } = await supabase
          .from("diet_meal_foods")
          .select("sort_order")
          .eq("diet_meal_id", mealId)
          .order("sort_order", { ascending: false })
          .limit(1);
        
        const newOrder = maxOrder && maxOrder.length > 0 ? maxOrder[0].sort_order + 1 : 0;

        const { error } = await supabase
          .from("diet_meal_foods")
          .insert({ ...data, diet_meal_id: mealId, sort_order: newOrder });
        if (error) throw error;
        toast.success("Alimento adicionado");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar alimento");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Alimento" : "Adicionar Alimento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="food-name">Alimento</Label>
            <Input
              id="food-name"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="Ex: Arroz Branco"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="measure">Medida</Label>
              <Input
                id="measure"
                value={measure}
                onChange={(e) => setMeasure(e.target.value)}
                placeholder="g"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="protein">Proteína (g)</Label>
              <Input
                id="protein"
                type="number"
                step="0.1"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs">Carboidrato (g)</Label>
              <Input
                id="carbs"
                type="number"
                step="0.1"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat">Gordura (g)</Label>
              <Input
                id="fat"
                type="number"
                step="0.1"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? "Salvar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FoodDialog;
