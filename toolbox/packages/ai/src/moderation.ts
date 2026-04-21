import { openai } from './client';

export interface ModerationResult {
  flagged: boolean;
  categories: Record<string, boolean>;
  scores: Record<string, number>;
}

export const moderateText = async (text: string): Promise<ModerationResult> => {
  const res = await openai().moderations.create({
    model: 'omni-moderation-latest',
    input: text,
  });
  const first = res.results[0];
  if (!first) return { flagged: false, categories: {}, scores: {} };
  return {
    flagged: first.flagged,
    categories: first.categories as unknown as Record<string, boolean>,
    scores: first.category_scores as unknown as Record<string, number>,
  };
};
