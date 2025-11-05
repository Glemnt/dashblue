import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface RecommendationCardProps {
  isTVMode: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact?: string;
  timeline?: string;
  difficulty?: string;
  steps?: string[];
}

const RecommendationCard = ({ 
  isTVMode, 
  priority, 
  title, 
  description,
  impact,
  timeline,
  difficulty,
  steps = []
}: RecommendationCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getPriorityStyles = () => {
    switch (priority) {
      case 'critical':
        return {
          border: 'border-l-4 border-red-500',
          bg: 'bg-red-500/5',
          badge: 'bg-red-500/20 text-red-400 border-red-500/30',
          icon: '🚨',
          label: 'URGENTE'
        };
      case 'high':
        return {
          border: 'border-l-4 border-orange-500',
          bg: 'bg-orange-500/5',
          badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
          icon: '🟠',
          label: 'ALTA'
        };
      case 'medium':
        return {
          border: 'border-l-4 border-yellow-500',
          bg: 'bg-yellow-500/5',
          badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
          icon: '🟡',
          label: 'MÉDIA'
        };
      default:
        return {
          border: 'border-l-4 border-blue-500',
          bg: 'bg-blue-500/5',
          badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          icon: '🔵',
          label: 'BAIXA'
        };
    }
  };

  const styles = getPriorityStyles();
  const textSize = isTVMode ? 'text-xl' : 'text-base';
  const titleSize = isTVMode ? 'text-3xl' : 'text-xl';
  const badgeSize = isTVMode ? 'px-6 py-2 text-xl' : 'px-3 py-1 text-sm';

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={`${styles.border} ${styles.bg} hover:shadow-lg transition-all`}>
        <CardContent className={`${isTVMode ? 'p-8' : 'p-6'} transition-all`}>
          <div className="flex items-start justify-between mb-4">
            <Badge className={`${styles.badge} ${badgeSize} ${priority === 'critical' ? 'animate-pulse' : ''}`}>
              {styles.icon} {styles.label}
            </Badge>
            
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className={isTVMode ? 'scale-150' : ''}>
                {isOpen ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <h3 className={`font-bold mb-3 transition-all ${titleSize}`}>
            {title}
          </h3>
          
          <p className={`text-muted-foreground mb-4 transition-all ${textSize}`}>
            {description}
          </p>
          
          {(impact || timeline || difficulty) && (
            <div className={`grid grid-cols-3 gap-3 p-4 bg-black/10 rounded-lg mb-4`}>
              {impact && (
                <div>
                  <p className={`font-bold text-green-400 transition-all ${isTVMode ? 'text-2xl' : 'text-lg'}`}>
                    {impact}
                  </p>
                  <p className={`text-xs text-muted-foreground transition-all ${isTVMode ? 'text-lg' : ''}`}>
                    Impacto
                  </p>
                </div>
              )}
              {timeline && (
                <div>
                  <p className={`font-bold text-blue-400 transition-all ${isTVMode ? 'text-2xl' : 'text-lg'}`}>
                    {timeline}
                  </p>
                  <p className={`text-xs text-muted-foreground transition-all ${isTVMode ? 'text-lg' : ''}`}>
                    Prazo
                  </p>
                </div>
              )}
              {difficulty && (
                <div>
                  <p className={`font-bold text-yellow-400 transition-all ${isTVMode ? 'text-2xl' : 'text-lg'}`}>
                    {difficulty}
                  </p>
                  <p className={`text-xs text-muted-foreground transition-all ${isTVMode ? 'text-lg' : ''}`}>
                    Dificuldade
                  </p>
                </div>
              )}
            </div>
          )}
          
          <CollapsibleContent>
            {steps.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className={`font-semibold mb-3 transition-all ${isTVMode ? 'text-2xl' : 'text-base'}`}>
                  📋 Passos para implementar:
                </p>
                <ol className={`list-decimal list-inside space-y-2 transition-all ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                  {steps.map((step, index) => (
                    <li key={index} className="text-muted-foreground">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            
            <div className="flex gap-3 mt-4">
              <Button className="flex-1" size={isTVMode ? 'lg' : 'default'}>
                ✅ Implementar
              </Button>
              <Button variant="outline" size={isTVMode ? 'lg' : 'default'}>
                💬 Discutir
              </Button>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
};

export default RecommendationCard;
