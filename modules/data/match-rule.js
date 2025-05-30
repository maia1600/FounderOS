import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';


const embeddingsPath = path.join(process.cwd(), 'modules', 'data', 'rules-embeddings.json');

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const embeddingsPath = path.join(process.cwd(), 'modules', 'data', 'rules-embeddings.json');
const regras = JSON.parse(fs.readFileSync(embeddingsPath, 'utf-8'));

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

  const resultados = regras.map(regra => {
    return {
      categoria: regra.categoria,
      condicao: regra.condicao,
      acao: regra.acao,
      score: cosineSimilarity(inputEmbedding, regra.embedding)
    };
  });

  const melhor = resultados.sort((a, b) => b.score - a.score)[0];
  return melhor;
}
