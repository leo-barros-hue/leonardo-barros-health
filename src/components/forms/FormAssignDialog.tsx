import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Link, Check } from "lucide-react";

interface FormAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string | null;
  templateName: string;
}

interface Patient {
  id: string;
  name: string;
}

const FormAssignDialog = ({ open, onOpenChange, templateId, templateName }: FormAssignDialogProps) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [sending, setSending] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) { setGeneratedLink(null); setSelectedPatient(""); setCopied(false); return; }
    supabase.from("patients").select("id, name").order("name").then(({ data }) => {
      if (data) setPatients(data);
    });
  }, [open]);

  const handleAssign = async () => {
    if (!templateId || !selectedPatient) { toast.error("Selecione um paciente"); return; }
    setSending(true);

    const { data, error } = await supabase
      .from("form_assignments")
      .insert({ form_template_id: templateId, patient_id: selectedPatient })
      .select("id, access_token")
      .single();

    setSending(false);
    if (error) { toast.error("Erro ao enviar formulário"); console.error(error); return; }

    const link = `${window.location.origin}/form/${data.access_token}`;
    setGeneratedLink(link);
    toast.success("Formulário enviado ao paciente!");
  };

  const handleCopy = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar Formulário</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Envie <span className="font-medium text-foreground">"{templateName}"</span> para um paciente.
        </p>

        {!generatedLink ? (
          <div className="space-y-4">
            <div>
              <Label>Paciente</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecionar paciente..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button onClick={handleAssign} disabled={sending || !selectedPatient}>
                {sending ? "Enviando..." : "Enviar"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Link className="w-4 h-4 text-primary shrink-0" />
              <p className="text-sm font-medium text-foreground">Link gerado com sucesso!</p>
            </div>
            <div className="flex gap-2">
              <Input value={generatedLink} readOnly className="text-xs bg-secondary/50" />
              <Button variant="outline" size="icon" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Compartilhe este link com o paciente para ele responder o formulário.</p>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Fechar</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FormAssignDialog;
