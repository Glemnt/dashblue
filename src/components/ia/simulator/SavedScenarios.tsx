import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatarReal } from '@/utils/metricsCalculator';
import { Save, Trash2, Upload, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface SavedScenario {
  id: string;
  name: string;
  date: string;
  values: {
    taxaShow: number;
    taxaConversao: number;
    ticketMedio: number;
  };
  projected: {
    receita: number;
    contratos: number;
    meta: number;
  };
}

interface SavedScenariosProps {
  scenarios: SavedScenario[];
  onLoad: (scenario: SavedScenario) => void;
  onDelete: (id: string) => void;
  onSave: (name: string) => void;
  isTVMode: boolean;
}

export const SavedScenarios = ({
  scenarios,
  onLoad,
  onDelete,
  onSave,
  isTVMode
}: SavedScenariosProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState('');

  const handleSave = () => {
    if (scenarioName.trim()) {
      onSave(scenarioName);
      setScenarioName('');
      setIsDialogOpen(false);
    }
  };

  return (
    <Card className="bg-card border-border p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className={`font-bold text-primary flex items-center gap-2 ${isTVMode ? 'text-3xl' : 'text-2xl'}`}>
          💾 Cenários Salvos
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2">
              <Save className="w-4 h-4" />
              Salvar Cenário Atual
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Salvar Cenário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="scenario-name">Nome do Cenário</Label>
                <Input
                  id="scenario-name"
                  placeholder="Ex: Meta Agressiva Q4"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={!scenarioName.trim()}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {scenarios.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Save className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum cenário salvo ainda.</p>
          <p className="text-sm mt-2">Ajuste os valores e clique em "Salvar Cenário Atual"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((scenario) => (
            <Card 
              key={scenario.id} 
              className="bg-background border-border p-4 hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-foreground text-lg mb-1">
                    {scenario.name}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(scenario.date), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(scenario.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxa Show:</span>
                  <span className="font-semibold text-foreground">{scenario.values.taxaShow.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxa Conv:</span>
                  <span className="font-semibold text-foreground">{scenario.values.taxaConversao.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ticket:</span>
                  <span className="font-semibold text-foreground">{formatarReal(scenario.values.ticketMedio)}</span>
                </div>
              </div>

              <div className="border-t border-border pt-3 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground">Receita Projetada:</span>
                  <span className="text-accent font-bold text-lg">
                    {formatarReal(scenario.projected.receita)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Contratos:</span>
                  <span className="text-foreground font-semibold">
                    {scenario.projected.contratos.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-muted-foreground">Meta:</span>
                  <Badge 
                    variant={scenario.projected.meta >= 100 ? "default" : "secondary"}
                    className={scenario.projected.meta >= 100 ? "bg-green-500" : ""}
                  >
                    {scenario.projected.meta.toFixed(1)}%
                  </Badge>
                </div>
              </div>

              <Button
                onClick={() => onLoad(scenario)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Carregar Cenário
              </Button>
            </Card>
          ))}
        </div>
      )}

      {scenarios.length > 0 && scenarios.length >= 5 && (
        <p className="text-xs text-muted-foreground text-center mt-4">
          Limite de 5 cenários atingido. Ao salvar um novo, o mais antigo será removido.
        </p>
      )}
    </Card>
  );
};
