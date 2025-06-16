import { Pool } from 'pg';
import fetch from 'node-fetch';

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
    // 🚀 Chamada ao proxy Manus em vez de chamar diretamente a Relevance
    const proxyRes = await fetch('https://3000-itvcypt6ehrwvc5licjgd-46723f17.manusvm.computer/relay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        agent_id: '3515dcce-eae9-40d1-ad18-c58915b4979b',
        api_key: process.env.RELEVANCE_API_KEY,
      }),
    });

    const raw = await proxyRes.text();
    console.log('🧠 RAW response do Proxy Manus →', raw);

    let relevanceData;
    try {
      relevanceData = JSON.parse(raw);
    } catch (e) {
      return res.status(502).json({ error: 'Resposta inválida do proxy', raw });
    }

    // TODO: opcional — gravar em base de dados com pool.query(...)
    return res.status(200).json({ resposta: relevanceData });

  } catch (error) {
    console.error('💥 ERRO CRÍTICO NO /api/chat:', error.message);
    return res.status(500).json({ error: 'Falha na comunicação com o proxy', details: error.message });
  }
}

