// /pages/api/chat.js

import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { message, session_id } = req.body;

  if (!message || !session_id) {
    return res.status(400).json({ error: 'Parâmetros inválidos' });
  }

  try {
    // Enviar mensagem para o agente da RelevanceAI
    const relevanceResponse = await fetch('https://api-dcbe5a.stack.tryrelevance.com/latest/agents/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RELEVANCE_API_KEY}`
      },
      body: JSON.stringify({
        message: {
          role: 'user',
          content: message
        },
        agent_id: '3515dcce-eae9-40d1-ad18-c58915b4979b'
      })
    });

    const relevanceData = await relevanceResponse.json();

    // A resposta da Relevance vem em relevanceData.output ou algo semelhante
    const aiResponse = relevanceData.output || 'Desculpa, não consegui interpretar.';

    // Guardar na base de dados Neon
    await pool.query(
      'INSERT INTO conversations (session_id, user_message, ai_response, timestamp) VALUES ($1, $2, $3, NOW())',
      [session_id, message, aiResponse]
    );

    // Devolver ao frontend
    res.status(200).json({ response: aiResponse });

  } catch (error) {
    console.error('Erro ao contactar Relevance:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
}









