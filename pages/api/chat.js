import { Pool } from 'pg';
import OpenAI from 'openai';


import { matchRule } from '../../modules/data/match-rule.js';
import { regras as rules } from '../../modules/data/rules-embeddings.mjs';


// Conexão à base de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Inicializa OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id, user_message, source_page } = req.body;
  if (!session_id || !user_message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Obter regra TAMAI mais próxima
    const regra = await matchRule(user_message);
    const contextoRegra = `
Regra TAMAI mais relevante:
- Categoria: ${regra.categoria}
- Condição: ${regra.condicao}
- Ação recomendada: ${regra.acao}
`.trim();

    // Gerar resposta da IA com contexto da regra
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'És um assistente da TAMAI, um centro automóvel em Portugal que oferece serviços como pintura, estofador, detalhe e restauro de plásticos. Responde de forma clara, curta e profissional. Simula preços quando possível. Nunca inventes dados técnicos.',
        },
        {
          role: 'user',
          content: `${user_message}\n\n${contextoRegra}`,
        },
      ],
      temperature: 0.7,
    });

    let ai_reply = completion.choices[0]?.message?.content || "Não consegui entender a sua questão.";

    // Verifica se deve aplicar upsell
    const numeros = ai_reply.match(/\d+/g)?.map(Number) || [];
    const maiorValor = Math.max(...numeros);

    if (maiorValor > 300) {
      const upsell = rules.find(r => r.categoria === 'upsell');
      if (upsell) {
        ai_reply += `\n\n${upsell.exemplo}`;
      }
    }

    // Extrair metadados simples
    const metadata = {
      categoria_servico: user_message.toLowerCase().includes("pintura") ? "pintura" : "geral",
      marca_carro: user_message.match(/(Volkswagen|BMW|Renault|Mercedes|Audi|Toyota)/i)?.[0] || null,
      modelo_carro: user_message.match(/\b(Golf|Clio|Yaris|A3|Civic)\b/i)?.[0] || null,
      ano_carro: user_message.match(/\b(19|20)\d{2}\b/)?.[0] || null,
    };

    // Gravar na base de dados
    await pool.query(
      `INSERT INTO conversations 
        (session_id, user_message, ai_response, source_page, categoria_servico, marca_carro, modelo_carro, ano_carro)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        session_id,
        user_message,
        ai_reply,
        source_page || null,
        metadata.categoria_servico,
        metadata.marca_carro,
        metadata.modelo_carro,
        metadata.ano_carro,
      ]
    );

    return res.status(200).json({ response: ai_reply, metadata });
  } catch (error) {
    console.error("Erro ao processar com IA:", error.message);
    return res.status(500).json({ error: 'Erro ao gerar resposta com IA' });
  }
}
