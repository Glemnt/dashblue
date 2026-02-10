

## Plano: Configurar Fevereiro 2026

### Resumo
Adicionar suporte completo para Fevereiro 2026 com novo squad "Ki Karnes", novo SDR "Brunno Vaz", e Davi agora apenas como Closer.

### Composicao Fevereiro 2026

| Squad | SDR | Closers |
|-------|-----|---------|
| Hot Dogs | Vinicius | Bruno, Caua |
| Corvo Azul | Andrey | Marcos, Franklin |
| Ki Karnes | Brunno Vaz | Davi, Fernandes |

- **Meta mensal**: R$310.000
- **Meta por squad**: R$103.333 (310k / 3)
- **Meta individual Closer**: R$51.666
- **Total squads**: 3

### Arquivos a Modificar

#### 1. `src/utils/sheetUrlManager.ts`
- Adicionar entrada `fevereiro-2026` em `AVAILABLE_MONTHS` com GID `2116469311`
- Adicionar no `SHEET_GIDS` legado
- Adicionar case `startMonth === 1 && startYear === 2026` em `getSheetUrlForPeriod`

#### 2. `src/utils/metasConfig.ts`
- Adicionar `fevereiro-2026` em `METAS_POR_MES` com meta R$310.000, metaIndividualCloser R$51.666, squads `{ metaPorSquad: 103333, totalSquads: 3 }`
- Adicionar `fevereiro-2026` em `METAS_TRAFEGO_POR_MES` (copiar janeiro como base, ajustar metaReceita para R$310.000)
- Atualizar fallbacks de `janeiro-2026` para `fevereiro-2026`

#### 3. `src/utils/closerMetricsCalculator.ts`
- Adicionar bloco `isFevereiro` (month === 1, year === 2026)
- Definir 6 closers em 3 squads:
  - Hot Dogs (vermelho): Bruno, Caua
  - Corvo Azul (azul): Marcos, Gabriel Franklin
  - Ki Karnes (nova cor, ex: #FF6B00 laranja): Davi, Gabriel Fernandes
- Davi deixa de ter funcao dupla

#### 4. `src/utils/sdrMetricsCalculator.ts`
- Adicionar bloco `isFevereiro` (month === 1, year === 2026)
- SDRs: Vinicius Meireles (Hot Dogs), Andrey (Corvo Azul), Brunno Vaz (Ki Karnes)
- Adicionar `BRUNNO VAZ` no `variantesMap` com variantes `['BRUNNO VAZ', 'BRUNNO', 'BRUNO VAZ']`

#### 5. `src/utils/squadsMetricsCalculator.ts`
- Este arquivo atualmente so suporta 2 squads (Hot Dogs vs Corvo Azul) com tipagem fixa
- Para Fevereiro, adicionar bloco `isFevereiro` no `SQUADS_CONFIG` com 3 squads
- Expandir interface `SquadMetrics.nome` para incluir `'Ki Karnes'`
- Expandir `identificarSquad` para retornar `'Ki Karnes'`
- Adicionar Ki Karnes na comparacao e no retorno
- Atualizar `normalizarNome` para incluir `BRUNNO` -> `Brunno Vaz`

#### 6. `src/utils/colaboradorPhotos.ts`
- Adicionar entrada para `Brunno Vaz` (placeholder ou foto se disponivel)

### Secao Tecnica - Desafio Principal

O maior desafio e a pagina de **Guerra de Squads** (`squadsMetricsCalculator.ts`), que hoje e projetada para exatamente 2 squads com tipagem rigida (`'Hot Dogs' | 'Corvo Azul'`). Para suportar 3 squads sera necessario:

1. Expandir o tipo union para incluir `'Ki Karnes'`
2. Ajustar a estrutura de retorno `SquadsComparison` que hoje tem campos fixos `hotDogs` e `corvoAzul` - adicionar `kiKarnes`
3. Atualizar os componentes de UI que consomem esses dados:
   - `SquadsPlacar.tsx` - placar entre squads
   - `SquadsComparativo.tsx` - tabela comparativa
   - `SquadsGraficos.tsx` - graficos
   - `SquadsMembros.tsx` - membros
   - `SquadsMetaIndividual.tsx` - metas individuais
   - `SquadsProjecao.tsx` - projecoes
   - `SquadsHistorico.tsx` - historico

4. O placar que hoje e "1v1" precisara mostrar 3 squads competindo

### Cor sugerida para Ki Karnes
- Laranja `#FF6B00` com emoji `🟠` para diferenciar de Hot Dogs (vermelho) e Corvo Azul (azul)

