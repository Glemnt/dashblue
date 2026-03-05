

## Problema

Os calculadores de métricas (`closerMetricsCalculator.ts`, `sdrMetricsCalculator.ts`, `squadsMetricsCalculator.ts`) não têm uma condição para Março 2026. Como resultado, Março cai no bloco `else` (fallback), que usa a equipe de Novembro 2025 — desatualizada.

O dash publicado está com o código de Fevereiro que funcionava, mas sem as metas de Março que acabamos de adicionar.

## Solução

Adicionar `isMarco` (month === 2, year === 2026) nos 3 arquivos, replicando a mesma estrutura de equipe de Fevereiro 2026:

### 1. `src/utils/closerMetricsCalculator.ts`
- Adicionar `const isMarco = dateRange && dateRange.start.getMonth() === 2 && dateRange.start.getFullYear() === 2026;`
- Adicionar bloco `if (isMarco)` antes de `isFevereiro` com os mesmos 6 closers e 3 squads de Fevereiro:
  - Bruno + Cauã → Hot Dogs
  - Marcos + Gabriel Franklin → Corvo Azul
  - Davi + Gabriel Fernandes → Ki Karnes

### 2. `src/utils/sdrMetricsCalculator.ts`
- Adicionar `const isMarco` e bloco `if (isMarco)` com os mesmos 3 SDRs de Fevereiro:
  - Vinícius Meireles → Hot Dogs
  - Andrey → Corvo Azul
  - Brunno Vaz → Ki Karnes

### 3. `src/utils/squadsMetricsCalculator.ts`
- Adicionar `const isMarco` e bloco `if (isMarco)` com os mesmos 3 squads de Fevereiro:
  - Hot Dogs (Bruno, Cauã, Vinícius)
  - Corvo Azul (Marcos, Gabriel Franklin, Andrey)
  - Ki Karnes (Davi, Gabriel Fernandes, Brunno Vaz)

Os 3 arquivos seguem o mesmo padrão: detectar o mês pelo `dateRange.start` e selecionar a composição da equipe correspondente.

