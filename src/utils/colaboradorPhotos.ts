// Imports das fotos
import fotoBruno from '@/assets/colaboradores/bruno.png';
import fotoCaua from '@/assets/colaboradores/caua.png';
import fotoDavi from '@/assets/colaboradores/davi.png';
import fotoFernandes from '@/assets/colaboradores/fernandes.png';
import fotoFranklin from '@/assets/colaboradores/franklin.png';
import fotoMarcos from '@/assets/colaboradores/marcos.png';
import fotoTiago from '@/assets/colaboradores/tiago.png';
import fotoVinicius from '@/assets/colaboradores/vinicius.png';
import fotoJoaoLopes from '@/assets/colaboradores/joao-lopes.png';
import fotoAndrey from '@/assets/colaboradores/andrey.png';
import fotoBrunnoVaz from '@/assets/colaboradores/brunno-vaz.png';

// Mapeamento nome → foto
const colaboradorPhotos: Record<string, string> = {
  'Bruno': fotoBruno,
  'Cauã': fotoCaua,
  'Caua': fotoCaua,
  'Davi': fotoDavi,
  'DAVI': fotoDavi,
  'Fernandes': fotoFernandes,
  'Gabriel Fernandes': fotoFernandes,
  'Franklin': fotoFranklin,
  'Gabriel Franklin': fotoFranklin,
  'João Lopes': fotoJoaoLopes,
  'Joao Lopes': fotoJoaoLopes,
  'João': fotoJoaoLopes,
  'Joao': fotoJoaoLopes,
  'Marcos': fotoMarcos,
  'Tiago': fotoTiago,
  'Vinicius': fotoVinicius,
  'Vinícius': fotoVinicius,
  'Andrey': fotoAndrey,
  'ANDREY': fotoAndrey,
  'Brunno Vaz': fotoBrunnoVaz,
  'BRUNNO VAZ': fotoBrunnoVaz,
  'Brunno': fotoBrunnoVaz,
};

// Função helper para obter foto
export const getColaboradorPhoto = (nome: string): string | null => {
  // Normalizar nome (remover espaços extras)
  const nomeNormalizado = nome.trim();
  return colaboradorPhotos[nomeNormalizado] || null;
};

// Função para verificar se tem foto
export const hasColaboradorPhoto = (nome: string): boolean => {
  return getColaboradorPhoto(nome) !== null;
};
