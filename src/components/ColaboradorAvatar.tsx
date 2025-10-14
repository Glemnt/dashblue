import { getColaboradorPhoto } from '@/utils/colaboradorPhotos';

interface ColaboradorAvatarProps {
  nome: string;
  emoji: string;
  squadColor: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showBorder?: boolean;
}

const ColaboradorAvatar = ({ 
  nome, 
  emoji, 
  squadColor, 
  size = 'md',
  className = '',
  showBorder = true
}: ColaboradorAvatarProps) => {
  const foto = getColaboradorPhoto(nome);
  
  // Mapeamento de tamanhos
  const sizeClasses = {
    'sm': 'w-12 h-12 text-2xl',
    'md': 'w-20 h-20 text-4xl',
    'lg': 'w-24 h-24 text-4xl',
    'xl': 'w-32 h-32 text-5xl',
    '2xl': 'w-40 h-40 text-6xl'
  };
  
  const borderClass = showBorder ? 'border-4 border-white' : '';
  
  return (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center shadow-lg overflow-hidden ${borderClass} ${className}`}
      style={{ backgroundColor: foto ? 'transparent' : squadColor }}
    >
      {foto ? (
        <img 
          src={foto} 
          alt={nome}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{emoji}</span>
      )}
    </div>
  );
};

export default ColaboradorAvatar;
