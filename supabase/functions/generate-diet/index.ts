import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { mode, patientProfile, foods, currentDiet } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    if (mode === "generate") {
      systemPrompt = `Você é um nutricionista especialista. Gere um plano alimentar completo e detalhado para o paciente.

REGRAS OBRIGATÓRIAS:
- Use APENAS alimentos da lista fornecida (food catalog)
- As quantidades devem ser em gramas (g)
- Retorne EXATAMENTE o JSON especificado, sem texto adicional
- Distribua os macronutrientes de forma equilibrada para atingir o TDEE do paciente
- Crie 5 refeições: Café da Manhã (07:00), Lanche da Manhã (10:00), Almoço (12:00), Lanche da Tarde (16:00), Jantar (20:00)
- Escolha alimentos variados e equilibrados de diferentes categorias
- As quantidades de cada alimento devem ser realistas (ex: 100-300g para carnes, 150-250g para arroz cozido, etc)

FORMATO DE RESPOSTA (JSON):
{
  "meals": [
    {
      "name": "CAFÉ DA MANHÃ",
      "time": "07:00",
      "foods": [
        { "food_name": "nome exato do alimento do catálogo", "quantity": 100 }
      ]
    }
  ]
}`;

      userPrompt = `Perfil do paciente:
- Sexo: ${patientProfile.sex === "M" ? "Masculino" : "Feminino"}
- Idade: ${patientProfile.age} anos
- Peso: ${patientProfile.weight} kg
- Objetivo: ${patientProfile.objective || "Manutenção"}
- TDEE: ${patientProfile.tdee} kcal/dia

Catálogo de alimentos disponíveis (nome | proteína/g | carboidrato/g | gordura/g | kcal/g):
${foods.map((f: any) => `${f.name} | ${f.protein_per_unit} | ${f.carbs_per_unit} | ${f.fat_per_unit} | ${f.kcal_per_unit}`).join("\n")}

Gere um plano alimentar completo para este paciente, distribuindo as calorias ao longo das 5 refeições para atingir aproximadamente ${patientProfile.tdee} kcal/dia.`;

    } else if (mode === "adjust_macros") {
      systemPrompt = `Você é um nutricionista especialista. Ajuste as quantidades dos alimentos da dieta atual para atingir as metas de macronutrientes especificadas.

REGRAS:
- Mantenha os mesmos alimentos e refeições, apenas ajuste as QUANTIDADES
- Tente atingir o mais próximo possível das metas de macros
- Retorne o JSON no mesmo formato da dieta recebida
- Quantidades devem ser realistas (mínimo 10g, máximo 500g por alimento)

FORMATO DE RESPOSTA (JSON):
{
  "meals": [
    {
      "meal_id": "id_da_refeição",
      "foods": [
        { "food_id": "id_do_alimento", "food_name": "nome", "quantity": 150 }
      ]
    }
  ]
}`;

      userPrompt = `Dieta atual:
${JSON.stringify(currentDiet, null, 2)}

Metas:
- Calorias alvo: ${patientProfile.tdee} kcal
- Peso do paciente: ${patientProfile.weight} kg

Ajuste as quantidades para atingir aproximadamente ${patientProfile.tdee} kcal, mantendo uma distribuição equilibrada de macros.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA insuficientes. Adicione créditos na sua conta." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("Erro no serviço de IA");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Resposta da IA não contém JSON válido");
    }

    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-diet error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
