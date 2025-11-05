import { useState, useEffect } from 'react';
import { usePeriodFilter } from '@/contexts/PeriodFilterContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useGoogleSheetsLeads } from '@/hooks/useGoogleSheetsLeads';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useGoogleSheetsCampanhas } from '@/hooks/useGoogleSheetsCampanhas';
import { calcularMetricas, formatarReal } from '@/utils/metricsCalculator';
import { supabase } from '@/integrations/supabase/client';
import { useTVMode } from '@/hooks/useTVMode';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import IAHeader from '@/components/ia/IAHeader';
import IAContextBanner from '@/components/ia/IAContextBanner';
import IAQuickActions from '@/components/ia/IAQuickActions';
import StatusCard from '@/components/ia/cards/StatusCard';
import RecommendationCard from '@/components/ia/cards/RecommendationCard';
import ChatContainer from '@/components/ia/chat/ChatContainer';
import AnalysisSkeleton from '@/components/ia/skeletons/AnalysisSkeleton';
import { Loader2 } from 'lucide-react';

const AssistenteIA = () => {
  const { selectedMonthKey } = usePeriodFilter();
  const { isTVMode, setIsTVMode } = useTVMode();
  const [now, setNow] = useState(new Date());
  const [analise, setAnalise] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant'; content: string; timestamp: Date}>>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [simulacao, setSimulacao] = useState<any>(null);
  const [relatorio, setRelatorio] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [simulationInputs, setSimulationInputs] = useState({
    taxaShow: 0,
    taxaConversao: 0,
    ticketMedio: 0
  });
  const { toast } = useToast();

  const { data: rawData, loading: loadingData, refetch } = useGoogleSheets(undefined, selectedMonthKey);
  const { totalLeads, totalMQLs } = useGoogleSheetsCampanhas();
  const { totalMQLs: mqlsLeads } = useGoogleSheetsLeads();

  const metricas = rawData.length > 0
    ? calcularMetricas(rawData, { totalLeads, totalMQLs: totalMQLs + mqlsLeads }, selectedMonthKey)
    : null;

  // Calcular dias úteis restantes
  const calcularDiasUteisRestantes = () => {
    const brasiliaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    const ano = brasiliaTime.getFullYear();
    const mes = brasiliaTime.getMonth();
    const dia = brasiliaTime.getDate();
    const ultimoDiaMes = new Date(ano, mes + 1, 0).getDate();
    
    let diasUteis = 0;
    for (let d = dia + 1; d <= ultimoDiaMes; d++) {
      const tempDate = new Date(ano, mes, d);
      const tempDiaSemana = tempDate.getDay();
      if (tempDiaSemana !== 0 && tempDiaSemana !== 6) {
        diasUteis++;
      }
    }
    return diasUteis;
  };

  const diasUteisRestantes = calcularDiasUteisRestantes();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (metricas && !analise && !isLoading) {
      gerarAnaliseCompleta();
    }
  }, [metricas]);

  useEffect(() => {
    if (metricas) {
      setSimulationInputs({
        taxaShow: metricas.taxaShow,
        taxaConversao: metricas.taxaConversao,
        ticketMedio: metricas.ticketMedio
      });
    }
  }, [metricas]);

  const gerarAnaliseCompleta = async () => {
    if (!metricas) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { type: 'analysis', metrics: metricas }
      });

      if (error) throw error;
      setAnalise(data);
      
      toast({ 
        title: "✅ Análise concluída", 
        description: "Insights gerados com sucesso" 
      });
    } catch (error: any) {
      console.error('Erro ao gerar análise:', error);
      toast({
        title: "❌ Erro",
        description: error.message || "Falha ao gerar análise",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const enviarMensagem = async (mensagemUsuario: string) => {
    if (!mensagemUsuario.trim() || isChatLoading || !metricas) return;
    
    const novasMensagens: Array<{role: 'user' | 'assistant'; content: string; timestamp: Date}> = [
      ...chatMessages, 
      { 
        role: 'user' as const, 
        content: mensagemUsuario,
        timestamp: new Date()
      }
    ];
    setChatMessages(novasMensagens);
    setIsChatLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          type: 'chat',
          metrics: metricas,
          history: chatMessages,
          question: mensagemUsuario
        }
      });

      if (error) throw error;

      if (data?.resposta) {
        setChatMessages([
          ...novasMensagens, 
          { 
            role: 'assistant' as const, 
            content: data.resposta,
            timestamp: new Date()
          }
        ]);
      }
    } catch (error: any) {
      toast({
        title: "❌ Erro no chat",
        description: error.message || "Falha ao enviar mensagem",
        variant: "destructive"
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  const simularCenario = async () => {
    if (!metricas) return;

    setIsSimulating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          type: 'simulation',
          metrics: metricas,
          changes: simulationInputs
        }
      });

      if (error) throw error;
      setSimulacao(data);
      toast({ title: "🔮 Simulação concluída" });
    } catch (error: any) {
      toast({
        title: "❌ Erro",
        description: error.message || "Falha ao simular",
        variant: "destructive"
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const gerarRelatorio = async () => {
    if (!metricas) return;

    setIsGeneratingReport(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { type: 'report', metrics: metricas }
      });

      if (error) throw error;
      setRelatorio(data);
      toast({ title: "📄 Relatório gerado" });
    } catch (error: any) {
      toast({
        title: "❌ Erro",
        description: error.message || "Falha ao gerar relatório",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Calculate temporal context
  const formatDate = (date: Date) => date.toLocaleDateString('pt-BR');
  const dataAtual = formatDate(now);
  const trimestre = Math.floor(now.getMonth() / 3) + 1;
  const percentualMes = ((now.getDate() / new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()) * 100).toFixed(1);
  const urgencia = diasUteisRestantes <= 3 ? 'CRÍTICA' : diasUteisRestantes <= 7 ? 'ALTA' : 'MÉDIA';
  const sazonalidade = 'Alta';
  
  // Determine overall status
  const getOverallStatus = (): 'healthy' | 'warning' | 'critical' => {
    if (!metricas) return 'warning';
    const progressoMeta = metricas.progressoMetaMensal;
    const progressoTempo = parseFloat(percentualMes);
    const diferenca = progressoMeta - progressoTempo;
    
    if (diferenca < -15) return 'critical';
    if (diferenca < -5) return 'warning';
    return 'healthy';
  };

  if (loadingData || !metricas) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B1120]">
      <Navigation isTVMode={isTVMode} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-[#0066FF] animate-spin mx-auto mb-4" />
            <p className="text-white text-xl">Carregando dados...</p>
          </div>
        </div>
      </div>
    );
  }

    return (
      <div className="min-h-screen flex flex-col bg-[#0B1120]">
        <Navigation isTVMode={isTVMode} />
      
      <IAHeader
        isTVMode={isTVMode}
        onToggleTVMode={() => setIsTVMode(!isTVMode)}
        onRefresh={() => {
          refetch();
          gerarAnaliseCompleta();
        }}
        status={getOverallStatus()}
        diasUteisRestantes={diasUteisRestantes}
        isLoading={isLoading}
      />
      
      <IAContextBanner
        isTVMode={isTVMode}
        dataAtual={dataAtual}
        trimestre={trimestre}
        progressoMes={parseFloat(percentualMes)}
        urgencia={urgencia}
        sazonalidade={sazonalidade}
      />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <IAQuickActions
            isTVMode={isTVMode}
            onChatClick={() => setActiveTab('chat')}
            onSimulatorClick={() => setActiveTab('simulator')}
            onReportClick={() => setActiveTab('report')}
            onAnalyzeClick={gerarAnaliseCompleta}
            isAnalyzing={isLoading}
          />
        </div>

        {/* Tabs System */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${isTVMode ? 'grid-cols-3 h-20 text-2xl' : 'grid-cols-5 h-12'} transition-all`}>
            <TabsTrigger value="overview" className={isTVMode ? 'text-xl' : ''}>
              📊 Visão Geral
            </TabsTrigger>
            <TabsTrigger value="chat" className={isTVMode ? 'text-xl' : ''}>
              💬 Chat IA
            </TabsTrigger>
            <TabsTrigger value="recommendations" className={isTVMode ? 'text-xl' : ''}>
              🎯 Recomendações
            </TabsTrigger>
            <TabsTrigger value="simulator" className={`${isTVMode ? 'text-xl hidden md:block' : ''}`}>
              🔮 Simulador
            </TabsTrigger>
            <TabsTrigger value="report" className={`${isTVMode ? 'text-xl hidden md:block' : ''}`}>
              📄 Relatório
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: VISÃO GERAL */}
          <TabsContent value="overview" className="space-y-6">
            {isLoading ? (
              <AnalysisSkeleton isTVMode={isTVMode} />
            ) : analise ? (
              <>
                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatusCard
                    isTVMode={isTVMode}
                    icon="🎯"
                    title="Ritmo"
                    value={metricas.progressoMetaMensal.toFixed(0) + '%'}
                    subtitle={`Meta: ${percentualMes}% do mês`}
                    trend={metricas.progressoMetaMensal > parseFloat(percentualMes) ? 'up' : 'down'}
                    variant={metricas.progressoMetaMensal > parseFloat(percentualMes) ? 'success' : 'warning'}
                  />
                  
                  <StatusCard
                    isTVMode={isTVMode}
                    icon="⚠️"
                    title="Gargalos Críticos"
                    value={analise.gargalos?.filter((g: any) => g.severidade === 'crítica').length || 0}
                    subtitle="Requerem ação imediata"
                    variant="danger"
                  />
                  
                  <StatusCard
                    isTVMode={isTVMode}
                    icon="💡"
                    title="Recomendações"
                    value={analise.recomendacoes?.length || 0}
                    subtitle="Ações sugeridas"
                    variant="default"
                  />
                  
                  <StatusCard
                    isTVMode={isTVMode}
                    icon="📊"
                    title="Projeção"
                    value={formatarReal(metricas.receitaTotal * (100 / metricas.progressoMetaMensal))}
                    subtitle={`${((metricas.receitaTotal * (100 / metricas.progressoMetaMensal)) / metricas.metaMensal * 100).toFixed(0)}% da meta`}
                    trend={metricas.progressoMetaMensal >= parseFloat(percentualMes) ? 'up' : 'down'}
                    variant={metricas.progressoMetaMensal >= parseFloat(percentualMes) ? 'success' : 'warning'}
                  />
                </div>

                {/* Summary */}
                <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
                  <div className={`${isTVMode ? 'p-8' : 'p-6'} transition-all`}>
                    <h3 className={`font-bold mb-4 transition-all ${isTVMode ? 'text-3xl' : 'text-xl'}`}>
                      📋 Sumário Executivo
                    </h3>
                    <p className={`text-muted-foreground whitespace-pre-wrap transition-all ${isTVMode ? 'text-2xl leading-relaxed' : 'text-base'}`}>
                      {analise.sumario}
                    </p>
                  </div>
                </Card>

                {/* Top 3 Recommendations */}
                <div>
                  <h3 className={`font-bold mb-4 transition-all ${isTVMode ? 'text-4xl' : 'text-2xl'}`}>
                    🎯 Top 3 Recomendações Prioritárias
                  </h3>
                  <div className="space-y-4">
                    {analise.recomendacoes?.slice(0, 3).map((rec: any, index: number) => (
                      <RecommendationCard
                        key={index}
                        isTVMode={isTVMode}
                        priority={rec.prioridade === 'urgente' ? 'critical' : rec.prioridade === 'alta' ? 'high' : 'medium'}
                        title={rec.acao}
                        description={rec.justificativa}
                        impact={rec.impacto}
                        timeline={rec.prazo}
                        difficulty={rec.dificuldade}
                        steps={rec.passos || []}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <Card>
                <div className={`${isTVMode ? 'p-12' : 'p-8'} text-center transition-all`}>
                  <div className={`${isTVMode ? 'text-8xl' : 'text-6xl'} mb-4`}>🤖</div>
                  <h3 className={`font-bold mb-2 transition-all ${isTVMode ? 'text-4xl' : 'text-2xl'}`}>
                    Análise não disponível
                  </h3>
                  <p className={`text-muted-foreground mb-6 transition-all ${isTVMode ? 'text-2xl' : 'text-base'}`}>
                    Clique em "Analisar" para gerar uma análise completa
                  </p>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* TAB 2: CHAT IA */}
          <TabsContent value="chat">
            <ChatContainer
              isTVMode={isTVMode}
              messages={chatMessages}
              onSendMessage={enviarMensagem}
              isTyping={isChatLoading}
            />
          </TabsContent>

          {/* TAB 3: RECOMENDAÇÕES */}
          <TabsContent value="recommendations" className="space-y-6">
            {analise?.recomendacoes && analise.recomendacoes.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`font-bold transition-all ${isTVMode ? 'text-4xl' : 'text-2xl'}`}>
                    🎯 Todas as Recomendações
                  </h2>
                  <div className={`text-muted-foreground transition-all ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                    {analise.recomendacoes.length} ações sugeridas
                  </div>
                </div>
                
                <div className="space-y-4">
                  {analise.recomendacoes.map((rec: any, index: number) => (
                    <RecommendationCard
                      key={index}
                      isTVMode={isTVMode}
                      priority={rec.prioridade === 'urgente' ? 'critical' : rec.prioridade === 'alta' ? 'high' : rec.prioridade === 'média' ? 'medium' : 'low'}
                      title={rec.acao}
                      description={rec.justificativa}
                      impact={rec.impacto}
                      timeline={rec.prazo}
                      difficulty={rec.dificuldade}
                      steps={rec.passos || []}
                    />
                  ))}
                </div>
              </>
            ) : (
              <Card>
                <div className={`${isTVMode ? 'p-12' : 'p-8'} text-center transition-all`}>
                  <div className={`${isTVMode ? 'text-8xl' : 'text-6xl'} mb-4`}>🎯</div>
                  <h3 className={`font-bold mb-2 transition-all ${isTVMode ? 'text-4xl' : 'text-2xl'}`}>
                    Nenhuma recomendação disponível
                  </h3>
                  <p className={`text-muted-foreground transition-all ${isTVMode ? 'text-2xl' : 'text-base'}`}>
                    Gere uma análise primeiro para ver as recomendações
                  </p>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* TAB 4: SIMULADOR */}
          <TabsContent value="simulator">
            <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30">
              <div className={`${isTVMode ? 'p-8' : 'p-6'} transition-all`}>
                <h2 className={`font-bold mb-6 transition-all ${isTVMode ? 'text-4xl' : 'text-2xl'}`}>
                  🔮 Simulador de Cenários
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Inputs */}
                  <div className="space-y-6">
                    <h3 className={`font-semibold mb-4 transition-all ${isTVMode ? 'text-2xl' : 'text-lg'}`}>
                      Ajustar Métricas:
                    </h3>
                    
                    <div>
                      <label className={`block mb-2 transition-all ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                        Taxa de Show: {simulationInputs.taxaShow.toFixed(0)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={simulationInputs.taxaShow}
                        className="w-full"
                        onChange={(e) => setSimulationInputs({ ...simulationInputs, taxaShow: parseInt(e.target.value) })}
                      />
                    </div>
                    
                    <div>
                      <label className={`block mb-2 transition-all ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                        Taxa de Conversão: {simulationInputs.taxaConversao.toFixed(0)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={simulationInputs.taxaConversao}
                        className="w-full"
                        onChange={(e) => setSimulationInputs({ ...simulationInputs, taxaConversao: parseInt(e.target.value) })}
                      />
                    </div>
                    
                    <div>
                      <label className={`block mb-2 transition-all ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                        Ticket Médio: R$ {simulationInputs.ticketMedio.toFixed(0)}
                      </label>
                      <input
                        type="range"
                        min="5000"
                        max="30000"
                        step="1000"
                        value={simulationInputs.ticketMedio}
                        className="w-full"
                        onChange={(e) => setSimulationInputs({ ...simulationInputs, ticketMedio: parseInt(e.target.value) })}
                      />
                    </div>
                    
                    <Button
                      onClick={simularCenario}
                      disabled={isSimulating}
                      className={`w-full transition-all ${isTVMode ? 'py-8 text-2xl' : 'py-6 text-lg'}`}
                    >
                      {isSimulating ? 'Simulando...' : '🔮 Simular Cenário'}
                    </Button>
                  </div>
                  
                  {/* Results */}
                  <div className={`bg-black/20 rounded-lg ${isTVMode ? 'p-8' : 'p-6'} transition-all`}>
                    <h3 className={`font-semibold mb-4 transition-all ${isTVMode ? 'text-2xl' : 'text-lg'}`}>
                      Resultados da Simulação:
                    </h3>
                    
                    {simulacao ? (
                      <div className="space-y-4">
                        <div>
                          <p className={`text-muted-foreground transition-all ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                            Projeção de Receita:
                          </p>
                          <p className={`font-bold text-green-400 transition-all ${isTVMode ? 'text-4xl' : 'text-2xl'}`}>
                            {simulacao.projecaoReceita}
                          </p>
                        </div>
                        
                        <div>
                          <p className={`text-muted-foreground transition-all ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                            Atingimento de Meta:
                          </p>
                          <p className={`font-bold transition-all ${isTVMode ? 'text-4xl' : 'text-2xl'}`}>
                            {simulacao.percentualMeta}
                          </p>
                        </div>
                        
                        {simulacao.viabilidade && (
                          <div>
                            <p className={`text-muted-foreground transition-all ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                              Viabilidade:
                            </p>
                            <p className={`whitespace-pre-wrap transition-all ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                              {simulacao.viabilidade}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className={`text-muted-foreground text-center py-12 transition-all ${isTVMode ? 'text-2xl' : 'text-base'}`}>
                        Ajuste as métricas e clique em "Simular" para ver os resultados
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 5: RELATÓRIO */}
          <TabsContent value="report">
            <Card className="bg-gradient-to-r from-green-500/20 to-teal-500/20 border-green-500/30">
              <div className={`${isTVMode ? 'p-8' : 'p-6'} transition-all`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`font-bold transition-all ${isTVMode ? 'text-4xl' : 'text-2xl'}`}>
                    📄 Relatório Executivo
                  </h2>
                  <Button
                    onClick={gerarRelatorio}
                    disabled={isGeneratingReport}
                    size={isTVMode ? 'lg' : 'default'}
                  >
                    {isGeneratingReport ? 'Gerando...' : '📥 Gerar Relatório'}
                  </Button>
                </div>
                
                {relatorio ? (
                  <div className="space-y-6">
                    {relatorio.sumario && (
                      <div>
                        <h3 className={`font-semibold mb-3 transition-all ${isTVMode ? 'text-3xl' : 'text-xl'}`}>
                          📊 Sumário Executivo
                        </h3>
                        <p className={`text-muted-foreground whitespace-pre-wrap transition-all ${isTVMode ? 'text-2xl leading-relaxed' : 'text-base'}`}>
                          {relatorio.sumario}
                        </p>
                      </div>
                    )}
                    
                    {relatorio.destaques && relatorio.destaques.length > 0 && (
                      <div>
                        <h3 className={`font-semibold mb-3 transition-all ${isTVMode ? 'text-3xl' : 'text-xl'}`}>
                          ✅ Destaques Positivos
                        </h3>
                        <ul className={`space-y-2 transition-all ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                          {relatorio.destaques.map((destaque: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-400">✓</span>
                              <span>{destaque}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {relatorio.desafios && relatorio.desafios.length > 0 && (
                      <div>
                        <h3 className={`font-semibold mb-3 transition-all ${isTVMode ? 'text-3xl' : 'text-xl'}`}>
                          ⚠️ Desafios
                        </h3>
                        <ul className={`space-y-2 transition-all ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                          {relatorio.desafios.map((desafio: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-yellow-400">⚠</span>
                              <span>{desafio}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {relatorio.acoesChave && relatorio.acoesChave.length > 0 && (
                      <div>
                        <h3 className={`font-semibold mb-3 transition-all ${isTVMode ? 'text-3xl' : 'text-xl'}`}>
                          🎯 Top 5 Ações Prioritárias
                        </h3>
                        <ol className={`list-decimal list-inside space-y-2 transition-all ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                          {relatorio.acoesChave.map((acao: string, index: number) => (
                            <li key={index}>{acao}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className={`${isTVMode ? 'text-8xl' : 'text-6xl'} mb-4`}>📄</div>
                    <p className={`text-muted-foreground transition-all ${isTVMode ? 'text-2xl' : 'text-base'}`}>
                      Clique em "Gerar Relatório" para criar um relatório executivo completo
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {!isTVMode && <Footer />}
    </div>
  );
};

export default AssistenteIA;
