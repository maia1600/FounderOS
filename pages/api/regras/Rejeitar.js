import { Client } from 'pg';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'ID é obrigatório.' });

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    await client.query('DELETE FROM regras WHERE id = $1', [id]);
    await client.end();
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Erro ao rejeitar regra:', err);
    await client.end();
    return res.status(500).json({ error: 'Erro ao rejeitar regra.' });
  }
}
