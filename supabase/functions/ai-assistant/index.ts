import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const formatarReal = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(valor);
};

const identifyBottlenecks = (metrics: any): string => {
  const gargalos = [];
  
  if (metrics.taxaShow < 75) {
    gargalos.push(`- Taxa de Show BAIXA: ${metrics.taxaShow.toFixed(1)}% (meta: 75%)`);
  }
  
  if (metrics.taxaConversao < 25) {
    gargalos.push(`- Taxa de Conversão BAIXA: ${metrics.taxaConversao.toFixed(1)}% (meta: 25%)`);
  }
  
  if (metrics.ticketMedio < 12000) {
    gargalos.push(`- Ticket Médio BAIXO: ${formatarReal(metrics.ticketMedio)} (meta: R$ 12.000)`);
  }
  
  if (metrics.taxaQualificacao < 35) {
    gargalos.push(`- Taxa de Qualificação BAIXA: ${metrics.taxaQualificacao.toFixed(1)}% (meta: 35%)`);
  }
  
  if (metrics.progressoMetaMensal < 50) {
    gargalos.push(`- Progresso da Meta CRÍTICO: ${metrics.progressoMetaMensal.toFixed(1)}% (esperado: >50%)`);
  }
  
  return gargalos.length > 0 ? gargalos.join('\n') : '- Nenhum gargalo crítico identificado';
};

const buildAnalysisPrompt = (metrics: any) => `
Você é um consultor especialista em vendas B2B, gestão comercial e estratégias de crescimento.

Analise os dados abaixo do dashboard comercial da Blue Ocean (consultoria SaaS de marketing para investidores brasileiros):

CONTEXTO DA EMPRESA:
- Modelo: SaaS B2B
- Ticket Meta: R$ 12.000
- Ciclo de vendas: SDR → Closer → Fechamento
- Squads: Hot Dogs vs Corvo Azul

MÉTRICAS GERAIS:
- Meta Mensal: ${formatarReal(metrics.metaMensal)}
- Receita Atual: ${formatarReal(metrics.receitaTotal)}
- Progresso: ${metrics.progressoMetaMensal.toFixed(1)}%
- Contratos: ${metrics.totalContratos} de 55 (meta)
- Ticket Médio: ${formatarReal(metrics.ticketMedio)} (meta: R$ 12.000)
- Taxa de Conversão Geral: ${metrics.taxaConversao.toFixed(1)}% (meta: 25%)

PERFORMANCE SDR:
- Total Calls: ${metrics.totalCalls}
- Calls Qualificadas: ${metrics.callsQualificadas}
- Taxa de Qualificação: ${metrics.taxaQualificacao.toFixed(1)}% (meta: 35%)
- Taxa de Show: ${metrics.taxaShow.toFixed(1)}% (meta: 75%)

PERFORMANCE CLOSER:
- Calls Realizadas: ${metrics.callsRealizadas}
- Contratos Fechados: ${metrics.totalContratos}
- Taxa de Conversão: ${metrics.taxaConversao.toFixed(1)}% (meta: 25%)
- Ticket Médio: ${formatarReal(metrics.ticketMedio)}

FUNIL:
- Leads: ${metrics.funil.leads}
- MQLs: ${metrics.funil.mqls}
- Calls Agendadas: ${metrics.funil.callsAgendadas}
- Calls Realizadas: ${metrics.funil.callsRealizadas}
- Contratos: ${metrics.funil.contratos}

SQUADS:
- Hot Dogs: ${formatarReal(metrics.squads.hotDogs.receita)} (${metrics.squads.hotDogs.contratos} contratos)
- Corvo Azul: ${formatarReal(metrics.squads.corvoAzul.receita)} (${metrics.squads.corvoAzul.contratos} contratos)
- Líder: ${metrics.squads.lider === 'hotDogs' ? 'Hot Dogs' : 'Corvo Azul'}
- Vantagem: ${formatarReal(metrics.squads.vantagem)}

GARGALOS IDENTIFICADOS:
${identifyBottlenecks(metrics)}

Com base nesses dados, forneça uma análise estruturada em JSON com:

{
  "executiveSummary": "Resumo executivo em 2-3 linhas",
  "status": "healthy|warning|critical",
  "bottlenecks": [
    {
      "id": "unique-id",
      "titulo": "Nome do gargalo",
      "descricao": "Descrição detalhada",
      "severidade": "alta|media|baixa",
      "impactoFinanceiro": "R$ X perdidos ou Y contratos",
      "metricaAfetada": "Nome da métrica"
    }
  ],
  "opportunities": [
    {
      "id": "unique-id",
      "titulo": "Nome da oportunidade",
      "descricao": "Descrição",
      "ganhoEstimado": "R$ X ou Y contratos",
      "dificuldade": "facil|media|dificil",
      "roi": "alto|medio|baixo"
    }
  ],
  "funnelAnalysis": [
    {
      "nome": "Leads → MQLs",
      "conversao": 0,
      "benchmark": 0,
      "status": "acima|dentro|abaixo",
      "insights": "Análise específica desta etapa"
    }
  ],
  "recommendations": [
    {
      "id": "unique-id",
      "priority": "alta|media|baixa",
      "titulo": "Implementar Follow-up Automático 24h",
      "problemaQueResolve": "Taxa de show está 20% abaixo da meta",
      "metricaAfetada": "Taxa de Show",
      "melhoriaEsperada": "+15% na taxa de show",
      "ganhoFinanceiro": "+R$ 45k/mês",
      "dificuldade": "facil|media|dificil",
      "tempoImplementacao": 5,
      "passos": ["Passo 1", "Passo 2"],
      "responsavel": "SDR|Closer|Gestor"
    }
  ]
}

Seja direto, acionável e use dados concretos. Retorne APENAS o JSON válido, sem markdown ou texto adicional.
`;

const buildChatPrompt = (metrics: any, history: any[], question: string) => `
Você é um consultor especialista em vendas B2B.

DADOS ATUAIS DO DASHBOARD:
- Meta Mensal: ${formatarReal(metrics.metaMensal)}
- Receita: ${formatarReal(metrics.receitaTotal)} (${metrics.progressoMetaMensal.toFixed(1)}%)
- Contratos: ${metrics.totalContratos}
- Ticket Médio: ${formatarReal(metrics.ticketMedio)}
- Taxa Show: ${metrics.taxaShow.toFixed(1)}%
- Taxa Conversão: ${metrics.taxaConversao.toFixed(1)}%

HISTÓRICO DA CONVERSA:
${history.map(msg => `${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`).join('\n')}

NOVA PERGUNTA DO USUÁRIO:
${question}

Responda de forma direta, acionável e baseada nos dados. Use Markdown para formatação.
`;

const buildSimulationPrompt = (metrics: any, changes: any) => `
DADOS ATUAIS:
- Receita: ${formatarReal(metrics.receitaTotal)}
- Contratos: ${metrics.totalContratos}
- Taxa Show: ${metrics.taxaShow.toFixed(1)}%
- Taxa Conversão: ${metrics.taxaConversao.toFixed(1)}%
- Ticket Médio: ${formatarReal(metrics.ticketMedio)}
- Meta: ${formatarReal(metrics.metaMensal)}

SIMULAÇÃO PROPOSTA:
- Taxa Show: ${metrics.taxaShow.toFixed(1)}% → ${changes.taxaShow}%
- Taxa Conversão: ${metrics.taxaConversao.toFixed(1)}% → ${changes.taxaConversao}%
- Ticket Médio: ${formatarReal(metrics.ticketMedio)} → ${formatarReal(changes.ticketMedio)}

Calcule o impacto preciso e retorne em JSON:
{
  "receitaProjetada": "R$ X",
  "diferencaReceita": 0,
  "contratosProjetados": 0,
  "diferencaContratos": 0,
  "metaProjetada": 0,
  "viabilidade": "Análise da viabilidade (2-3 linhas)",
  "passos": ["Passo 1", "Passo 2"]
}

Retorne APENAS o JSON válido.
`;

const buildReportPrompt = (metrics: any) => `
Gere um relatório executivo semanal completo baseado nestes dados:

- Meta Mensal: ${formatarReal(metrics.metaMensal)}
- Receita: ${formatarReal(metrics.receitaTotal)} (${metrics.progressoMetaMensal.toFixed(1)}%)
- Contratos: ${metrics.totalContratos}
- Ticket Médio: ${formatarReal(metrics.ticketMedio)}
- Taxa Show: ${metrics.taxaShow.toFixed(1)}%
- Taxa Conversão: ${metrics.taxaConversao.toFixed(1)}%

Retorne em JSON:
{
  "sumario": "Sumário executivo (3-5 linhas)",
  "destaques": ["Destaque 1", "Destaque 2"],
  "desafios": ["Desafio 1", "Desafio 2"],
  "recomendacoes": [
    {"titulo": "Rec 1", "descricao": "Desc"}
  ],
  "metricas": [
    {"nome": "Taxa Show", "atual": "65%", "meta": "75%", "tendencia": "↓ Caiu 5%"}
  ],
  "squads": "Análise da guerra de squads",
  "topPerformers": ["Nome: razão"],
  "needsCoaching": ["Nome: área de melhoria"],
  "projecoes": "Projeções para fim do mês",
  "proximosPassos": ["Passo 1", "Passo 2"]
}

Retorne APENAS o JSON válido.
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, metrics, history, question, changes } = await req.json();

    if (!['analysis', 'chat', 'simulation', 'report'].includes(type)) {
      throw new Error('Invalid analysis type');
    }

    let prompt = '';
    
    switch (type) {
      case 'analysis':
        prompt = buildAnalysisPrompt(metrics);
        break;
      case 'chat':
        prompt = buildChatPrompt(metrics, history || [], question);
        break;
      case 'simulation':
        prompt = buildSimulationPrompt(metrics, changes);
        break;
      case 'report':
        prompt = buildReportPrompt(metrics);
        break;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit excedido. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    let result;
    if (['analysis', 'simulation', 'report'].includes(type)) {
      try {
        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        result = JSON.parse(cleanContent);
      } catch (e) {
        console.error('JSON parse error:', e);
        console.error('Content:', content);
        throw new Error('Failed to parse AI response as JSON');
      }
    } else {
      result = content;
    }

    return new Response(
      JSON.stringify({ 
        [type]: result,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error('AI assistant error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro desconhecido' }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
