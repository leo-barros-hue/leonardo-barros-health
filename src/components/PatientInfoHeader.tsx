import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MessageCircle, Plus, X, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Patient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  sex: string | null;
}

interface PatientPlan {
  id?: string;
  patient_id: string;
  diet_active: boolean;
  workout_active: boolean;
  medical_active: boolean;
  plan_expires_at: string | null;
}

interface ScheduleDate {
  id: string;
  scheduled_date: string;
  label: string;
}

const calculateAge = (birthDate: string | null): string => {
  if (!birthDate) return "—";
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return `${age} anos`;
};

const formatPhone = (phone: string | null) => {
  if (!phone) return null;
  const d = phone.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return phone;
};

const getWhatsAppLink = (phone: string | null) => {
  if (!phone) return null;
  const d = phone.replace(/\D/g, "");
  const number = d.startsWith("55") ? d : `55${d}`;
  return `https://wa.me/${number}`;
};

const formatDate = (date: string | null) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR");
};

export default function PatientInfoHeader({ patient }: { patient: Patient }) {
  const [plan, setPlan] = useState<PatientPlan>({
    patient_id: patient.id,
    diet_active: false,
    workout_active: false,
    medical_active: false,
    plan_expires_at: null,
  });
  const [scheduleDates, setScheduleDates] = useState<ScheduleDate[]>([]);
  const [expiresDate, setExpiresDate] = useState<Date | undefined>();
  const [newScheduleDate, setNewScheduleDate] = useState<Date | undefined>();
  const [newLabel, setNewLabel] = useState("Atualização mensal");
  const [addingDate, setAddingDate] = useState(false);

  useEffect(() => {
    fetchPlan();
    fetchScheduleDates();
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

  const fetchScheduleDates = async () => {
    const { data } = await supabase
      .from("patient_schedule_dates")
      .select("*")
      .eq("patient_id", patient.id)
      .order("scheduled_date", { ascending: true });
    if (data) setScheduleDates(data as ScheduleDate[]);
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

  const addScheduleDate = async () => {
    if (!newScheduleDate) return;
    const { data } = await supabase
      .from("patient_schedule_dates")
      .insert({
        patient_id: patient.id,
        scheduled_date: format(newScheduleDate, "yyyy-MM-dd"),
        label: newLabel || "Atualização mensal",
      })
      .select()
      .single();
    if (data) {
      setScheduleDates((prev) => [...prev, data as ScheduleDate].sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date)));
      setNewScheduleDate(undefined);
      setNewLabel("Atualização mensal");
      setAddingDate(false);
      toast({ title: "Data agendada com sucesso" });
    }
  };

  const removeScheduleDate = async (id: string) => {
    await supabase.from("patient_schedule_dates").delete().eq("id", id);
    setScheduleDates((prev) => prev.filter((d) => d.id !== id));
  };

  const whatsAppLink = getWhatsAppLink(patient.phone);
  const formattedPhone = formatPhone(patient.phone);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-foreground">Informações do paciente</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1: Patient info */}
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-0.5">Nome</p>
            <p className="text-base font-semibold text-foreground">{patient.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-0.5">E-mail</p>
            <p className="text-sm text-foreground">{patient.email || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-0.5">Telefone</p>
            {formattedPhone && whatsAppLink ? (
              <div className="flex items-center gap-2">
                <a
                  href={whatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  {formattedPhone}
                  <MessageCircle className="w-4 h-4 text-green-500" />
                </a>
              </div>
            ) : (
              <p className="text-sm text-foreground">—</p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-0.5">Data de nascimento</p>
            <p className="text-sm text-foreground">
              {formatDate(patient.birth_date)}{" "}
              <span className="text-muted-foreground">({calculateAge(patient.birth_date)})</span>
            </p>
          </div>
        </div>

        {/* Column 2: Plan toggles */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-semibold text-foreground">Planos ativos</p>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Ative os planos que o paciente possui contratados.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="space-y-3">
            {([
              { key: "diet_active" as const, label: "Dieta" },
              { key: "workout_active" as const, label: "Treino" },
              { key: "medical_active" as const, label: "Acompanhamento Médico" },
            ]).map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={plan[key]}
                    onCheckedChange={(v) => handleToggle(key, v)}
                  />
                  <span className="text-sm text-foreground">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Plan dates */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-semibold text-foreground">Vigência do plano</p>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Data de expiração do plano e datas de atualização agendadas.</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Expiration date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal h-9 text-sm">
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {expiresDate ? format(expiresDate, "dd/MM/yyyy") : "Definir validade..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={expiresDate}
                onSelect={handleExpiresChange}
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Scheduled update dates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium">Próximas atualizações</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setAddingDate(true)}
              >
                <Plus className="w-3 h-3 mr-1" /> Adicionar
              </Button>
            </div>

            {addingDate && (
              <div className="space-y-2 mb-3 p-3 rounded-lg bg-secondary/30 border border-border">
                <Input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Descrição"
                  className="h-8 text-sm"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal h-8 text-sm">
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {newScheduleDate ? format(newScheduleDate, "dd/MM/yyyy") : "Selecionar data..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newScheduleDate}
                      onSelect={setNewScheduleDate}
                      locale={ptBR}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex gap-2">
                  <Button size="sm" className="h-7 text-xs flex-1" onClick={addScheduleDate} disabled={!newScheduleDate}>
                    Salvar
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAddingDate(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              {scheduleDates.length === 0 && !addingDate && (
                <p className="text-xs text-muted-foreground italic">Nenhuma data agendada</p>
              )}
              {scheduleDates.map((sd) => (
                <div key={sd.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-normal">
                      {format(new Date(sd.scheduled_date), "dd/MM/yyyy")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{sd.label}</span>
                  </div>
                  <button
                    onClick={() => removeScheduleDate(sd.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
