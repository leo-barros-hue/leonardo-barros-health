import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Copy, Check } from "lucide-react";
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

const generatePassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const calculateAge = (birthDate: string): number | null => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const NewPatientDialog = ({ onPatientCreated }: NewPatientDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [sex, setSex] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");

  const resetForm = () => {
    setName(""); setCpf(""); setEmail(""); setPhone("");
    setBirthDate(""); setSex(""); setGeneratedPassword("");
    setShowResult(false); setCopied(false);
  };

  const age = calculateAge(birthDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cpfDigits = cpf.replace(/\D/g, "");
    if (cpfDigits.length !== 11) {
      toast.error("CPF deve ter 11 dígitos");
      return;
    }

    const password = generatePassword();
    setGeneratedPassword(password);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-patient", {
        body: {
          name,
          cpf: cpfDigits,
          email: email || undefined,
          phone: phone.replace(/\D/g, "") || undefined,
          password,
          birth_date: birthDate || undefined,
          sex: sex || undefined,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setShowResult(true);
      onPatientCreated();
    } catch (err: any) {
      toast.error("Erro ao cadastrar paciente", { description: err.message });
      setGeneratedPassword("");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    const cpfDigits = cpf.replace(/\D/g, "");
    const text = `Olá ${name.split(" ")[0]}! 🏋️\n\nSeu acesso foi criado:\n\n📱 Login (CPF): ${cpfDigits}\n\n🔑 Senha: ${generatedPassword}\n\nAcesse pelo app para ver seu plano.`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Dados copiados! Cole no WhatsApp.");
    setTimeout(() => setCopied(false), 3000);
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

        {!showResult ? (
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

            {/* Data de nascimento & Sexo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="pat-birth">Data de nascimento</Label>
                <Input id="pat-birth" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="bg-secondary/50 border-glass-border" />
                {age !== null && (
                  <p className="text-xs text-muted-foreground">{age} anos</p>
                )}
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

            <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cadastrando...</> : "Cadastrar Paciente"}
            </Button>
          </form>
        ) : (
          <div className="space-y-5 mt-2">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 space-y-3">
              <p className="font-semibold text-foreground text-center">✅ Paciente cadastrado!</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paciente:</span>
                  <span className="font-medium text-foreground">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Login (CPF):</span>
                  <span className="font-mono font-medium text-foreground">{cpf.replace(/\D/g, "")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Senha:</span>
                  <span className="font-mono font-bold text-primary text-lg">{generatedPassword}</span>
                </div>
              </div>
            </div>

            <Button onClick={handleCopy} className="w-full h-11 gap-2" variant={copied ? "outline" : "default"}>
              {copied ? <><Check className="w-4 h-4" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar dados para WhatsApp</>}
            </Button>

            <Button onClick={() => { resetForm(); }} variant="ghost" className="w-full text-muted-foreground">
              Cadastrar outro paciente
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewPatientDialog;
