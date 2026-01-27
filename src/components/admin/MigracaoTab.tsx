import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { migrateAllMonths, migrateMonth, clearMigratedData, MigrationResult } from '@/utils/migrateLegacyData';

const MigracaoTab = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runFullMigration = async () => {
    setIsRunning(true);
    setLogs([]);
    setResult(null);
    setError(null);
    
    addLog('Iniciando migração completa...');
    
    try {
      const migrationResult = await migrateAllMonths((message) => {
        addLog(message);
      });
      
      setResult(migrationResult);
      
      if (migrationResult.success) {
        addLog('Migração concluída com sucesso!');
      } else {
        addLog('Migração concluída com alguns erros.');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
      addLog(`ERRO: ${errorMsg}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runSingleMonth = async (monthKey: string) => {
    setIsRunning(true);
    setLogs([]);
    setResult(null);
    setError(null);
    
    addLog(`Iniciando migração de ${monthKey}...`);
    
    try {
      const { vendas, agendamentos } = await migrateMonth(monthKey, (message) => {
        addLog(message);
      });
      
      addLog(`Concluído: ${vendas} vendas, ${agendamentos} agendamentos`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
      addLog(`ERRO: ${errorMsg}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearData = async () => {
    if (!confirm('ATENÇÃO: Isso irá apagar TODOS os dados de vendas e agendamentos. Continuar?')) {
      return;
    }
    
    setIsRunning(true);
    setLogs([]);
    addLog('Limpando dados...');
    
    try {
      await clearMigratedData();
      addLog('Dados limpos com sucesso!');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
      addLog(`ERRO: ${errorMsg}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-[#1A1F2E] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-[#0066FF]" />
            Migração de Dados Legados
          </CardTitle>
          <CardDescription>
            Importe dados das planilhas do Google Sheets para o banco de dados Supabase.
            Esta operação irá migrar vendas e agendamentos de Outubro/2025 a Janeiro/2026.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-amber-500/10 border-amber-500/20">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-500">Importante</AlertTitle>
            <AlertDescription className="text-amber-200/80">
              Execute esta migração apenas uma vez. Executar múltiplas vezes pode criar dados duplicados.
              Recomendamos limpar os dados antes de uma nova migração.
            </AlertDescription>
          </Alert>

          {/* Ações */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={runFullMigration} 
              disabled={isRunning}
              className="bg-[#0066FF] hover:bg-[#0052CC]"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Migrar Todos os Meses
            </Button>
            
            <Button 
              onClick={clearData} 
              disabled={isRunning}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Dados
            </Button>
          </div>

          {/* Migração por mês */}
          <div className="border-t border-white/10 pt-4">
            <p className="text-sm text-muted-foreground mb-3">Ou migre um mês específico:</p>
            <div className="flex flex-wrap gap-2">
              {['outubro-2025', 'novembro-2025', 'dezembro-2025', 'janeiro-2026'].map((month) => (
                <Button 
                  key={month}
                  onClick={() => runSingleMonth(month)} 
                  disabled={isRunning}
                  variant="outline"
                  size="sm"
                  className="border-white/10 hover:bg-white/5"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {month.charAt(0).toUpperCase() + month.slice(1).replace('-', ' ')}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultado */}
      {result && (
        <Card className="bg-[#1A1F2E] border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {result.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Resultado da Migração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-[#0D1321] rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-[#0066FF]">{result.totalVendas}</p>
                <p className="text-sm text-muted-foreground">Vendas Importadas</p>
              </div>
              <div className="bg-[#0D1321] rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-[#00C49F]">{result.totalAgendamentos}</p>
                <p className="text-sm text-muted-foreground">Agendamentos Importados</p>
              </div>
            </div>

            {/* Detalhes por mês */}
            <div className="space-y-2">
              {result.byMonth.map((month, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between bg-[#0D1321] rounded-lg p-3"
                >
                  <div className="flex items-center gap-2">
                    {month.status === 'done' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    {month.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                    <span className="text-white">{month.month}</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {month.vendas} vendas
                    </span>
                    <span className="text-muted-foreground">
                      {month.agendamentos} agendamentos
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Erros */}
            {result.errors.length > 0 && (
              <Alert className="mt-4 bg-red-500/10 border-red-500/20">
                <XCircle className="h-4 w-4 text-red-500" />
                <AlertTitle className="text-red-500">Erros encontrados</AlertTitle>
                <AlertDescription className="text-red-200/80">
                  <ul className="list-disc list-inside">
                    {result.errors.map((err, index) => (
                      <li key={index}>{err}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <Card className="bg-[#1A1F2E] border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-sm">Log de Execução</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-[#0D1321] rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-xs">
              {logs.map((log, index) => (
                <div key={index} className="text-muted-foreground py-0.5">
                  {log}
                </div>
              ))}
              {isRunning && (
                <div className="flex items-center gap-2 text-[#0066FF] py-0.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Processando...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Erro geral */}
      {error && (
        <Alert className="bg-red-500/10 border-red-500/20">
          <XCircle className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-red-500">Erro na Migração</AlertTitle>
          <AlertDescription className="text-red-200/80">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MigracaoTab;
