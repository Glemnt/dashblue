import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
}

interface MetaInsight {
  campaign_id: string;
  campaign_name: string;
  spend: string;
  impressions: string;
  clicks: string;
  ctr: string;
  cpc: string;
  actions?: Array<{ action_type: string; value: string }>;
  cost_per_action_type?: Array<{ action_type: string; value: string }>;
}

interface CampanhaData {
  id: number;
  nome: string;
  canal: string;
  status: 'ativo' | 'pausado' | 'finalizado';
  investimento: number;
  impressoes: number;
  cliques: number;
  ctr: number;
  cpc: number;
  leadsGerados: number;
  cpl: number;
  leadsQualificados: number;
  taxaQualificacao: number;
  callsAgendadas: number;
  callsRealizadas: number;
  fechamentos: number;
  valorFechado: number;
  roas: number;
  roi: number;
  cac: number;
  ticketMedio: number;
}

// Identifica o tipo de campanha pelo nome
type CampaignType = 'whatsapp' | 'formulario' | 'lp' | 'vsl' | 'outro';

const getCampaignType = (campaignName: string): CampaignType => {
  const name = campaignName.toLowerCase();
  
  // WhatsApp campaigns
  if (name.includes('whatsapp') || name.includes('wpp') || name.includes('mensagem')) {
    return 'whatsapp';
  }
  
  // Native form campaigns (formulário nativo do Meta)
  if (name.includes('formulário') || name.includes('formulario') || name.includes('nativo') || name.includes('b2b')) {
    return 'formulario';
  }
  
  // VSL campaigns
  if (name.includes('vsl')) {
    return 'vsl';
  }
  
  // Landing Page campaigns
  if (name.includes('landing page') || name.includes('lp ') || name.includes('| lp') || name.includes('lpv')) {
    return 'lp';
  }
  
  return 'outro';
};

// Mapeamento de tipos de campanha para action_types específicos
const CAMPAIGN_ACTION_TYPES: Record<CampaignType, string[]> = {
  whatsapp: [
    'onsite_conversion.messaging_conversation_started_7d',
    'onsite_conversion.messaging_first_reply',
  ],
  formulario: [
    'leadgen.other',
    'lead',
  ],
  lp: [
    'offsite_conversion.fb_pixel_lead',
    'lead',
  ],
  vsl: [
    'offsite_conversion.fb_pixel_lead',
    'offsite_conversion.fb_pixel_custom',
    'lead',
  ],
  outro: [
    'lead',
    'leadgen.other',
    'offsite_conversion.fb_pixel_lead',
  ],
};

// Busca leads baseado no tipo de campanha - retorna APENAS o evento correto
const getLeadsByType = (
  actions: Array<{ action_type: string; value: string }>,
  campaignType: CampaignType,
  campaignName: string
): number => {
  const validActionTypes = CAMPAIGN_ACTION_TYPES[campaignType];
  
  // Procura o primeiro action_type válido para este tipo de campanha
  for (const actionType of validActionTypes) {
    const action = actions.find(a => a.action_type === actionType);
    if (action) {
      const leads = parseInt(action.value || '0', 10);
      console.log(`[${campaignName}] Found ${leads} leads via ${actionType} (type: ${campaignType})`);
      return leads;
    }
  }
  
  // Se não encontrou, busca offsite_conversion.custom.* para LP/VSL
  if (campaignType === 'lp' || campaignType === 'vsl') {
    const customAction = actions.find(a => a.action_type.startsWith('offsite_conversion.custom.'));
    if (customAction) {
      const leads = parseInt(customAction.value || '0', 10);
      console.log(`[${campaignName}] Found ${leads} leads via custom conversion: ${customAction.action_type}`);
      return leads;
    }
  }
  
  console.log(`[${campaignName}] No matching action type found for campaign type: ${campaignType}`);
  return 0;
};

const getLeadsFromActions = (actions?: Array<{ action_type: string; value: string }>, campaignName?: string): number => {
  if (!actions || actions.length === 0) {
    console.log(`[${campaignName}] No actions array or empty`);
    return 0;
  }
  
  const campaignType = getCampaignType(campaignName || '');
  
  // Log all actions for debugging
  console.log(`[${campaignName}] Type: ${campaignType} | Actions (${actions.length}):`, 
    JSON.stringify(actions.map(a => ({ type: a.action_type, value: a.value }))));
  
  return getLeadsByType(actions, campaignType, campaignName || '');
};

const getCPLFromCostPerAction = (costPerAction?: Array<{ action_type: string; value: string }>, campaignName?: string): number => {
  if (!costPerAction || costPerAction.length === 0) {
    return 0;
  }
  
  const campaignType = getCampaignType(campaignName || '');
  const validActionTypes = CAMPAIGN_ACTION_TYPES[campaignType];
  
  // Procura o CPL para o action_type correto
  for (const actionType of validActionTypes) {
    const costAction = costPerAction.find(a => a.action_type === actionType);
    if (costAction) {
      console.log(`[${campaignName}] CPL found: ${costAction.value} via ${actionType}`);
      return parseFloat(costAction.value || '0');
    }
  }
  
  return 0;
};

const normalizeStatus = (status: string): 'ativo' | 'pausado' | 'finalizado' => {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
      return 'ativo';
    case 'PAUSED':
      return 'pausado';
    default:
      return 'finalizado';
  }
};

const normalizeCanal = (campaignName: string): string => {
  const name = campaignName.toLowerCase();
  if (name.includes('instagram') || name.includes('ig_')) return 'Instagram';
  if (name.includes('facebook') || name.includes('fb_')) return 'Facebook';
  if (name.includes('linkedin')) return 'LinkedIn';
  if (name.includes('google')) return 'Google';
  if (name.includes('youtube')) return 'YouTube';
  if (name.includes('tiktok')) return 'TikTok';
  return 'Facebook'; // Default for Meta campaigns
};

// Get current month range as fallback
const getCurrentMonthRange = (): { since: string; until: string } => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  
  return {
    since: formatDate(firstDay),
    until: formatDate(lastDay)
  };
};

interface MetaPaginatedResponse<T> {
  data?: T[];
  paging?: {
    next?: string;
    cursors?: {
      after?: string;
      before?: string;
    };
  };
  error?: {
    message: string;
    code: number;
  };
}

// Fetch all pages of data from Meta API with pagination
const fetchAllPages = async <T>(initialUrl: string): Promise<T[]> => {
  const allData: T[] = [];
  let nextUrl: string | null = initialUrl;
  let pageCount = 0;
  const maxPages = 10; // Safety limit
  
  while (nextUrl && pageCount < maxPages) {
    pageCount++;
    console.log(`Fetching page ${pageCount}...`);
    
    const response: Response = await fetch(nextUrl);
    const json: MetaPaginatedResponse<T> = await response.json();
    
    if (json.error) {
      console.error(`Error on page ${pageCount}:`, json.error);
      throw new Error(json.error.message);
    }
    
    if (json.data && Array.isArray(json.data)) {
      allData.push(...json.data);
      console.log(`Page ${pageCount}: Got ${json.data.length} items, total: ${allData.length}`);
    }
    
    // Check for next page
    nextUrl = json.paging?.next || null;
  }
  
  console.log(`Pagination complete: ${pageCount} pages, ${allData.length} total items`);
  return allData;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get('META_ACCESS_TOKEN');
    const adAccountId = Deno.env.get('META_AD_ACCOUNT_ID');

    if (!accessToken || !adAccountId) {
      console.error('Missing META_ACCESS_TOKEN or META_AD_ACCOUNT_ID');
      return new Response(
        JSON.stringify({ 
          error: 'Configuração incompleta', 
          message: 'META_ACCESS_TOKEN e META_AD_ACCOUNT_ID são necessários' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body for date range
    let startDate: string | null = null;
    let endDate: string | null = null;
    
    try {
      const body = await req.json();
      startDate = body.startDate || null;
      endDate = body.endDate || null;
    } catch {
      // No body or invalid JSON, use defaults
    }

    // Determine time range
    let timeRange: { since: string; until: string };
    
    if (startDate && endDate) {
      timeRange = { since: startDate, until: endDate };
      console.log(`Using custom date range: ${startDate} to ${endDate}`);
    } else {
      timeRange = getCurrentMonthRange();
      console.log(`Using current month range: ${timeRange.since} to ${timeRange.until}`);
    }

    // Ensure adAccountId has act_ prefix
    const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;

    console.log(`Fetching campaigns for account: ${formattedAccountId}`);

    // Step 1: Fetch ALL campaigns with pagination
    const campaignsUrl = `https://graph.facebook.com/v21.0/${formattedAccountId}/campaigns?fields=id,name,status,objective&limit=500&access_token=${accessToken}`;
    
    console.log('Fetching all campaigns with pagination...');
    const campaigns = await fetchAllPages<MetaCampaign>(campaignsUrl);
    console.log(`Total campaigns fetched: ${campaigns.length}`);

    // Step 2: Fetch ALL insights with pagination
    const timeRangeParam = encodeURIComponent(JSON.stringify(timeRange));
    const insightsUrl = `https://graph.facebook.com/v21.0/${formattedAccountId}/insights?level=campaign&fields=campaign_id,campaign_name,spend,impressions,clicks,ctr,cpc,actions,cost_per_action_type&time_range=${timeRangeParam}&limit=500&access_token=${accessToken}`;
    
    console.log('Fetching all insights with pagination...');
    const insights = await fetchAllPages<MetaInsight>(insightsUrl);
    console.log(`Total insights fetched: ${insights.length}`);

    // Log raw insight data for debugging
    insights.forEach((insight, idx) => {
      console.log(`[RAW INSIGHT ${idx + 1}] Campaign: ${insight.campaign_name}, Spend: ${insight.spend}, Actions: ${insight.actions ? insight.actions.length : 0}`);
      if (insight.actions && insight.actions.length > 0) {
        console.log(`[RAW ACTIONS ${insight.campaign_name}]:`, JSON.stringify(insight.actions));
      }
    });

    // Step 3: Map insights to campaigns
    const insightsMap = new Map<string, MetaInsight>();
    insights.forEach(insight => {
      insightsMap.set(insight.campaign_id, insight);
    });

    console.log(`Insights mapped for ${insightsMap.size} campaigns`);

    // Step 4: Transform data to CampanhaData format
    const campanhas: CampanhaData[] = campaigns.map((campaign, index) => {
      const insight = insightsMap.get(campaign.id);
      
      const investimento = parseFloat(insight?.spend || '0');
      const impressoes = parseInt(insight?.impressions || '0', 10);
      const cliques = parseInt(insight?.clicks || '0', 10);
      const ctr = parseFloat(insight?.ctr || '0');
      const cpc = parseFloat(insight?.cpc || '0');
      const leadsGerados = getLeadsFromActions(insight?.actions, campaign.name);
      const cpl = getCPLFromCostPerAction(insight?.cost_per_action_type, campaign.name) || 
                  (leadsGerados > 0 ? investimento / leadsGerados : 0);
      
      // Estimated values (these would come from CRM in a real scenario)
      const taxaQualificacao = 55 + Math.random() * 20; // 55-75%
      const leadsQualificados = Math.round(leadsGerados * (taxaQualificacao / 100));
      const callsAgendadas = Math.round(leadsQualificados * 0.45);
      const callsRealizadas = Math.round(callsAgendadas * 0.85);
      const fechamentos = Math.round(callsRealizadas * 0.2);
      const ticketMedio = 8000 + Math.random() * 6000; // R$ 8k - 14k
      const valorFechado = fechamentos * ticketMedio;
      
      const roas = investimento > 0 ? valorFechado / investimento : 0;
      const roi = investimento > 0 ? ((valorFechado - investimento) / investimento) * 100 : 0;
      const cac = fechamentos > 0 ? investimento / fechamentos : 0;

      return {
        id: index + 1,
        nome: campaign.name,
        canal: normalizeCanal(campaign.name),
        status: normalizeStatus(campaign.status),
        investimento,
        impressoes,
        cliques,
        ctr,
        cpc,
        leadsGerados,
        cpl,
        leadsQualificados,
        taxaQualificacao,
        callsAgendadas,
        callsRealizadas,
        fechamentos,
        valorFechado,
        roas,
        roi,
        cac,
        ticketMedio
      };
    });

    // Filter out campaigns with no spend in the selected period
    const activeCampaigns = campanhas.filter(c => c.investimento > 0);

    // Log summary
    const totalLeads = activeCampaigns.reduce((sum, c) => sum + c.leadsGerados, 0);
    const totalInvestimento = activeCampaigns.reduce((sum, c) => sum + c.investimento, 0);
    console.log(`=== SUMMARY ===`);
    console.log(`Total campaigns with spend: ${activeCampaigns.length}`);
    console.log(`Total investimento: R$ ${totalInvestimento.toFixed(2)}`);
    console.log(`Total leads: ${totalLeads}`);

    return new Response(
      JSON.stringify({
        success: true,
        campanhas: activeCampaigns,
        meta: {
          totalCampaigns: campaigns.length,
          campaignsWithData: activeCampaigns.length,
          totalLeads,
          totalInvestimento,
          timeRange: timeRange,
          fetchedAt: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching Meta campaigns:', errorMessage);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno', 
        message: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
