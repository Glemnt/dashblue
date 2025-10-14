import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';

export interface VendasOutubroData {
  nome: string;
  valorVendas: number;
  percentualVendas: number;
  ticketMedio: number;
  callsRealizadas: number;
  callsQualificadas: number;
  numeroContratos: number;
  taxaConversao: number;
}

interface UseVendasOutubroReturn {
  closers: VendasOutubroData[];
  totais: VendasOutubroData | null;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refetch: () => void;
}

const parseValor = (valorStr: string): number => {
  if (!valorStr) return 0;
  const cleanValue = String(valorStr).replace(/[R$\s.]/g, '').replace(',', '.');
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

const parsePercentual = (percentStr: string): number => {
  if (!percentStr) return 0;
  const cleanValue = String(percentStr).replace(/[%\s]/g, '').replace(',', '.');
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

export const useGoogleSheetsVendasOutubro = (): UseVendasOutubroReturn => {
  const [closers, setClosers] = useState<VendasOutubroData[]>([]);
  const [totais, setTotais] = useState<VendasOutubroData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vSMYk5K5k39Apo7zd4z5xhi3aS9C_YE5FGgGJfhcLaCSlfh4YZp1AlAyjPw8PQho9fDlUYHSgofKyuj/pub?gid=2010777326&single=true&output=csv'
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const closersData: VendasOutubroData[] = [];
            let totaisData: VendasOutubroData | null = null;

            results.data.forEach((row: any) => {
              const nome = String(row['CLOSERS'] || '').trim();
              
              if (!nome) return;

              const data: VendasOutubroData = {
                nome: nome,
                valorVendas: parseValor(row['Valor em Vendas'] || '0'),
                percentualVendas: parsePercentual(row['% das vendas'] || '0'),
                ticketMedio: parseValor(row['Ticket médio'] || '0'),
                callsRealizadas: parseInt(row['Calls realizadas'] || '0') || 0,
                callsQualificadas: parseInt(row['Calls Qualificadas'] || '0') || 0,
                numeroContratos: parseInt(row['N. de contratos'] || '0') || 0,
                taxaConversao: parsePercentual(row['Tx. conversão'] || '0')
              };

              if (nome.toUpperCase() === 'TOTAL') {
                totaisData = data;
              } else {
                closersData.push(data);
              }
            });

            setClosers(closersData);
            setTotais(totaisData);
            setLastUpdate(new Date());
            setLoading(false);
          } catch (err) {
            console.error('Erro ao processar dados:', err);
            setError('Erro ao processar dados da planilha');
            setLoading(false);
          }
        },
        error: (err) => {
          console.error('Erro ao fazer parse do CSV:', err);
          setError('Erro ao fazer parse do CSV');
          setLoading(false);
        }
      });
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    const interval = setInterval(() => {
      fetchData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const refetch = useCallback(() => {
    fetchData();
  }, []);

  return {
    closers,
    totais,
    loading,
    error,
    lastUpdate,
    refetch
  };
};
