import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, Printer, ArrowLeftRight } from 'lucide-react';
import { useExecutiveData } from '@/hooks/useExecutiveData';
import Navigation from '@/components/Navigation';
import PageSkeleton from '@/components/skeletons/PageSkeleton';
import { ExecutiveMetaCard } from '@/components/executive/ExecutiveMetaCard';
import { ExecutiveKPICard } from '@/components/executive/ExecutiveKPICard';
import { TopPerformersCard } from '@/components/executive/TopPerformersCard';
import { SquadsBattleCard } from '@/components/executive/SquadsBattleCard';
import { FinancialSummaryCard } from '@/components/executive/FinancialSummaryCard';
import { ProjectionsCard } from '@/components/executive/ProjectionsCard';
import { TemporalComparisonModal } from '@/components/comparison/TemporalComparisonModal';
import logoWhite from '@/assets/logo-white.png';
import { formatarReal } from '@/utils/metricsCalculator';
import { 
  DollarSign, 
  FileText, 
  Target, 
  TrendingUp, 
  Users, 
  Zap 
} from 'lucide-react';

const DashboardExecutivo = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showComparison, setShowComparison] = useState(false);
  
  const { 
    metricas, 
    metricasSquads, 
    metricasFinanceiras, 
    sdrKPIs, 
    closerKPIs,
    projecoes,
    loading, 
    error,
    lastUpdate 
  } = useExecutiveData();
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleExport = () => {
    console.log('Exportar dashboard');
  };
  
  if (loading) {
    return <PageSkeleton type="index" />;
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro ao Carregar</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }
  
  if (!metricas) return null;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER COMPACTO */}
      <header className="bg-white border-b sticky top-0 z-50 print:static">
        <div className="max-w-[1800px] mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src={logoWhite} alt="Blue Ocean" className="h-8" />
            <div className="border-l pl-4">
              <h1 className="text-2xl font-black text-gray-900">Dashboard Executivo</h1>
              <p className="text-xs text-gray-500">
                Atualizado: {lastUpdate?.toLocaleTimeString('pt-BR')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 print:hidden">
            <Button 
              onClick={() => setShowComparison(true)}
              variant="outline"
              size="sm"
            >
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Comparar
            </Button>
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>
      </header>
      
      {/* NAVIGATION */}
      <div className="print:hidden">
        <Navigation />
      </div>
      
      {/* MODAL DE COMPARAÇÃO */}
      <TemporalComparisonModal
        open={showComparison}
        onOpenChange={setShowComparison}
        pageType="dashboard"
      />
      
      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-[1800px] mx-auto px-8 py-6 space-y-6">
        
        {/* SEÇÃO 1: STATUS DAS METAS */}
        <section className="grid grid-cols-3 gap-4">
          <ExecutiveMetaCard
            tipo="mensal"
            valor={metricas.receitaTotal}
            meta={metricas.metaMensal}
            progresso={metricas.progressoMetaMensal}
            faltante={metricas.metaMensal - metricas.receitaTotal}
          />
          <ExecutiveMetaCard
            tipo="semanal"
            valor={metricas.receitaSemanal}
            meta={metricas.metaSemanal}
            progresso={metricas.progressoMetaSemanal}
            faltante={metricas.metaSemanal - metricas.receitaSemanal}
          />
          <ExecutiveMetaCard
            tipo="diária"
            valor={metricas.receitaDiaria}
            meta={metricas.metaDiaria}
            progresso={metricas.progressoMetaDiaria}
            faltante={metricas.metaDiaria - metricas.receitaDiaria}
          />
        </section>
        
        {/* SEÇÃO 2: KPIs PRINCIPAIS */}
        <section className="grid grid-cols-3 gap-4">
          <ExecutiveKPICard
            icon={DollarSign}
            label="Receita Total"
            value={formatarReal(metricas.receitaTotal)}
            subtitle={`${metricas.totalContratos} contratos`}
            color="bg-white border-blue-200"
            trend="up"
          />
          <ExecutiveKPICard
            icon={FileText}
            label="Contratos"
            value={metricas.totalContratos.toString()}
            subtitle={`Meta: 55 (${((metricas.totalContratos/55)*100).toFixed(0)}%)`}
            color="bg-white border-green-200"
            trend="up"
          />
          <ExecutiveKPICard
            icon={Target}
            label="Ticket Médio"
            value={formatarReal(metricas.ticketMedio)}
            subtitle="Meta: R$ 12.000"
            color="bg-white border-purple-200"
            trend="stable"
          />
          <ExecutiveKPICard
            icon={TrendingUp}
            label="Taxa Conversão"
            value={`${metricas.taxaConversao.toFixed(1)}%`}
            subtitle={`${metricas.totalContratos}/${metricas.callsQualificadas} qualificados`}
            color="bg-white border-cyan-200"
            trend="up"
          />
          <ExecutiveKPICard
            icon={Users}
            label="Taxa de Show"
            value={`${metricas.taxaShow.toFixed(1)}%`}
            subtitle={`${metricas.callsRealizadas}/${metricas.callsAgendadas} agendadas`}
            color="bg-white border-yellow-200"
            trend="down"
          />
          <ExecutiveKPICard
            icon={Zap}
            label="MQLs"
            value={metricas.funil.mqls.toString()}
            subtitle={`${((metricas.funil.mqls/metricas.funil.leads)*100).toFixed(1)}% dos leads`}
            color="bg-white border-indigo-200"
            trend="up"
          />
        </section>
        
        {/* SEÇÃO 3: PERFORMANCE + SQUADS */}
        <section className="grid grid-cols-3 gap-4">
          <TopPerformersCard
            tipo="SDR"
            performers={sdrKPIs.kpis.map(k => ({
              nome: k.nome,
              valorVendas: k.valorVendas,
              percentual: k.percentualVendas
            }))}
          />
          <TopPerformersCard
            tipo="Closer"
            performers={closerKPIs.kpis.map(k => ({
              nome: k.nome,
              valorVendas: k.valorVendas,
              percentual: k.percentualVendas
            }))}
          />
          <SquadsBattleCard
            hotDogs={{
              receita: metricasSquads?.hotDogs.receitaTotal || 0,
              contratos: metricasSquads?.hotDogs.contratos || 0
            }}
            corvoAzul={{
              receita: metricasSquads?.corvoAzul.receitaTotal || 0,
              contratos: metricasSquads?.corvoAzul.contratos || 0
            }}
            lider={metricasSquads?.placar.lider || 'Empate'}
            vantagem={metricasSquads?.placar.vantagem || 0}
          />
        </section>
        
        {/* SEÇÃO 4: FINANCEIRO + PROJEÇÕES */}
        <section className="grid grid-cols-3 gap-4">
          <FinancialSummaryCard
            receitaTotal={metricasFinanceiras?.receitas.total || 0}
            receitaAssinada={metricasFinanceiras?.receitas.assinada || 0}
            receitaPaga={metricasFinanceiras?.receitas.paga || 0}
            gapFinanceiro={metricasFinanceiras?.receitas.gapFinanceiroTotal || 0}
            taxaRecebimento={metricasFinanceiras?.receitas.taxaRecebimentoTotal || 0}
          />
          {projecoes && <ProjectionsCard projecoes={projecoes} />}
        </section>
        
      </main>
      
      {/* FOOTER */}
      <footer className="bg-white border-t mt-8 py-4 print:fixed print:bottom-0 print:w-full">
        <div className="max-w-[1800px] mx-auto px-8 text-center text-xs text-gray-500">
          Dashboard Executivo Blue Ocean • Gerado em {currentTime.toLocaleString('pt-BR')}
        </div>
      </footer>
    </div>
  );
};

export default DashboardExecutivo;
