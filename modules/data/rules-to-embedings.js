
// ✅ rules-to-embeddings.js
import fs from 'fs';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const rules = [
  {
    categoria: "objeções",
    condicao: "cliente menciona preço alto",
    acao: "responder com empatia e reforçar o valor e durabilidade do serviço"
  },
  {
    categoria: "urgencia",
    condicao: "cliente menciona pressa ou urgência",
    acao: "responder com prioridade e sugerir marcação imediata"
  },
  {
    categoria: "upsell",
    condicao: "cliente recebe orçamento elevado",
    acao: "sugerir oferta extra (ex: carro de substituição gratuito)",
    exemplo: "💡 Oferta: carro de substituição incluído para orçamentos acima de 300€!"
  }
];

async function gerarEmbeddings() {
  const regrasComEmbedding = [];

  for (const regra of rules) {
    const input = `${regra.categoria} - ${regra.condicao} - ${regra.acao}`;
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input
    });

    regrasComEmbedding.push({
      ...regra,
      embedding: response.data[0].embedding
    });
  }

  fs.writeFileSync(
    './modules/data/rules-embeddings.mjs',
    `export const regras = ${JSON.stringify(regrasComEmbedding, null, 2)};`
  );

  console.log('✅ Ficheiro com embeddings atualizado.');
}

gerarEmbeddings().catch(err => console.error('Erro:', err));
