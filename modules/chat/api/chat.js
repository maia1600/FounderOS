import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id, user_message, source_page } = req.body;

  if (!session_id || !user_message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const ai_reply = "Resposta automática simulada para: " + user_message;

    await pool.query(
      `INSERT INTO conversations (session_id, user_message, ai_response, source_page)
       VALUES ($1, $2, $3, $4)`,
      [session_id, user_message, ai_reply, source_page || null]
    );

    res.status(200).json({ response: ai_reply });
  } catch (error) {
    console.error('Erro no chat handler:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
