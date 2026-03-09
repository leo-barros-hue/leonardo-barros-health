import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calculator, Activity, Save, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PatientEnergyTabProps {
  patient: {
    id: string;
    sex: string | null;
    birth_date: string | null;
  };
}

export default function PatientEnergyTab({ patient }: PatientEnergyTabProps) {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState(patient.sex || "M");
  const [bodyFat, setBodyFat] = useState("");
  const [activityFactor, setActivityFactor] = useState("1.2");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lastSavedWeight, setLastSavedWeight] = useState<number | null>(null);
  const [lastSavedBodyFat, setLastSavedBodyFat] = useState<number | null>(null);
  const [selectedFormula, setSelectedFormula] = useState<string | null>(null);

  useEffect(() => {
    if (patient.birth_date) {
      const birthDate = new Date(patient.birth_date);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge.toString());
    }
  }, [patient.birth_date]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch latest measurements
      const { data: measurementData } = await supabase
        .from("body_measurements")
        .select("weight, body_fat_pct")
        .eq("patient_id", patient.id)
        .order("measured_at", { ascending: false })
        .limit(1)
        .single();

      if (measurementData?.weight) {
        setWeight(measurementData.weight.toString());
        setLastSavedWeight(measurementData.weight);
      }
      if (measurementData?.body_fat_pct) {
        setBodyFat(measurementData.body_fat_pct.toString());
        setLastSavedBodyFat(measurementData.body_fat_pct);
      }

      // Fetch energy profile
      const { data: profileData } = await supabase
        .from("patient_energy_profiles")
        .select("height, activity_factor, selected_formula")
        .eq("patient_id", patient.id)
        .single();

      if (profileData?.height) {
        setHeight(profileData.height.toString());
      }
      if (profileData?.activity_factor) {
        setActivityFactor(profileData.activity_factor.toString());
      }
      if (profileData?.selected_formula) {
        setSelectedFormula(profileData.selected_formula);
      }
    };
    fetchData();
  }, [patient.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save height, activity factor and selected formula to patient_energy_profiles
      const { error: profileError } = await supabase
        .from("patient_energy_profiles")
        .upsert({
          patient_id: patient.id,
          height: height ? parseFloat(height) : null,
          activity_factor: parseFloat(activityFactor),
          selected_formula: selectedFormula,
          updated_at: new Date().toISOString(),
        }, { onConflict: "patient_id" });

      if (profileError) throw profileError;

      // If weight or body fat changed, add new measurement
      const w = weight ? parseFloat(weight) : null;
      const bf = bodyFat ? parseFloat(bodyFat) : null;
      const weightChanged = w !== lastSavedWeight;
      const bodyFatChanged = bf !== lastSavedBodyFat;

      if ((w || bf) && (weightChanged || bodyFatChanged)) {
        const { error: measurementError } = await supabase
          .from("body_measurements")
          .insert({
            patient_id: patient.id,
            weight: w,
            body_fat_pct: bf,
          });

        if (measurementError) throw measurementError;
        setLastSavedWeight(w);
        setLastSavedBodyFat(bf);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast({ title: "Dados salvos com sucesso!" });
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSelectFormula = (formula: string) => {
    setSelectedFormula(formula);
  };

  const calculateResults = () => {
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    const a = parseFloat(age) || 0;
    const bf = parseFloat(bodyFat) || 0;
    const af = parseFloat(activityFactor) || 1.2;

    const lbm = w * (1 - bf / 100);

    let harris = 0;
    let mifflin = 0;

    if (w > 0 && h > 0 && a > 0) {
      if (sex === "M") {
        harris = 88.362 + 13.397 * w + 4.799 * h - 5.677 * a;
        mifflin = 10 * w + 6.25 * h - 5 * a + 5;
      } else {
        harris = 447.593 + 9.247 * w + 3.098 * h - 4.330 * a;
        mifflin = 10 * w + 6.25 * h - 5 * a - 161;
      }
    }

    let cunningham = null;
    let tinsley = null;

    if (w > 0 && bf > 0) {
      cunningham = 500 + 22 * lbm;
      tinsley = 284 + 25.9 * lbm;
    }

    return {
      harris: harris > 0 ? Math.round(harris) : null,
      mifflin: mifflin > 0 ? Math.round(mifflin) : null,
      cunningham: cunningham ? Math.round(cunningham) : null,
      tinsley: tinsley ? Math.round(tinsley) : null,
      tdee: {
        harris: harris > 0 ? Math.round(harris * af) : null,
        mifflin: mifflin > 0 ? Math.round(mifflin * af) : null,
        cunningham: cunningham ? Math.round(cunningham * af) : null,
        tinsley: tinsley ? Math.round(tinsley * af) : null,
      },
    };
  };

  const results = calculateResults();

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calculator className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Calculadora de Gasto Calórico</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Sexo</Label>
            <Select value={sex} onValueChange={setSex}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Masculino</SelectItem>
                <SelectItem value="F">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Idade (anos)</Label>
            <Input
              type="number"
              placeholder="Ex: 30"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Peso (kg)</Label>
            <Input
              type="number"
              placeholder="Ex: 75.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Altura (cm)</Label>
            <Input
              type="number"
              placeholder="Ex: 175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>% de Gordura Corporal (Opcional)</Label>
            <Input
              type="number"
              placeholder="Ex: 15"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Fator de Atividade (TMB x Fator)</Label>
            <Select value={activityFactor} onValueChange={setActivityFactor}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o fator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1.2">Sedentário (1.2)</SelectItem>
                <SelectItem value="1.375">Levemente Ativo (1.375)</SelectItem>
                <SelectItem value="1.55">Moderadamente Ativo (1.55)</SelectItem>
                <SelectItem value="1.725">Muito Ativo (1.725)</SelectItem>
                <SelectItem value="1.9">Extremamente Ativo (1.9)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar Informações"}
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground">Escolha a fórmula para utilizar com o seu paciente:</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormulaResultCard
          title="Harris-Benedict"
          bmr={results.harris}
          tdee={results.tdee.harris}
          description="Fórmula tradicional, boa para a população em geral."
          isSelected={selectedFormula === "harris"}
          onClick={() => handleSelectFormula("harris")}
        />
        <FormulaResultCard
          title="Mifflin-St Jeor"
          bmr={results.mifflin}
          tdee={results.tdee.mifflin}
          description="Recomendada para pacientes que estão com sobrepeso ou obesidade."
          isSelected={selectedFormula === "mifflin"}
          onClick={() => handleSelectFormula("mifflin")}
        />
        <FormulaResultCard
          title="Cunningham"
          bmr={results.cunningham}
          tdee={results.tdee.cunningham}
          description="Excelente para atletas e pessoas com muita massa magra. (Requer % Gordura)"
          isSelected={selectedFormula === "cunningham"}
          onClick={() => handleSelectFormula("cunningham")}
        />
        <FormulaResultCard
          title="Tinsley"
          bmr={results.tinsley}
          tdee={results.tdee.tinsley}
          description="Ótima alternativa para quem pratica musculação. (Requer % Gordura)"
          isSelected={selectedFormula === "tinsley"}
          onClick={() => handleSelectFormula("tinsley")}
        />
      </div>
    </div>
  );
}

function FormulaResultCard({ title, bmr, tdee, description }: { title: string; bmr: number | null; tdee: number | null; description: string }) {
  return (
    <div className="glass-card p-5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Activity className="w-16 h-16 text-primary" />
      </div>
      <h3 className="font-bold text-foreground text-lg mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground mb-4 h-8">{description}</p>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1 uppercase font-semibold">TMB / Basal</p>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-bold text-foreground leading-none">
              {bmr ? bmr.toLocaleString('pt-BR') : "—"}
            </span>
            {bmr && <span className="text-sm text-muted-foreground mb-0.5">kcal</span>}
          </div>
        </div>
        
        <div>
          <p className="text-xs text-muted-foreground mb-1 uppercase font-semibold">Gasto Total</p>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-bold text-primary leading-none">
              {tdee ? tdee.toLocaleString('pt-BR') : "—"}
            </span>
            {tdee && <span className="text-sm text-primary/70 mb-0.5">kcal</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
