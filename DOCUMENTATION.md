# 📊 Dashblue - Documentação Técnica Completa

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
13. [Integrações Externas](#13-integrações-externas)
14. [Configuração e Deploy](#14-configuração-e-deploy)
15. [Guias de Manutenção](#15-guias-de-manutenção)
16. [Decisões Arquiteturais](#16-decisões-arquiteturais)

---

## 1. Visão Geral

### 1.1 Descrição do Projeto

O **Dashblue** é um sistema completo de gestão comercial desenvolvido para acompanhar métricas de vendas, performance de equipe e campanhas de marketing. O sistema integra dados de múltiplas fontes (Google Sheets, Meta Ads, Kommo CRM) em uma interface unificada com visualizações em tempo real.

### 1.2 Stack Tecnológica

| Tecnologia | Versão | Justificativa |
|------------|--------|---------------|
| **React** | 18.3.1 | Componentes reutilizáveis, hooks, ecossistema maduro |
| **TypeScript** | 5.8.3 | Tipagem estática, prevenção de erros em tempo de compilação |
| **Vite** | 5.4.19 | Build extremamente rápido, HMR instantâneo |
| **Tailwind CSS** | 3.4.17 | Utility-first, design system consistente, dark mode nativo |
| **shadcn/ui** | - | Componentes acessíveis, altamente customizáveis |
| **React Router DOM** | 6.30.1 | Roteamento SPA com suporte a lazy loading |
| **TanStack Query** | 5.83.0 | Cache inteligente, revalidação automática, estados de loading |
| **Supabase** | 2.79.0 | Backend serverless, PostgreSQL, Edge Functions |
| **Recharts** | 2.15.4 | Gráficos responsivos e customizáveis |
| **PapaParse** | 5.4.1 | Parse robusto de CSV |
| **date-fns** | 3.6.0 | Manipulação de datas com imutabilidade |
| **Zod** | 3.25.76 | Validação de schemas |
| **React Hook Form** | 7.61.1 | Gerenciamento de formulários |

### 1.3 Funcionalidades Principais

- 📈 **Dashboard Executivo**: Visão geral de KPIs comerciais
- 👥 **Performance SDR**: Métricas individuais de pré-vendas
- 🎯 **Performance Closer**: Métricas individuais de fechamento
- 💰 **Financeiro**: Funil financeiro e contratos
- ⚔️ **Guerra dos Squads**: Competição gamificada entre equipes
- 📣 **Tráfego Pago**: Análise de campanhas Meta Ads
- 🤖 **Assistente IA**: Chat contextual com análises inteligentes
- ⚙️ **Admin**: Gestão de colaboradores, metas e vendas

### 1.4 Requisitos do Sistema

- **Node.js**: 18+ (recomendado via nvm)
- **Bun** ou **npm**: Para gerenciamento de pacotes
- **Navegador**: Chrome, Firefox, Safari, Edge (versões recentes)

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
│  Google Sheets  │      │   Supabase      │      │   APIs Externas │
│   (Planilhas)   │      │   (PostgreSQL)  │      │                 │
│                 │      │                 │      │  ┌───────────┐  │
│  • Vendas       │      │  ┌───────────┐  │      │  │ Meta Ads  │  │
│  • Calls        │      │  │PostgreSQL │  │      │  │   API     │  │
│  • Leads        │      │  └─────┬─────┘  │      │  └───────────┘  │
│                 │      │        │        │      │                 │
└─────────────────┘      │  ┌─────┴─────┐  │      │  ┌───────────┐  │
                         │  │   Edge   │  │      │  │  Kommo    │  │
                         │  │ Functions │  │      │  │   CRM     │  │
                         │  └──────────┘  │      │  └───────────┘  │
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

### 2.3 Padrão de Arquitetura

O projeto segue uma arquitetura **baseada em domínios**:

- **Pages**: Componentes de rota que orquestram a lógica
- **Components**: Organizados por domínio (admin, closer, sdr, etc.)
- **Hooks**: Lógica de negócio reutilizável
- **Utils**: Funções puras de cálculo e transformação
- **Contexts**: Estado global compartilhado

---

## 3. Estrutura de Diretórios

```
dashblue/
├── 📁 src/
│   ├── 📁 pages/                    # Páginas/Rotas da aplicação
│   │   ├── Index.tsx                # Dashboard principal (/)
│   │   ├── PerformanceSDR.tsx       # Métricas SDR (/sdr)
│   │   ├── PerformanceCloser.tsx   # Métricas Closer (/closer)
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
│   │   │   └── ContractsTable.tsx  # Tabela de contratos
│   │   │
│   │   ├── 📁 ia/                   # Componentes IA
│   │   │   └── simulator/
│   │   │       └── SimulatorSlider.tsx
│   │   │
│   │   ├── 📁 ui/                   # Componentes shadcn/ui (40+ componentes)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── input.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── chart.tsx
│   │   │   └── ... (outros componentes)
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
│   │   ├── useRealFinancials.ts    # Dados financeiros
│   │   ├── useComparativoMensal.ts  # Comparativo entre meses
│   │   ├── useTrafegoAIAnalysis.ts # Análise IA tráfego
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
│   │   ├── colaboradorPhotos.ts    # Mapeamento de fotos
│   │   ├── sheetUrlManager.ts       # Gestão URLs planilhas
│   │   └── leadsSheetUrlManager.ts
│   │
│   ├── 📁 contexts/                 # Context API
│   │   └── PeriodFilterContext.tsx  # Contexto de filtro de período
│   │
│   ├── 📁 integrations/             # Integrações externas
│   │   └── 📁 supabase/
│   │       ├── client.ts            # Cliente Supabase
│   │       ├── types.ts             # Tipos do banco
│   │       └── types.generated.ts   # Tipos auto-gerados
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
│   │       └── index.ts              # Webhook Kommo CRM
│   │
│   ├── 📁 migrations/              # Migrações SQL
│   │   ├── 20251223205707_*.sql     # Migração leads_crm
│   │   └── 20251229200120_*.sql     # Migração colaboradores/vendas
│   │
│   └── config.toml                  # Configuração Supabase
│
├── 📄 package.json                  # Dependências
├── 📄 tailwind.config.ts            # Configuração Tailwind
├── 📄 vite.config.ts               # Configuração Vite
├── 📄 tsconfig.json                 # Configuração TypeScript
├── 📄 tsconfig.app.json             # TS config para app
├── 📄 tsconfig.node.json            # TS config para node
├── 📄 eslint.config.js              # Configuração ESLint
├── 📄 postcss.config.js             # Configuração PostCSS
├── 📄 components.json               # Config shadcn/ui
├── 📄 .env                          # Variáveis de ambiente
├── 📄 .gitignore                    # Arquivos ignorados
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
│  │ kommo_id      │         │ lead_id (FK)        │                   │
│  │ nome          │         │ kommo_id            │                   │
│  │ email         │         │ campo_alterado     │                   │
│  │ telefone      │         │ valor_anterior      │                   │
│  │ empresa       │         │ valor_novo          │                   │
│  │ status        │         │ status_anterior     │                   │
│  │ sdr_nome      │         │ status_novo         │                   │
│  │ closer_nome   │         │ created_at          │                   │
│  │ valor_contrato│         └─────────────────────┘                   │
│  │ data_entrada  │                                                    │
│  │ data_mql      │                                                    │
│  │ data_reuniao  │                                                    │
│  │ data_ganho    │                                                    │
│  │ data_perdido  │                                                    │
│  │ motivo_perda  │                                                    │
│  │ tags[]        │                                                    │
│  │ kommo_payload │                                                    │
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
| `tipo` | TEXT | "sdr" ou "closer" (CHECK constraint) |
| `squad` | TEXT | Squad do colaborador (opcional) |
| `ativo` | BOOLEAN | Se está ativo na equipe (default: true) |
| `created_at` | TIMESTAMPTZ | Data de criação |

**Índices**: Nenhum (tabela pequena)

#### `vendas`
Registra todas as vendas/contratos fechados.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `colaborador_id` | UUID | FK para colaboradores (opcional) |
| `colaborador_nome` | TEXT | Nome do closer que fechou |
| `valor` | NUMERIC | Valor do contrato |
| `origem` | TEXT | "inbound", "outbound", "indicacao" (CHECK) |
| `data_fechamento` | DATE | Data do fechamento (default: CURRENT_DATE) |
| `lead_nome` | TEXT | Nome do lead/empresa |
| `observacao` | TEXT | Observações adicionais |
| `created_at` | TIMESTAMPTZ | Data de criação |

**Índices**: Nenhum

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
| `status` | TEXT | "agendado", "realizado", "no_show", "cancelado" (CHECK) |
| `qualificado` | BOOLEAN | Se o lead é qualificado (MQL) (default: false) |
| `origem` | TEXT | Canal de origem (CHECK: inbound/outbound/indicacao) |
| `observacao` | TEXT | Observações |
| `created_at` | TIMESTAMPTZ | Data de criação |

**Índices**: Nenhum

#### `metas_mensais`
Define as metas comerciais por mês.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `mes` | TEXT | Mês no formato "janeiro-2025" (UNIQUE) |
| `meta_mensal` | NUMERIC | Meta total do mês |
| `meta_individual_closer` | NUMERIC | Meta por closer |
| `meta_ticket_medio` | NUMERIC | Meta de ticket médio |
| `meta_taxa_conversao` | NUMERIC | Meta de conversão (%) |
| `meta_taxa_qualificacao_sdr` | NUMERIC | Meta qualificação SDR (%) |
| `meta_taxa_show_sdr` | NUMERIC | Meta de show rate (%) |
| `created_at` | TIMESTAMPTZ | Data de criação |
| `updated_at` | TIMESTAMPTZ | Data de atualização |

**Índices**: Nenhum

#### `leads_crm`
Leads sincronizados do Kommo CRM.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador interno |
| `kommo_id` | BIGINT | ID no Kommo CRM (UNIQUE) |
| `nome` | TEXT | Nome do lead |
| `email` | TEXT | Email de contato |
| `telefone` | TEXT | Telefone |
| `empresa` | TEXT | Nome da empresa |
| `status` | TEXT | Stage atual no funil (default: 'NOVO') |
| `pipeline_nome` | TEXT | Nome da pipeline no Kommo |
| `stage_nome` | TEXT | Nome do estágio |
| `sdr_nome` | TEXT | SDR responsável |
| `closer_nome` | TEXT | Closer atribuído |
| `responsavel_id` | BIGINT | ID do responsável no Kommo |
| `responsavel_nome` | TEXT | Nome do responsável |
| `is_mql` | BOOLEAN | Se é MQL (default: false) |
| `tags` | TEXT[] | Tags do lead |
| `valor_contrato` | DECIMAL(12,2) | Valor do contrato |
| `motivo_perda` | TEXT | Motivo da perda |
| `data_entrada` | TIMESTAMPTZ | Data de entrada no funil (default: NOW()) |
| `data_mql` | TIMESTAMPTZ | Data de qualificação MQL |
| `data_reuniao` | TIMESTAMPTZ | Data da reunião |
| `data_closer` | TIMESTAMPTZ | Data de atribuição ao closer |
| `data_ganho` | TIMESTAMPTZ | Data do fechamento |
| `data_perdido` | TIMESTAMPTZ | Data da perda |
| `updated_at` | TIMESTAMPTZ | Data de atualização (auto-update via trigger) |
| `created_at` | TIMESTAMPTZ | Data de criação |
| `kommo_payload` | JSONB | Payload completo do Kommo para auditoria |

**Índices**:
- `idx_leads_crm_kommo_id` (kommo_id)
- `idx_leads_crm_status` (status)
- `idx_leads_crm_sdr_nome` (sdr_nome)
- `idx_leads_crm_closer_nome` (closer_nome)
- `idx_leads_crm_is_mql` (is_mql)
- `idx_leads_crm_data_entrada` (data_entrada)

**Triggers**:
- `trigger_update_leads_crm_updated_at`: Atualiza `updated_at` automaticamente

#### `leads_crm_historico`
Histórico de alterações nos leads para auditoria.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `lead_id` | UUID | FK para leads_crm (ON DELETE CASCADE) |
| `kommo_id` | BIGINT | ID do lead no Kommo |
| `status_anterior` | TEXT | Status anterior |
| `status_novo` | TEXT | Novo status |
| `campo_alterado` | TEXT | Campo que foi modificado |
| `valor_anterior` | TEXT | Valor antes da alteração |
| `valor_novo` | TEXT | Novo valor |
| `created_at` | TIMESTAMPTZ | Data da alteração |

**Índices**:
- `idx_leads_crm_historico_lead_id` (lead_id)
- `idx_leads_crm_historico_kommo_id` (kommo_id)

### 4.3 Relacionamentos

- `vendas.colaborador_id` → `colaboradores.id` (FK opcional)
- `agendamentos.sdr_id` → `colaboradores.id` (FK opcional)
- `agendamentos.closer_id` → `colaboradores.id` (FK opcional)
- `leads_crm_historico.lead_id` → `leads_crm.id` (FK com CASCADE)

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
| `*` | `NotFound.tsx` | Página 404 |

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

**Características:**
- Contexto temporal (conhece data atual, dias úteis restantes)
- Histórico de conversa
- Análise de sazonalidade
- Consideração de feriados

### 5.9 Admin

**Arquivo:** `src/pages/Admin.tsx`

**Responsabilidade:** Painel administrativo para gestão do sistema.

**Funcionalidades:**
- **Colaboradores:** CRUD completo
- **Metas Mensais:** Configuração de metas por mês
- **Vendas:** Importação e gestão de vendas
- **Agendamentos:** Gestão de calls

**Componentes:**
- `AdminResumoPanel` - Resumo geral
- `ColaboradoresTab` - CRUD colaboradores
- `MetasTab` - Configuração de metas
- `VendasTab` - Gestão de vendas
- `AgendamentosTab` - Gestão de agendamentos

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
export const parseValor = (valor: any): number

/**
 * Formata números para exibição em Real brasileiro
 */
export const formatarReal = (valor: number): string

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
): Metricas
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
```

### 6.4 metasConfig.ts

**Responsabilidade:** Configuração centralizada de metas por mês.

**Estrutura:**

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
): Promise<{ total: number }>
```

---

## 7. Custom Hooks

### 7.1 useGoogleSheets

**Arquivo:** `src/hooks/useGoogleSheets.ts`

**Responsabilidade:** Fetch e parse de dados de Google Sheets públicas.

```typescript
interface UseGoogleSheetsReturn {
  data: any[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refetch: () => void;
  isRefetching: boolean;
}

export const useGoogleSheets = (
  dateRange?: DateRange, 
  monthKey?: string
): UseGoogleSheetsReturn
```

**Características:**
- Auto-refresh a cada 10 segundos
- Retry automático (até 3 tentativas com delay exponencial)
- Parse robusto de CSV com PapaParse
- Suporte a múltiplos formatos de data
- Cache via estado local

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

export const usePeriodFilter = (): PeriodFilterContextType
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

export const useTVMode = (): UseTVModeReturn
```

**Características:**
- Fullscreen API
- Esconder navegação
- Auto-rotação de abas (opcional)
- Esconder cursor após inatividade

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
  type: 'chat' | 'analysis' | 'simulation' | 'report';
  metrics?: Metricas;
  history?: Message[];
  question?: string;
  changes?: {
    taxaShow: number;
    taxaConversao: number;
    ticketMedio: number;
  };
}
```

**Características:**
- Usa Lovable AI Gateway (sem API key do usuário)
- Contexto temporal completo (data atual, dias úteis, sazonalidade)
- Histórico de conversa (até 50 mensagens)
- Formatação Markdown nas respostas
- Análise de feriados brasileiros
- Consideração de sazonalidade B2B

**Secrets necessários:**
- `LOVABLE_API_KEY`

### 8.2 fetch-meta-campaigns

**Arquivo:** `supabase/functions/fetch-meta-campaigns/index.ts`

**Responsabilidade:** Integração com Meta Ads API.

**Endpoint:** `POST /fetch-meta-campaigns`

**Payload:**

```typescript
interface RequestBody {
  startDate?: string;  // YYYY-MM-DD (opcional, usa mês atual se não fornecido)
  endDate?: string;    // YYYY-MM-DD (opcional)
}
```

**Resposta:**

```typescript
interface Response {
  success: boolean;
  campanhas: CampanhaData[];
  meta: {
    totalCampaigns: number;
    campaignsWithData: number;
    totalLeads: number;
    totalInvestimento: number;
    timeRange: { since: string; until: string };
    fetchedAt: string;
  };
}
```

**Características:**
- Paginação automática (até 10 páginas, 500 itens por página)
- Identificação automática de tipo de campanha (WhatsApp, Formulário, LP, VSL)
- Mapeamento correto de action_types por tipo de campanha
- Fallback para mês atual se datas não fornecidas

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

**Mapeamento de pipelines:**

```typescript
const PIPELINE_MAPPING = {
  'DISTRIBUIÇÃO DE LEADS': { tipo: 'distribuicao' },
  'SDR - Davi': { tipo: 'sdr', sdr_nome: 'Davi' },
  'SDR - ANDREY': { tipo: 'sdr', sdr_nome: 'Andrey' },
  'SDR - Vinicius': { tipo: 'sdr', sdr_nome: 'Vinicius' },
  'Closer - Bruno': { tipo: 'closer', closer_nome: 'Bruno' },
  // ... outros
};
```

**Mapeamento de estágios:**

```typescript
const STAGE_MAPPING: Record<string, string> = {
  'Leads Novos': 'NOVO',
  'Em qualificação': 'QUALIFICACAO',
  'Reunião Agendada': 'REUNIAO_AGENDADA',
  'Venda Ganha': 'GANHO',
  'Venda Perdida': 'PERDIDO',
  // ... outros
};
```

**Características:**
- Parse de payload form-urlencoded ou JSON
- Busca informações adicionais via API Kommo quando necessário
- Registro automático de histórico de mudanças
- Detecção automática de MQL (via tags)
- Atualização de timestamps baseado em status

**Secrets necessários:**
- `KOMMO_ACCESS_TOKEN`
- `SUPABASE_URL`
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
  canais: CanalMetrics[];
  diasNoMes: number;
  diasDecorridos: number;
  dataAtual: string;
  taxasConversao: TaxasConversao;
}
```

**Resposta:**

```typescript
interface Response {
  success: boolean;
  analysis: {
    executiveSummary: string;
    projecoes: {
      investimentoProjetado: number;
      leadsProjetados: number;
      fechamentosProjetados: number;
      roasProjetado: number;
      cacProjetado: number;
      receitaProjetada: number;
      conclusao: string;
    };
    alertas: {
      urgentes: Array<{ campanha: string; problema: string; acao: string; impacto: string }>;
      atencao: Array<{ campanha: string; problema: string; acao: string; potencial: string }>;
      oportunidades: Array<{ campanha: string; oportunidade: string; acao: string; ganhoEstimado: string }>;
    };
    recomendacoes: Array<{ prioridade: number; titulo: string; descricao: string; ganhoEstimado: string }>;
  };
  timestamp: string;
}
```

**Características:**
- Validação de projeções (nunca menor que valores atuais)
- Cálculos baseados em fórmulas matemáticas
- Análise de campanhas com ROAS < 1.0 (urgentes)
- Identificação de oportunidades de escalar (ROAS > 3.0)
- Recomendações priorizadas

**Secrets necessários:**
- `LOVABLE_API_KEY`

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
```

#### Tabela Comparativa

```tsx
interface ComparisonTableProps<T> {
  data: T[];
  columns: Column<T>[];
  sortable?: boolean;
  onRowClick?: (item: T) => void;
}
```

### 9.3 Componentes Reutilizáveis

#### Navigation
- Navegação principal com links para todas as páginas
- Responsivo com collapse em mobile
- Indicador de página ativa

#### PeriodFilter
- Filtro de período (dia, semana, mês, custom)
- Integrado com PeriodFilterContext
- Persistência no localStorage

#### ColaboradorAvatar
- Avatar com foto do colaborador
- Fallback para iniciais se não houver foto
- Suporte a diferentes tamanhos

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
| `SUPABASE_URL` | URL do projeto Supabase | kommo-webhook |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave admin Supabase | kommo-webhook |

### 12.3 Variáveis de Ambiente

O arquivo `.env` é gerenciado automaticamente pelo Lovable Cloud:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_SUPABASE_PROJECT_ID=xxx
```

> **Importante:** Nunca editar `.env` manualmente. É regenerado automaticamente.

### 12.4 CORS

Todas as Edge Functions têm CORS habilitado:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

> **Nota:** Para produção, considerar restringir `Access-Control-Allow-Origin` a domínios específicos.

---

## 13. Integrações Externas

### 13.1 Google Sheets

**Uso:** Fonte principal de dados de vendas e calls.

**Formato:** CSV exportado de planilhas públicas.

**Características:**
- URLs dinâmicas por mês/período
- Auto-refresh a cada 10 segundos
- Parse robusto com PapaParse
- Suporte a múltiplos formatos de coluna

**Gerenciamento de URLs:**
- `sheetUrlManager.ts` - URLs de planilhas de vendas
- `leadsSheetUrlManager.ts` - URLs de planilhas de leads

### 13.2 Meta Ads API

**Uso:** Dados de campanhas de tráfego pago.

**Endpoint:** `https://graph.facebook.com/v21.0/`

**Características:**
- Paginação automática
- Identificação de tipo de campanha
- Mapeamento correto de action_types
- Cache via Edge Function

**Limitações:**
- Rate limits da API Meta
- Necessário token válido
- Limite de 500 itens por página

### 13.3 Kommo CRM

**Uso:** Sincronização de leads via webhook.

**Endpoint:** `https://api-g.kommo.com/api/v4/`

**Características:**
- Webhook recebe eventos em tempo real
- Mapeamento de pipelines e estágios
- Histórico de mudanças
- Detecção automática de MQL

**Eventos suportados:**
- `leads[add]` - Novo lead
- `leads[update]` - Lead atualizado
- `leads[status]` - Mudança de status
- `leads[delete]` - Lead removido

### 13.4 Lovable AI Gateway

**Uso:** Assistente IA e análises inteligentes.

**Endpoint:** `https://ai.gateway.lovable.dev/v1/chat/completions`

**Modelo:** `google/gemini-2.5-flash`

**Características:**
- Sem necessidade de API key do usuário
- Contexto temporal completo
- Análise de sazonalidade
- Consideração de feriados

---

## 14. Configuração e Deploy

### 14.1 Instalação Local

```bash
# 1. Clone o repositório
git clone <YOUR_GIT_URL>
cd dashblue

# 2. Instale as dependências
npm install
# ou
bun install

# 3. Configure variáveis de ambiente
# O arquivo .env é gerado automaticamente pelo Lovable Cloud
# Para desenvolvimento local, crie um .env.local com:
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...

# 4. Inicie o servidor de desenvolvimento
npm run dev
# ou
bun dev
```

### 14.2 Build de Produção

```bash
# Build para produção
npm run build
# ou
bun run build

# Preview do build
npm run preview
```

### 14.3 Deploy

O projeto está configurado para deploy automático via **Lovable Cloud**.

**Para deploy manual:**
1. Acesse [Lovable](https://lovable.dev/projects/61dd678e-d716-49c9-866c-b7e08011ed75)
2. Clique em Share → Publish

**Para deploy customizado:**
- O build gera arquivos estáticos em `dist/`
- Pode ser deployado em qualquer servidor estático (Vercel, Netlify, etc.)

### 14.4 Configuração de Edge Functions

As Edge Functions são deployadas automaticamente pelo Supabase quando há push para o repositório.

**Para deploy manual:**
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref <PROJECT_REF>

# Deploy de uma função
supabase functions deploy ai-assistant
```

### 14.5 Configuração de Secrets

**No Supabase Dashboard:**
1. Vá em Project Settings → Edge Functions
2. Adicione os secrets necessários:
   - `LOVABLE_API_KEY`
   - `META_ACCESS_TOKEN`
   - `META_AD_ACCOUNT_ID`
   - `KOMMO_ACCESS_TOKEN`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## 15. Guias de Manutenção

### 15.1 Adicionar Novo Colaborador

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

### 15.2 Importar Vendas de Planilha

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

### 15.3 Modificar Metas

**Via Admin:**
1. Acesse `/admin`
2. Clique na aba "Metas Mensais"
3. Selecione o mês
4. Edite os valores
5. Salve

**Via código:**
1. Edite `src/utils/metasConfig.ts`
2. Modifique os valores em `METAS_POR_MES[mes]`

### 15.4 Adicionar Nova Página

1. Crie o componente em `src/pages/NovaPagina.tsx`
2. Adicione a rota em `src/App.tsx`:

```tsx
import NovaPagina from './pages/NovaPagina';

// No Routes:
<Route path="/nova" element={<NovaPagina />} />
```

3. Adicione link na navegação em `src/components/Navigation.tsx`

### 15.5 Criar Nova Edge Function

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

### 15.6 Atualizar Tipos do Supabase

```bash
# Gerar tipos atualizados
npx supabase gen types typescript --project-id <PROJECT_ID> > src/integrations/supabase/types.generated.ts
```

---

## 16. Decisões Arquiteturais

### 16.1 Por que Google Sheets como fonte de dados?

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
- Auto-refresh silencioso

### 16.2 Por que Edge Functions para APIs externas?

| Razão | Benefício |
|-------|-----------|
| Secrets seguros | API keys não expostas no client |
| CORS controlado | Sem problemas de cross-origin |
| Rate limiting | Controle de requisições |
| Logs centralizados | Debug facilitado |

### 16.3 Por que TanStack Query?

| Feature | Uso |
|---------|-----|
| Cache automático | Reduz requisições |
| Stale-while-revalidate | UX fluida |
| Retry automático | Resiliência |
| DevTools | Debug facilitado |

### 16.4 Por que Context API para filtros?

| Razão | Alternativa considerada |
|-------|------------------------|
| Estado global simples | Redux (overkill) |
| Poucos consumidores | Zustand (desnecessário) |
| Sincronização entre páginas | Props drilling (confuso) |

### 16.5 Por que calculadores em utils/?

| Razão | Benefício |
|-------|-----------|
| Separação de concerns | Componentes limpos |
| Testabilidade | Unit tests isolados |
| Reutilização | Mesmo cálculo em vários lugares |
| Manutenção | Lógica centralizada |

### 16.6 Por que shadcn/ui?

| Razão | Benefício |
|-------|-----------|
| Componentes acessíveis | WCAG compliance |
| Altamente customizáveis | Design system próprio |
| Baseado em Radix UI | Componentes primitivos robustos |
| Código no projeto | Controle total |

---

## 📝 Changelog

| Data | Versão | Descrição |
|------|--------|-----------|
| 2025-01 | 1.0.0 | Documentação técnica completa inicial |

---

## 🤝 Contribuição

Para contribuir com o projeto:

1. Entenda a estrutura de diretórios
2. Siga os padrões de código estabelecidos
3. Teste localmente antes de commitar
4. Documente novas funcionalidades

---

## 📞 Suporte

Para dúvidas ou problemas:
- Consulte esta documentação
- Verifique os logs do console do navegador
- Verifique os logs das Edge Functions no Supabase Dashboard

---

**Desenvolvido com ❤️ pela equipe Blue Ocean**
