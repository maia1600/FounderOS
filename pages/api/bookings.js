import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    console.log('📥 Dados recebidos:', req.body);

    const {
      nome,
      email,
      telefone,
      servicos,
      marca,
      modelo,
      ano,
      start,
      data_fim,
      marcado_por
    } = req.body;

    if (!nome || !email || !telefone || !servicos || !marca || !modelo || !ano || !start || !data_fim || !marcado_por) {
      return res.status(400).json({ error: 'Campos obrigatórios em falta.' });
    }

    try {
      await pool.query(
        `INSERT INTO bookings 
         (nome, email, telefone, servicos, marca, modelo, ano, start, data_fim, marcado_por)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [nome, email, telefone, servicos, marca, modelo, ano, start, data_fim, marcado_por]
      );

      return res.status(201).json({ success: true, message: 'Marcação gravada com sucesso.' });
    } catch (err) {
      console.error('❌ Erro ao gravar marcação:', err);
      return res.status(500).json({ error: 'Erro ao gravar marcação.' });
    }
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query('SELECT * FROM bookings ORDER BY start ASC');
      return res.status(200).json(rows);
    } catch (err) {
      console.error('Erro no GET:', err);
      return res.status(500).json({ error: 'Erro ao obter marcações.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
  return res.status(405).end(`Método ${req.method} não permitido`);
}

