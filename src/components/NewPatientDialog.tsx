import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NewPatientDialogProps {
  onPatientCreated: () => void;
}

const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const NewPatientDialog = ({ onPatientCreated }: NewPatientDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [objective, setObjective] = useState("");
  const [password, setPassword] = useState("");

  const resetForm = () => {
    setName(""); setCpf(""); setEmail(""); setPhone("");
    setAge(""); setSex(""); setObjective(""); setPassword("");
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cpfDigits = cpf.replace(/\D/g, "");
    if (cpfDigits.length !== 11) {
      toast.error("CPF deve ter 11 dígitos");
      return;
    }
    if (password.length < 6) {
      toast.error("Senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-patient", {
        body: {
          name,
          cpf: cpfDigits,
          email: email || undefined,
          phone: phone.replace(/\D/g, "") || undefined,
          password,
          age: age ? parseInt(age) : undefined,
          sex: sex || undefined,
          objective: objective || undefined,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Paciente cadastrado com sucesso!", {
        description: `Login: ${cpfDigits} · Senha definida pelo admin`,
      });
      resetForm();
      setOpen(false);
      onPatientCreated();
    } catch (err: any) {
      toast.error("Erro ao cadastrar paciente", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Plus className="w-4 h-4" />
          Novo Paciente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Cadastrar Novo Paciente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="pat-name">Nome completo *</Label>
            <Input id="pat-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo do paciente" required className="bg-secondary/50 border-glass-border" />
          </div>

          {/* CPF */}
          <div className="space-y-1.5">
            <Label htmlFor="pat-cpf">CPF *</Label>
            <Input id="pat-cpf" value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} placeholder="000.000.000-00" required className="bg-secondary/50 border-glass-border" />
          </div>

          {/* Email & Telefone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="pat-email">E-mail</Label>
              <Input id="pat-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="paciente@email.com" className="bg-secondary/50 border-glass-border" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pat-phone">Telefone</Label>
              <Input id="pat-phone" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="(00) 00000-0000" className="bg-secondary/50 border-glass-border" />
            </div>
          </div>

          {/* Idade, Sexo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="pat-age">Idade</Label>
              <Input id="pat-age" type="number" min="0" max="120" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Ex: 30" className="bg-secondary/50 border-glass-border" />
            </div>
            <div className="space-y-1.5">
              <Label>Sexo</Label>
              <Select value={sex} onValueChange={setSex}>
                <SelectTrigger className="bg-secondary/50 border-glass-border">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Objetivo */}
          <div className="space-y-1.5">
            <Label htmlFor="pat-obj">Objetivo</Label>
            <Input id="pat-obj" value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Ex: Emagrecimento, Hipertrofia..." className="bg-secondary/50 border-glass-border" />
          </div>

          {/* Senha */}
          <div className="space-y-1.5">
            <Label htmlFor="pat-pass">Senha de acesso *</Label>
            <div className="relative">
              <Input
                id="pat-pass"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                className="bg-secondary/50 border-glass-border pr-10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">O paciente usará o CPF + esta senha para fazer login</p>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cadastrando...</> : "Cadastrar Paciente"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewPatientDialog;
