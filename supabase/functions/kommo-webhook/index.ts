import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapeamento de pipelines
const PIPELINE_MAPPING = {
  'DISTRIBUIÇÃO DE LEADS': { tipo: 'distribuicao' },
  'SDR - Davi': { tipo: 'sdr', sdr_nome: 'Davi' },
  'SDR - ANDREY': { tipo: 'sdr', sdr_nome: 'Andrey' },
  'SDR - Vinicius': { tipo: 'sdr', sdr_nome: 'Vinicius' },
  'Closer - Bruno': { tipo: 'closer', closer_nome: 'Bruno' },
  'Closer - Cauã': { tipo: 'closer', closer_nome: 'Cauã' },
  'Closer - G. Franklin': { tipo: 'closer', closer_nome: 'G. Franklin' },
  'Closer - G. Fernandes': { tipo: 'closer', closer_nome: 'G. Fernandes' },
  'Closer - Marcos': { tipo: 'closer', closer_nome: 'Marcos' },
};

// Mapeamento de estágios para status interno
const STAGE_MAPPING: Record<string, string> = {
  // Distribuição de Leads
  'Contato Inicial': 'NOVO',
  'Oferta feita': 'NOVO',
  'Negociação': 'NOVO',
  
  // SDR - Estágios
  'Leads Novos': 'NOVO',
  'Em qualificação': 'QUALIFICACAO',
  'Contato Posterior': 'CONTATO_POSTERIOR',
  'Reunião Agendada': 'REUNIAO_AGENDADA',
  'No Show': 'NO_SHOW',
  
  // Closer - Estágios
  'Recebidos do SDR': 'RECEBIDO_CLOSER',
  'Em negociação': 'NEGOCIACAO',
  'Follow up 1': 'FOLLOW_UP',
  'Follow up 2': 'FOLLOW_UP',
  'Follow up 3': 'FOLLOW_UP',
  'Follow up 4': 'FOLLOW_UP',
  'Follow up 5': 'FOLLOW_UP',
  'Follow up 6': 'FOLLOW_UP',
  'Follow up 7': 'FOLLOW_UP',
  'Venda Futura': 'VENDA_FUTURA',
  'Venda Ganha': 'GANHO',
  'Venda Perdida': 'PERDIDO',
};

// Parse do payload do Kommo (formato x-www-form-urlencoded)
function parseKommoPayload(body: string): any {
  try {
    // Tenta parsear como JSON primeiro
    return JSON.parse(body);
  } catch {
    // Se não for JSON, parseia como form-urlencoded
    const params = new URLSearchParams(body);
    const result: any = {};
    
    for (const [key, value] of params.entries()) {
      // Kommo envia dados aninhados como leads[add][0][id], leads[status][0][id], etc.
      const match = key.match(/^(\w+)\[(\w+)\]\[(\d+)\]\[(.+)\]$/);
      if (match) {
        const [, entity, action, index, field] = match;
        if (!result[entity]) result[entity] = {};
        if (!result[entity][action]) result[entity][action] = [];
        if (!result[entity][action][index]) result[entity][action][index] = {};
        result[entity][action][index][field] = value;
      } else {
        // Campo simples
        result[key] = value;
      }
    }
    
    return result;
  }
}

// Extrai dados do lead do payload do Kommo
function extractLeadData(leadData: any, eventType: string) {
  const lead = {
    kommo_id: parseInt(leadData.id) || null,
    nome: leadData.name || null,
    pipeline_id: parseInt(leadData.pipeline_id) || null,
    status_id: parseInt(leadData.status_id) || null,
    responsavel_id: parseInt(leadData.responsible_user_id) || null,
    valor: null as number | null,
    tags: [] as string[],
    custom_fields: {} as Record<string, any>,
  };
  
  // Extrai valor do campo "Venda" dos custom fields
  if (leadData.custom_fields_values) {
    for (const field of leadData.custom_fields_values) {
      if (field.field_name === 'Venda' || field.field_code === 'Venda') {
        lead.valor = parseFloat(field.values?.[0]?.value) || null;
      }
      lead.custom_fields[field.field_name || field.field_id] = field.values?.[0]?.value;
    }
  }
  
  // Extrai tags
  if (leadData._embedded?.tags) {
    lead.tags = leadData._embedded.tags.map((t: any) => t.name);
  } else if (leadData.tags) {
    if (typeof leadData.tags === 'string') {
      lead.tags = leadData.tags.split(',').map((t: string) => t.trim());
    } else if (Array.isArray(leadData.tags)) {
      lead.tags = leadData.tags.map((t: any) => typeof t === 'object' ? t.name : t);
    }
  }
  
  return lead;
}

// Busca informações adicionais do lead via API do Kommo (se necessário)
async function fetchLeadDetails(kommoId: number, accessToken: string): Promise<any> {
  try {
    const response = await fetch(`https://api-g.kommo.com/api/v4/leads/${kommoId}?with=contacts,custom_fields_values`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error(`Erro ao buscar lead ${kommoId}: ${response.status}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erro ao buscar lead ${kommoId}:`, error);
    return null;
  }
}

// Busca informações da pipeline via API do Kommo
async function fetchPipelineInfo(pipelineId: number, accessToken: string): Promise<{ pipeline_nome: string; stage_nome: string; status_id: number } | null> {
  try {
    const response = await fetch(`https://api-g.kommo.com/api/v4/leads/pipelines/${pipelineId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error(`Erro ao buscar pipeline ${pipelineId}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    return {
      pipeline_nome: data.name,
      stage_nome: '',
      status_id: 0,
    };
  } catch (error) {
    console.error(`Erro ao buscar pipeline ${pipelineId}:`, error);
    return null;
  }
}

// Busca nome do estágio via API do Kommo
async function fetchStageName(pipelineId: number, statusId: number, accessToken: string): Promise<string | null> {
  try {
    const response = await fetch(`https://api-g.kommo.com/api/v4/leads/pipelines/${pipelineId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error(`Erro ao buscar pipeline ${pipelineId}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    const statuses = data._embedded?.statuses || [];
    const status = statuses.find((s: any) => s.id === statusId);
    return status?.name || null;
  } catch (error) {
    console.error(`Erro ao buscar estágio ${statusId}:`, error);
    return null;
  }
}

// Busca nome do usuário responsável via API do Kommo
async function fetchUserName(userId: number, accessToken: string): Promise<string | null> {
  try {
    const response = await fetch(`https://api-g.kommo.com/api/v4/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error(`Erro ao buscar usuário ${userId}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    return data.name || null;
  } catch (error) {
    console.error(`Erro ao buscar usuário ${userId}:`, error);
    return null;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const kommoAccessToken = Deno.env.get('KOMMO_ACCESS_TOKEN')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parseia o body
    const bodyText = await req.text();
    console.log('=== WEBHOOK KOMMO RECEBIDO ===');
    console.log('Body raw:', bodyText.substring(0, 500));
    
    const payload = parseKommoPayload(bodyText);
    console.log('Payload parseado:', JSON.stringify(payload, null, 2).substring(0, 1000));
    
    // Identifica o tipo de evento e extrai os leads
    let leads: any[] = [];
    let eventType = 'unknown';
    
    if (payload.leads?.add) {
      eventType = 'add';
      leads = Array.isArray(payload.leads.add) ? payload.leads.add : Object.values(payload.leads.add);
    } else if (payload.leads?.status) {
      eventType = 'status';
      leads = Array.isArray(payload.leads.status) ? payload.leads.status : Object.values(payload.leads.status);
    } else if (payload.leads?.update) {
      eventType = 'update';
      leads = Array.isArray(payload.leads.update) ? payload.leads.update : Object.values(payload.leads.update);
    } else if (payload.leads?.delete) {
      eventType = 'delete';
      leads = Array.isArray(payload.leads.delete) ? payload.leads.delete : Object.values(payload.leads.delete);
    }
    
    console.log(`Tipo de evento: ${eventType}, Quantidade de leads: ${leads.length}`);
    
    if (leads.length === 0) {
      console.log('Nenhum lead encontrado no payload');
      return new Response(JSON.stringify({ success: true, message: 'No leads to process' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Processa cada lead
    for (const leadPayload of leads) {
      try {
        const leadData = extractLeadData(leadPayload, eventType);
        
        if (!leadData.kommo_id) {
          console.error('Lead sem ID:', leadPayload);
          continue;
        }
        
        console.log(`Processando lead ${leadData.kommo_id}...`);
        
        // Busca informações adicionais via API se necessário
        let pipelineNome = '';
        let stageNome = '';
        
        if (leadData.pipeline_id) {
          // Busca nome da pipeline
          const pipelineResponse = await fetch(`https://api-g.kommo.com/api/v4/leads/pipelines/${leadData.pipeline_id}`, {
            headers: {
              'Authorization': `Bearer ${kommoAccessToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (pipelineResponse.ok) {
            const pipelineData = await pipelineResponse.json();
            pipelineNome = pipelineData.name || '';
            
            // Busca nome do estágio
            if (leadData.status_id && pipelineData._embedded?.statuses) {
              const status = pipelineData._embedded.statuses.find((s: any) => s.id === leadData.status_id);
              stageNome = status?.name || '';
            }
          }
        }
        
        console.log(`Pipeline: ${pipelineNome}, Estágio: ${stageNome}`);
        
        // Identifica SDR ou Closer baseado na pipeline
        let sdrNome: string | null = null;
        let closerNome: string | null = null;
        const pipelineInfo = PIPELINE_MAPPING[pipelineNome as keyof typeof PIPELINE_MAPPING];
        
        if (pipelineInfo) {
          if (pipelineInfo.tipo === 'sdr' && 'sdr_nome' in pipelineInfo) {
            sdrNome = pipelineInfo.sdr_nome;
          } else if (pipelineInfo.tipo === 'closer' && 'closer_nome' in pipelineInfo) {
            closerNome = pipelineInfo.closer_nome;
          }
        }
        
        // Mapeia o status interno
        const statusInterno = STAGE_MAPPING[stageNome] || 'NOVO';
        
        // Verifica se é MQL (tem tag "MQL")
        const isMql = leadData.tags.some((tag: string) => tag.toLowerCase() === 'mql');
        
        // Busca nome do responsável
        let responsavelNome: string | null = null;
        if (leadData.responsavel_id) {
          responsavelNome = await fetchUserName(leadData.responsavel_id, kommoAccessToken);
        }
        
        // Busca lead existente para comparar e registrar histórico
        const { data: existingLead } = await supabase
          .from('leads_crm')
          .select('*')
          .eq('kommo_id', leadData.kommo_id)
          .maybeSingle();
        
        // Prepara dados para upsert
        const leadRecord: any = {
          kommo_id: leadData.kommo_id,
          nome: leadData.nome,
          status: statusInterno,
          pipeline_nome: pipelineNome,
          stage_nome: stageNome,
          sdr_nome: sdrNome || existingLead?.sdr_nome,
          closer_nome: closerNome || existingLead?.closer_nome,
          responsavel_id: leadData.responsavel_id,
          responsavel_nome: responsavelNome,
          is_mql: isMql,
          tags: leadData.tags,
          kommo_payload: leadPayload,
        };
        
        // Atualiza timestamps baseado no status
        if (statusInterno === 'GANHO' && leadData.valor) {
          leadRecord.valor_contrato = leadData.valor;
          leadRecord.data_ganho = new Date().toISOString();
        }
        
        if (statusInterno === 'PERDIDO') {
          leadRecord.data_perdido = new Date().toISOString();
          // Tenta extrair motivo de perda dos custom fields
          if (leadData.custom_fields['Motivo de Perda']) {
            leadRecord.motivo_perda = leadData.custom_fields['Motivo de Perda'];
          }
        }
        
        if (isMql && !existingLead?.is_mql) {
          leadRecord.data_mql = new Date().toISOString();
        }
        
        if (statusInterno === 'REUNIAO_AGENDADA' && existingLead?.status !== 'REUNIAO_AGENDADA') {
          leadRecord.data_reuniao = new Date().toISOString();
        }
        
        if (closerNome && !existingLead?.closer_nome) {
          leadRecord.data_closer = new Date().toISOString();
        }
        
        // Faz upsert do lead
        const { data: upsertedLead, error: upsertError } = await supabase
          .from('leads_crm')
          .upsert(leadRecord, { onConflict: 'kommo_id' })
          .select()
          .single();
        
        if (upsertError) {
          console.error(`Erro ao salvar lead ${leadData.kommo_id}:`, upsertError);
          continue;
        }
        
        console.log(`Lead ${leadData.kommo_id} salvo com sucesso. Status: ${statusInterno}`);
        
        // Registra histórico de mudança de status
        if (existingLead && existingLead.status !== statusInterno) {
          await supabase
            .from('leads_crm_historico')
            .insert({
              lead_id: upsertedLead.id,
              kommo_id: leadData.kommo_id,
              status_anterior: existingLead.status,
              status_novo: statusInterno,
              campo_alterado: 'status',
              valor_anterior: existingLead.status,
              valor_novo: statusInterno,
            });
          
          console.log(`Histórico registrado: ${existingLead.status} -> ${statusInterno}`);
        }
        
        // Registra outras mudanças importantes
        if (existingLead) {
          // Mudança de pipeline
          if (existingLead.pipeline_nome !== pipelineNome) {
            await supabase
              .from('leads_crm_historico')
              .insert({
                lead_id: upsertedLead.id,
                kommo_id: leadData.kommo_id,
                campo_alterado: 'pipeline',
                valor_anterior: existingLead.pipeline_nome,
                valor_novo: pipelineNome,
              });
          }
          
          // Mudança de responsável
          if (existingLead.responsavel_id !== leadData.responsavel_id) {
            await supabase
              .from('leads_crm_historico')
              .insert({
                lead_id: upsertedLead.id,
                kommo_id: leadData.kommo_id,
                campo_alterado: 'responsavel',
                valor_anterior: existingLead.responsavel_nome,
                valor_novo: responsavelNome,
              });
          }
        }
        
      } catch (leadError) {
        console.error(`Erro ao processar lead:`, leadError);
      }
    }
    
    return new Response(JSON.stringify({ success: true, processed: leads.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});