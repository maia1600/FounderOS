
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const embeddingsPath = path.join(process.cwd(), 'modules', 'data', 'rules-embeddings.json');
const regras = JSON.parse(fs.readFileSync(embeddingsPath, 'utf-8'));

// Função para calcular similaridade cosseno
function cosineSimilarity(a, b) {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Função principal
const main = async () => {
  const mensagem = process.argv.slice(2).join(" ");

  if (!mensagem) {
    console.log("⚠️  Usa assim: node motor-decisao.js \"mensagem do cliente\"");
    process.exit(1);
  }

  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: mensagem
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

  const top3 = resultados.sort((a, b) => b.score - a.score).slice(0, 3);

  console.log(`🔎 Mensagem analisada: "${mensagem}"`);
  console.log("🔗 Top 3 regras mais próximas:");
  top3.forEach((r, i) => {
    console.log(`\n#${i + 1}`);
    console.log(`Categoria: ${r.categoria}`);
    console.log(`Condicao: ${r.condicao}`);
    console.log(`Acao: ${r.acao}`);
    console.log(`Score: ${r.score.toFixed(4)}`);
  });
};

main();
