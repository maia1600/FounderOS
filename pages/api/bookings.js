import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query('SELECT * FROM bookings ORDER BY start ASC');
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao obter marcações.' });
    }
  }

  else if (req.method === 'POST') {
    const { nome, email, telefone, servicos, start, end, created_by } = req.body;

    if (!nome || !servicos || !start || !end) {
      return res.status(400).json({ error: 'Dados incompletos.' });
    }

    try {
      await pool.query(
        `INSERT INTO bookings 
         (nome, email, telefone, servicos, start, "end", created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [nome, email, telefone, servicos, start, end, created_by || 'Desconhecido']
      );
      res.status(201).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao gravar marcação.' });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}

