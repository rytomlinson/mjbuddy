import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

interface HandSummary {
  handName: string;
  distance: number;
  points: number;
  isConcealed: boolean;
  neededTilesCount: number;
}

interface AdviceContext {
  tileCount: number;
  hasDrawnTile: boolean;
  topHands: HandSummary[];
  hasExposedMelds: boolean;
}

export async function generateStrategyAdvice(context: AdviceContext): Promise<string> {
  const { tileCount, hasDrawnTile, topHands, hasExposedMelds } = context;

  if (topHands.length === 0) {
    return "Add more tiles to see hand recommendations and strategic advice.";
  }

  const topHandsDesc = topHands.slice(0, 5).map((h, i) =>
    `${i + 1}. ${h.handName} (${h.distance} away, ${h.points}pts${h.isConcealed ? ', concealed' : ''})`
  ).join('\n');

  const prompt = `You are a Mah Jongg strategy advisor. The player has ${tileCount} tiles${hasDrawnTile ? ' plus a drawn tile' : ''}.${hasExposedMelds ? ' They have exposed melds.' : ''}

Their top viable hands are:
${topHandsDesc}

Give 1-2 sentences of strategic advice. Focus on:
- Whether to commit to one hand or stay flexible
- Key tiles to watch for or avoid discarding
- Whether concealed hands are still viable given their exposures
- Risk/reward tradeoffs between closer low-point hands vs farther high-point hands

Be concise and specific. No greeting or sign-off.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = message.content.find(block => block.type === 'text');
    return textBlock ? textBlock.text : "Focus on your closest hands while staying flexible.";
  } catch (error) {
    console.error('LLM advice error:', error);
    // Fallback advice based on data
    const closest = topHands[0];
    if (closest.distance <= 2) {
      return `You're close to ${closest.handName}! Focus on the ${closest.neededTilesCount} tiles you need and avoid discarding anything that helps it.`;
    } else if (topHands.length >= 3 && topHands[2].distance <= 4) {
      return "You have several viable options. Stay flexible and see which tiles come your way before committing.";
    } else {
      return `Work toward ${closest.handName} but keep alternatives open. You need ${closest.distance} more tiles.`;
    }
  }
}
