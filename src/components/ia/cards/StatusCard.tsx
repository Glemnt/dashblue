import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatusCardProps {
  isTVMode: boolean;
  icon: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const StatusCard = ({ 
  isTVMode, 
  icon, 
  title, 
  value, 
  subtitle,
  trend,
  variant = 'default'
}: StatusCardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-l-4 border-green-500 bg-green-500/5';
      case 'warning':
        return 'border-l-4 border-yellow-500 bg-yellow-500/5';
      case 'danger':
        return 'border-l-4 border-red-500 bg-red-500/5';
      default:
        return 'border-l-4 border-blue-500 bg-blue-500/5';
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  return (
    <Card className={`${getVariantStyles()} hover:shadow-lg transition-all`}>
      <CardContent className={`${isTVMode ? 'p-8' : 'p-6'} transition-all`}>
        <div className="flex items-start justify-between mb-2">
          <span className={`${isTVMode ? 'text-4xl' : 'text-2xl'} transition-all`}>
            {icon}
          </span>
          {getTrendIcon()}
        </div>
        
        <h3 className={`text-muted-foreground font-medium mb-2 transition-all ${isTVMode ? 'text-xl' : 'text-sm'}`}>
          {title}
        </h3>
        
        <p className={`font-bold transition-all ${isTVMode ? 'text-5xl' : 'text-3xl'}`}>
          {value}
        </p>
        
        {subtitle && (
          <p className={`text-muted-foreground mt-2 transition-all ${isTVMode ? 'text-lg' : 'text-xs'}`}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusCard;
