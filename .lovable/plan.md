

## Corrigir valores de vendas e contratos dos SDRs

### Problema
Os campos `vendasOriginadas` e `contratosOriginados` no `sdrMetricsCalculator.ts` contam TODAS as linhas onde `SDR FECHOU` corresponde ao SDR, sem verificar se `FECHAMENTO = 'SIM'`. Isso infla os valores (ex: Vinicius mostra R$20k e muitos contratos, quando na verdade tem apenas 2 contratos reais).

### Solucao
Adicionar filtro `FECHAMENTO === 'SIM'` nos calculos de `vendasOriginadas` e `contratosOriginados`, igual ja existe no array `contratos`.

### Arquivo modificado
- **`src/utils/sdrMetricsCalculator.ts`** (linhas 220-234)
  - `vendasOriginadas`: adicionar `.filter(row => FECHAMENTO === 'SIM')` antes do `.reduce()`
  - `contratosOriginados`: adicionar mesma condicao no `.filter()`

### Detalhe tecnico
Atualmente:
```ts
// vendasOriginadas - conta TUDO onde SDR FECHOU = nome
const vendasOriginadas = filteredData
  .filter(row => compararNomeSDR(row['SDR FECHOU'], nome))
  .reduce((acc, row) => acc + parseValor(row['VALOR']), 0);

// contratosOriginados - conta TUDO onde SDR FECHOU = nome  
const contratosOriginados = filteredData.filter(row => 
  compararNomeSDR(row['SDR FECHOU'], nome)
).length;
```

Corrigido:
```ts
// vendasOriginadas - apenas onde FECHAMENTO = SIM
const vendasOriginadas = filteredData
  .filter(row => {
    const sdrFechou = String(row['SDR FECHOU'] || '').trim();
    const fechamento = String(row['FECHAMENTO'] || '').trim().toUpperCase();
    return compararNomeSDR(sdrFechou, nome) && fechamento === 'SIM';
  })
  .reduce((acc, row) => acc + parseValor(row['VALOR']), 0);

// contratosOriginados - apenas onde FECHAMENTO = SIM
const contratosOriginados = filteredData.filter(row => {
  const sdrFechou = String(row['SDR FECHOU'] || '').trim();
  const fechamento = String(row['FECHAMENTO'] || '').trim().toUpperCase();
  return compararNomeSDR(sdrFechou, nome) && fechamento === 'SIM';
}).length;
```

