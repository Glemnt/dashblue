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
  leadsQualificados: number;
  callsAgendadas: number;
  callsRealizadas: number;
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

interface TaxasConversao {
  leadsParaQualificados: number;
  qualificadosParaCalls: number;
  callsParaFechamentos: number;
  leadsParaFechamentos: number;
  ticketMedio: number;
}

interface RequestBody {
  campanhas: CampanhaData[];
  totais: TrafegoTotais;
  canais: CanalMetrics[];
  diasNoMes: number;
  diasDecorridos: number;
  dataAtual: string;
  taxasConversao: TaxasConversao;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campanhas, totais, canais, diasNoMes, diasDecorridos, dataAtual, taxasConversao } = await req.json() as RequestBody;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('[AI Trafego Analyst] Iniciando análise com', campanhas?.length, 'campanhas');
    console.log('[AI Trafego Analyst] Totais recebidos:', JSON.stringify(totais));
    console.log('[AI Trafego Analyst] Taxas de conversão:', JSON.stringify(taxasConversao));
    console.log('[AI Trafego Analyst] Contexto temporal:', { dataAtual, diasDecorridos, diasNoMes });

    const percentualMes = Math.round((diasDecorridos / diasNoMes) * 100);
    const diasRestantes = diasNoMes - diasDecorridos;

    // Pré-calcular projeções para validação
    const investimentoDia = diasDecorridos > 0 ? totais.investimento / diasDecorridos : 0;
    const investimentoProjetadoCalc = investimentoDia * diasNoMes;
    
    const leadsDia = diasDecorridos > 0 ? totais.leads / diasDecorridos : 0;
    const leadsProjetadosCalc = leadsDia * diasNoMes;
    
    const fechamentosDia = diasDecorridos > 0 ? totais.fechamentos / diasDecorridos : 0;
    const fechamentosProjetadosCalc = Math.max(
      fechamentosDia * diasNoMes,
      totais.fechamentos + 1
    );
    
    const receitaProjetadaCalc = fechamentosProjetadosCalc * taxasConversao.ticketMedio;
    const roasProjetadoCalc = investimentoProjetadoCalc > 0 ? receitaProjetadaCalc / investimentoProjetadoCalc : 0;
    const cacProjetadoCalc = fechamentosProjetadosCalc > 0 ? investimentoProjetadoCalc / fechamentosProjetadosCalc : 0;

    // Preparar dados das campanhas para análise
    const campanhasResumidas = campanhas.slice(0, 15).map(c => ({
      nome: c.nome,
      objetivo: c.objetivo,
      investimento: c.investimento,
      leads: c.leads,
      cpl: c.cpl,
      fechamentos: c.fechamentos,
      receita: c.receita,
      roas: c.roas,
      ctr: c.ctr || 0
    }));

    const systemPrompt = `Você é um especialista sênior em Tráfego Pago e Media Buying com 15+ anos de experiência em agências de marketing digital de alta performance.

=== REGRAS CRÍTICAS PARA CÁLCULOS ===

1. NUNCA retorne projeções menores que os valores atuais
2. Se já existem ${totais.fechamentos} fechamentos REAIS, a projeção de fechamentos DEVE ser >= ${totais.fechamentos}
3. Se já existem ${totais.leads} leads REAIS, a projeção de leads DEVE ser >= ${totais.leads}
4. Todas as projeções devem ser baseadas em MATEMÁTICA usando as fórmulas abaixo
5. Use as taxas de conversão REAIS fornecidas para calcular projeções

=== FÓRMULAS OBRIGATÓRIAS DE CÁLCULO ===

Métricas diárias (já calculadas para você):
- Investimento por dia: R$ ${investimentoDia.toFixed(2)}
- Leads por dia: ${leadsDia.toFixed(1)}
- Fechamentos por dia: ${fechamentosDia.toFixed(2)}

Projeções sugeridas (use como base, pode ajustar com sua análise):
- Investimento Projetado = ${investimentoDia.toFixed(2)} × ${diasNoMes} = R$ ${investimentoProjetadoCalc.toFixed(2)}
- Leads Projetados = ${leadsDia.toFixed(1)} × ${diasNoMes} = ${Math.round(leadsProjetadosCalc)}
- Fechamentos Projetados = MAX(${fechamentosDia.toFixed(2)} × ${diasNoMes}, ${totais.fechamentos} + 1) = ${Math.round(fechamentosProjetadosCalc)}
- Receita Projetada = ${Math.round(fechamentosProjetadosCalc)} × R$ ${taxasConversao.ticketMedio.toFixed(2)} = R$ ${receitaProjetadaCalc.toFixed(2)}
- ROAS Projetado = R$ ${receitaProjetadaCalc.toFixed(2)} / R$ ${investimentoProjetadoCalc.toFixed(2)} = ${roasProjetadoCalc.toFixed(2)}x
- CAC Projetado = R$ ${investimentoProjetadoCalc.toFixed(2)} / ${Math.round(fechamentosProjetadosCalc)} = R$ ${cacProjetadoCalc.toFixed(2)}

=== VALIDAÇÕES OBRIGATÓRIAS ===

Antes de retornar os valores, VALIDE:
✓ investimentoProjetado >= ${totais.investimento} (valor atual)
✓ leadsProjetados >= ${totais.leads} (valor atual)
✓ fechamentosProjetados >= ${totais.fechamentos} (valor atual) - CRÍTICO!
✓ Todos os valores devem ser números positivos
✓ ROAS e CAC devem fazer sentido matemático

=== EXPERTISE ===

- Análise avançada de métricas: ROAS, ROI, CAC, CPL, CTR, CPC
- Otimização de campanhas Meta Ads, Google Ads
- Estratégias de alocação de budget por objetivo
- Identificação de campanhas que devem ser pausadas (ROAS < 1.0)
- Identificação de campanhas para escalar (ROAS > 3.0)
- Análise de tendências e projeções

IMPORTANTE: Responda APENAS com JSON válido, sem markdown, sem backticks, sem explicações adicionais.

Estrutura EXATA do JSON:
{
  "executiveSummary": "string com resumo executivo em até 2 frases",
  "projecoes": {
    "investimentoProjetado": number,
    "leadsProjetados": number,
    "fechamentosProjetados": number,
    "roasProjetado": number,
    "cacProjetado": number,
    "receitaProjetada": number,
    "conclusao": "string com conclusão e recomendação principal"
  },
  "alertas": {
    "urgentes": [{"campanha": "nome", "problema": "descrição", "acao": "ação", "impacto": "impacto estimado"}],
    "atencao": [{"campanha": "nome", "problema": "descrição", "acao": "ação", "potencial": "potencial"}],
    "oportunidades": [{"campanha": "nome", "oportunidade": "descrição", "acao": "ação", "ganhoEstimado": "ganho"}]
  },
  "recomendacoes": [{"prioridade": 1, "titulo": "título", "descricao": "descrição", "ganhoEstimado": "ganho"}]
}`;

    const userPrompt = `=== CONTEXTO TEMPORAL ===
Data atual: ${dataAtual}
Dia do mês: ${diasDecorridos} de ${diasNoMes}
Dias restantes no mês: ${diasRestantes}
Progresso do mês: ${percentualMes}%

=== MÉTRICAS ATUAIS (DADOS REAIS DO MÊS ATÉ AGORA) ===
- Investimento até agora: R$ ${totais.investimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Leads gerados: ${totais.leads}
- CPL Médio: R$ ${totais.cpl.toFixed(2)}
- Leads Qualificados: ${totais.leadsQualificados}
- Calls Agendadas: ${totais.callsAgendadas}
- Calls Realizadas: ${totais.callsRealizadas}
- FECHAMENTOS REAIS (já realizados): ${totais.fechamentos} ← JÁ ACONTECERAM!
- RECEITA REAL: R$ ${totais.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ← JÁ FATURADO!
- ROAS Atual: ${totais.roas.toFixed(2)}x
- ROI Atual: ${totais.roi.toFixed(1)}%
- CAC Atual: R$ ${totais.cac.toFixed(2)}

=== TAXAS DE CONVERSÃO ATUAIS (baseadas em dados reais) ===
- Lead → Qualificado: ${(taxasConversao.leadsParaQualificados * 100).toFixed(2)}%
- Qualificado → Call: ${(taxasConversao.qualificadosParaCalls * 100).toFixed(2)}%
- Call → Fechamento: ${(taxasConversao.callsParaFechamentos * 100).toFixed(2)}%
- Lead → Fechamento (taxa geral): ${(taxasConversao.leadsParaFechamentos * 100).toFixed(2)}%
- Ticket Médio: R$ ${taxasConversao.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

=== METAS DO MÊS (FUNIL INVERTIDO BASEADO NA META COMERCIAL) ===

META COMERCIAL:
- Receita: R$ 325.000
- Ticket Médio: R$ 4.000
- Fechamentos necessários: 82

METAS DO FUNIL (de baixo para cima):
- Fechamentos: 82 (taxa call→fechamento meta: 20%)
- Calls Realizadas: 410 (taxa agendada→realizada meta: 80%)
- Calls Agendadas (MQL): 513 (taxa lead→qualificado meta: 50%)
- Leads: 1.026

METAS DE TRÁFEGO:
- Investimento: R$ 220.000
- Leads Mínimo: 1.026
- CPL Máximo: R$ 214,42
- CAC Máximo: R$ 2.682,93
- ROAS Mínimo: 1.48x

TAXAS DE CONVERSÃO META:
- Lead → Qualificado: 50%
- Call Agendada → Realizada: 80%
- Call → Fechamento: 20%

=== CAMPANHAS ATIVAS (Top 15 por investimento) ===
${JSON.stringify(campanhasResumidas, null, 2)}

=== PERFORMANCE POR CANAL ===
${JSON.stringify(canais, null, 2)}

=== INSTRUÇÕES FINAIS ===

Com base nos dados acima, analise e retorne:

1. PROJEÇÕES PARA FIM DO MÊS:
   - Use as fórmulas do system prompt
   - Lembre-se: já temos ${totais.fechamentos} fechamentos, então a projeção DEVE ser >= ${totais.fechamentos}
   - Já temos ${totais.leads} leads, então a projeção DEVE ser >= ${totais.leads}

2. ALERTAS URGENTES (para campanhas com ROAS < 1.0 ou problemas críticos)

3. ALERTAS DE ATENÇÃO (para campanhas com ROAS entre 1.0 e 1.5)

4. OPORTUNIDADES (para campanhas com ROAS > 3.0 que podem ser escaladas)

5. RECOMENDAÇÕES PRIORIZADAS (3-5 ações específicas com impacto estimado)

RESPONDA APENAS COM O JSON VÁLIDO.`;

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
        temperature: 0.3, // Mais determinístico para cálculos
        max_tokens: 3000
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

    // Validar e corrigir projeções se necessário
    if (analysis.projecoes) {
      const p = analysis.projecoes;
      
      // Garantir que projeções sejam >= valores atuais
      if (p.fechamentosProjetados < totais.fechamentos) {
        console.log('[AI Trafego Analyst] Corrigindo fechamentos projetados:', p.fechamentosProjetados, '->', Math.round(fechamentosProjetadosCalc));
        p.fechamentosProjetados = Math.round(fechamentosProjetadosCalc);
      }
      
      if (p.leadsProjetados < totais.leads) {
        console.log('[AI Trafego Analyst] Corrigindo leads projetados:', p.leadsProjetados, '->', Math.round(leadsProjetadosCalc));
        p.leadsProjetados = Math.round(leadsProjetadosCalc);
      }
      
      if (p.investimentoProjetado < totais.investimento) {
        console.log('[AI Trafego Analyst] Corrigindo investimento projetado:', p.investimentoProjetado, '->', Math.round(investimentoProjetadoCalc));
        p.investimentoProjetado = Math.round(investimentoProjetadoCalc);
      }
      
      // Recalcular ROAS e CAC se corrigidos
      if (p.receitaProjetada && p.investimentoProjetado > 0) {
        p.roasProjetado = p.receitaProjetada / p.investimentoProjetado;
      }
      
      if (p.fechamentosProjetados > 0 && p.investimentoProjetado > 0) {
        p.cacProjetado = p.investimentoProjetado / p.fechamentosProjetados;
      }
    }

    console.log('[AI Trafego Analyst] Análise concluída com sucesso');
    console.log('[AI Trafego Analyst] Projeções finais:', JSON.stringify(analysis.projecoes));

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
