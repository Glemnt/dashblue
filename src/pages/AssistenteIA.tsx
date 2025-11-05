import { useState, useEffect } from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useGoogleSheetsCampanhas } from '@/hooks/useGoogleSheetsCampanhas';
import { useGoogleSheetsLeads } from '@/hooks/useGoogleSheetsLeads';
import { calcularMetricas } from '@/utils/metricsCalculator';
import { usePeriodFilter } from '@/contexts/PeriodFilterContext';
import { useTVMode } from '@/hooks/useTVMode';
import { PeriodType, DateRange } from '@/utils/dateFilters';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PeriodFilter from '@/components/sdr/PeriodFilter';
import TVModeToggle from '@/components/TVModeToggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { RefreshCw, Sparkles, TrendingUp, AlertTriangle, Target, MessageSquare, Calculator, FileText, Loader2 } from 'lucide-react';
import logoWhite from '@/assets/logo-white.png';

const AssistenteIA = () => {
  const { toast } = useToast();
  const { selectedMonthKey, periodType, dateRange, setPeriodType, setDateRange, setSelectedMonthKey } = usePeriodFilter();
  const { isTVMode, setIsTVMode } = useTVMode();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [simulation, setSimulation] = useState<any>(null);
  const [simulationValues, setSimulationValues] = useState({
    taxaShow: 0,
    taxaConversao: 0,
    ticketMedio: 0
  });
  const [report, setReport] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const { data: rawData, loading: loadingData, refetch } = useGoogleSheets(undefined, selectedMonthKey);
  const { totalLeads, totalMQLs } = useGoogleSheetsCampanhas();
  const { totalMQLs: mqlsLeads } = useGoogleSheetsLeads();

  const metricas = rawData.length > 0
    ? calcularMetricas(rawData, { totalLeads, totalMQLs: totalMQLs + mqlsLeads }, selectedMonthKey)
    : null;

  // Calcular dias úteis restantes no mês
  const calcularDiasUteisRestantes = () => {
    const now = new Date();
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

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (metricas && !analysis && !loading) {
      gerarAnaliseCompleta();
    }
  }, [metricas]);

  useEffect(() => {
    if (metricas) {
      setSimulationValues({
        taxaShow: metricas.taxaShow,
        taxaConversao: metricas.taxaConversao,
        ticketMedio: metricas.ticketMedio
      });
    }
  }, [metricas]);

  const gerarAnaliseCompleta = async () => {
    if (!metricas) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { type: 'analysis', metrics: metricas }
      });

      if (error) throw error;
      setAnalysis(data.analysis);
      
      localStorage.setItem('lastAnalysis', JSON.stringify({
        data: data.analysis,
        timestamp: new Date()
      }));
      
      toast({ title: "✅ Análise concluída", description: "Insights gerados com sucesso" });
    } catch (error: any) {
      console.error('Erro ao gerar análise:', error);
      toast({
        title: "❌ Erro",
        description: error.message || "Falha ao gerar análise",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const enviarMensagem = async () => {
    if (!chatInput.trim() || !metricas) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          type: 'chat',
          metrics: metricas,
          history: chatMessages,
          question: chatInput
        }
      });

      if (error) throw error;

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.chat,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
      localStorage.setItem('chatHistory', JSON.stringify([...chatMessages, assistantMessage]));
    } catch (error: any) {
      toast({
        title: "❌ Erro no chat",
        description: error.message || "Falha ao enviar mensagem",
        variant: "destructive"
      });
    } finally {
      setChatLoading(false);
    }
  };

  const simularCenario = async () => {
    if (!metricas) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          type: 'simulation',
          metrics: metricas,
          changes: simulationValues
        }
      });

      if (error) throw error;
      setSimulation(data.simulation);
      toast({ title: "🔮 Simulação concluída" });
    } catch (error: any) {
      toast({
        title: "❌ Erro",
        description: error.message || "Falha ao simular",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const gerarRelatorio = async () => {
    if (!metricas) return;

    setReportLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { type: 'report', metrics: metricas }
      });

      if (error) throw error;
      setReport(data.report);
      toast({ title: "📄 Relatório gerado" });
    } catch (error: any) {
      toast({
        title: "❌ Erro",
        description: error.message || "Falha ao gerar relatório",
        variant: "destructive"
      });
    } finally {
      setReportLoading(false);
    }
  };

  if (loadingData || !metricas) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#0066FF] animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Carregando dados...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    if (metricas.progressoMetaMensal >= 80) return 'bg-green-500';
    if (metricas.progressoMetaMensal >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-[#0B1120]">
      {/* Header */}
      <header className="bg-[#0B1120] border-b-2 border-white/15 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-6 md:py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <img src={logoWhite} alt="Blue Ocean" className={isTVMode ? "h-20" : "h-12"} />
              <div>
                <h1 className={`font-outfit font-bold text-white ${isTVMode ? 'text-6xl' : 'text-3xl md:text-4xl'}`}>
                  Assistente de IA Comercial
                </h1>
                <p className={`text-[#94A3B8] font-outfit ${isTVMode ? 'text-3xl mt-2' : 'text-sm md:text-base'}`}>
                  Insights estratégicos baseados em dados
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <TVModeToggle isTVMode={isTVMode} onToggle={() => setIsTVMode(!isTVMode)} />
              <Button
                onClick={() => {
                  refetch();
                  gerarAnaliseCompleta();
                }}
                variant="outline"
                className={isTVMode ? "text-2xl px-8 py-6" : ""}
              >
                <RefreshCw className={`${isTVMode ? 'w-8 h-8 mr-4' : 'w-4 h-4 mr-2'}`} />
                Atualizar
              </Button>
              <div className={`text-right ${isTVMode ? 'text-2xl' : 'text-sm'}`}>
                <p className="text-white font-semibold">{formatDate(currentTime)}</p>
                <p className="text-[#94A3B8]">{formatTime(currentTime)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <Navigation isTVMode={isTVMode} />
      
      <div className="max-w-[1920px] mx-auto">
        <PeriodFilter 
          onFilterChange={(type: PeriodType, range: DateRange) => {
            setPeriodType(type);
            setDateRange(range);
          }}
          onMonthChange={setSelectedMonthKey}
          currentPeriod={periodType}
          currentDateRange={dateRange}
          selectedMonthKey={selectedMonthKey}
          isTVMode={isTVMode}
        />
      </div>

      {/* Contexto Temporal */}
      <section className="bg-[#0B1120] py-8 px-6 md:px-12">
        <Card className="max-w-[1920px] mx-auto bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            📅 Contexto Temporal
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Data Atual</p>
              <p className="text-white font-bold">
                {new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
              </p>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm">Dias Úteis Restantes</p>
              <p className="text-cyan-400 font-bold text-2xl">
                {calcularDiasUteisRestantes()}
              </p>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm">Progresso do Mês</p>
              <p className="text-white font-bold">
                {((new Date().getDate() / new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()) * 100).toFixed(0)}%
              </p>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm">Trimestre</p>
              <p className="text-white font-bold">
                Q{Math.floor(new Date().getMonth() / 3) + 1} / {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Status do Assistente */}
      <section className="bg-gradient-to-br from-[#0066FF]/20 to-[#00E5CC]/20 py-12 md:py-20 px-6 md:px-12">
        <Card className="max-w-4xl mx-auto bg-[#151E35] border-2 border-[#0066FF]/30 p-12">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full bg-[#0066FF]/20 animate-pulse" />
              <div className="absolute inset-2 rounded-full bg-[#0066FF]/40 animate-ping" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-[#00E5CC]" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Assistente Online ✅</h2>
            <p className="text-[#94A3B8] mb-8">
              {loading ? 'Analisando dados...' : 'Análise completa disponível'}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#0B1120] p-4 rounded-lg">
                <p className="text-[#00E5CC] text-2xl font-bold">{analysis?.recommendations?.length || 0}</p>
                <p className="text-[#94A3B8] text-sm">Recomendações</p>
              </div>
              <div className="bg-[#0B1120] p-4 rounded-lg">
                <p className="text-[#FFB800] text-2xl font-bold">{analysis?.bottlenecks?.length || 0}</p>
                <p className="text-[#94A3B8] text-sm">Gargalos</p>
              </div>
              <div className="bg-[#0B1120] p-4 rounded-lg">
                <p className="text-[#0066FF] text-2xl font-bold">{analysis?.opportunities?.length || 0}</p>
                <p className="text-[#94A3B8] text-sm">Oportunidades</p>
              </div>
              <div className="bg-[#0B1120] p-4 rounded-lg">
                <p className="text-white text-2xl font-bold">98%</p>
                <p className="text-[#94A3B8] text-sm">Confiança</p>
              </div>
            </div>

            <Button onClick={gerarAnaliseCompleta} disabled={loading} className="bg-[#0066FF] hover:bg-[#0066FF]/90">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Gerar Nova Análise
                </>
              )}
            </Button>
          </div>
        </Card>
      </section>

      {/* Análise Automática */}
      {analysis && (
        <section className="bg-[#F8FAFC] py-12 md:py-20 px-6 md:px-12">
          <div className="max-w-[1920px] mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B1120] mb-8 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-[#0066FF]" />
              Diagnóstico Atual
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Status Geral */}
              <Card className={`${getStatusColor()} bg-opacity-10 border-2 p-8`}>
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 ${getStatusColor()} rounded-full flex items-center justify-center text-3xl`}>
                    {analysis.status === 'healthy' ? '🟢' : analysis.status === 'warning' ? '🟡' : '🔴'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-[#0B1120] mb-2">
                      {analysis.status === 'healthy' ? 'Saudável' : analysis.status === 'warning' ? 'Atenção' : 'Crítico'}
                    </h3>
                    <p className="text-[#0B1120]/80">{analysis.executiveSummary}</p>
                  </div>
                </div>
              </Card>

              {/* Principais Gargalos */}
              <Card className="bg-white border-2 border-red-500/30 p-8">
                <h3 className="text-2xl font-bold text-[#0B1120] mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  Principais Gargalos
                </h3>
                <div className="space-y-4">
                  {analysis.bottlenecks?.slice(0, 3).map((gargalo: any) => (
                    <div key={gargalo.id} className="border-l-4 border-red-500 pl-4">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-bold text-[#0B1120]">{gargalo.titulo}</h4>
                        <Badge variant={gargalo.severidade === 'alta' ? 'destructive' : 'secondary'}>
                          {gargalo.severidade}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#0B1120]/70 mb-2">{gargalo.descricao}</p>
                      <p className="text-xs text-red-600 font-semibold">Impacto: {gargalo.impactoFinanceiro}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Recomendações */}
      {analysis?.recommendations && (
        <section className="bg-[#0B1120] py-12 md:py-20 px-6 md:px-12">
          <div className="max-w-[1920px] mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 flex items-center gap-3">
              <Target className="w-8 h-8 text-[#00E5CC]" />
              Plano de Ação Recomendado
            </h2>

            <div className="grid gap-6">
              {analysis.recommendations.slice(0, 5).map((rec: any) => (
                <Card key={rec.id} className={`bg-[#151E35] border-l-4 ${
                  rec.priority === 'alta' ? 'border-red-500' : 
                  rec.priority === 'media' ? 'border-yellow-500' : 'border-green-500'
                } p-6`}>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{rec.titulo}</h3>
                    <Badge variant={rec.priority === 'alta' ? 'destructive' : 'secondary'}>
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-[#94A3B8] mb-4">{rec.problemaQueResolve}</p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-[#94A3B8]">Impacto</p>
                      <p className="text-[#00E5CC] font-semibold">{rec.melhoriaEsperada}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#94A3B8]">Ganho</p>
                      <p className="text-[#00E5CC] font-semibold">{rec.ganhoFinanceiro}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#94A3B8]">Tempo</p>
                      <p className="text-white font-semibold">{rec.tempoImplementacao} dias</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-[#94A3B8] mb-2">Passos:</p>
                    <ol className="list-decimal list-inside space-y-1 text-white text-sm">
                      {rec.passos.map((passo: string, i: number) => (
                        <li key={i}>{passo}</li>
                      ))}
                    </ol>
                  </div>

                  <p className="text-xs text-[#94A3B8]">Responsável: <span className="text-white">{rec.responsavel}</span></p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Chat Interativo */}
      <section className="bg-[#F8FAFC] py-12 md:py-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0B1120] mb-8 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-[#0066FF]" />
            Pergunte ao Assistente
          </h2>

          <Card className="bg-white p-6">
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-lg ${
                    msg.role === 'user' ? 'bg-[#0066FF] text-white' : 'bg-[#F8FAFC] text-[#0B1120]'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#F8FAFC] p-4 rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin text-[#0066FF]" />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {['Por que não estou batendo a meta?', 'Como melhorar a taxa de conversão?', 'Previsão para fim do mês?'].map((q) => (
                  <Button
                    key={q}
                    variant="outline"
                    size="sm"
                    onClick={() => setChatInput(q)}
                  >
                    {q}
                  </Button>
                ))}
              </div>

              <div className="flex gap-2">
                <Textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && enviarMensagem()}
                  placeholder="Pergunte sobre qualquer métrica ou estratégia..."
                  className="flex-1"
                  maxLength={500}
                />
                <Button onClick={enviarMensagem} disabled={chatLoading || !chatInput.trim()}>
                  Enviar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Simulador */}
      <section className="bg-[#0B1120] py-12 md:py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 flex items-center gap-3">
            <Calculator className="w-8 h-8 text-[#00E5CC]" />
            Simulador: E se...
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-[#151E35] p-6">
              <h3 className="text-xl font-bold text-white mb-6">Simular Mudanças</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-white mb-2 block">Taxa de Show: {simulationValues.taxaShow.toFixed(1)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={simulationValues.taxaShow}
                    onChange={(e) => setSimulationValues(prev => ({ ...prev, taxaShow: Number(e.target.value) }))}
                    className="w-full"
                  />
                  <p className="text-xs text-[#94A3B8] mt-1">Atual: {metricas.taxaShow.toFixed(1)}%</p>
                </div>

                <div>
                  <label className="text-white mb-2 block">Taxa de Conversão: {simulationValues.taxaConversao.toFixed(1)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={simulationValues.taxaConversao}
                    onChange={(e) => setSimulationValues(prev => ({ ...prev, taxaConversao: Number(e.target.value) }))}
                    className="w-full"
                  />
                  <p className="text-xs text-[#94A3B8] mt-1">Atual: {metricas.taxaConversao.toFixed(1)}%</p>
                </div>

                <Button onClick={simularCenario} disabled={loading} className="w-full bg-[#00E5CC] text-[#0B1120]">
                  {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                  🔮 Simular Impacto
                </Button>
              </div>
            </Card>

            {simulation && (
              <Card className="bg-[#151E35] p-6">
                <h3 className="text-xl font-bold text-white mb-6">Resultados</h3>
                
                <div className="space-y-4">
                  <div className="bg-[#0B1120] p-4 rounded-lg">
                    <p className="text-[#94A3B8] text-sm">Receita Projetada</p>
                    <p className="text-2xl font-bold text-[#00E5CC]">{simulation.receitaProjetada}</p>
                    <p className={`text-sm ${simulation.diferencaReceita > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {simulation.diferencaReceita > 0 ? '+' : ''}{simulation.diferencaReceita}%
                    </p>
                  </div>

                  <div className="bg-[#0B1120] p-4 rounded-lg">
                    <p className="text-[#94A3B8] text-sm">Viabilidade</p>
                    <p className="text-white text-sm">{simulation.viabilidade}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Relatório */}
      <section className="bg-[#F8FAFC] py-12 md:py-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0B1120] mb-8 flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#0066FF]" />
            Relatório Executivo
          </h2>

          <Button onClick={gerarRelatorio} disabled={reportLoading} className="mb-6">
            {reportLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
            Gerar Relatório Completo
          </Button>

          {report && (
            <Card className="bg-white p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#0B1120] mb-2">📊 Sumário Executivo</h3>
                  <p className="text-[#0B1120]/80">{report.sumario}</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#0B1120] mb-2">✅ Destaques</h3>
                  <ul className="list-disc list-inside space-y-1 text-[#0B1120]/80">
                    {report.destaques?.map((d: string, i: number) => <li key={i}>{d}</li>)}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#0B1120] mb-2">⚠️ Desafios</h3>
                  <ul className="list-disc list-inside space-y-1 text-[#0B1120]/80">
                    {report.desafios?.map((d: string, i: number) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </div>
      </section>

      {!isTVMode && <Footer />}
    </div>
  );
};

export default AssistenteIA;
