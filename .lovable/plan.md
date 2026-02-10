

## No-Show: destaque vermelho + card clicavel

### 1. Destacar calls no-show em vermelho na lista de "Total Calls"

No `renderCallItem`, verificar se a call e no-show (CLOSER = "NO-SHOW"). Se sim, aplicar borda e fundo vermelho ao item.

**Arquivo**: `src/components/sdr/SDRDetailCard.tsx`
- No `renderCallItem`, adicionar logica condicional:
  - Se `call.closer` contiver "NO-SHOW" (uppercase), usar `bg-red-50 border-red-300` no container
  - Adicionar badge vermelho "No-Show" no item

### 2. Adicionar campo `noShow` ao `SDRCallData`

**Arquivo**: `src/utils/sdrMetricsCalculator.ts`
- Adicionar `noShow: boolean` na interface `SDRCallData`
- No `mapCallData`, popular: `noShow: closer === 'NO-SHOW'`

### 3. Tornar o card "No-Shows" clicavel

**Arquivo**: `src/components/sdr/SDRDetailCard.tsx`
- Expandir `DetailView` para incluir `'noshows'`
- Transformar o card de No-Shows (atualmente estatico na grid de taxas) em card clicavel, movendo-o para a grid principal de 4 cards ou adicionando como 5o card
- No `renderDetailPanel`, adicionar case `'noshows'` que filtra `sdr.callsAgendadasData` por `call.noShow === true`
- Aplicar estilo vermelho ao card (bg-[#FF4757]/5, border-[#FF4757]/20, ring-[#FF4757])

### Arquivos modificados
1. `src/utils/sdrMetricsCalculator.ts` - Adicionar `noShow: boolean` ao `SDRCallData` e popular no `mapCallData`
2. `src/components/sdr/SDRDetailCard.tsx` - Destacar no-shows em vermelho nas listas, tornar card No-Shows clicavel com filtro

