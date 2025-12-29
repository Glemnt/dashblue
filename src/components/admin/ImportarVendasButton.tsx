import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { importVendasFromAllMonths, clearAllVendas } from '@/utils/importVendas';
import { Download, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const ImportarVendasButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState<{ total: number; byMonth: Record<string, number> } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleImport = async (clearFirst: boolean) => {
    setIsLoading(true);
    setProgress('Iniciando importação...');
    setResult(null);

    try {
      if (clearFirst) {
        setProgress('Limpando vendas existentes...');
        await clearAllVendas();
      }

      const importResult = await importVendasFromAllMonths(setProgress);
      setResult(importResult);
      
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
      
      toast({
        title: 'Importação concluída!',
        description: `${importResult.total} vendas importadas com sucesso.`,
      });
    } catch (error) {
      console.error('Erro na importação:', error);
      toast({
        title: 'Erro na importação',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setIsOpen(false);
      setProgress('');
      setResult(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 border-[#0066FF]/30 text-[#0066FF] hover:bg-[#0066FF]/10"
          onClick={() => setIsOpen(true)}
        >
          <Download className="h-4 w-4" />
          Importar do Sheets
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1A1F2E] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-[#0066FF]" />
            Importar Vendas do Google Sheets
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Importa todas as vendas (FECHAMENTO = SIM) de Outubro, Novembro e Dezembro 2025.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#0066FF] mb-4" />
            <p className="text-sm text-muted-foreground">{progress}</p>
          </div>
        ) : result ? (
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Importação concluída!</span>
            </div>
            <div className="bg-white/5 rounded-lg p-4 space-y-2">
              <p className="text-lg font-bold text-[#0066FF]">{result.total} vendas importadas</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Outubro 2025: {result.byMonth['outubro-2025'] || 0} vendas</p>
                <p>• Novembro 2025: {result.byMonth['novembro-2025'] || 0} vendas</p>
                <p>• Dezembro 2025: {result.byMonth['dezembro-2025'] || 0} vendas</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-500">Atenção</p>
                <p className="text-muted-foreground">
                  Escolha se deseja limpar as vendas existentes antes de importar ou adicionar às existentes.
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {!isLoading && !result && (
            <>
              <Button
                variant="outline"
                onClick={() => handleImport(false)}
                className="border-white/10 hover:bg-white/5"
              >
                Adicionar às existentes
              </Button>
              <Button
                onClick={() => handleImport(true)}
                className="bg-[#0066FF] hover:bg-[#0066FF]/80"
              >
                Limpar e importar
              </Button>
            </>
          )}
          {result && (
            <Button onClick={handleClose} className="bg-[#0066FF] hover:bg-[#0066FF]/80">
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportarVendasButton;
