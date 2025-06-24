import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  // Permitir CORS para qualquer origem
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query('SELECT * FROM bookings ORDER BY start ASC');
      res.status(200).json(rows);
    } catch (err) {
      console.error('Erro no GET:', err);
      res.status(500).json({ error: 'Erro ao obter marcações.' });
    }
  }

  else if (req.method === 'POST') {
    const { nome, email, telefone, servicos, start, end, created_by } = req.body;

    if (!nome || !servicos || !start || !end) {
      return res.status(400).json({ error: 'Campos obrigatórios: nome, servicos, start, end.' });
    }

    try {
      await pool.query(
        `INSERT INTO bookings 
         (nome, email, telefone, servicos, start, "end", created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          nome,
          email || '',
          telefone || '',
          servicos,
          start,
          end,
          created_by || 'Utilizador'
        ]
      );
      return res.status(201).json({ success: true, message: 'Marcação gravada com sucesso.' });
    } catch (err) {
      console.error('Erro no POST:', err);
      return res.status(500).json({ error: 'Erro ao gravar marcação.' });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
    return res.status(405).end(`Método ${req.method} não permitido`);
  }
}

    return res.status(405).end(`Método ${req.method} não permitido`);
  }
}
