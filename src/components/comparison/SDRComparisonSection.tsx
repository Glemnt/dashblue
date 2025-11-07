import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatarReal } from '@/utils/metricsCalculator';

interface Props {
  data: {
    top3Current: any[];
    top3Previous: any[];
    improvements: string[];
    declines: string[];
  };
}

export const SDRComparisonSection = ({ data }: Props) => {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Comparação de Performance SDR</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3 text-primary">Período Atual - Top 3</h4>
            <div className="space-y-2">
              {data.top3Current.map((sdr, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-primary/10 rounded border border-primary/20">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{idx + 1}º</span>
                    <span className="text-foreground">{sdr.nome}</span>
                  </div>
                  <span className="font-semibold text-foreground">{formatarReal(sdr.vendasOriginadas)}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 text-muted-foreground">Período Anterior - Top 3</h4>
            <div className="space-y-2">
              {data.top3Previous.map((sdr, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded border border-border">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{idx + 1}º</span>
                    <span className="text-foreground">{sdr.nome}</span>
                  </div>
                  <span className="font-semibold text-foreground">{formatarReal(sdr.vendasOriginadas)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {(data.improvements.length > 0 || data.declines.length > 0) && (
          <div className="grid grid-cols-2 gap-6 mt-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-600">
                <TrendingUp className="w-4 h-4" />
                Maiores Melhorias
              </h4>
              {data.improvements.map((improvement, idx) => (
                <Badge key={idx} variant="outline" className="mr-2 mb-2">
                  {improvement}
                </Badge>
              ))}
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-600">
                <TrendingDown className="w-4 h-4" />
                Maiores Quedas
              </h4>
              {data.declines.map((decline, idx) => (
                <Badge key={idx} variant="outline" className="mr-2 mb-2">
                  {decline}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
