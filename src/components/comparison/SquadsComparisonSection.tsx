import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface Props {
  data: {
    liderCurrentPeriod: string;
    liderPreviousPeriod: string;
    mudancaLideranca: boolean;
  };
}

export const SquadsComparisonSection = ({ data }: Props) => {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Comparação Guerra de Squads</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.mudancaLideranca && (
            <Alert>
              <AlertTitle>🏆 Mudança de Liderança!</AlertTitle>
              <AlertDescription>
                O líder mudou de <strong>{data.liderPreviousPeriod}</strong> para <strong>{data.liderCurrentPeriod}</strong>
              </AlertDescription>
            </Alert>
          )}
          
          {!data.mudancaLideranca && (
            <Alert>
              <AlertTitle>👑 Liderança Mantida</AlertTitle>
              <AlertDescription>
                <strong>{data.liderCurrentPeriod}</strong> continua na liderança nos dois períodos
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <h4 className="font-semibold text-foreground mb-2">Período Atual</h4>
              <p className="text-2xl font-bold text-primary">{data.liderCurrentPeriod}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <h4 className="font-semibold text-foreground mb-2">Período Anterior</h4>
              <p className="text-2xl font-bold text-muted-foreground">{data.liderPreviousPeriod}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
