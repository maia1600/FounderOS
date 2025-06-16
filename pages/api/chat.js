import { Pool } from 'pg';

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
      body: JSON.stringify({
        message: {
          role: 'user',
          content: message,
        },
        agent_id: '3515dcce-eae9-40d1-ad18-c58915b4979b',
      }),
    });

    const raw = await relevanceRes.text();
    console.log('📥 RAW da Relevance →', raw);

    let relevanceData;
    try {
      relevanceData = JSON.parse(raw);
    } catch (err) {
      console.error('❌ Erro ao fazer parse do JSON da Relevance:', err);
      return res.status(500).json({ error: 'Resposta inválida da Relevance' });
    }

    if (!relevanceRes.ok) {
      console.error('❌ Erro da Relevance:', relevanceData);
      return res.status(relevanceRes.status).json({
        error: relevanceData?.message || 'Erro da Relevance',
      });
    }

    const ai_response = relevanceData?.message?.content || '';

    await pool.query(
      `INSERT INTO conversations 
        (session_id, user_message, ai_response, source_page, categoria_servico, marca_carro, modelo_carro, ano_carro) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        session_id,
        message,
        ai_response,
        source_page,
        categoria_servico,
        marca_carro,
        modelo_carro,
        ano_carro,
      ]
    );

    return res.status(200).json({ resposta: ai_response });
  } catch (err) {
    console.error('❌ Erro no handler geral:', err);
    return res.status(500).json({ error: 'Erro ao processar a mensagem' });
  }
}


