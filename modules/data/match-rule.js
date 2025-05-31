import { regras } from './rules-embeddings.mjs';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

export async function matchRule(userMessage) {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: userMessage
  });

  const inputEmbedding = response.data[0].embedding;

  const resultados = regras.map(regra => ({
    ...regra,
    score: cosineSimilarity(inputEmbedding, regra.embedding)
  }));

  return resultados.sort((a, b) => b.score - a.score)[0];
}

