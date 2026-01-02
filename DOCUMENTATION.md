# 📊 Blue Ocean Dashboard - Documentação Técnica

> Sistema de gestão comercial B2B para equipe de vendas da Blue Ocean

---

## 📑 Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura do Sistema](#2-arquitetura-do-sistema)
3. [Estrutura de Diretórios](#3-estrutura-de-diretórios)
4. [Modelo de Dados](#4-modelo-de-dados)
5. [Páginas Principais](#5-páginas-principais)
6. [Utilitários (Utils)](#6-utilitários-utils)
7. [Custom Hooks](#7-custom-hooks)
8. [Edge Functions](#8-edge-functions)
9. [Componentes](#9-componentes)
10. [Padrões de Código](#10-padrões-de-código)
11. [Configuração de Metas](#11-configuração-de-metas)
12. [Segurança](#12-segurança)
13. [Guias de Manutenção](#13-guias-de-manutenção)
14. [Decisões Arquiteturais](#14-decisões-arquiteturais)

---

## 1. Visão Geral

### 1.1 Descrição do Projeto

O **Blue Ocean Dashboard** é um sistema completo de gestão comercial desenvolvido para acompanhar métricas de vendas, performance de equipe e campanhas de marketing. O sistema integra dados de múltiplas fontes (Google Sheets, Meta Ads, Kommo CRM) em uma interface unificada com visualizações em tempo real.

### 1.2 Stack Tecnológica

| Tecnologia | Versão | Justificativa |
|------------|--------|---------------|
| **React** | 18.3.1 | Componentes reutilizáveis, hooks, ecossistema maduro |
| **TypeScript** | - | Tipagem estática, prevenção de erros em tempo de compilação |
| **Vite** | - | Build extremamente rápido, HMR instantâneo |
| **Tailwind CSS** | - | Utility-first, design system consistente, dark mode nativo |
| **shadcn/ui** | - | Componentes acessíveis, altamente customizáveis |
| **React Router DOM** | 6.30.1 | Roteamento SPA com suporte a lazy loading |
| **TanStack Query** | 5.83.0 | Cache inteligente, revalidação automática, estados de loading |
| **Lovable Cloud (Supabase)** | - | Backend serverless, PostgreSQL, Edge Functions |
| **Recharts** | 2.15.4 | Gráficos responsivos e customizáveis |
| **PapaParse** | 5.4.1 | Parse robusto de CSV |
| **date-fns** | 3.6.0 | Manipulação de datas com imutabilidade |

### 1.3 Funcionalidades Principais

- 📈 **Dashboard Executivo**: Visão geral de KPIs comerciais
- 👥 **Performance SDR**: Métricas individuais de pré-vendas
- 🎯 **Performance Closer**: Métricas individuais de fechamento
- 💰 **Financeiro**: Funil financeiro e contratos
- ⚔️ **Guerra dos Squads**: Competição gamificada entre equipes
- 📣 **Tráfego Pago**: Análise de campanhas Meta Ads
- 🤖 **Assistente IA**: Chat contextual com análises inteligentes
- ⚙️ **Admin**: Gestão de colaboradores, metas e vendas

---

## 2. Arquitetura do Sistema

### 2.1 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React SPA)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Pages     │  │ Components  │  │   Hooks     │  │   Utils     │    │
│  │  (9 rotas)  │  │ (domínios)  │  │  (custom)   │  │(calculadores)│   │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
│         │                │                │                │            │
│         └────────────────┴────────────────┴────────────────┘            │
│                                    │                                    │
│                          ┌─────────┴─────────┐                          │
│                          │  TanStack Query   │                          │
│                          │   (Cache Layer)   │                          │
│                          └─────────┬─────────┘                          │
└────────────────────────────────────┼────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Google Sheets  │      │   Lovable Cloud │      │   APIs Externas │
│   (Planilhas)   │      │   (Supabase)    │      │                 │
│                 │      │                 │      │  ┌───────────┐  │
│  • Vendas       │      │  ┌───────────┐  │      │  │ Meta Ads  │  │
│  • Calls        │      │  │PostgreSQL │  │      │  │   API     │  │
│  • Leads        │      │  └─────┬─────┘  │      │  └───────────┘  │
│                 │      │        │        │      │                 │
└─────────────────┘      │  ┌─────┴─────┐  │      │  ┌───────────┐  │
                         │  │   Edge    │  │      │  │  Kommo    │  │
                         │  │ Functions │  │      │  │   CRM     │  │
                         │  └───────────┘  │      │  └───────────┘  │
                         └─────────────────┘      └─────────────────┘
```

### 2.2 Fluxo de Dados

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Usuário │────▶│   Page   │────▶│   Hook   │────▶│  Fonte   │
│  (input) │     │(componente)    │ (fetch)  │     │  (data)  │
└──────────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
                      │                │                │
                      │                │     ┌──────────┴──────────┐
                      │                │     │                     │
                      │                ▼     ▼                     ▼
                      │         ┌──────────────┐          ┌──────────────┐
                      │         │    Utils     │          │  TanStack    │
                      │         │ (calculate)  │          │   Query      │
                      │         └──────┬───────┘          │  (cache)     │
                      │                │                  └──────────────┘
                      │                │
                      ▼                ▼
               ┌─────────────────────────────┐
               │     Render (UI Update)      │
               └─────────────────────────────┘
```

---

## 3. Estrutura de Diretórios

```
blue-ocean-dashboard/
├── 📁 src/
│   ├── 📁 pages/                    # Páginas/Rotas da aplicação
│   │   ├── Index.tsx                # Dashboard principal (/)
│   │   ├── PerformanceSDR.tsx       # Métricas SDR (/sdr)
│   │   ├── PerformanceCloser.tsx    # Métricas Closer (/closer)
│   │   ├── Financeiro.tsx           # Painel financeiro (/financeiro)
│   │   ├── GuerraSquads.tsx         # Competição squads (/squads)
│   │   ├── TrafegoPago.tsx          # Campanhas Meta (/trafego)
│   │   ├── TrafegoIA.tsx            # Análise IA tráfego (/trafego/ia)
│   │   ├── AssistenteIA.tsx         # Chat IA (/ia)
│   │   ├── Admin.tsx                # Painel admin (/admin)
│   │   └── NotFound.tsx             # Página 404
│   │
│   ├── 📁 components/               # Componentes organizados por domínio
│   │   ├── 📁 admin/                # Componentes do painel admin
│   │   │   ├── AdminResumoPanel.tsx # Resumo geral
│   │   │   ├── ColaboradoresTab.tsx # CRUD colaboradores
│   │   │   ├── MetasTab.tsx         # Configuração de metas
│   │   │   ├── VendasTab.tsx        # Gestão de vendas
│   │   │   └── AgendamentosTab.tsx  # Gestão de agendamentos
│   │   │
│   │   ├── 📁 closer/               # Componentes de Closers
│   │   │   ├── CloserPodium.tsx     # Pódio de ranking
│   │   │   ├── CloserDetailCard.tsx # Card individual
│   │   │   ├── CloserComparisonTable.tsx
│   │   │   ├── CloserComparisonMobileCards.tsx
│   │   │   └── CloserCharts.tsx     # Gráficos
│   │   │
│   │   ├── 📁 sdr/                  # Componentes de SDRs
│   │   │   ├── SDRPodium.tsx        # Pódio de ranking
│   │   │   ├── SDRDetailCard.tsx    # Card individual
│   │   │   ├── SDRComparisonTable.tsx
│   │   │   ├── SDRComparisonMobileCards.tsx
│   │   │   ├── SDRCharts.tsx        # Gráficos
│   │   │   ├── MonthSelector.tsx    # Seletor de mês
│   │   │   └── PeriodFilter.tsx     # Filtro de período
│   │   │
│   │   ├── 📁 squads/               # Componentes Guerra Squads
│   │   │   ├── SquadsPlacar.tsx     # Placar principal
│   │   │   ├── SquadsComparativo.tsx
│   │   │   ├── SquadsMembros.tsx    # Membros por squad
│   │   │   ├── SquadsMetaIndividual.tsx
│   │   │   ├── SquadsProjecao.tsx   # Projeções
│   │   │   ├── SquadsGraficos.tsx
│   │   │   └── SquadsHistorico.tsx
│   │   │
│   │   ├── 📁 trafego/              # Componentes Tráfego Pago
│   │   │   ├── TrafegoKPICards.tsx  # Cards de KPIs
│   │   │   ├── TrafegoFunnel.tsx    # Funil de conversão
│   │   │   ├── TrafegoMetaBars.tsx  # Barras de progresso
│   │   │   ├── TrafegoPodium.tsx    # Ranking campanhas
│   │   │   ├── TrafegoCanais.tsx    # Performance por canal
│   │   │   ├── TrafegoComercial.tsx # Métricas comerciais
│   │   │   ├── TrafegoComparativo.tsx
│   │   │   ├── TrafegoROICard.tsx   # Card de ROI
│   │   │   ├── TrafegoAICard.tsx    # Card IA
│   │   │   ├── TrafegoAIInsights.tsx # Insights IA
│   │   │   └── CampanhasTable.tsx   # Tabela de campanhas
│   │   │
│   │   ├── 📁 financial/            # Componentes Financeiro
│   │   │   ├── FinancialFunnel.tsx  # Funil financeiro
│   │   │   └── ContractsTable.tsx   # Tabela de contratos
│   │   │
│   │   ├── 📁 ia/                   # Componentes IA
│   │   │   └── simulator/
│   │   │       └── SimulatorSlider.tsx
│   │   │
│   │   ├── 📁 ui/                   # Componentes shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── input.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── chart.tsx
│   │   │   └── ... (40+ componentes)
│   │   │
│   │   ├── Navigation.tsx           # Navegação principal
│   │   ├── MobileMenu.tsx           # Menu mobile
│   │   ├── Footer.tsx               # Rodapé
│   │   ├── TVModeToggle.tsx         # Toggle modo TV
│   │   └── ColaboradorAvatar.tsx    # Avatar com foto
│   │
│   ├── 📁 hooks/                    # Custom Hooks
│   │   ├── 📁 admin/                # Hooks do admin
│   │   │   ├── useAgendamentos.ts
│   │   │   ├── useColaboradores.ts
│   │   │   ├── useMetasMensais.ts
│   │   │   └── useVendas.ts
│   │   │
│   │   ├── useGoogleSheets.ts       # Fetch de planilhas
│   │   ├── useGoogleSheetsCampanhas.ts
│   │   ├── useGoogleSheetsLeads.ts
│   │   ├── useCloserKPIs.ts         # KPIs de closers
│   │   ├── useSDRKPIs.ts            # KPIs de SDRs
│   │   ├── useMetaCampaigns.ts      # Campanhas Meta Ads
│   │   ├── useRealFinancials.ts     # Dados financeiros
│   │   ├── useComparativoMensal.ts  # Comparativo entre meses
│   │   ├── useTrafegoAIAnalysis.ts  # Análise IA tráfego
│   │   ├── useTVMode.ts             # Modo televisão
│   │   ├── use-mobile.tsx           # Detecção mobile
│   │   └── use-toast.ts             # Sistema de toasts
│   │
│   ├── 📁 utils/                    # Utilitários e Calculadores
│   │   ├── metricsCalculator.ts     # Motor principal de métricas
│   │   ├── closerMetricsCalculator.ts
│   │   ├── sdrMetricsCalculator.ts
│   │   ├── financialMetricsCalculator.ts
│   │   ├── squadsMetricsCalculator.ts
│   │   ├── trafegoMetricsCalculator.ts
│   │   ├── metasConfig.ts           # Configuração de metas
│   │   ├── importVendas.ts          # Importação de vendas
│   │   ├── dateFilters.ts           # Filtros de data
│   │   ├── progressColorUtils.ts    # Cores de progresso
│   │   ├── sdrActivityUtils.ts      # Utilidades SDR
│   │   ├── colaboradorPhotos.ts     # Mapeamento de fotos
│   │   ├── sheetUrlManager.ts       # Gestão URLs planilhas
│   │   └── leadsSheetUrlManager.ts
│   │
│   ├── 📁 contexts/                 # Context API
│   │   └── PeriodFilterContext.tsx  # Contexto de filtro de período
│   │
│   ├── 📁 integrations/             # Integrações externas
│   │   └── 📁 supabase/
│   │       ├── client.ts            # Cliente Supabase (auto-gerado)
│   │       ├── types.ts             # Tipos do banco (auto-gerado)
│   │       └── types.generated.ts
│   │
│   ├── 📁 assets/                   # Assets estáticos
│   │   ├── logo-white.png
│   │   └── 📁 colaboradores/        # Fotos dos colaboradores
│   │       ├── bruno.png
│   │       ├── caua.png
│   │       ├── fernandes.png
│   │       ├── franklin.png
│   │       ├── marcos.png
│   │       ├── tiago.png
│   │       ├── davi.png
│   │       ├── andrey.png
│   │       ├── vinicius.png
│   │       └── joao-lopes.png
│   │
│   ├── 📁 lib/                      # Bibliotecas/Utilitários
│   │   └── utils.ts                 # cn() para classes Tailwind
│   │
│   ├── App.tsx                      # Componente raiz + rotas
│   ├── App.css                      # Estilos globais
│   ├── main.tsx                     # Entry point
│   ├── index.css                    # Tokens Tailwind
│   └── vite-env.d.ts                # Tipos Vite
│
├── 📁 supabase/
│   ├── 📁 functions/                # Edge Functions
│   │   ├── 📁 ai-assistant/
│   │   │   └── index.ts             # Chat IA contextual
│   │   ├── 📁 ai-trafego-analyst/
│   │   │   └── index.ts             # Análise IA tráfego
│   │   ├── 📁 fetch-meta-campaigns/
│   │   │   └── index.ts             # Integração Meta Ads
│   │   └── 📁 kommo-webhook/
│   │       └── index.ts             # Webhook Kommo CRM
│   │
│   ├── 📁 migrations/               # Migrações SQL (auto-gerado)
│   └── config.toml                  # Configuração Supabase
│
├── 📄 package.json                  # Dependências (read-only)
├── 📄 tailwind.config.ts            # Configuração Tailwind
├── 📄 vite.config.ts                # Configuração Vite
├── 📄 tsconfig.json                 # Configuração TypeScript
├── 📄 .env                          # Variáveis de ambiente (auto-gerado)
└── 📄 DOCUMENTATION.md              # Esta documentação
```

---

## 4. Modelo de Dados

### 4.1 Diagrama Entidade-Relacionamento

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BANCO DE DADOS                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐         ┌─────────────────┐                       │
│  │  colaboradores  │         │  metas_mensais  │                       │
│  ├─────────────────┤         ├─────────────────┤                       │
│  │ id (PK)         │         │ id (PK)         │                       │
│  │ nome            │         │ mes             │                       │
│  │ tipo            │         │ meta_mensal     │                       │
│  │ squad           │         │ meta_individual │                       │
│  │ ativo           │         │ meta_ticket     │                       │
│  │ created_at      │         │ meta_conversao  │                       │
│  └────────┬────────┘         │ meta_qualif_sdr │                       │
│           │                  │ meta_show_sdr   │                       │
│           │                  └─────────────────┘                       │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────┐         ┌─────────────────┐                       │
│  │     vendas      │         │  agendamentos   │                       │
│  ├─────────────────┤         ├─────────────────┤                       │
│  │ id (PK)         │         │ id (PK)         │                       │
│  │ colaborador_id  │◄────────│ sdr_id          │                       │
│  │ colaborador_nome│         │ closer_id       │                       │
│  │ valor           │         │ sdr_nome        │                       │
│  │ origem          │         │ closer_nome     │                       │
│  │ data_fechamento │         │ lead_nome       │                       │
│  │ lead_nome       │         │ data_agendamento│                       │
│  │ observacao      │         │ status          │                       │
│  │ created_at      │         │ qualificado     │                       │
│  └─────────────────┘         │ origem          │                       │
│                              │ observacao      │                       │
│                              └─────────────────┘                       │
│                                                                         │
│  ┌─────────────────┐         ┌─────────────────────┐                   │
│  │   leads_crm     │────────▶│ leads_crm_historico │                   │
│  ├─────────────────┤         ├─────────────────────┤                   │
│  │ id (PK)         │         │ id (PK)             │                   │
│  │ kommo_id        │         │ lead_id (FK)        │                   │
│  │ nome            │         │ kommo_id            │                   │
│  │ email           │         │ campo_alterado      │                   │
│  │ telefone        │         │ valor_anterior      │                   │
│  │ empresa         │         │ valor_novo          │                   │
│  │ status          │         │ status_anterior     │                   │
│  │ sdr_nome        │         │ status_novo         │                   │
│  │ closer_nome     │         │ created_at          │                   │
│  │ valor_contrato  │         └─────────────────────┘                   │
│  │ data_entrada    │                                                    │
│  │ data_mql        │                                                    │
│  │ data_reuniao    │                                                    │
│  │ data_ganho      │                                                    │
│  │ data_perdido    │                                                    │
│  │ motivo_perda    │                                                    │
│  │ tags[]          │                                                    │
│  │ kommo_payload   │                                                    │
│  └─────────────────┘                                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Descrição das Tabelas

#### `colaboradores`
Armazena informações dos membros da equipe comercial.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `nome` | TEXT | Nome do colaborador |
| `tipo` | TEXT | "SDR" ou "Closer" |
| `squad` | TEXT | "Hot Dogs" ou "Corvo Azul" |
| `ativo` | BOOLEAN | Se está ativo na equipe |
| `created_at` | TIMESTAMP | Data de criação |

#### `vendas`
Registra todas as vendas/contratos fechados.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `colaborador_id` | UUID | FK para colaboradores (opcional) |
| `colaborador_nome` | TEXT | Nome do closer que fechou |
| `valor` | NUMERIC | Valor do contrato |
| `origem` | TEXT | "inbound", "outbound", "indicacao" |
| `data_fechamento` | DATE | Data do fechamento |
| `lead_nome` | TEXT | Nome do lead/empresa |
| `observacao` | TEXT | Observações adicionais |

#### `agendamentos`
Controla os agendamentos de calls entre SDR e Closer.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `sdr_id` | UUID | FK para colaboradores (SDR) |
| `closer_id` | UUID | FK para colaboradores (Closer) |
| `sdr_nome` | TEXT | Nome do SDR |
| `closer_nome` | TEXT | Nome do Closer |
| `lead_nome` | TEXT | Nome do lead |
| `data_agendamento` | DATE | Data da call |
| `status` | TEXT | "agendado", "realizado", "no_show", "cancelado" |
| `qualificado` | BOOLEAN | Se o lead é qualificado (MQL) |
| `origem` | TEXT | Canal de origem |

#### `metas_mensais`
Define as metas comerciais por mês.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `mes` | TEXT | Mês no formato "janeiro-2025" |
| `meta_mensal` | NUMERIC | Meta total do mês |
| `meta_individual_closer` | NUMERIC | Meta por closer |
| `meta_ticket_medio` | NUMERIC | Meta de ticket médio |
| `meta_taxa_conversao` | NUMERIC | Meta de conversão (%) |
| `meta_taxa_qualificacao_sdr` | NUMERIC | Meta qualificação SDR (%) |
| `meta_taxa_show_sdr` | NUMERIC | Meta de show rate (%) |

#### `leads_crm`
Leads sincronizados do Kommo CRM.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador interno |
| `kommo_id` | BIGINT | ID no Kommo CRM |
| `nome` | TEXT | Nome do lead |
| `email` | TEXT | Email de contato |
| `telefone` | TEXT | Telefone |
| `empresa` | TEXT | Nome da empresa |
| `status` | TEXT | Stage atual no funil |
| `sdr_nome` | TEXT | SDR responsável |
| `closer_nome` | TEXT | Closer atribuído |
| `valor_contrato` | NUMERIC | Valor do contrato |
| `data_entrada` | TIMESTAMP | Data de entrada no funil |
| `data_mql` | TIMESTAMP | Data de qualificação MQL |
| `data_reuniao` | TIMESTAMP | Data da reunião |
| `data_ganho` | TIMESTAMP | Data do fechamento |
| `data_perdido` | TIMESTAMP | Data da perda |
| `motivo_perda` | TEXT | Motivo da perda |
| `tags` | TEXT[] | Tags do lead |
| `is_mql` | BOOLEAN | Se é MQL |

#### `leads_crm_historico`
Histórico de alterações nos leads para auditoria.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `lead_id` | UUID | FK para leads_crm |
| `kommo_id` | BIGINT | ID do lead no Kommo |
| `campo_alterado` | TEXT | Campo que foi modificado |
| `valor_anterior` | TEXT | Valor antes da alteração |
| `valor_novo` | TEXT | Novo valor |
| `status_anterior` | TEXT | Status anterior |
| `status_novo` | TEXT | Novo status |
| `created_at` | TIMESTAMP | Data da alteração |

---

## 5. Páginas Principais

### 5.1 Visão Geral das Rotas

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/` | `Index.tsx` | Dashboard executivo com visão geral |
| `/sdr` | `PerformanceSDR.tsx` | Métricas individuais dos SDRs |
| `/closer` | `PerformanceCloser.tsx` | Métricas individuais dos Closers |
| `/financeiro` | `Financeiro.tsx` | Funil financeiro e contratos |
| `/squads` | `GuerraSquads.tsx` | Competição entre squads |
| `/trafego` | `TrafegoPago.tsx` | Campanhas Meta Ads |
| `/trafego/ia` | `TrafegoIA.tsx` | Análise IA de tráfego |
| `/ia` | `AssistenteIA.tsx` | Chat com IA contextual |
| `/admin` | `Admin.tsx` | Painel administrativo |

### 5.2 Index (Dashboard Principal)

**Arquivo:** `src/pages/Index.tsx`

**Responsabilidade:** Apresentar visão executiva consolidada de todos os KPIs comerciais.

**Dados exibidos:**
- Meta mensal vs realizado
- Receita total e por squad
- Número de contratos
- Taxa de conversão geral
- Projeção do mês
- Top performers

**Hooks utilizados:**
- `useGoogleSheets` - Dados das planilhas
- `usePeriodFilter` - Filtro de período
- `useRealFinancials` - Dados financeiros reais

### 5.3 PerformanceSDR

**Arquivo:** `src/pages/PerformanceSDR.tsx`

**Responsabilidade:** Exibir métricas detalhadas de cada SDR.

**Métricas por SDR:**
- Calls agendadas
- Calls qualificadas (MQLs)
- Taxa de qualificação
- Taxa de show
- Vendas originadas

**Componentes:**
- `SDRPodium` - Ranking top 3
- `SDRDetailCard` - Card detalhado por SDR
- `SDRComparisonTable` - Comparativo em tabela
- `SDRCharts` - Gráficos de evolução

### 5.4 PerformanceCloser

**Arquivo:** `src/pages/PerformanceCloser.tsx`

**Responsabilidade:** Exibir métricas detalhadas de cada Closer.

**Métricas por Closer:**
- Receita fechada
- Número de contratos
- Ticket médio
- Taxa de conversão
- Taxa de assinatura

**Componentes:**
- `CloserPodium` - Ranking top 3
- `CloserDetailCard` - Card detalhado
- `CloserComparisonTable` - Comparativo
- `CloserCharts` - Gráficos

### 5.5 Financeiro

**Arquivo:** `src/pages/Financeiro.tsx`

**Responsabilidade:** Análise financeira detalhada do funil de vendas.

**Métricas:**
- Receita assinada
- Receita paga
- Gap financeiro
- Taxa de recebimento
- Contratos por status

**Componentes:**
- `FinancialFunnel` - Funil visual
- `ContractsTable` - Tabela de contratos

### 5.6 GuerraSquads

**Arquivo:** `src/pages/GuerraSquads.tsx`

**Responsabilidade:** Gamificação da competição entre squads.

**Features:**
- Placar em tempo real
- Modo TV fullscreen
- Auto-refresh
- Trash talk dinâmico

**Componentes:**
- `SquadsPlacar` - Placar principal
- `SquadsMetaIndividual` - Metas individuais
- `SquadsComparativo` - Comparativo
- `SquadsMembros` - Membros
- `SquadsProjecao` - Projeções

### 5.7 TrafegoPago

**Arquivo:** `src/pages/TrafegoPago.tsx`

**Responsabilidade:** Análise de campanhas de tráfego pago (Meta Ads).

**Métricas:**
- Investimento
- Leads gerados
- CPL (Custo por Lead)
- CAC (Custo de Aquisição)
- ROAS

**Componentes:**
- `TrafegoKPICards` - Cards de KPIs
- `TrafegoFunnel` - Funil de conversão
- `TrafegoCanais` - Performance por canal
- `CampanhasTable` - Tabela de campanhas

### 5.8 AssistenteIA

**Arquivo:** `src/pages/AssistenteIA.tsx`

**Responsabilidade:** Interface de chat com IA contextual.

**Modos de operação:**
- **Chat:** Perguntas e respostas gerais
- **Analysis:** Análise de métricas específicas
- **Simulation:** Simulações "what-if"
- **Report:** Geração de relatórios

---

## 6. Utilitários (Utils)

### 6.1 metricsCalculator.ts

**Localização:** `src/utils/metricsCalculator.ts`

**Responsabilidade:** Motor principal de cálculo de KPIs comerciais.

#### Funções principais:

```typescript
/**
 * Converte strings monetárias brasileiras para números
 * Exemplos:
 *   "R$ 1.234,56" -> 1234.56
 *   "1.000" -> 1000
 *   "500,00" -> 500
 */
export const parseValor = (valor: any): number => {
  if (valor === null || valor === undefined || valor === '') return 0;
  if (typeof valor === 'number') return valor;
  
  const str = String(valor)
    .replace(/[R$\s]/g, '')    // Remove R$ e espaços
    .replace(/\./g, '')         // Remove pontos (separador de milhar)
    .replace(',', '.');         // Converte vírgula para ponto decimal
  
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};

/**
 * Formata números para exibição em Real brasileiro
 */
export const formatarReal = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

/**
 * Calcula todas as métricas do funil comercial
 * @param data - Array de dados brutos da planilha
 * @param dadosMarketing - Dados de leads/MQLs opcionais
 * @param monthKey - Chave do mês para metas
 */
export const calcularMetricas = (
  data: any[],
  dadosMarketing?: { totalLeads: number, totalMQLs: number },
  monthKey?: string
): Metricas => {
  // ... implementação
};
```

#### Interface de retorno:

```typescript
interface Metricas {
  // Metas
  metaMensal: number;
  metaSemanal: number;
  metaDiaria: number;
  
  // Receita
  receitaTotal: number;
  receitaPaga: number;
  receitaAssinada: number;
  receitaSemanal: number;
  receitaDiaria: number;
  
  // Contratos
  totalContratos: number;
  contratosSemana: number;
  contratosHoje: number;
  
  // Calls
  totalCalls: number;
  callsQualificadas: number;
  callsRealizadas: number;
  callsAgendadas: number;
  noShows: number;
  
  // Taxas
  taxaQualificacao: number;
  taxaShow: number;
  taxaConversao: number;
  
  // Ticket
  ticketMedio: number;
  
  // Progresso
  progressoMensal: number;
  progressoSemanal: number;
  progressoDiario: number;
  
  // Squads
  squads: {
    hotDogs: Squad;
    corvoAzul: Squad;
  };
  
  // Funil
  funil: {
    leads: number;
    qualificados: number;
    agendados: number;
    realizados: number;
    propostas: number;
    fechamentos: number;
  };
}
```

### 6.2 closerMetricsCalculator.ts

**Responsabilidade:** Cálculo de métricas específicas de Closers.

```typescript
interface CloserMetrics {
  nome: string;
  squad: string;
  
  // Receita
  receitaTotal: number;
  receitaPaga: number;
  receitaAssinada: number;
  
  // Contratos
  totalContratos: number;
  contratosAssinados: number;
  contratosPagos: number;
  
  // Calls
  callsRecebidas: number;
  callsRealizadas: number;
  
  // Taxas
  taxaConversao: number;
  taxaAssinatura: number;
  taxaPagamento: number;
  
  // Ticket
  ticketMedio: number;
  
  // Dados brutos
  contratos: CloserContract[];
  calls: CallData[];
}

export const calcularMetricasCloser = (
  data: any[],
  dateRange?: DateRange
): CloserData => {
  // ... implementação
};
```

### 6.3 sdrMetricsCalculator.ts

**Responsabilidade:** Cálculo de métricas específicas de SDRs.

```typescript
interface SDRMetrics {
  nome: string;
  squad: string;
  
  // Calls
  callsAgendadas: number;
  callsQualificadas: number;
  callsRealizadas: number;
  noShows: number;
  
  // Taxas
  taxaQualificacao: number;
  taxaShow: number;
  
  // Vendas originadas
  vendasOriginadas: number;
  receitaOriginada: number;
  
  // Dados brutos
  contratos: SDRContract[];
}

export const calcularMetricasSDR = (
  data: any[],
  dateRange?: DateRange
): SDRData => {
  // ... implementação
};
```

### 6.4 metasConfig.ts

**Responsabilidade:** Configuração centralizada de metas por mês.

```typescript
// Thresholds para cores de progresso
export const THRESHOLDS_GLOBAIS = {
  progressoVerde: 100,      // >= 100% = verde
  progressoAmarelo: 80,     // >= 80% = amarelo
  // Abaixo de 80% = vermelho
  
  cores: {
    verde: '#00E5CC',
    amarelo: '#FFB800',
    vermelho: '#FF4757'
  }
};

// Metas comerciais por mês
export const METAS_POR_MES: Record<string, MetasMensais> = {
  'dezembro-2025': {
    metaMensal: 325000,
    metaIndividualCloser: 65000,
    modelo: 'MRR',
    squads: {
      metaPorSquad: 162500,
      totalSquads: 2
    },
    metaTicketMedioCloser: 4200,
    metaTaxaConversao: 28,
    metaTaxaQualificacaoSDR: 50,
    metaTaxaShowSDR: 75,
    numSDRs: 3
  }
};

// Metas de tráfego por mês
export const METAS_TRAFEGO_POR_MES: Record<string, MetasTrafego> = {
  'dezembro-2025': {
    investimentoMensal: 220000,
    metaReceita: 325000,
    ticketMedio: 4000,
    fechamentos: 82,
    callsRealizadas: 410,
    callsAgendadas: 513,
    leads: 1026,
    taxaLeadParaQualificado: 0.50,
    taxaCallAgendadaParaRealizada: 0.80,
    taxaCallParaFechamento: 0.20,
    cplMeta: 214.42,
    cacMeta: 2682.93,
    roasMinimo: 1.48
  }
};
```

### 6.5 importVendas.ts

**Responsabilidade:** Pipeline de importação de vendas de Google Sheets.

```typescript
// Mapeamento de GIDs por mês
const MONTH_GIDS: Record<string, { gid: string; month: number; year: number }> = {
  'outubro-2025': { gid: '...', month: 10, year: 2025 },
  'novembro-2025': { gid: '930588352', month: 11, year: 2025 },
  'dezembro-2025': { gid: '...', month: 12, year: 2025 }
};

// Mapeamento de nomes de closers (planilha -> banco)
const closerMappings: Record<string, string[]> = {
  'Bruno': ['BRUNO'],
  'Cauã': ['CAUA', 'CAUÃ'],
  'Fernandes': ['G. FERNANDES', 'GABRIEL FERNANDES', 'FERNANDES'],
  'Franklin': ['G. FRANKLIN', 'GABRIEL FRANKLIN', 'FRANKLIN'],
  'Marcos': ['MARCOS', 'OUTRO']
};

/**
 * Importa vendas de um mês específico
 */
export const importVendasFromMonth = async (
  monthKey: string,
  onProgress?: (message: string) => void
): Promise<{ total: number }> => {
  // 1. Buscar colaboradores do banco
  // 2. Buscar dados da planilha
  // 3. Filtrar linhas com FECHAMENTO = "SIM" e VALOR > 0
  // 4. Mapear dados para formato do banco
  // 5. Inserir no banco
};
```

---

## 7. Custom Hooks

### 7.1 useGoogleSheets

**Arquivo:** `src/hooks/useGoogleSheets.ts`

**Responsabilidade:** Fetch e parse de dados de Google Sheets públicas.

```typescript
interface UseGoogleSheetsOptions {
  url: string;
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseGoogleSheetsReturn {
  data: any[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useGoogleSheets = (options: UseGoogleSheetsOptions): UseGoogleSheetsReturn => {
  // Implementação com TanStack Query
  // - Auto-refresh a cada 5 minutos
  // - Retry automático em falhas
  // - Parse CSV com PapaParse
};
```

**Características:**
- Cache automático via TanStack Query
- Refresh a cada 5 minutos
- Retry em caso de erro de rede
- Parse robusto de CSV
- Suporte a múltiplos formatos de data

### 7.2 usePeriodFilter

**Arquivo:** `src/contexts/PeriodFilterContext.tsx`

**Responsabilidade:** Gerenciar estado global de filtro de período.

```typescript
interface PeriodFilterContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  monthKey: string;
  periodType: 'day' | 'week' | 'month' | 'custom';
  setPeriodType: (type: string) => void;
}

export const usePeriodFilter = (): PeriodFilterContextType => {
  return useContext(PeriodFilterContext);
};
```

**Características:**
- Persistência no localStorage
- Sincronização entre páginas
- Suporte a diferentes tipos de período
- Geração automática de monthKey

### 7.3 useCloserKPIs

**Arquivo:** `src/hooks/useCloserKPIs.ts`

**Responsabilidade:** Combinar dados de múltiplas fontes para KPIs de Closers.

```typescript
export const useCloserKPIs = () => {
  const { dateRange, monthKey } = usePeriodFilter();
  const { data: sheetsData } = useGoogleSheets({ ... });
  const { data: dashboardData } = useGoogleSheets({ ... });
  
  // Calcular métricas
  const metricas = useMemo(() => {
    const calculadas = calcularMetricasCloser(sheetsData, dateRange);
    return mesclarMetricasComDashboard(calculadas, dashboardData);
  }, [sheetsData, dashboardData, dateRange]);
  
  return metricas;
};
```

### 7.4 useTVMode

**Arquivo:** `src/hooks/useTVMode.ts`

**Responsabilidade:** Gerenciar modo televisão para dashboards.

```typescript
interface UseTVModeReturn {
  isTVMode: boolean;
  toggleTVMode: () => void;
  enterTVMode: () => void;
  exitTVMode: () => void;
}

export const useTVMode = (): UseTVModeReturn => {
  // Fullscreen API
  // Esconder navegação
  // Auto-rotação de abas (opcional)
  // Esconder cursor após inatividade
};
```

---

## 8. Edge Functions

### 8.1 ai-assistant

**Arquivo:** `supabase/functions/ai-assistant/index.ts`

**Responsabilidade:** Assistente de IA contextual para análises comerciais.

**Endpoint:** `POST /ai-assistant`

**Modos de operação:**

| Modo | Descrição |
|------|-----------|
| `chat` | Conversação geral com contexto comercial |
| `analysis` | Análise detalhada de métricas específicas |
| `simulation` | Simulações "what-if" com projeções |
| `report` | Geração de relatórios formatados |

**Payload:**

```typescript
interface RequestBody {
  mode: 'chat' | 'analysis' | 'simulation' | 'report';
  message: string;
  context?: {
    metricas?: Metricas;
    periodo?: string;
    monthKey?: string;
  };
  history?: Message[];
}
```

**Características:**
- Usa Lovable AI Gateway (sem API key do usuário)
- Contexto temporal (conhece metas do mês)
- Histórico de conversa
- Formatação Markdown nas respostas

### 8.2 fetch-meta-campaigns

**Arquivo:** `supabase/functions/fetch-meta-campaigns/index.ts`

**Responsabilidade:** Integração com Meta Ads API.

**Endpoint:** `POST /fetch-meta-campaigns`

**Payload:**

```typescript
interface RequestBody {
  startDate: string;  // YYYY-MM-DD
  endDate: string;    // YYYY-MM-DD
}
```

**Resposta:**

```typescript
interface Response {
  campanhas: Campanha[];
  totais: {
    investimento: number;
    leads: number;
    impressoes: number;
    cliques: number;
    cpl: number;
  };
  canais: {
    [canal: string]: {
      investimento: number;
      leads: number;
      cpl: number;
    };
  };
}
```

**Secrets necessários:**
- `META_ACCESS_TOKEN`
- `META_AD_ACCOUNT_ID`

### 8.3 kommo-webhook

**Arquivo:** `supabase/functions/kommo-webhook/index.ts`

**Responsabilidade:** Receber webhooks do Kommo CRM.

**Endpoint:** `POST /kommo-webhook`

**Eventos processados:**
- `leads[add]` - Novo lead criado
- `leads[update]` - Lead atualizado
- `leads[status]` - Mudança de status
- `leads[delete]` - Lead removido

**Mapeamento de status:**

```typescript
const statusMapping: Record<number, string> = {
  // Pipeline Principal
  12345: 'NOVO',
  12346: 'MQL',
  12347: 'REUNIAO_AGENDADA',
  12348: 'COM_CLOSER',
  12349: 'PROPOSTA',
  12350: 'GANHO',
  12351: 'PERDIDO'
};
```

**Secrets necessários:**
- `KOMMO_ACCESS_TOKEN`
- `SUPABASE_SERVICE_ROLE_KEY`

### 8.4 ai-trafego-analyst

**Arquivo:** `supabase/functions/ai-trafego-analyst/index.ts`

**Responsabilidade:** Análise de IA para campanhas de tráfego.

**Endpoint:** `POST /ai-trafego-analyst`

**Payload:**

```typescript
interface RequestBody {
  campanhas: CampanhaData[];
  totais: TrafegoTotais;
  canais: Record<string, CanalMetrics>;
  taxasConversao: TaxasConversao;
}
```

**Resposta:**

```typescript
interface Response {
  success: boolean;
  analysis: {
    resumo: string;
    projecoes: {
      leads: number;
      investimento: number;
      cpl: number;
    };
    alertas: string[];
    recomendacoes: string[];
    campanhasDestaque: {
      melhores: string[];
      atencao: string[];
    };
  };
  timestamp: string;
}
```

---

## 9. Componentes

### 9.1 Estrutura de Componentes

Os componentes seguem uma organização por domínio de negócio:

```
components/
├── admin/         # CRUD e gestão
├── closer/        # Métricas de closers
├── sdr/           # Métricas de SDRs
├── squads/        # Guerra dos squads
├── trafego/       # Tráfego pago
├── financial/     # Financeiro
├── ia/            # Assistente IA
└── ui/            # Componentes base (shadcn)
```

### 9.2 Padrões de Componentes

#### Card de Métricas

```tsx
interface MetricCardProps {
  titulo: string;
  valor: number | string;
  meta?: number;
  progresso?: number;
  tendencia?: 'up' | 'down' | 'stable';
  icon?: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({
  titulo,
  valor,
  meta,
  progresso,
  tendencia,
  icon
}) => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">{titulo}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold">{valor}</div>
      {meta && (
        <Progress value={progresso} className="mt-2" />
      )}
    </Card>
  );
};
```

#### Tabela Comparativa

```tsx
interface ComparisonTableProps<T> {
  data: T[];
  columns: Column<T>[];
  sortable?: boolean;
  onRowClick?: (item: T) => void;
}

const ComparisonTable = <T extends object>({
  data,
  columns,
  sortable,
  onRowClick
}: ComparisonTableProps<T>) => {
  // Implementação com shadcn Table
};
```

### 9.3 Componentes Reutilizáveis

#### Navigation

```tsx
// src/components/Navigation.tsx
// Navegação principal com links para todas as páginas
// Responsivo com collapse em mobile
```

#### PeriodFilter

```tsx
// src/components/sdr/PeriodFilter.tsx
// Filtro de período (dia, semana, mês, custom)
// Integrado com PeriodFilterContext
```

#### ColaboradorAvatar

```tsx
// src/components/ColaboradorAvatar.tsx
// Avatar com foto do colaborador
// Fallback para iniciais se não houver foto
```

---

## 10. Padrões de Código

### 10.1 Parsing de Valores Monetários

O sistema precisa lidar com diferentes formatos de valores vindos das planilhas:

```typescript
// Exemplos de entrada:
// "R$ 1.234,56"
// "1.234,56"
// "1234.56"
// "1234"
// 1234

export const parseValor = (valor: any): number => {
  if (valor === null || valor === undefined || valor === '') return 0;
  if (typeof valor === 'number') return valor;
  
  const str = String(valor)
    .replace(/[R$\s]/g, '')    // Remove "R$" e espaços
    .replace(/\./g, '')         // Remove pontos (milhar brasileiro)
    .replace(',', '.');         // Vírgula -> ponto decimal
  
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};
```

### 10.2 Fallback de Colunas

As planilhas podem ter diferentes nomes de colunas. Usamos fallback:

```typescript
const getColumnValue = (row: any, ...columns: string[]): string => {
  for (const col of columns) {
    const value = row[col];
    if (value !== undefined && value !== null && value !== '') {
      return String(value).trim();
    }
  }
  return '';
};

// Uso:
const closerName = getColumnValue(row, 
  'CLOSER FECHOU', 
  'CLOSER', 
  'Closer',
  'closer'
);
```

### 10.3 Mapeamento de Closers

Diferentes fontes usam diferentes nomes para o mesmo closer:

```typescript
const closerMappings: Record<string, string[]> = {
  'Bruno': ['BRUNO', 'Bruno', 'B. SILVA'],
  'Cauã': ['CAUA', 'CAUÃ', 'Cauã', 'CAUA SANTOS'],
  'Fernandes': ['G. FERNANDES', 'GABRIEL FERNANDES', 'FERNANDES', 'Fernandes'],
  'Franklin': ['G. FRANKLIN', 'GABRIEL FRANKLIN', 'FRANKLIN', 'Franklin'],
  'Marcos': ['MARCOS', 'Marcos', 'OUTRO']
};

const normalizeCloserName = (name: string): string | null => {
  const normalized = name.toUpperCase().trim();
  
  for (const [dbName, aliases] of Object.entries(closerMappings)) {
    if (aliases.some(alias => normalized.includes(alias.toUpperCase()))) {
      return dbName;
    }
  }
  
  return null; // Closer não encontrado
};
```

### 10.4 Filtro de Data

```typescript
export const filterDataByDateRange = (
  data: any[],
  dateRange: DateRange,
  dateColumn: string = 'DATA DE ENTRADA'
): any[] => {
  return data.filter(row => {
    const dateStr = row[dateColumn];
    if (!dateStr) return false;
    
    const date = parseDate(dateStr);
    if (!date) return false;
    
    return isWithinInterval(date, {
      start: dateRange.from,
      end: dateRange.to
    });
  });
};

const parseDate = (dateStr: string): Date | null => {
  // Tenta múltiplos formatos
  const formats = [
    'dd/MM/yyyy',
    'yyyy-MM-dd',
    'd/M/yyyy',
    'dd-MM-yyyy'
  ];
  
  for (const format of formats) {
    const parsed = parse(dateStr, format, new Date());
    if (isValid(parsed)) return parsed;
  }
  
  return null;
};
```

### 10.5 Cores de Progresso

```typescript
export const getProgressColor = (
  progresso: number,
  thresholds = THRESHOLDS_GLOBAIS
): string => {
  if (progresso >= thresholds.progressoVerde) {
    return thresholds.cores.verde;
  }
  if (progresso >= thresholds.progressoAmarelo) {
    return thresholds.cores.amarelo;
  }
  return thresholds.cores.vermelho;
};

// Para classes Tailwind:
export const getProgressColorClass = (progresso: number): string => {
  if (progresso >= 100) return 'text-green-500 bg-green-500/20';
  if (progresso >= 80) return 'text-yellow-500 bg-yellow-500/20';
  return 'text-red-500 bg-red-500/20';
};
```

---

## 11. Configuração de Metas

### 11.1 Estrutura de Metas Mensais

```typescript
// src/utils/metasConfig.ts

interface MetasMensais {
  // Meta principal
  metaMensal: number;              // Meta total do mês (R$)
  metaIndividualCloser: number;    // Meta por closer (R$)
  modelo: 'TCV' | 'MRR';           // Tipo de modelo
  
  // Squads
  squads: {
    metaPorSquad: number;          // Meta por squad
    totalSquads: number;           // Número de squads (2)
  };
  
  // Metas de performance Closer
  metaTicketMedioCloser: number;   // R$ 4.200
  metaTaxaConversao: number;       // 28%
  metaTaxaAssinatura: number;      // 100%
  metaTaxaPagamento: number;       // 100%
  
  // Metas de performance SDR
  metaTaxaQualificacaoSDR: number; // 50%
  metaTaxaShowSDR: number;         // 75%
  numSDRs: number;                 // Número de SDRs
  
  // Metas financeiras
  metaTaxaRecebimentoMinimo: number; // 90%
}
```

### 11.2 Como Adicionar Novo Mês

1. Edite `src/utils/metasConfig.ts`
2. Adicione entrada em `METAS_POR_MES`:

```typescript
export const METAS_POR_MES: Record<string, MetasMensais> = {
  // ... meses existentes
  
  'janeiro-2026': {
    metaMensal: 400000,
    metaIndividualCloser: 80000,
    modelo: 'MRR',
    squads: {
      metaPorSquad: 200000,
      totalSquads: 2
    },
    metaTicketMedioCloser: 4500,
    metaTaxaConversao: 30,
    metaTaxaAssinatura: 100,
    metaTaxaPagamento: 100,
    metaTaxaRecebimentoMinimo: 90,
    metaTaxaQualificacaoSDR: 55,
    metaTaxaShowSDR: 80,
    numSDRs: 4
  }
};
```

3. Adicione entrada em `METAS_TRAFEGO_POR_MES` se necessário

---

## 12. Segurança

### 12.1 Row Level Security (RLS)

Todas as tabelas têm RLS habilitado. Políticas atuais (acesso público):

```sql
-- Exemplo para tabela 'vendas'
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read vendas" 
ON vendas FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert vendas" 
ON vendas FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update vendas" 
ON vendas FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete vendas" 
ON vendas FOR DELETE 
USING (true);
```

> **Nota:** O sistema atual não implementa autenticação de usuários. As políticas são públicas para uso interno da equipe. Para produção com usuários externos, implementar auth.

### 12.2 Secrets Necessários

| Secret | Descrição | Onde usar |
|--------|-----------|-----------|
| `LOVABLE_API_KEY` | Gateway de IA Lovable | ai-assistant, ai-trafego-analyst |
| `META_ACCESS_TOKEN` | Token da API Meta Ads | fetch-meta-campaigns |
| `META_AD_ACCOUNT_ID` | ID da conta de anúncios | fetch-meta-campaigns |
| `KOMMO_ACCESS_TOKEN` | Token da API Kommo | kommo-webhook |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave admin Supabase | kommo-webhook |

### 12.3 Variáveis de Ambiente

O arquivo `.env` é gerenciado automaticamente pelo Lovable Cloud:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_SUPABASE_PROJECT_ID=xxx
```

> **Importante:** Nunca editar `.env` manualmente. É regenerado automaticamente.

---

## 13. Guias de Manutenção

### 13.1 Adicionar Novo Colaborador

**Via Admin (recomendado):**
1. Acesse `/admin`
2. Clique na aba "Colaboradores"
3. Clique em "Novo Colaborador"
4. Preencha nome, tipo (SDR/Closer) e squad
5. Salve

**Via código (se necessário atualizar mapeamentos):**
1. Adicione foto em `src/assets/colaboradores/nome.png`
2. Atualize `src/utils/colaboradorPhotos.ts`
3. Atualize mapeamentos em `src/utils/importVendas.ts` se houver variações de nome

### 13.2 Importar Vendas de Planilha

1. Obtenha o GID da aba da planilha
2. Edite `src/utils/importVendas.ts`:

```typescript
const MONTH_GIDS = {
  // ... existentes
  'janeiro-2026': { gid: 'NOVO_GID', month: 1, year: 2026 }
};
```

3. Execute a importação via Admin ou:

```typescript
import { importVendasFromMonth } from '@/utils/importVendas';

await importVendasFromMonth('janeiro-2026', console.log);
```

### 13.3 Modificar Metas

**Via Admin:**
1. Acesse `/admin`
2. Clique na aba "Metas Mensais"
3. Selecione o mês
4. Edite os valores
5. Salve

**Via código:**
1. Edite `src/utils/metasConfig.ts`
2. Modifique os valores em `METAS_POR_MES[mes]`

### 13.4 Adicionar Nova Página

1. Crie o componente em `src/pages/NovaPagina.tsx`
2. Adicione a rota em `src/App.tsx`:

```tsx
import NovaPagina from './pages/NovaPagina';

// No Routes:
<Route path="/nova" element={<NovaPagina />} />
```

3. Adicione link na navegação em `src/components/Navigation.tsx`

### 13.5 Criar Nova Edge Function

1. Crie diretório em `supabase/functions/nome-funcao/`
2. Crie `index.ts`:

```typescript
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { param } = await req.json();
    
    // Lógica aqui
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

3. A função será deployada automaticamente

---

## 14. Decisões Arquiteturais

### 14.1 Por que Google Sheets como fonte de dados?

| Prós | Contras |
|------|---------|
| Planilhas já existiam | Dependência de formato |
| Equipe já usa | Latência de rede |
| Sem migração inicial | Limite de requisições |
| Fácil edição | Parse de CSV |

**Mitigação dos contras:**
- Cache com TanStack Query
- Parse robusto com PapaParse
- Fallback de colunas

### 14.2 Por que Edge Functions para APIs externas?

| Razão | Benefício |
|-------|-----------|
| Secrets seguros | API keys não expostas no client |
| CORS controlado | Sem problemas de cross-origin |
| Rate limiting | Controle de requisições |
| Logs centralizados | Debug facilitado |

### 14.3 Por que TanStack Query?

| Feature | Uso |
|---------|-----|
| Cache automático | Reduz requisições |
| Stale-while-revalidate | UX fluida |
| Retry automático | Resiliência |
| DevTools | Debug facilitado |

### 14.4 Por que Context API para filtros?

| Razão | Alternativa considerada |
|-------|------------------------|
| Estado global simples | Redux (overkill) |
| Poucos consumidores | Zustand (desnecessário) |
| Sincronização entre páginas | Props drilling (confuso) |

### 14.5 Por que calculadores em utils/?

| Razão | Benefício |
|-------|-----------|
| Separação de concerns | Componentes limpos |
| Testabilidade | Unit tests isolados |
| Reutilização | Mesmo cálculo em vários lugares |
| Manutenção | Lógica centralizada |

---

## 📝 Changelog

| Data | Versão | Descrição |
|------|--------|-----------|
| 2025-01 | 1.0.0 | Documentação inicial |

---

## 🤝 Contribuição

Para contribuir com o projeto:

1. Entenda a estrutura de diretórios
2. Siga os padrões de código estabelecidos
3. Teste localmente antes de commitar
4. Documente novas funcionalidades

---

**Desenvolvido com ❤️ pela equipe Blue Ocean**
