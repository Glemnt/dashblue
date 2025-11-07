import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
  subtitle: string;
  color: string;
  trend?: 'up' | 'down' | 'stable';
}

export const ExecutiveKPICard = ({ 
  icon: Icon, 
  label, 
  value, 
  subtitle, 
  color,
  trend 
}: Props) => {
  return (
    <Card className={`p-4 border-2 ${color} hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <Icon className="w-6 h-6 text-gray-600" />
        {trend && (
          <span className={`text-xs font-bold ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-gray-500'
          }`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
          </span>
        )}
      </div>
      
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
        {label}
      </p>
      
      <p className="text-3xl font-black text-gray-900 mb-1">
        {value}
      </p>
      
      <p className="text-xs text-gray-500">
        {subtitle}
      </p>
    </Card>
  );
};
