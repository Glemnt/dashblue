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

// Obter contexto temporal completo (Brasília/São Paulo)
const getTemporalContext = () => {
  const now = new Date();
  const brasiliaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  
  const ano = brasiliaTime.getFullYear();
  const mes = brasiliaTime.getMonth();
  const dia = brasiliaTime.getDate();
  const diaSemana = brasiliaTime.getDay();
  
  const ultimoDiaMes = new Date(ano, mes + 1, 0).getDate();
  const diasRestantes = ultimoDiaMes - dia;
  
  let diasUteisRestantes = 0;
  for (let d = dia + 1; d <= ultimoDiaMes; d++) {
    const tempDate = new Date(ano, mes, d);
    const tempDiaSemana = tempDate.getDay();
    if (tempDiaSemana !== 0 && tempDiaSemana !== 6) {
      diasUteisRestantes++;
    }
  }
  
  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const mesNome = meses[mes];
  
  const diasSemana = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const diaSemanaNome = diasSemana[diaSemana];
  
  const percentualMesDecorrido = ((dia / ultimoDiaMes) * 100).toFixed(1);
  
  let periodoMes = '';
  if (dia <= 10) periodoMes = 'início do mês';
  else if (dia <= 20) periodoMes = 'meio do mês';
  else periodoMes = 'final do mês';
  
  const trimestre = Math.floor(mes / 3) + 1;
  
  const feriadosBrasileiros = [
    { data: '2025-01-01', nome: 'Ano Novo', impactoVendas: 'negativo' },
    { data: '2025-02-24', nome: 'Carnaval', impactoVendas: 'muito negativo' },
    { data: '2025-02-25', nome: 'Carnaval', impactoVendas: 'muito negativo' },
    { data: '2025-04-18', nome: 'Sexta-feira Santa', impactoVendas: 'negativo' },
    { data: '2025-04-21', nome: 'Tiradentes', impactoVendas: 'neutro' },
    { data: '2025-05-01', nome: 'Dia do Trabalho', impactoVendas: 'neutro' },
    { data: '2025-06-19', nome: 'Corpus Christi', impactoVendas: 'negativo' },
    { data: '2025-09-07', nome: 'Independência', impactoVendas: 'neutro' },
    { data: '2025-10-12', nome: 'Nossa Senhora Aparecida', impactoVendas: 'neutro' },
    { data: '2025-11-02', nome: 'Finados', impactoVendas: 'neutro' },
    { data: '2025-11-15', nome: 'Proclamação da República', impactoVendas: 'neutro' },
    { data: '2025-11-20', nome: 'Consciência Negra', impactoVendas: 'neutro' },
    { data: '2025-12-25', nome: 'Natal', impactoVendas: 'muito negativo' },
  ];
  
  const datasComemorativas = [
    { mes: 1, descricao: 'Planejamento anual - empresas definem orçamentos' },
    { mes: 2, descricao: 'Pré-Carnaval - produtividade reduzida' },
    { mes: 3, descricao: 'Retomada pós-Carnaval - empresas aceleram projetos' },
    { mes: 4, descricao: 'Fechamento trimestral - empresas buscam bater metas Q1' },
    { mes: 5, descricao: 'Mês curto (feriados) - expectativa de vendas menor' },
    { mes: 6, descricao: 'Metade do ano - revisão de estratégias e orçamentos' },
    { mes: 7, descricao: 'Férias escolares - decisores viajando, vendas mais lentas' },
    { mes: 8, descricao: 'Retomada pós-férias - empresas retomam projetos' },
    { mes: 9, descricao: 'Fechamento trimestral Q3 - pressão por resultados' },
    { mes: 10, descricao: 'Planejamento 2026 - empresas buscam soluções para ano seguinte' },
    { mes: 11, descricao: 'Black Friday (final) - alto volume de prospecção' },
    { mes: 12, descricao: 'Final de ano - decisores de férias, vendas difíceis' }
  ];
  
  const contextoMesAtual = datasComemorativas.find(d => d.mes === mes + 1)?.descricao || '';
  
  const feriadosProximos = [];
  for (let d = 0; d <= 7; d++) {
    const futureDate = new Date(ano, mes, dia + d);
    const futureDateStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${String(futureDate.getDate()).padStart(2, '0')}`;
    const feriado = feriadosBrasileiros.find(f => f.data === futureDateStr);
    if (feriado) {
      feriadosProximos.push({
        ...feriado,
        diasAte: d
      });
    }
  }
  
  let sazonalidade = '';
  if (mes === 0) sazonalidade = 'baixa (planejamento anual, decisões lentas)';
  else if (mes === 1) sazonalidade = 'muito baixa (Carnaval)';
  else if (mes === 2 || mes === 3) sazonalidade = 'alta (retomada pós-Carnaval, fechamento Q1)';
  else if (mes === 4) sazonalidade = 'média-baixa (muitos feriados)';
  else if (mes === 5) sazonalidade = 'média (metade do ano)';
  else if (mes === 6) sazonalidade = 'baixa (férias escolares)';
  else if (mes === 7) sazonalidade = 'média (retomada)';
  else if (mes === 8 || mes === 9) sazonalidade = 'alta (fechamento Q3, planejamento 2026)';
  else if (mes === 10) sazonalidade = 'muito alta (Black Friday, urgência de fim de ano)';
  else if (mes === 11) sazonalidade = 'muito baixa (férias, fim de ano)';
  
  const urgenciaTempo = diasUteisRestantes <= 3 
    ? 'CRÍTICA - últimos dias úteis do mês' 
    : diasUteisRestantes <= 7 
      ? 'ALTA - última semana útil'
      : diasUteisRestantes <= 10
        ? 'MÉDIA - aproximando do fim do mês'
        : 'NORMAL - ainda há tempo no mês';
  
  return {
    dataAtual: brasiliaTime.toLocaleDateString('pt-BR'),
    horaAtual: brasiliaTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    diaSemana: diaSemanaNome,
    mes: mesNome,
    ano,
    dia,
    trimestre,
    diasRestantes,
    diasUteisRestantes,
    percentualMesDecorrido,
    periodoMes,
    contextoMesAtual,
    sazonalidade,
    feriadosProximos: feriadosProximos.length > 0 
      ? feriadosProximos.map(f => `${f.nome} (${f.diasAte === 0 ? 'hoje' : `em ${f.diasAte} dias`}) - impacto: ${f.impactoVendas}`)
      : [],
    urgenciaTempo
  };
};

const analisarRitmo = (progressoMeta: number, percentualMesDecorrido: number): string => {
  const diferenca = progressoMeta - percentualMesDecorrido;
  
  if (diferenca < -10) {
    return `🔴 MUITO ATRASADO: Meta em ${progressoMeta.toFixed(1)}% vs ${percentualMesDecorrido}% do mês decorrido`;
  } else if (diferenca < -5) {
    return `🟠 ATRASADO: Meta em ${progressoMeta.toFixed(1)}% vs ${percentualMesDecorrido}% do mês decorrido`;
  } else if (diferenca >= -5 && diferenca <= 5) {
    return `🟡 NO RITMO: Meta em ${progressoMeta.toFixed(1)}% vs ${percentualMesDecorrido}% do mês decorrido`;
  } else if (diferenca > 5 && diferenca <= 15) {
    return `🟢 ADIANTADO: Meta em ${progressoMeta.toFixed(1)}% vs ${percentualMesDecorrido}% do mês decorrido`;
  } else {
    return `🚀 MUITO ADIANTADO: Meta em ${progressoMeta.toFixed(1)}% vs ${percentualMesDecorrido}% do mês decorrido`;
  }
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

const buildAnalysisPrompt = (metrics: any) => {
  const temporal = getTemporalContext();
  const ritmo = analisarRitmo(metrics.progressoMetaMensal || 0, parseFloat(temporal.percentualMesDecorrido));
  
  return `
Você é um consultor especialista em vendas B2B, gestão comercial e estratégias de crescimento.

⏰ CONTEXTO TEMPORAL CRÍTICO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Data Atual: ${temporal.dataAtual} (${temporal.diaSemana})
🕐 Hora: ${temporal.horaAtual} (Horário de Brasília)
📆 Mês: ${temporal.mes} de ${temporal.ano} (${temporal.trimestre}º trimestre)
📊 Progresso do mês: ${temporal.percentualMesDecorrido}% (${temporal.periodoMes})
⏳ Dias restantes no mês: ${temporal.diasRestantes} (${temporal.diasUteisRestantes} dias úteis)
🚨 Urgência: ${temporal.urgenciaTempo}

🎯 CONTEXTO DO MÊS ATUAL:
${temporal.contextoMesAtual}

📈 SAZONALIDADE B2B:
Expectativa de vendas: ${temporal.sazonalidade}

${temporal.feriadosProximos.length > 0 ? `⚠️ FERIADOS PRÓXIMOS (impactam vendas):
${temporal.feriadosProximos.join('\n')}` : '✅ Nenhum feriado nos próximos 7 dias'}

📊 ANÁLISE DE RITMO:
${ritmo}

INTERPRETAÇÃO DO RITMO:
- Se ATRASADO: recomendar ações emergenciais e aceleração
- Se NO RITMO: manter consistência
- Se ADIANTADO: focar em qualidade e pipeline futuro

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

GARGALOS IDENTIFICADOS:
${identifyBottlenecks(metrics)}

**IMPORTANTE - CONSIDERE OBRIGATORIAMENTE:**
1. Quantos dias úteis restam para bater a meta (${temporal.diasUteisRestantes})
2. Estamos no ${temporal.periodoMes} - adaptar urgência das recomendações
3. Sazonalidade atual (${temporal.sazonalidade}) - ajustar expectativas
4. Feriados próximos - considerar impacto em produtividade e vendas
5. Se há urgência crítica de tempo, priorizar ações de IMPACTO IMEDIATO
6. Se é início de mês, focar em construção de pipeline
7. Se é final de mês, focar em aceleração de fechamentos
8. Análise de ritmo (${ritmo.split(':')[0]}) - ajustar tom das recomendações

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

Suas recomendações DEVEM ser ajustadas ao contexto temporal!
Seja direto, acionável e use dados concretos. Retorne APENAS o JSON válido, sem markdown ou texto adicional.
`;
};

const buildChatPrompt = (metrics: any, history: any[], question: string) => {
  const temporal = getTemporalContext();
  
  return `
Você é um consultor especialista em vendas B2B.

⏰ CONTEXTO TEMPORAL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Data: ${temporal.dataAtual} (${temporal.diaSemana})
📊 ${temporal.periodoMes} - ${temporal.diasUteisRestantes} dias úteis restantes
📈 Sazonalidade: ${temporal.sazonalidade}
🚨 Urgência: ${temporal.urgenciaTempo}
${temporal.feriadosProximos.length > 0 ? `⚠️ Feriados próximos: ${temporal.feriadosProximos.join(', ')}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

Ao responder, SEMPRE considere:
- O tempo disponível até o fim do mês (${temporal.diasUteisRestantes} dias úteis)
- A sazonalidade atual (${temporal.sazonalidade})
- Feriados que podem impactar vendas
- Se a pergunta envolve projeções, calcule baseado em dias úteis restantes
- Se a pergunta envolve urgência, adapte ao ${temporal.periodoMes}

Responda de forma direta, acionável e baseada nos dados. Use Markdown para formatação.
`;
};

const buildSimulationPrompt = (metrics: any, changes: any) => {
  const temporal = getTemporalContext();
  
  return `
⏰ CONTEXTO TEMPORAL PARA SIMULAÇÃO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Data: ${temporal.dataAtual}
⏳ Dias úteis restantes: ${temporal.diasUteisRestantes}
📊 Progresso do mês: ${temporal.percentualMesDecorrido}%
📈 Sazonalidade: ${temporal.sazonalidade}
🚨 Urgência: ${temporal.urgenciaTempo}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

Calcule o impacto preciso considerando:
1. TEMPO DISPONÍVEL: Apenas ${temporal.diasUteisRestantes} dias úteis restantes
2. Se as mudanças propostas são VIÁVEIS neste prazo
3. Se a sazonalidade (${temporal.sazonalidade}) favorece ou dificulta
4. Se há feriados próximos que reduzem produtividade
5. O ${temporal.periodoMes} e urgência (${temporal.urgenciaTempo})

Retorne em JSON:
{
  "receitaProjetada": "R$ X",
  "diferencaReceita": 0,
  "contratosProjetados": 0,
  "diferencaContratos": 0,
  "metaProjetada": 0,
  "viabilidade": "Análise REALISTA da viabilidade no tempo disponível (2-3 linhas)",
  "passos": ["Passo 1", "Passo 2"]
}

Seja preciso nos cálculos e REALISTA na viabilidade considerando o tempo.
Na análise de viabilidade, seja HONESTO sobre se é possível no tempo disponível!
Retorne APENAS o JSON válido.
`;
};

const buildReportPrompt = (metrics: any) => {
  const temporal = getTemporalContext();
  const ritmo = analisarRitmo(metrics.progressoMetaMensal || 0, parseFloat(temporal.percentualMesDecorrido));
  
  return `
Gere um relatório executivo considerando o contexto temporal:

📅 REFERÊNCIA TEMPORAL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Data do relatório: ${temporal.dataAtual} (${temporal.diaSemana})
- Período: ${temporal.mes} de ${temporal.ano}
- Progresso: ${temporal.percentualMesDecorrido}% do mês decorrido
- Tempo restante: ${temporal.diasUteisRestantes} dias úteis
- Sazonalidade: ${temporal.sazonalidade}
- Contexto: ${temporal.contextoMesAtual}
- Ritmo: ${ritmo}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DADOS DO DASHBOARD:
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
  "projecoes": "Projeções REALISTAS para fim do mês baseadas em ${temporal.diasUteisRestantes} dias úteis restantes",
  "proximosPassos": ["Passo 1", "Passo 2"]
}

No relatório, inclua OBRIGATORIAMENTE:
1. Análise de RITMO (estamos adiantados/atrasados vs tempo decorrido)
2. PROJEÇÕES realistas baseadas em dias úteis restantes (${temporal.diasUteisRestantes})
3. Impacto de feriados e sazonalidade nas metas
4. Recomendações urgentes vs planejamento médio prazo
5. Se estamos em período favorável ou desafiador para vendas

Retorne APENAS o JSON válido.
`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, metrics, history, question, changes } = await req.json();

    // Validate analysis type
    if (!['analysis', 'chat', 'simulation', 'report'].includes(type)) {
      throw new Error('Invalid analysis type');
    }

    // Validate chat history length
    if (history && (!Array.isArray(history) || history.length > 50)) {
      throw new Error('Chat history must be an array with max 50 messages');
    }

    // Validate question length
    if (question && (typeof question !== 'string' || question.length > 1000)) {
      throw new Error('Question must be a string with max 1000 characters');
    }

    // Validate metrics structure
    if (metrics && (typeof metrics !== 'object' || Array.isArray(metrics) || metrics === null)) {
      throw new Error('Invalid metrics format - must be an object');
    }

    // Validate changes structure for simulation
    if (type === 'simulation' && changes && (typeof changes !== 'object' || Array.isArray(changes) || changes === null)) {
      throw new Error('Invalid changes format - must be an object');
    }

    // Sanitize string inputs to prevent abuse
    const sanitizeInput = (str: string) => str.substring(0, 1000).trim();
    const sanitizedQuestion = question ? sanitizeInput(question) : question;

    let prompt = '';
    
    switch (type) {
      case 'analysis':
        prompt = buildAnalysisPrompt(metrics);
        break;
      case 'chat':
        prompt = buildChatPrompt(metrics, history || [], sanitizedQuestion);
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