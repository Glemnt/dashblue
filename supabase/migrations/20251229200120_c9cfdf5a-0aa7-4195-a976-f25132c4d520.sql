-- Tabela de colaboradores (SDRs e Closers)
CREATE TABLE colaboradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('sdr', 'closer')),
  squad TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de metas mensais
CREATE TABLE metas_mensais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mes TEXT NOT NULL UNIQUE,
  meta_mensal NUMERIC NOT NULL DEFAULT 0,
  meta_individual_closer NUMERIC DEFAULT 0,
  meta_ticket_medio NUMERIC DEFAULT 0,
  meta_taxa_conversao NUMERIC DEFAULT 0,
  meta_taxa_qualificacao_sdr NUMERIC DEFAULT 0,
  meta_taxa_show_sdr NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de vendas
CREATE TABLE vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID REFERENCES colaboradores(id),
  colaborador_nome TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  origem TEXT NOT NULL CHECK (origem IN ('indicacao', 'outbound', 'inbound')),
  lead_nome TEXT,
  data_fechamento DATE NOT NULL DEFAULT CURRENT_DATE,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de agendamentos
CREATE TABLE agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sdr_id UUID REFERENCES colaboradores(id),
  sdr_nome TEXT NOT NULL,
  closer_id UUID REFERENCES colaboradores(id),
  closer_nome TEXT,
  lead_nome TEXT,
  data_agendamento DATE NOT NULL,
  status TEXT DEFAULT 'agendado' CHECK (status IN ('agendado', 'realizado', 'no_show', 'cancelado')),
  qualificado BOOLEAN DEFAULT FALSE,
  origem TEXT CHECK (origem IN ('indicacao', 'outbound', 'inbound')),
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas_mensais ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público para leitura (dashboard precisa ler)
CREATE POLICY "Allow public read colaboradores" ON colaboradores FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read metas_mensais" ON metas_mensais FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read vendas" ON vendas FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read agendamentos" ON agendamentos FOR SELECT TO anon USING (true);

-- Políticas de acesso público para escrita (admin sem auth por enquanto)
CREATE POLICY "Allow public insert colaboradores" ON colaboradores FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public update colaboradores" ON colaboradores FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow public delete colaboradores" ON colaboradores FOR DELETE TO anon USING (true);

CREATE POLICY "Allow public insert metas_mensais" ON metas_mensais FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public update metas_mensais" ON metas_mensais FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow public delete metas_mensais" ON metas_mensais FOR DELETE TO anon USING (true);

CREATE POLICY "Allow public insert vendas" ON vendas FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public update vendas" ON vendas FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow public delete vendas" ON vendas FOR DELETE TO anon USING (true);

CREATE POLICY "Allow public insert agendamentos" ON agendamentos FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public update agendamentos" ON agendamentos FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow public delete agendamentos" ON agendamentos FOR DELETE TO anon USING (true);

-- Inserir colaboradores iniciais baseados no sistema atual
INSERT INTO colaboradores (nome, tipo, squad) VALUES
  ('Davi', 'sdr', NULL),
  ('Vinicius', 'sdr', NULL),
  ('Tiago', 'sdr', NULL),
  ('Andrey', 'sdr', NULL),
  ('João Lopes', 'sdr', NULL),
  ('Cauã', 'sdr', NULL),
  ('Bruno', 'closer', 'Alfa'),
  ('Marcos', 'closer', 'Alfa'),
  ('Fernandes', 'closer', 'Beta'),
  ('Franklin', 'closer', 'Beta');

-- Inserir meta do mês atual
INSERT INTO metas_mensais (mes, meta_mensal, meta_individual_closer, meta_ticket_medio, meta_taxa_conversao, meta_taxa_qualificacao_sdr, meta_taxa_show_sdr)
VALUES ('janeiro-2025', 325000, 65000, 4000, 25, 47, 85);