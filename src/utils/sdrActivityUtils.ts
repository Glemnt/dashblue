export interface SDRActivity {
  data: string;
  empresa: string;
  status: string;
  closer: string;
  qualificada: boolean;
}

export const getRecentActivities = (data: any[], sdrNome: string, limit: number = 5): SDRActivity[] => {
  const activities = data
    .filter(row => {
      const sdrName = String(row['SDR'] || '').trim().toUpperCase();
      return sdrName === sdrNome.toUpperCase();
    })
    .map(row => ({
      data: row['DATA'] || row['Data'] || row['Data_Realizacao'] || 'Sem data',
      empresa: row['EMPRESA'] || row['Empresa'] || 'Empresa não informada',
      status: row['STATUS'] || row['Status'] || 'Pendente',
      closer: row['CLOSER'] || row['Closer'] || 'Não atribuído',
      qualificada: String(row['QUALIFICADA (SQL)'] || '').trim().toUpperCase() === 'SIM'
    }))
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
