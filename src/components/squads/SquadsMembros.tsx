import { formatarReal } from '@/utils/financialMetricsCalculator';
import { SquadMetrics } from '@/utils/squadsMetricsCalculator';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getMetasPorMes } from '@/utils/metasConfig';

interface SquadsMembrosProps {
  hotDogs: SquadMetrics;
  corvoAzul: SquadMetrics;
  isTVMode: boolean;
  monthKey: string;
}

export const SquadsMembros = ({ hotDogs, corvoAzul, isTVMode, monthKey }: SquadsMembrosProps) => {
  // Metas dinâmicas do metasConfig
  const configMeta = getMetasPorMes(monthKey);
  const metaIndividual = configMeta.metaIndividualCloser || 65000;
  const metaTaxaConversao = configMeta.metaTaxaConversao || 28;
  const renderSquadCard = (squad: SquadMetrics) => {
    return (
      <Card className={`bg-[#151E35] border-l-8 p-6 md:p-8 ${
        squad.nome === 'Hot Dogs' ? 'border-[#FF4757]' : 'border-[#0066FF]'
      }`}>
        <div className="text-center mb-6">
          <div className={`mb-3 ${isTVMode ? 'text-6xl' : 'text-5xl'}`}>
            {squad.emoji}
          </div>
          <h3 className={`font-black text-white mb-2 ${
            isTVMode ? 'text-3xl' : 'text-2xl'
          }`}>
            {squad.nome}
          </h3>
          {squad.badges.includes('maior-receita') && (
            <Badge variant="warning" className={isTVMode ? 'text-xl px-4 py-2' : ''}>
              🏆 Líder em Receita
            </Badge>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className={`text-[#94A3B8] ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                  Posição
                </TableHead>
                <TableHead className={`text-[#94A3B8] ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                  Membro
                </TableHead>
                <TableHead className={`text-[#94A3B8] ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                  Função
                </TableHead>
                <TableHead className={`text-[#94A3B8] ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                  Receita
                </TableHead>
                <TableHead className={`text-[#94A3B8] ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                  Contratos
                </TableHead>
                <TableHead className={`text-[#94A3B8] ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {squad.membros.map((membro, idx) => (
                <TableRow key={membro.nome} className="border-white/10">
                  <TableCell className={`font-bold ${isTVMode ? 'text-2xl' : 'text-lg'}`}>
                    <span className={
                      idx === 0 ? 'text-[#FFB800]' :
                      idx === 1 ? 'text-[#94A3B8]' :
                      'text-[#CD7F32]'
                    }>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                    </span>
                  </TableCell>
                  <TableCell className={`text-white font-semibold ${isTVMode ? 'text-2xl' : 'text-base'}`}>
                    {membro.nome}
                  </TableCell>
                  <TableCell className={`text-[#94A3B8] ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                    {membro.funcao}
                  </TableCell>
                  <TableCell className={`text-white font-bold ${isTVMode ? 'text-2xl' : 'text-base'}`}>
                    {formatarReal(membro.receitaIndividual)}
                  </TableCell>
                  <TableCell className={`text-white ${isTVMode ? 'text-xl' : 'text-base'}`}>
                    {membro.contratos}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {membro.badges.includes('mvp') && (
                        <span className={isTVMode ? 'text-3xl' : 'text-2xl'} title="MVP do Squad">
                          👑
                        </span>
                      )}
                      {membro.receitaIndividual >= metaIndividual && (
                        <span className={isTVMode ? 'text-3xl' : 'text-2xl'} title={`Meta Batida (${formatarReal(metaIndividual)})`}>
                          🔥
                        </span>
                      )}
                      {membro.taxaConversao >= metaTaxaConversao && (
                        <span className={isTVMode ? 'text-3xl' : 'text-2xl'} title={`Taxa >= ${metaTaxaConversao}%`}>
                          ⭐
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className={`text-[#94A3B8] mb-1 ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                Total do Squad
              </p>
              <p className={`text-white font-black ${isTVMode ? 'text-3xl' : 'text-2xl'}`}>
                {formatarReal(squad.receitaTotal)}
              </p>
            </div>
            <div>
              <p className={`text-[#94A3B8] mb-1 ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                Média por Membro
              </p>
              <p className={`text-white font-black ${isTVMode ? 'text-3xl' : 'text-2xl'}`}>
                {formatarReal(squad.mediaVendasPorMembro)}
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  };
  
  return (
    <div className="max-w-[1600px] mx-auto">
      <h2 className={`text-white font-black text-center mb-12 ${
        isTVMode ? 'text-5xl' : 'text-4xl'
      }`}>
        Desempenho Individual dos Guerreiros
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {renderSquadCard(hotDogs)}
        {renderSquadCard(corvoAzul)}
      </div>
    </div>
  );
};
