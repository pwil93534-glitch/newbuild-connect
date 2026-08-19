import { Buyer } from '../types';
import { AGENT_PERSONA } from '../constants/agent';

const API_URL = 'https://api.anthropic.com/v1/messages';
const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';
console.log('API_KEY loaded:', API_KEY ? `yes (${API_KEY.substring(0, 12)}...)` : 'MISSING');

function buildSystemPrompt(buyer: Partial<Buyer>): string {
  const buyerTypeLabel: Record<string, string> = {
    veteran: 'Veteran / Military',
    first_time: 'First-Time Home Buyer',
    relocation: 'Relocating Buyer',
    senior: 'Senior / Active Adult (55+)',
  };
  const baseLabel: Record<string, string> = {
    luke: 'Luke Air Force Base (Surprise/Glendale area)',
    huachuca: 'Fort Huachuca (Sierra Vista area)',
    dm: 'Davis-Monthan AFB (Tucson area)',
    veteran_retired: 'Veteran / Retiring',
  };
  const loanLabel: Record<string, string> = {
    va: 'VA Loan', fha: 'FHA Loan', conventional: 'Conventional Loan', unsure: 'Not sure yet',
  };
  const timelineLabel: Record<string, string> = {
    asap: 'As soon as possible', '1_3mo': '1–3 months', '3_6mo': '3–6 months',
    '6_12mo': '6–12 months', exploring: 'Just exploring',
  };

  return `You are the AI-powered advisor for ${AGENT_PERSONA.name}, a Real Estate Strategist specializing in New Construction in Phoenix and Tucson, Arizona. You speak as a knowledgeable, warm, and encouraging extension of the agent's personal brand.

The buyer you are speaking with:
- Name: ${buyer.name ?? 'there'}
- Buyer Type: ${buyer.buyer_type ? buyerTypeLabel[buyer.buyer_type] : 'Not specified'}
${buyer.military_base ? `- Military Base: ${baseLabel[buyer.military_base]}` : ''}
- Budget: ${buyer.budget_min ? `$${buyer.budget_min.toLocaleString()}–$${buyer.budget_max?.toLocaleString()}` : 'Not specified'}
- Current Journey Stage: ${buyer.current_stage ?? 1}
- Loan Type: ${buyer.loan_type ? loanLabel[buyer.loan_type] : 'Not specified'}
- Timeline: ${buyer.timeline ? timelineLabel[buyer.timeline] : 'Not specified'}

You have deep knowledge of:
- All new construction communities in Phoenix (West Valley, Surprise, Goodyear, Litchfield Park, Peoria, Buckeye, Queen Creek) and Tucson (Sahuarita, Marana, Vail)
- VA loan benefits: $0 down, no PMI, disability funding fee exemption, BAH as qualifying income
- AZ incentives: Home Plus DPA (3–5%), Pima/Tucson DPA (4%), builder programs
- Builder incentives: Pulte Flex Cash (3%), Hometown Heroes ($2,000), rate buydowns
- BAH rates 2026: Luke AFB ($1,641–$3,678), Fort Huachuca ($1,260–$2,511), Davis-Monthan ($1,356–$2,583)
- Arizona property tax exemption for 100% P&T disabled veterans
- Builders: Pulte, Taylor Morrison, Del Webb, Meritage, DR Horton, Richmond American, Toll Brothers, Shea Homes

Rules:
- Always be warm, encouraging, and empowering
- Give 3 key points max per response unless asked for more
- Always end with a clear next action or question
- Never give legal, financial, or tax advice
- Use the buyer's name naturally
- Match energy: Military = direct; First-Time = nurturing; Senior = warm; Relocation = excited`;
}

export async function streamAIResponse(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  buyer: Partial<Buyer>,
  onChunk: (chunk: string) => void,
  onComplete: (fullText: string) => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: buildSystemPrompt(buyer),
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', response.status, errText);
      throw new Error(`API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const text: string = data?.content?.[0]?.text ?? "I'm having trouble responding right now. Please try again.";

    // Simulate streaming by revealing text word by word
    const words = text.split(' ');
    let built = '';
    for (const word of words) {
      built += (built ? ' ' : '') + word;
      onChunk(built);
      await new Promise((r) => setTimeout(r, 30));
    }
    onComplete(text);
  } catch (error) {
    console.error('streamAIResponse error:', error);
    onError(error instanceof Error ? error : new Error('AI service unavailable. Check your API key.'));
  }
}

export async function generateDailyInsight(buyer: Partial<Buyer>): Promise<string> {
  if (!API_KEY) {
    return 'Add your Anthropic API key to .env.local to enable AI insights.';
  }

  const buyerTypeContext: Record<string, string> = {
    veteran: 'Focus on VA benefits, BAH buying power, and military-specific incentives.',
    first_time: 'Focus on down payment assistance and FHA programs.',
    relocation: 'Focus on Arizona market advantages and community comparisons.',
    senior: 'Focus on 55+ community lifestyle and retirement-friendly incentives.',
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 150,
        system: buildSystemPrompt(buyer),
        messages: [{
          role: 'user',
          content: `Generate a single, specific, actionable daily insight for this buyer. Keep it to 2-3 sentences maximum. Be specific with numbers when possible. ${buyer.buyer_type ? buyerTypeContext[buyer.buyer_type] : ''} Current stage: ${buyer.current_stage ?? 1}.`,
        }],
      }),
    });

    if (!response.ok) return 'Your journey to a new home is on track. Check your Journey tab for your next steps.';
    const data = await response.json();
    return data?.content?.[0]?.text ?? 'Check the Communities tab for the latest Arizona new construction incentives.';
  } catch {
    return 'Check the Communities tab for the latest Arizona new construction incentives.';
  }
}
