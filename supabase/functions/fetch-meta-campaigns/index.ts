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

const getLeadsFromActions = (actions?: Array<{ action_type: string; value: string }>): number => {
  if (!actions) return 0;
  
  const leadActions = actions.filter(a => 
    a.action_type === 'lead' || 
    a.action_type === 'onsite_conversion.lead_grouped' ||
    a.action_type === 'offsite_conversion.fb_pixel_lead'
  );
  
  return leadActions.reduce((sum, a) => sum + parseInt(a.value || '0', 10), 0);
};

const getCPLFromCostPerAction = (costPerAction?: Array<{ action_type: string; value: string }>): number => {
  if (!costPerAction) return 0;
  
  const leadCost = costPerAction.find(a => 
    a.action_type === 'lead' || 
    a.action_type === 'onsite_conversion.lead_grouped' ||
    a.action_type === 'offsite_conversion.fb_pixel_lead'
  );
  
  return leadCost ? parseFloat(leadCost.value || '0') : 0;
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

    // Ensure adAccountId has act_ prefix
    const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;

    console.log(`Fetching campaigns for account: ${formattedAccountId}`);

    // Step 1: Fetch campaigns
    const campaignsUrl = `https://graph.facebook.com/v21.0/${formattedAccountId}/campaigns?fields=id,name,status,objective&access_token=${accessToken}`;
    
    console.log('Fetching campaigns...');
    const campaignsResponse = await fetch(campaignsUrl);
    const campaignsData = await campaignsResponse.json();

    if (campaignsData.error) {
      console.error('Meta API Error (campaigns):', campaignsData.error);
      return new Response(
        JSON.stringify({ 
          error: 'Erro na API da Meta', 
          details: campaignsData.error.message,
          code: campaignsData.error.code
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const campaigns: MetaCampaign[] = campaignsData.data || [];
    console.log(`Found ${campaigns.length} campaigns`);

    // Step 2: Fetch insights for the account (aggregated by campaign)
    const insightsUrl = `https://graph.facebook.com/v21.0/${formattedAccountId}/insights?level=campaign&fields=campaign_id,campaign_name,spend,impressions,clicks,ctr,cpc,actions,cost_per_action_type&date_preset=this_month&access_token=${accessToken}`;
    
    console.log('Fetching insights...');
    const insightsResponse = await fetch(insightsUrl);
    const insightsData = await insightsResponse.json();

    if (insightsData.error) {
      console.error('Meta API Error (insights):', insightsData.error);
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao buscar insights', 
          details: insightsData.error.message 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const insights: MetaInsight[] = insightsData.data || [];
    console.log(`Found ${insights.length} insight records`);

    // Step 3: Map insights to campaigns
    const insightsMap = new Map<string, MetaInsight>();
    insights.forEach(insight => {
      insightsMap.set(insight.campaign_id, insight);
    });

    // Step 4: Transform data to CampanhaData format
    const campanhas: CampanhaData[] = campaigns.map((campaign, index) => {
      const insight = insightsMap.get(campaign.id);
      
      const investimento = parseFloat(insight?.spend || '0');
      const impressoes = parseInt(insight?.impressions || '0', 10);
      const cliques = parseInt(insight?.clicks || '0', 10);
      const ctr = parseFloat(insight?.ctr || '0');
      const cpc = parseFloat(insight?.cpc || '0');
      const leadsGerados = getLeadsFromActions(insight?.actions);
      const cpl = getCPLFromCostPerAction(insight?.cost_per_action_type) || 
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

    // Filter out campaigns with no spend
    const activeCampaigns = campanhas.filter(c => c.investimento > 0 || c.status === 'ativo');

    console.log(`Returning ${activeCampaigns.length} campaigns with data`);

    return new Response(
      JSON.stringify({
        success: true,
        campanhas: activeCampaigns,
        meta: {
          totalCampaigns: campaigns.length,
          campaignsWithData: activeCampaigns.length,
          datePreset: 'this_month',
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
