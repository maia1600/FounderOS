
// pages/api/conversas.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const token = req.headers['capri123'];
  if (token !== process.env.NEXT_PUBLIC_DASHBOARD_SECRET) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM conversations ORDER BY timestamp DESC LIMIT 100`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar conversas:', err);
    res.status(500).json({ error: 'Erro interno ao obter conversas' });
  }
}
