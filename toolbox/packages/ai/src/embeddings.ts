import { openai } from './client';

export const EMBEDDING_MODEL = 'text-embedding-3-small';
export const EMBEDDING_DIMS = 1536;

export const embedText = async (text: string): Promise<number[]> => {
  const trimmed = text.trim();
  if (!trimmed) return new Array<number>(EMBEDDING_DIMS).fill(0);
  const res = await openai().embeddings.create({
    model: EMBEDDING_MODEL,
    input: trimmed.slice(0, 8000),
  });
  const first = res.data[0];
  if (!first) throw new Error('No embedding returned');
  return first.embedding;
};

export const toPgVector = (vec: readonly number[]): string =>
  `[${vec.join(',')}]`;
