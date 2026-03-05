

## Adicionar metas de Março 2026

350k total, 6 closers (~58.333 cada), 3 squads (~116.667 cada), 3 SDRs.

### Arquivo: `src/utils/metasConfig.ts`

**1. Adicionar `'marco-2026'` em `METAS_POR_MES`:**
```
metaMensal: 350000
metaIndividualCloser: 58333
modelo: 'MRR'
squads: { metaPorSquad: 116667, totalSquads: 3 }
```
Demais campos mantém padrão (ticket 4200, conversão 28%, etc.)

**2. Adicionar `'marco-2026'` em `METAS_TRAFEGO_POR_MES`** (copiar de fevereiro, ajustar metaReceita para 350000 e recalcular fechamentos/calls)

**3. Atualizar fallbacks** de `'fevereiro-2026'` para `'marco-2026'` em `getMetasTrafegoAtual` e `getMetasPorMes`

