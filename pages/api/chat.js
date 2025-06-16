import { Pool } from 'pg';
import fetch from 'node-fetch';
import https from 'https';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const {
    message,
    session_id,
    source_page = 'website',
    categoria_servico = '',
    marca_carro = '',
    modelo_carro = '',
    ano_carro = '',
  } = req.body;

  if (!message || !session_id) {
    return res.status(400).json({ error: 'Parâmetros obrigatórios em falta' });
  }

  try {
    const relevanceRes = await fetch('https://api.tryrelevance.com/latest/agents/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RELEVANCE_API_KEY}`,
      },
      agent: new https.Agent({ rejectUnauthorized: false }), // para SSL debugging
      body: JSON.stringify({
        message: {
          role: 'user',
          content: message,
        },
        agent_id: '3515dcce-eae9-40d1-ad18-c58915b4979b',
      }),
    });

    const raw = await relevanceRes.text();
    console.log('🧠 RAW response da Relevance →', raw);

    let relevanceData;
    try {
      relevanceData = JSON.parse(raw);
    } catch (e) {
      return res.status(502).json({ error: 'Resposta inválida da Relevance', raw });
    }

    // TODO opcional: gravar no Neon com pool.query(...)
    return res.status(200).json({ resposta: relevanceData });

  } catch (error) {
    console.error('💥 ERRO CRÍTICO NO /api/chat:', error.message);
    return res.status(500).json({ error: 'Falha na comunicação com a Relevance', details: error.message });
  }
}

