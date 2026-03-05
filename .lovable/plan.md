

## Adicionar Marco 2026 na planilha

Adicionar o GID `426693075` para Marco 2026 em todos os locais que registram meses disponiveis.

### Arquivos modificados

**1. `src/utils/sheetUrlManager.ts`**
- Adicionar entrada em `AVAILABLE_MONTHS`: `{ key: 'marco-2026', label: 'Marco 2026', gid: '426693075', month: 2, year: 2026 }`
- Adicionar em `SHEET_GIDS`: `'marco-2026': '426693075'`
- Adicionar case em `getSheetUrlForPeriod`: `startMonth === 2 && startYear === 2026` -> `'marco-2026'`
- Atualizar fallback de `'fevereiro-2026'` para `'marco-2026'`

**2. `src/utils/importVendas.ts`**
- Adicionar em `MONTH_GIDS`: `'marco-2026': { gid: '426693075', month: 2, year: 2026 }`

Como a data atual e Marco 2026, `getCurrentAvailableMonth()` vai automaticamente selecionar Marco como mes padrao.

