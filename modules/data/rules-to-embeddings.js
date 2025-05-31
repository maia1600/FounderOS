import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const regrasBase = [
  {
    categoria: "objeções",
    condicao: "cliente menciona preço alto",
    acao: "responder com empatia e reforçar o valor e durabilidade do serviço"
  },
  {
    categoria: "upsell",
    condicao: "preço acima de 300 euros",
    acao: "oferecer carro de substituição gratuito acima de 500€",
    exemplo: "Aproveite a campanha de Maio: carro de substituição incluído para orçamentos acima de 500€!"
  },
  {
    categoria: "educação",
    condicao: "cliente confunde polimento com pintura",
    acao: "explicar que polimento remove riscos superficiais sem pintar"
  }
];

async function gerar() {
  const inputs = regrasBase.map(r => `${r.categoria}: ${r.condicao}`);
  const res = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: inputs
  });

  const regrasComEmbedding = regrasBase.map((r, i) => ({
    ...r,
    embedding: res.data[i].embedding
  }));

  const output = `export const regras = ${JSON.stringify(regrasComEmbedding, null, 2)};\n`;

  const filePath = path.resolve('rules-embeddings.mjs');
  fs.writeFileSync(filePath, output, 'utf-8');

  console.log('✅ rules-embeddings.mjs gerado com sucesso!');
}

gerar();