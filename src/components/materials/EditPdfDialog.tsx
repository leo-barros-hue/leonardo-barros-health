import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";

interface EditPdfDialogProps {
  pdf: { id: string; name: string; description: string; category: string } | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditPdfDialog = ({ pdf, onOpenChange, onSuccess }: EditPdfDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pdf) {
      setName(pdf.name);
      setDescription(pdf.description || "");
      setCategory(pdf.category || "");
    }
  }, [pdf]);

  const handleSubmit = async () => {
    if (!pdf || !name.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("materials_pdfs").update({
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
    }).eq("id", pdf.id);
    setLoading(false);
    if (error) { toast.error("Erro ao salvar."); return; }
    toast.success("PDF atualizado!");
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={!!pdf} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Editar PDF</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Nome *</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Descrição</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
          <div><Label>Categoria</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPdfDialog;
