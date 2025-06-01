import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { categoria, condicao, acao, exemplo } = req.body;
  if (!categoria || !condicao || !acao) {
    return res.status(400).json({ error: 'Campos obrigatórios em falta.' });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    const id = uuidv4();
    await client.query(
      `INSERT INTO regras (id, categoria, condicao, acao, exemplo, ativa, aprovada)
       VALUES ($1, $2, $3, $4, $5, true, false)`,
      [id, categoria, condicao, acao, exemplo || '']
    );

    await client.end();
    return res.status(201).json({ success: true, id });
  } catch (err) {
    await client.end();
    return res.status(500).json({ error: 'Erro ao criar regra.' });
  }
}
