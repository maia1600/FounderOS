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
    const proxyURL = 'https://tamai-proxy.maia1600.workers.dev/';

    const requestBody = {
      message,
      agent_id: '3515dcce-eae9-40d1-ad18-c58915b4979b', // atualiza se necessário
      api_key: process.env.RELEVANCE_API_KEY,
    };

    console.log('📤 A enviar para proxy:', proxyURL);
    console.log('📦 Body do proxy →', requestBody);

    const response = await fetch(proxyURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const contentType = response.headers.get('content-type');
    const raw = await response.text();

    if (!contentType || !contentType.includes('application/json')) {
      console.error('⚠️ Proxy respondeu com HTML →', raw.slice(0, 300));
      return res.status(502).json({ error: 'Resposta inválida do proxy (HTML)', raw });
    }

    const relevanceData = JSON.parse(raw);
    console.log('✅ Resposta da Relevance via proxy:', relevanceData);

    if (!relevanceData || !relevanceData.message) {
      return res.status(502).json({ error: 'Resposta incompleta ou inválida da Relevance', relevanceData });
    }

    // Podes guardar no Neon se quiseres (exemplo comentado)
    // await pool.query('INSERT INTO conversations (...) VALUES (...)');

    return res.status(200).json({ resposta: relevanceData });

  } catch (error) {
    console.error('💥 ERRO FATAL no /api/chat:', error.message);
    return res.status(502).json({ error: 'Falha na comunicação com o proxy', details: error.message });
  }
}






