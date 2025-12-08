import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CampanhaData {
  nome: string;
  objetivo: string;
  investimento: number;
  leads: number;
  cpl: number;
  fechamentos: number;
  receita: number;
  roas: number;
  ctr?: number;
  cpc?: number;
}

interface TrafegoTotais {
  investimento: number;
  leads: number;
  cpl: number;
  fechamentos: number;
  receita: number;
  roas: number;
  cac: number;
  roi: number;
}

interface CanalMetrics {
  canal: string;
  investimento: number;
  leads: number;
  cpl: number;
  fechamentos: number;
  receita: number;
  roas: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campanhas, totais, canais, diasNoMes, diasDecorridos } = await req.json() as {
      campanhas: CampanhaData[];
      totais: TrafegoTotais;
      canais: CanalMetrics[];
      diasNoMes: number;
      diasDecorridos: number;
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('[AI Trafego Analyst] Iniciando análise com', campanhas?.length, 'campanhas');
    console.log('[AI Trafego Analyst] Totais recebidos:', JSON.stringify(totais));

    const percentualMes = Math.round((diasDecorridos / diasNoMes) * 100);

    // Preparar dados das campanhas para análise
    const campanhasResumidas = campanhas.slice(0, 15).map(c => ({
      nome: c.nome,
      objetivo: c.objetivo,
      investimento: c.investimento,
      leads: c.leads,
      cpl: c.cpl,
      fechamentos: c.fechamentos,
      roas: c.roas,
      ctr: c.ctr || 0
    }));

    const systemPrompt = `Você é um especialista sênior em Tráfego Pago e Media Buying com 15+ anos de experiência em agências de marketing digital de alta performance. Seu expertise inclui:

- Análise avançada de métricas: ROAS, ROI, CAC, CPL, CTR, CPC
- Otimização de campanhas Meta Ads, Google Ads
- Estratégias de alocação de budget
- Projeções baseadas em tendências
- Identificação de oportunidades e riscos

Você sempre fornece análises acionáveis, com números específicos e recomendações claras.

IMPORTANTE: Responda APENAS com JSON válido, sem markdown, sem backticks, sem explicações. O JSON deve seguir exatamente esta estrutura:
{
  "executiveSummary": "string com resumo executivo em até 2 frases",
  "projecoes": {
    "investimentoProjetado": number,
    "leadsProjetados": number,
    "fechamentosProjetados": number,
    "roasProjetado": number,
    "cacProjetado": number,
    "conclusao": "string com conclusão e recomendação principal"
  },
  "alertas": {
    "urgentes": [
      {
        "campanha": "nome da campanha ou 'Geral'",
        "problema": "descrição do problema",
        "acao": "ação recomendada",
        "impacto": "impacto estimado em R$ ou %"
      }
    ],
    "atencao": [
      {
        "campanha": "nome da campanha ou 'Geral'",
        "problema": "descrição do problema",
        "acao": "ação recomendada",
        "potencial": "potencial de melhoria"
      }
    ],
    "oportunidades": [
      {
        "campanha": "nome da campanha ou 'Geral'",
        "oportunidade": "descrição da oportunidade",
        "acao": "ação recomendada",
        "ganhoEstimado": "ganho estimado em R$ ou %"
      }
    ]
  },
  "recomendacoes": [
    {
      "prioridade": 1,
      "titulo": "título curto",
      "descricao": "descrição detalhada da ação",
      "ganhoEstimado": "estimativa de ganho"
    }
  ]
}`;

    const userPrompt = `Analise os seguintes dados de tráfego pago e forneça insights acionáveis:

## MÉTRICAS ATUAIS (${percentualMes}% do mês)
- Investimento Total: R$ ${totais.investimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Leads Gerados: ${totais.leads}
- CPL Médio: R$ ${totais.cpl.toFixed(2)}
- Fechamentos: ${totais.fechamentos}
- Receita: R$ ${totais.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- ROAS: ${totais.roas.toFixed(2)}x
- CAC: R$ ${totais.cac.toFixed(2)}
- ROI: ${totais.roi.toFixed(1)}%

## METAS DO MÊS
- Investimento Máximo: R$ 110.000
- Leads Mínimo: 600
- CAC Máximo: R$ 8.000
- ROAS Mínimo: 2.0x

## CAMPANHAS ATIVAS (Top 15)
${JSON.stringify(campanhasResumidas, null, 2)}

## PERFORMANCE POR CANAL
${JSON.stringify(canais, null, 2)}

## DIAS NO MÊS
- Dias totais: ${diasNoMes}
- Dias decorridos: ${diasDecorridos}
- Dias restantes: ${diasNoMes - diasDecorridos}

Com base nesses dados:
1. Calcule projeções realistas para fim do mês
2. Identifique campanhas que precisam de atenção urgente (ROAS < 1.5 ou sem leads)
3. Identifique oportunidades de escalar (ROAS > 3.0)
4. Sugira realocações de budget se necessário
5. Forneça 3-5 recomendações priorizadas

RESPONDA APENAS COM O JSON, SEM NENHUM TEXTO ADICIONAL.`;

    console.log('[AI Trafego Analyst] Chamando Lovable AI Gateway...');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI Trafego Analyst] Erro da API:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Por favor, adicione créditos ao workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('[AI Trafego Analyst] Resposta recebida, parseando JSON...');

    // Limpar e parsear o JSON da resposta
    let cleanContent = content.trim();
    // Remover possíveis backticks de markdown
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.slice(7);
    }
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.slice(3);
    }
    if (cleanContent.endsWith('```')) {
      cleanContent = cleanContent.slice(0, -3);
    }
    cleanContent = cleanContent.trim();

    let analysis;
    try {
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('[AI Trafego Analyst] Erro ao parsear JSON:', parseError);
      console.error('[AI Trafego Analyst] Conteúdo recebido:', cleanContent.substring(0, 500));
      throw new Error('Falha ao processar resposta da IA');
    }

    console.log('[AI Trafego Analyst] Análise concluída com sucesso');

    return new Response(JSON.stringify({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('[AI Trafego Analyst] Erro:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Erro desconhecido",
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
