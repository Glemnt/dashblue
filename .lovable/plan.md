

## Plano: Meta SDR = Meta Squad + Detalhamento de Calls

### 1. Meta individual SDR = Meta do Squad

Atualmente a meta individual do SDR e baseada em `metaIndividualCalls` (numero de calls). O pedido e que a meta de **valor** (vendas originadas) do SDR seja igual a meta do squad (`metaPorSquad`). 

**Arquivo**: `src/pages/PerformanceSDR.tsx`
- Extrair `configMeta.squads.metaPorSquad` e passar como nova prop `metaIndividualVendas` ao `SDRDetailCard`

**Arquivo**: `src/components/sdr/SDRDetailCard.tsx`
- Adicionar prop `metaIndividualVendas` (valor em R$)
- Adicionar barra de progresso "Vendas Originadas vs Meta do Squad" na secao "Performance vs Meta Individual"

### 2. Detalhamento de calls no SDR (igual ao Closer)

Atualmente o `SDRDetailCard` mostra apenas numeros agregados. O Closer tem cards clicaveis que exibem a lista de calls com detalhes (nome, data, SDR, tipo, qualificada, valor). Vamos replicar isso para o SDR.

**Arquivo**: `src/utils/sdrMetricsCalculator.ts`
- Adicionar interface `SDRCallData` com campos: `nomeCall`, `data`, `closer`, `tipoCall`, `qualificada`, `valor`, `fechamento`, `assinatura`, `pagamento`
- Adicionar campos `callsAgendadasData: SDRCallData[]`, `callsRealizadasData: SDRCallData[]`, `callsQualificadasData: SDRCallData[]` na interface `SDRMetrics`
- No calculo de metricas, popular esses arrays a partir de `callsDoSDR`:
  - `callsAgendadasData` = todas as calls do SDR (com detalhes mapeados)
  - `callsRealizadasData` = filtradas onde CLOSER preenchido e nao e NO-SHOW
  - `callsQualificadasData` = filtradas onde QUALIFICADA (SQL) = SIM

**Arquivo**: `src/components/sdr/SDRDetailCard.tsx`
- Refatorar para usar o mesmo padrao do `CloserDetailCard`:
  - Adicionar estado `selectedView` com opcoes: `'none' | 'agendadas' | 'realizadas' | 'qualificadas' | 'contratos'`
  - Tornar os cards de Total Calls, Qualificadas, Realizadas e Contratos **clicaveis**
  - Ao clicar, exibir painel com lista de calls (nome do cliente, data, closer, tipo, status qualificada, valor)
  - Manter secao de "Contratos Fechados" como view clicavel tambem

### Secao Tecnica

#### Novo tipo `SDRCallData`
```text
SDRCallData {
  nomeCall: string
  data: string
  closer: string
  tipoCall: string (R1/R2)
  qualificada: boolean
  valor: number
  fechamento: boolean
}
```

#### Campos adicionados a `SDRMetrics`
```text
callsAgendadasData: SDRCallData[]
callsRealizadasData: SDRCallData[]
callsQualificadasData: SDRCallData[]
```

#### Fluxo no SDRDetailCard
```text
Card "Total Calls" (clicavel) --> mostra callsAgendadasData
Card "Realizadas" (clicavel) --> mostra callsRealizadasData
Card "Qualificadas" (clicavel) --> mostra callsQualificadasData
Card "Contratos" (clicavel) --> mostra contratos (ja existente)
```

### Arquivos modificados
1. `src/utils/sdrMetricsCalculator.ts` - Adicionar `SDRCallData`, popular arrays de calls
2. `src/components/sdr/SDRDetailCard.tsx` - Refatorar com cards clicaveis e painel de detalhes
3. `src/pages/PerformanceSDR.tsx` - Passar `metaIndividualVendas={configMeta.squads.metaPorSquad}` ao SDRDetailCard

