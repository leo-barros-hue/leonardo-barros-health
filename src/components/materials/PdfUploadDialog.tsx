import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Upload, Loader2 } from "lucide-react";

interface PdfUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const PdfUploadDialog = ({ open, onOpenChange, onSuccess }: PdfUploadDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !file) {
      toast.error("Preencha o nome e selecione um arquivo PDF.");
      return;
    }

    setLoading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(filePath, file, { contentType: "application/pdf" });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("materials").getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("materials_pdfs").insert({
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        file_url: urlData.publicUrl,
        file_name: filePath,
      });

      if (dbError) throw dbError;

      toast.success("PDF adicionado com sucesso!");
      setName("");
      setDescription("");
      setCategory("");
      setFile(null);
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error("Erro ao enviar PDF: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar PDF</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome do material *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Guia Low FODMAP" />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descrição do material" rows={2} />
          </div>
          <div>
            <Label>Categoria</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex: Dieta, Treino, Exames" />
          </div>
          <div>
            <Label>Arquivo PDF *</Label>
            <div className="mt-1">
              <label className="flex items-center gap-2 cursor-pointer border border-input rounded-md px-3 py-2 hover:bg-secondary/50 transition-colors">
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{file ? file.name : "Selecionar arquivo..."}</span>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PdfUploadDialog;
