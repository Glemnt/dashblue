export interface SDRActivity {
  data: string;
  empresa: string;
  nomeCall: string;
  valorContrato: number;
  assinatura: string;
  pagamento: string;
  status: string;
  closer: string;
  qualificada: boolean;
  temContrato: boolean;
}

export const getRecentActivities = (data: any[], sdrNome: string, limit: number = 5): SDRActivity[] => {
  const parseValor = (valorStr: string): number => {
    if (!valorStr) return 0;
    const cleanValue = String(valorStr).replace(/[R$\s.]/g, '').replace(',', '.');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  const activities = data
    .filter(row => {
      const sdrName = String(row['SDR'] || '').trim().toUpperCase();
      return sdrName === sdrNome.toUpperCase();
    })
    .map(row => {
      const fechamento = String(row['FECHAMENTO'] || '').trim().toUpperCase();
      const temContrato = fechamento === 'SIM';
      
      return {
        data: row['DATA'] || row['Data'] || row['Data_Realizacao'] || 'Sem data',
        empresa: row['EMPRESA'] || row['Empresa'] || 'Empresa não informada',
        nomeCall: row['NOME DA CALL'] || 'Cliente não identificado',
        valorContrato: parseValor(row['VALOR'] || '0'),
        assinatura: row['ASSINATURA'] || 'Pendente',
        pagamento: row['PAGAMENTO'] || 'Pendente',
        status: row['STATUS'] || row['Status'] || 'Pendente',
        closer: row['CLOSER'] || row['Closer'] || 'Não atribuído',
        qualificada: String(row['QUALIFICADA (SQL)'] || '').trim().toUpperCase() === 'SIM',
        temContrato
      };
    })
    .sort((a, b) => {
      try {
        const dateA = parseDate(a.data);
        const dateB = parseDate(b.data);
        return dateB.getTime() - dateA.getTime();
      } catch {
        return 0;
      }
    })
    .slice(0, limit);

  return activities;
};

const parseDate = (dateStr: string): Date => {
  if (dateStr.includes('/')) {
    const [day, month, year] = dateStr.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  } else if (dateStr.includes('-')) {
    return new Date(dateStr);
  }
  return new Date();
};
