import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  ArrowLeft,
  CalendarIcon,
  MessageCircle,
  Save,
  RefreshCw,
  CheckCircle2,
  CalendarPlus,
  Copy,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Patient {
  id: string;
  name: string;
  cpf: string | null;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  sex: string | null;
  objective: string | null;
  created_at: string;
  updated_at: string;
}

interface PatientPlan {
  id?: string;
  patient_id: string;
  diet_active: boolean;
  workout_active: boolean;
  medical_active: boolean;
  plan_expires_at: string | null;
  plan_starts_at: string | null;
}

interface ProfileHeaderProps {
  patient: Patient;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "evolution", label: "Evolução" },
  { id: "schedule", label: "Agendamentos" },
  { id: "anamnesis", label: "Anamnese" },
  { id: "assessments", label: "Avaliações" },
  { id: "diet", label: "Dietas" },
  { id: "workout", label: "Treinos" },
  { id: "cardio", label: "Cardio" },
  { id: "exams", label: "Exames" },
  { id: "photos", label: "Fotos" },
  { id: "notes", label: "Notas" },
];

const calculateAge = (birthDate: string | null): number | null => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const getWhatsAppLink = (phone: string | null) => {
  if (!phone) return null;
  const d = phone.replace(/\D/g, "");
  const number = d.startsWith("55") ? d : `55${d}`;
  return `https://wa.me/${number}`;
};

export default function PatientProfileHeader({ patient, activeTab, onTabChange }: ProfileHeaderProps) {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PatientPlan>({
    patient_id: patient.id,
    diet_active: false,
    workout_active: false,
    medical_active: false,
    plan_expires_at: null,
    plan_starts_at: null,
  });
  const [expiresDate, setExpiresDate] = useState<Date | undefined>();
  const [startsDate, setStartsDate] = useState<Date | undefined>();
  const [nextUpdateDate, setNextUpdateDate] = useState<Date | undefined>();
  const [nextScheduleId, setNextScheduleId] = useState<string | null>(null);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [addDaysOpen, setAddDaysOpen] = useState(false);
  const [extraDays, setExtraDays] = useState("7");

  useEffect(() => {
    fetchPlan();
    fetchLatestMeasurements();
    fetchEnergyProfile();
    fetchNextScheduleDate();
  }, [patient.id]);

  const fetchPlan = async () => {
    const { data } = await supabase
      .from("patient_plans")
      .select("*")
      .eq("patient_id", patient.id)
      .maybeSingle();
    if (data) {
      setPlan(data as PatientPlan);
      if (data.plan_expires_at) setExpiresDate(new Date(data.plan_expires_at));
    }
  };

  const fetchLatestMeasurements = async () => {
    const { data } = await supabase
      .from("body_measurements")
      .select("weight")
      .eq("patient_id", patient.id)
      .order("measured_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data?.weight) setLatestWeight(data.weight);
  };

  const fetchEnergyProfile = async () => {
    const { data } = await supabase
      .from("patient_energy_profiles")
      .select("height")
      .eq("patient_id", patient.id)
      .maybeSingle();
    if (data?.height) setHeight(data.height);
  };

  const upsertPlan = async (updates: Partial<PatientPlan>) => {
    const newPlan = { ...plan, ...updates };
    setPlan(newPlan);
    if (plan.id) {
      await supabase.from("patient_plans").update(updates).eq("id", plan.id);
    } else {
      const { data } = await supabase
        .from("patient_plans")
        .insert({ patient_id: patient.id, ...updates })
        .select()
        .single();
      if (data) setPlan(data as PatientPlan);
    }
  };

  const handleToggle = (field: "diet_active" | "workout_active" | "medical_active", value: boolean) => {
    upsertPlan({ [field]: value });
  };

  const handleExpiresChange = (date: Date | undefined) => {
    setExpiresDate(date);
    upsertPlan({ plan_expires_at: date ? format(date, "yyyy-MM-dd") : null });
  };

  const handleAddDays = () => {
    const days = parseInt(extraDays);
    if (isNaN(days) || days <= 0) return;
    const base = expiresDate || new Date();
    const newDate = new Date(base);
    newDate.setDate(newDate.getDate() + days);
    handleExpiresChange(newDate);
    setAddDaysOpen(false);
    toast({ title: `${days} dias adicionados ao plano` });
  };

  const handleSave = () => {
    toast({ title: "Alterações salvas com sucesso" });
  };

  const handleFinalize = () => {
    toast({ title: "Atendimento finalizado" });
  };

  const age = calculateAge(patient.birth_date);
  const bmi = latestWeight && height ? (latestWeight / ((height / 100) ** 2)).toFixed(1) : null;

  const daysRemaining = expiresDate
    ? differenceInDays(expiresDate, new Date())
    : null;

  const whatsAppLink = getWhatsAppLink(patient.phone);

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg">
      {/* Main header with gradient */}
      <div className="bg-gradient-to-r from-primary via-[hsl(210,80%,45%)] to-[hsl(220,70%,50%)] p-6 pb-4">
        <div className="flex items-start gap-6">
          {/* Back button + Avatar */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/patients")}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-xl font-bold text-primary-foreground">
              {getInitials(patient.name)}
            </div>
          </div>

          {/* Patient Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-primary-foreground truncate">{patient.name}</h1>
            {patient.email && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-sm text-white/70">{patient.email}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(patient.email!);
                    toast({ title: "E-mail copiado" });
                  }}
                  className="text-white/50 hover:text-white/80 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Info badges */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {age !== null && (
                <Badge variant="secondary" className="bg-white/15 text-white border-0 text-xs font-medium">
                  {age} anos
                </Badge>
              )}
              {height && (
                <Badge variant="secondary" className="bg-white/15 text-white border-0 text-xs font-medium">
                  {height} cm
                </Badge>
              )}
              {latestWeight && (
                <Badge variant="secondary" className="bg-white/15 text-white border-0 text-xs font-medium">
                  {latestWeight} kg
                </Badge>
              )}
              {bmi && (
                <Badge variant="secondary" className="bg-white/15 text-white border-0 text-xs font-medium">
                  IMC {bmi}
                </Badge>
              )}

              {/* Plan toggles inline */}
              <div className="hidden lg:flex items-center gap-4 ml-4">
                {([
                  { key: "diet_active" as const, label: "Dieta" },
                  { key: "workout_active" as const, label: "Treino" },
                  { key: "medical_active" as const, label: "Médico" },
                ] as const).map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <Switch
                      checked={plan[key]}
                      onCheckedChange={(v) => handleToggle(key, v)}
                      className="data-[state=checked]:bg-green-400 scale-90"
                    />
                    <span className="text-xs text-white/80 font-medium">{label}</span>
                  </div>
                ))}
              </div>

              {/* Plan expiration */}
              {expiresDate && (
                <Badge
                  variant="secondary"
                  className={`border-0 text-xs font-semibold ml-2 ${
                    daysRemaining !== null && daysRemaining <= 7
                      ? "bg-destructive/80 text-white"
                      : "bg-green-500/80 text-white"
                  }`}
                >
                  {daysRemaining !== null && daysRemaining >= 0
                    ? `${daysRemaining} dias restantes`
                    : "Plano expirado"}
                </Badge>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="hidden md:flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 bg-white/10 hover:bg-white/20 text-white rounded-xl"
                  onClick={handleFinalize}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">Finalizar atendimento</p></TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 bg-white/10 hover:bg-white/20 text-white rounded-xl"
                  onClick={() => setAddDaysOpen(true)}
                >
                  <CalendarPlus className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">Adicionar dias ao plano</p></TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 bg-white/10 hover:bg-white/20 text-white rounded-xl"
                  onClick={handleSave}
                >
                  <Save className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">Salvar alterações</p></TooltipContent>
            </Tooltip>

            <Popover>
              <PopoverTrigger asChild>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 bg-white/10 hover:bg-white/20 text-white rounded-xl"
                    >
                      <CalendarIcon className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">Vigência do plano</p></TooltipContent>
                </Tooltip>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={expiresDate}
                  onSelect={handleExpiresChange}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 bg-white/10 hover:bg-white/20 text-white rounded-xl"
                  onClick={() => fetchPlan().then(() => fetchLatestMeasurements()).then(() => fetchEnergyProfile())}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">Atualizar dados</p></TooltipContent>
            </Tooltip>

            {whatsAppLink && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a href={whatsAppLink} target="_blank" rel="noopener noreferrer">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 bg-white/10 hover:bg-white/20 text-white rounded-xl"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </a>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">WhatsApp</p></TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Mobile plan toggles */}
        <div className="flex lg:hidden items-center gap-4 mt-4 pt-3 border-t border-white/10">
          {([
            { key: "diet_active" as const, label: "Dieta" },
            { key: "workout_active" as const, label: "Treino" },
            { key: "medical_active" as const, label: "Médico" },
          ] as const).map(({ key, label }) => (
            <div key={key} className="flex items-center gap-1.5">
              <Switch
                checked={plan[key]}
                onCheckedChange={(v) => handleToggle(key, v)}
                className="data-[state=checked]:bg-green-400 scale-90"
              />
              <span className="text-xs text-white/80 font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* Mobile action buttons */}
        <div className="flex md:hidden items-center gap-1.5 mt-3 overflow-x-auto">
          <Button size="sm" variant="ghost" className="h-8 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg shrink-0" onClick={handleFinalize}>
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Finalizar
          </Button>
          <Button size="sm" variant="ghost" className="h-8 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg shrink-0" onClick={() => setAddDaysOpen(true)}>
            <CalendarPlus className="w-3.5 h-3.5 mr-1" /> +Dias
          </Button>
          <Button size="sm" variant="ghost" className="h-8 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg shrink-0" onClick={handleSave}>
            <Save className="w-3.5 h-3.5 mr-1" /> Salvar
          </Button>
          {whatsAppLink && (
            <a href={whatsAppLink} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="ghost" className="h-8 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg shrink-0">
                <MessageCircle className="w-3.5 h-3.5 mr-1" /> WhatsApp
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="bg-card border-b border-border">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add days dialog */}
      <Dialog open={addDaysOpen} onOpenChange={setAddDaysOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Adicionar dias ao plano</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <p className="text-sm text-muted-foreground">
              {expiresDate
                ? `Vigência atual: ${format(expiresDate, "dd/MM/yyyy")}`
                : "Nenhuma vigência definida. Os dias serão adicionados a partir de hoje."}
            </p>
            <Input
              type="number"
              value={extraDays}
              onChange={(e) => setExtraDays(e.target.value)}
              placeholder="Dias a adicionar"
              min="1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDaysOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddDays}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
