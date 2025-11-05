import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

interface AIAnalysisProps {
  analysis: {
    viabilidade: 'Viável' | 'Desafiador' | 'Irreal';
    cenarioMaisProvavel: string;
    justificativa: string;
    acoesNecessarias: string[];
    riscosEOportunidades: {
      riscos: string[];
      oportunidades: string[];
    };
    recomendacao: string;
    passosTaticos: string[];
  } | null;
  onAnalyze: () => void;
  isLoading: boolean;
  isTVMode: boolean;
}

export const AIAnalysis = ({ analysis, onAnalyze, isLoading, isTVMode }: AIAnalysisProps) => {
  const getViabilityBadge = (viabilidade: string) => {
    switch (viabilidade) {
      case 'Viável':
        return <Badge className="bg-green-500 text-white flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Viável
        </Badge>;
      case 'Desafiador':
        return <Badge className="bg-yellow-500 text-white flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Desafiador
        </Badge>;
      case 'Irreal':
        return <Badge className="bg-red-500 text-white flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Irreal
        </Badge>;
      default:
        return null;
    }
  };

  const cenarioLabels: Record<string, string> = {
    atual: 'Atual',
    simulado: 'Simulado',
    realista: 'Realista',
    otimista: 'Otimista',
    pessimista: 'Pessimista'
  };

  return (
    <Card className="bg-background border-accent/30 border-2 p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className={`font-bold text-primary flex items-center gap-2 ${isTVMode ? 'text-3xl' : 'text-2xl'}`}>
          🤖 Análise do Assistente
        </h3>
        {analysis && getViabilityBadge(analysis.viabilidade)}
      </div>

      {!analysis && (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-accent" />
          <p className="text-muted-foreground mb-4">
            Clique no botão abaixo para obter uma análise detalhada da IA sobre todos os cenários
          </p>
          <Button 
            onClick={onAnalyze}
            disabled={isLoading}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
            size={isTVMode ? "lg" : "default"}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analisando cenários...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Analisar Cenários com IA
              </>
            )}
          </Button>
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          {/* Cenário Mais Provável */}
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
            <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Cenário Mais Provável
            </h4>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-accent text-accent-foreground text-lg">
                {cenarioLabels[analysis.cenarioMaisProvavel] || analysis.cenarioMaisProvavel}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{analysis.justificativa}</p>
          </div>

          {/* Recomendação */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <h4 className="font-bold text-foreground mb-2">💡 Recomendação</h4>
            <p className="text-sm text-foreground">{analysis.recomendacao}</p>
          </div>

          {/* Ações Necessárias */}
          <div>
            <h4 className="font-bold text-foreground mb-3">✅ Ações Necessárias</h4>
            <ul className="space-y-2">
              {analysis.acoesNecessarias.map((acao, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-accent font-bold mt-0.5">→</span>
                  <span className="text-sm text-foreground">{acao}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Passos Táticos */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h4 className="font-bold text-foreground mb-3">🎯 Passos Táticos</h4>
            <ol className="space-y-2 list-decimal list-inside">
              {analysis.passosTaticos.map((passo, index) => (
                <li key={index} className="text-sm text-foreground">
                  {passo}
                </li>
              ))}
            </ol>
          </div>

          {/* Riscos e Oportunidades */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                ⚠️ Riscos
              </h4>
              <ul className="space-y-2">
                {analysis.riscosEOportunidades.riscos.map((risco, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span className="text-sm text-foreground">{risco}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                🌟 Oportunidades
              </h4>
              <ul className="space-y-2">
                {analysis.riscosEOportunidades.oportunidades.map((oportunidade, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span className="text-sm text-foreground">{oportunidade}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Botão para nova análise */}
          <Button 
            onClick={onAnalyze}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analisar Novamente
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
};
