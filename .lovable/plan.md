

## Adicionar Abril 2026 + Novo SDR Gabriel Valadares

### Resumo
- Novo mês Abril 2026 (GID `428662425`) em todos os arquivos de configuração
- Novo SDR Gabriel Valadares (foto + mapeamento) sem squad
- Meta: 360k, 6 closers (meta distribuída entre 5, excluindo Fernandes = 72k cada), 4 SDRs, 3 squads (120k cada)

### Arquivos modificados

**1. Foto do Gabriel Valadares**
- Salvar a foto enviada em `src/assets/colaboradores/gabriel-valadares.png`

**2. `src/utils/colaboradorPhotos.ts`**
- Adicionar import `fotoGabrielValadares` de `@/assets/colaboradores/gabriel-valadares.png`
- Adicionar entradas no mapeamento: `'Gabriel Valadares'`, `'GABRIEL VALADARES'`, `'Valadares'`

**3. `src/utils/sheetUrlManager.ts`**
- Adicionar em `AVAILABLE_MONTHS`: `{ key: 'abril-2026', label: 'Abril 2026', gid: '428662425', month: 3, year: 2026 }`
- Adicionar em `SHEET_GIDS`: `'abril-2026': '428662425'`
- Adicionar case em `getSheetUrlForPeriod`: `startMonth === 3 && startYear === 2026`
- Atualizar fallback de `'marco-2026'` para `'abril-2026'`

**4. `src/utils/importVendas.ts`**
- Adicionar em `MONTH_GIDS`: `'abril-2026': { gid: '428662425', month: 3, year: 2026 }`

**5. `src/utils/dateFilters.ts`**
- Adicionar `'abril-2026'` em `MESES_DISPONIVEIS`

**6. `src/utils/metasConfig.ts`**
- Adicionar `'abril-2026'` em `METAS_TRAFEGO_POR_MES` (copiar de março, ajustar metaReceita para 360000)
- Adicionar `'abril-2026'` em `METAS_POR_MES`:
  - `metaMensal: 360000`
  - `metaIndividualCloser: 72000`
  - `squads: { metaPorSquad: 120000, totalSquads: 3 }`
  - `numSDRs: 4`
- Atualizar fallbacks para `'abril-2026'`

**7. `src/utils/closerMetricsCalculator.ts`**
- Adicionar `const isAbril = dateRange && dateRange.start.getMonth() === 3 && dateRange.start.getFullYear() === 2026`
- Bloco `if (isAbril)`: mesmos 6 closers de março nos mesmos squads (Bruno+Cauã→Hot Dogs, Marcos+Franklin→Corvo Azul, Davi+Fernandes→Ki Karnes)

**8. `src/utils/sdrMetricsCalculator.ts`**
- Adicionar `isAbril` e bloco com 4 SDRs:
  - Vinícius Meireles → Hot Dogs
  - Andrey → Corvo Azul
  - Brunno Vaz → Ki Karnes
  - Gabriel Valadares → Sem Squad (cor `#64748B`, emoji `⚪`)
- Adicionar `'GABRIEL VALADARES'` nas variantes de nome

**9. `src/utils/squadsMetricsCalculator.ts`**
- Adicionar `isAbril` com mesmos 3 squads de março (Gabriel Valadares fica fora dos squads)
- Adicionar `'GABRIEL VALADARES'` e `'VALADARES'` no `normalizarNome`

